import * as dotenv from "dotenv";
import type { Request, Response } from "express";
import express from "express";
import got, { type Response as GotResponse } from "got";
import logger from "../utils/logger.js";

const _got = got.extend({ enableUnixSockets: true });

dotenv.config({ quiet: true });

const router: express.Router = express.Router();

// Support both legacy single-endpoint and new multi-endpoint configuration
const DOCKER_SOCK = process.env.DOCKER_SOCK;
const DOCKER_NORMALIZED_ENDPOINTS = process.env.DOCKER_NORMALIZED_ENDPOINTS;

// Parse endpoints - use DOCKER_NORMALIZED_ENDPOINTS if available, fall back to DOCKER_SOCK
const NORMALIZED_ENDPOINTS: string[] = DOCKER_NORMALIZED_ENDPOINTS
  ? DOCKER_NORMALIZED_ENDPOINTS.split(',').map(e => e.trim()).filter(e => e)
  : DOCKER_SOCK
  ? [DOCKER_SOCK]
  : [];

if (NORMALIZED_ENDPOINTS.length === 0) {
  logger.error("No Docker endpoints configured. Set DOCKER_NORMALIZED_ENDPOINTS or DOCKER_SOCK");
}

// Helper to normalize endpoint URLs (supports both Unix sockets and HTTP)
const normalizeEndpoint = (endpoint: string): string => {
  const trimmed = endpoint.trim();
  // If it's already HTTP(S), use as-is
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  // If it's a Unix socket path, convert to got's format
  if (trimmed.startsWith('/')) {
    return `http://unix:${trimmed}:`;
  }
  // Unknown format, return as-is and let it fail
  logger.warn(`Unknown endpoint format: ${trimmed}`);
  return trimmed;
};

// Normalize all endpoints
const NORMALIZED_NORMALIZED_ENDPOINTS = NORMALIZED_ENDPOINTS.map(normalizeEndpoint);

// URL builders - now endpoint-aware
const CONTAINERS = (endpoint: string) => `${endpoint}/containers/json?all=true`;
const CONTAINER_STOP = (endpoint: string, id: string) => `${endpoint}/containers/${id}/stop`;
const CONTAINER_PRUNE = (endpoint: string) => `${endpoint}/containers/prune`;
const CONTAINER = (endpoint: string, id: string) =>
  `${endpoint}/containers/json?all=true&filters={"id":["${id}"]}`;
const CONTAINER_REMOVE = (endpoint: string, id: string) => `${endpoint}/containers/${id}?v=1`;
const CONTAINER_START = (endpoint: string, id: string) => `${endpoint}/containers/${id}/start`;
const CONTAINER_RESTART = (endpoint: string, id: string) => `${endpoint}/containers/${id}/restart`;
const CONTAINER_RENAME = (endpoint: string, id: string, name: string | undefined) =>
  `${endpoint}/containers/${id}/rename?name=${name}`;
const CONTAINER_PAUSE = (endpoint: string, id: string) => `${endpoint}/containers/${id}/pause`;
const CONTAINER_UNPAUSE = (endpoint: string, id: string) => `${endpoint}/containers/${id}/unpause`;
const CONTAINER_LOGS = (endpoint: string, id: string) =>
  `${endpoint}/containers/${id}/logs?stdout=true&stderr=true&tail=200`;
const CONTAINER_STATS = (endpoint: string, id: string) =>
  `${endpoint}/containers/${id}/stats?stream=false`;

// Helper to extract hostname from endpoint URL
const getNodeName = (endpoint: string): string => {
  try {
    const url = new URL(endpoint);
    return url.hostname;
  } catch {
    return 'unknown';
  }
};

// Validate container ID to prevent SSRF
const VALID_CONTAINER_ID = /^[a-zA-Z0-9_-]+$/;
const isValidContainerId = (id: string | undefined): boolean => {
  if (!id || typeof id !== 'string') return false;
  return VALID_CONTAINER_ID.test(id) && id.length <= 71;
};

const PINNED = new Set<string>();

// Filter to only return containers managed by Lilypad (ones with the label)
const NAMESPACE = process.env.NAMESPACE || "org.domain.review";
const CONTAINER_TAG = `${NAMESPACE}.name`;

interface ContainerLabels {
  [key: string]: string;
}

interface ContainerData {
  Id: string;
  Names: string[];
  Image: string;
  State: string;
  Status: string;
  Created: number;
  Labels: ContainerLabels;
  Node?: string;
}

interface DockerError extends Error {
  statusCode?: number;
}

router.get("/", async (_req: Request, res: Response) => {
  try {
    // Query all endpoints in parallel
    const results = await Promise.allSettled(
      NORMALIZED_ENDPOINTS.map(async (endpoint) => {
        const response = await _got(CONTAINERS(endpoint));
        const data: ContainerData[] = JSON.parse(response.body);
        
        // Add node information to each container
        const nodeName = getNodeName(endpoint);
        return data.map(container => ({
          ...container,
          Node: nodeName
        }));
      })
    );

    // Merge results from all nodes
    let allContainers: ContainerData[] = [];
    const nodeErrors: { node: string; error: string }[] = [];

    results.forEach((result, index) => {
      const nodeName = getNodeName(NORMALIZED_ENDPOINTS[index]);
      if (result.status === 'fulfilled') {
        allContainers = allContainers.concat(result.value);
      } else {
        logger.error(`Failed to fetch containers from ${nodeName}:`, result.reason);
        nodeErrors.push({ node: nodeName, error: String(result.reason) });
      }
    });

    // Filter to only include containers with the Lilypad label
    allContainers = allContainers.filter((c) => c.Labels && CONTAINER_TAG in c.Labels);

    // Apply pinned state
    allContainers.forEach((c) => {
      if (PINNED.has(c.Names[0])) {
        c.State = "pinned";
      }
    });

    // Send response as array (backward compatibility)
    // Note: Errors are logged but not included in response to maintain API compatibility
    if (nodeErrors.length > 0) {
      logger.warn(`Container fetch completed with ${nodeErrors.length} node errors:`, nodeErrors);
    }

    res.send(allContainers);
  } catch (error) {
    const err = error as DockerError;
    logger.error("Failed to fetch containers:", err.message);
    res.status(500).send({ error: "Failed to fetch containers" });
  }
});

router.post("/pin", async (req: Request, res: Response) => {
  try {
    const { containerName } = req.body as { containerName: string };
    if (PINNED.has(containerName)) {
      PINNED.delete(containerName);
      logger.info(`Container ${containerName} unpinned`);
    } else {
      PINNED.add(containerName);
      logger.info(`Container ${containerName} pinned`);
    }
    res.sendStatus(200);
  } catch (error) {
    const err = error as DockerError;
    logger.error("Error pinning container:", err.message);
    res.sendStatus(err.statusCode || 500);
  }
});

router.post("/stop", async (req: Request, res: Response): Promise<void> => {
  const { containerId } = req.body as { containerId: string };
  if (!isValidContainerId(containerId)) {
    res.status(400).send({ error: "Invalid container ID" });
    return;
  }
  logger.debug("Stopping container:", containerId?.substring(0, 12));

  try {
    // Try to stop on all endpoints - container will only exist on one
    const results = await Promise.allSettled(
      NORMALIZED_ENDPOINTS.map(endpoint => _got.post(CONTAINER_STOP(endpoint, containerId)))
    );
    
    const success = results.find(r => r.status === 'fulfilled');
    if (success) {
      logger.info(`Container ${containerId?.substring(0, 12)} stopped`);
      res.sendStatus(200);
    } else {
      const error = results.find(r => r.status === 'rejected') as PromiseRejectedResult;
      throw error?.reason || new Error("Failed to stop container");
    }
  } catch (error) {
    const err = error as DockerError;
    logger.error("Error stopping container:", err.message);
    res.sendStatus(err.statusCode || 500);
  }
});

router.post("/start", async (req: Request, res: Response): Promise<void> => {
  const { containerId } = req.body as { containerId: string };
  if (!isValidContainerId(containerId)) {
    res.status(400).send({ error: "Invalid container ID" });
    return;
  }
  logger.debug("Starting container:", containerId?.substring(0, 12));

  try {
    const results = await Promise.allSettled(
      NORMALIZED_ENDPOINTS.map(endpoint => _got.post(CONTAINER_START(endpoint, containerId)))
    );
    
    const success = results.find(r => r.status === 'fulfilled');
    if (success) {
      logger.info(`Container ${containerId?.substring(0, 12)} started`);
      res.sendStatus(200);
    } else {
      const error = results.find(r => r.status === 'rejected') as PromiseRejectedResult;
      throw error?.reason || new Error("Failed to start container");
    }
  } catch (error) {
    const err = error as DockerError;
    logger.error("Error starting container:", err.message);
    res.sendStatus(err.statusCode || 500);
  }
});

router.post("/prune", async (_req: Request, res: Response) => {
  logger.debug("Pruning containers");

  try {
    const results = await Promise.allSettled(
      NORMALIZED_ENDPOINTS.map(endpoint => _got.post(CONTAINER_PRUNE(endpoint)))
    );
    
    const successCount = results.filter(r => r.status === 'fulfilled').length;
    logger.info(`Containers pruned on ${successCount}/${NORMALIZED_ENDPOINTS.length} nodes`);
    
    res.send({ success: true, nodesPruned: successCount });
  } catch (error) {
    const err = error as DockerError;
    logger.error("Error pruning containers:", err.message);
    res.sendStatus(err.statusCode || 500);
  }
});

router.get("/:containerId", async (req: Request, res: Response): Promise<void> => {
  const { containerId } = req.params as { containerId: string };
  if (!isValidContainerId(containerId)) {
    res.status(400).send({ error: "Invalid container ID" });
    return;
  }
  logger.debug("Fetching container:", containerId?.substring(0, 12));

  try {
    // Try all endpoints and return from the first successful one
    const results = await Promise.allSettled(
      NORMALIZED_ENDPOINTS.map(async (endpoint) => {
        const data = await _got(CONTAINER(endpoint, containerId));
        const containers: ContainerData[] = JSON.parse(data.body);
        if (containers.length > 0) {
          return {
            ...containers[0],
            Node: getNodeName(endpoint)
          };
        }
        return null;
      })
    );
    
    // Find first successful result with container data
    for (const result of results) {
      if (result.status === 'fulfilled' && result.value) {
        res.send(result.value);
        return;
      }
    }
    
    // If no container found on any node
    res.status(404).send({ error: "Container not found" });
  } catch (error) {
    const err = error as DockerError;
    logger.error("Error fetching container:", err.message);
    res.status(500).send({ error: "Failed to fetch container" });
  }
});

router.delete("/:containerId", async (req: Request, res: Response): Promise<void> => {
  const { containerId } = req.params as { containerId: string };
  const { force } = req.query as { force?: string };
  if (!isValidContainerId(containerId)) {
    res.status(400).send({ error: "Invalid container ID" });
    return;
  }
  logger.debug("Removing container:", containerId?.substring(0, 12), force ? "(force)" : "");

  try {
    const results = await Promise.allSettled(
      NORMALIZED_ENDPOINTS.map(endpoint => {
        const url = force === "true" 
          ? `${CONTAINER_REMOVE(endpoint, containerId)}&force=true`
          : CONTAINER_REMOVE(endpoint, containerId);
        return _got.delete(url);
      })
    );
    
    const success = results.find(r => r.status === 'fulfilled');
    if (success) {
      logger.info(`Container ${containerId?.substring(0, 12)} removed`);
      res.sendStatus(200);
    } else {
      const error = results.find(r => r.status === 'rejected') as PromiseRejectedResult;
      throw error?.reason || new Error("Failed to remove container");
    }
  } catch (error) {
    const err = error as DockerError;
    logger.error("Error removing container:", err.message);
    res.sendStatus(err.statusCode || 500);
  }
});

router.post("/:containerId", async (req: Request, res: Response): Promise<void> => {
  const { containerId } = req.params as { containerId: string };
  if (!isValidContainerId(containerId)) {
    res.status(400).send({ error: "Invalid container ID" });
    return;
  }
  logger.debug("Starting container:", containerId?.substring(0, 12));

  try {
    const results = await Promise.allSettled(
      NORMALIZED_ENDPOINTS.map(endpoint => _got.post(CONTAINER_START(endpoint, containerId)))
    );
    
    const success = results.find(r => r.status === 'fulfilled');
    if (success) {
      logger.info(`Container ${containerId?.substring(0, 12)} started`);
      res.sendStatus(200);
    } else {
      const error = results.find(r => r.status === 'rejected') as PromiseRejectedResult;
      throw error?.reason || new Error("Failed to start container");
    }
  } catch (error) {
    const err = error as DockerError;
    logger.error("Error starting container:", err.message);
    res.sendStatus(err.statusCode || 500);
  }
});

router.get("/:containerId/logs", async (req: Request, res: Response): Promise<void> => {
  const { containerId } = req.params as { containerId: string };
  if (!isValidContainerId(containerId)) {
    res.status(400).send({ error: "Invalid container ID" });
    return;
  }
  logger.debug("Fetching logs for container:", containerId?.substring(0, 12));

  try {
    // Try all endpoints and return logs from the first successful one
    const results = await Promise.allSettled(
      NORMALIZED_ENDPOINTS.map(endpoint => _got(CONTAINER_LOGS(endpoint, containerId)))
    );
    
    const success = results.find(r => r.status === 'fulfilled') as PromiseFulfilledResult<GotResponse<string>>;
    if (success) {
      const logs = success.value.body.split("\n");
      const text: string[] = [];

      logs.forEach((log: string) => {
        // header parsing can go here
        text.push(`${log.slice(8)}`);
      });

      res.send(JSON.stringify(text));
    } else {
      const error = results.find(r => r.status === 'rejected') as PromiseRejectedResult;
      throw error?.reason || new Error("Failed to fetch logs");
    }
  } catch (error) {
    const err = error as DockerError;
    logger.error("Error fetching logs:", err.message);
    res.status(500).send({ error: "Failed to fetch logs" });
  }
});

router.post("/:containerId/restart", async (req: Request, res: Response): Promise<void> => {
  const { containerId } = req.params as { containerId: string };
  if (!isValidContainerId(containerId)) {
    res.status(400).send({ error: "Invalid container ID" });
    return;
  }
  logger.debug("Restarting container:", containerId?.substring(0, 12));

  try {
    const results = await Promise.allSettled(
      NORMALIZED_ENDPOINTS.map(endpoint => _got.post(CONTAINER_RESTART(endpoint, containerId)))
    );
    
    const success = results.find(r => r.status === 'fulfilled');
    if (success) {
      logger.info(`Container ${containerId?.substring(0, 12)} restarted`);
      res.sendStatus(200);
    } else {
      const error = results.find(r => r.status === 'rejected') as PromiseRejectedResult;
      throw error?.reason || new Error("Failed to restart container");
    }
  } catch (error) {
    const err = error as DockerError;
    logger.error("Error restarting container:", err.message);
    res.sendStatus(err.statusCode || 500);
  }
});

router.post("/:containerId/rename", async (req: Request, res: Response): Promise<void> => {
  const { containerId } = req.params as { containerId: string };
  const { name } = req.query as { name?: string };
  if (!isValidContainerId(containerId)) {
    res.status(400).send({ error: "Invalid container ID" });
    return;
  }
  logger.debug(
    "Renaming container:",
    containerId?.substring(0, 12),
    "to",
    name,
  );

  try {
    const results = await Promise.allSettled(
      NORMALIZED_ENDPOINTS.map(endpoint => _got.post(CONTAINER_RENAME(endpoint, containerId, name)))
    );
    
    const success = results.find(r => r.status === 'fulfilled');
    if (success) {
      logger.info(
        `Container ${containerId?.substring(0, 12)} renamed to ${name}`,
      );
      res.sendStatus(200);
    } else {
      const error = results.find(r => r.status === 'rejected') as PromiseRejectedResult;
      throw error?.reason || new Error("Failed to rename container");
    }
  } catch (error) {
    const err = error as DockerError;
    logger.error("Error renaming container:", err.message);
    res.sendStatus(err.statusCode || 500);
  }
});

router.post("/:containerId/pause", async (req: Request, res: Response): Promise<void> => {
  const { containerId } = req.params as { containerId: string };
  if (!isValidContainerId(containerId)) {
    res.status(400).send({ error: "Invalid container ID" });
    return;
  }
  logger.debug("Pausing container:", containerId?.substring(0, 12));

  try {
    const results = await Promise.allSettled(
      NORMALIZED_ENDPOINTS.map(endpoint => _got.post(CONTAINER_PAUSE(endpoint, containerId)))
    );
    
    const success = results.find(r => r.status === 'fulfilled');
    if (success) {
      logger.info(`Container ${containerId?.substring(0, 12)} paused`);
      res.sendStatus(200);
    } else {
      const error = results.find(r => r.status === 'rejected') as PromiseRejectedResult;
      throw error?.reason || new Error("Failed to pause container");
    }
  } catch (error) {
    const err = error as DockerError;
    logger.error("Error pausing container:", err.message);
    res.sendStatus(err.statusCode || 500);
  }
});

router.post("/:containerId/unpause", async (req: Request, res: Response): Promise<void> => {
  const { containerId } = req.params as { containerId: string };
  if (!isValidContainerId(containerId)) {
    res.status(400).send({ error: "Invalid container ID" });
    return;
  }
  logger.debug("Unpausing container:", containerId?.substring(0, 12));

  try {
    const results = await Promise.allSettled(
      NORMALIZED_ENDPOINTS.map(endpoint => _got.post(CONTAINER_UNPAUSE(endpoint, containerId)))
    );
    
    const success = results.find(r => r.status === 'fulfilled');
    if (success) {
      logger.info(`Container ${containerId?.substring(0, 12)} unpaused`);
      res.sendStatus(200);
    } else {
      const error = results.find(r => r.status === 'rejected') as PromiseRejectedResult;
      throw error?.reason || new Error("Failed to unpause container");
    }
  } catch (error) {
    const err = error as DockerError;
    logger.error("Error unpausing container:", err.message);
    res.sendStatus(err.statusCode || 500);
  }
});

interface CpuStats {
  cpu_usage: {
    total_usage: number;
  };
  system_cpu_usage: number;
  online_cpus: number;
}

interface MemoryStats {
  usage?: number;
  limit?: number;
}

interface ContainerStats {
  cpu_stats: CpuStats;
  precpu_stats: CpuStats;
  memory_stats: MemoryStats;
}

router.get("/:containerId/stats", async (req: Request, res: Response): Promise<void> => {
  const { containerId } = req.params as { containerId: string };
  if (!isValidContainerId(containerId)) {
    res.status(400).send({ error: "Invalid container ID" });
    return;
  }
  logger.debug("Fetching stats for container:", containerId?.substring(0, 12));

  try {
    // Try all endpoints and return stats from the first successful one
    const results = await Promise.allSettled(
      NORMALIZED_ENDPOINTS.map(endpoint => _got(CONTAINER_STATS(endpoint, containerId)))
    );
    
    const success = results.find(r => r.status === 'fulfilled') as PromiseFulfilledResult<GotResponse<string>>;
    if (success) {
      const stats: ContainerStats = JSON.parse(success.value.body);

      // Calculate CPU percentage
      const cpuDelta =
        stats.cpu_stats.cpu_usage.total_usage -
        stats.precpu_stats.cpu_usage.total_usage;
      const systemDelta =
        stats.cpu_stats.system_cpu_usage - stats.precpu_stats.system_cpu_usage;
      const cpuPercent =
        (cpuDelta / systemDelta) * stats.cpu_stats.online_cpus * 100;

      // Calculate memory usage
      const memoryUsage = stats.memory_stats.usage || 0;
      const memoryLimit = stats.memory_stats.limit || 1;
      const memoryPercent = (memoryUsage / memoryLimit) * 100;

      res.send({
        cpuPercent: Math.round(cpuPercent * 100) / 100,
        memoryPercent: Math.round(memoryPercent * 100) / 100,
        memoryUsage: Math.round((memoryUsage / 1024 / 1024) * 100) / 100, // MB
        memoryLimit: Math.round((memoryLimit / 1024 / 1024) * 100) / 100, // MB
      });
    } else {
      const error = results.find(r => r.status === 'rejected') as PromiseRejectedResult;
      throw error?.reason || new Error("Failed to get stats");
    }
  } catch (error) {
    const err = error as DockerError;
    logger.error("Error fetching stats:", err.message);
    res.status(500).send({ error: "Failed to get stats" });
  }
});

export default router;
