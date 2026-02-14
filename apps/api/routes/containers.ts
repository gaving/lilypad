import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
import type { Request, Response } from "express";
import express from "express";
import got from "got";
import logger from "../utils/logger.js";

const _got = got.extend({ enableUnixSockets: true });

dotenv.config({ quiet: true });

const router: express.Router = express.Router();

const DOCKER_SOCK = process.env.DOCKER_SOCK;

const CONTAINERS = `${DOCKER_SOCK}/containers/json?all=true`;
const CONTAINER_STOP = (id: string) => `${DOCKER_SOCK}/containers/${id}/stop`;
const CONTAINER_PRUNE = `${DOCKER_SOCK}/containers/prune`;
const CONTAINER = (id: string) =>
  `${DOCKER_SOCK}/containers/json?all=true&filters={"id":["${id}"]}`;
const CONTAINER_REMOVE = (id: string) => `${DOCKER_SOCK}/containers/${id}?v=1`;
const CONTAINER_START = (id: string) => `${DOCKER_SOCK}/containers/${id}/start`;
const CONTAINER_RESTART = (id: string) => `${DOCKER_SOCK}/containers/${id}/restart`;
const CONTAINER_RENAME = (id: string, name: string | undefined) =>
  `${DOCKER_SOCK}/containers/${id}/rename?name=${name}`;
const CONTAINER_PAUSE = (id: string) => `${DOCKER_SOCK}/containers/${id}/pause`;
const CONTAINER_UNPAUSE = (id: string) => `${DOCKER_SOCK}/containers/${id}/unpause`;
const CONTAINER_LOGS = (id: string) =>
  `${DOCKER_SOCK}/containers/${id}/logs?stdout=true&stderr=true&tail=200`;
const CONTAINER_STATS = (id: string) =>
  `${DOCKER_SOCK}/containers/${id}/stats?stream=false`;

// Validate container ID to prevent SSRF
const VALID_CONTAINER_ID = /^[a-zA-Z0-9_-]+$/;
const isValidContainerId = (id: string | undefined): boolean => {
  if (!id || typeof id !== 'string') return false;
  return VALID_CONTAINER_ID.test(id) && id.length <= 71;
};

const PINNED = new Set<string>();

// Filter to only return containers managed by Lilypad (ones with the label)
const CONTAINER_TAG = process.env.CONTAINER_TAG || "org.domain.review.name";

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
}

interface DockerError extends Error {
  statusCode?: number;
}

router.get("/", async (_req: Request, res: Response) => {
  try {
    const response = await _got(CONTAINERS);
    let data: ContainerData[] = JSON.parse(response.body);

    // Filter to only include containers with the Lilypad label
    data = data.filter((c) => c.Labels && CONTAINER_TAG in c.Labels);

    data.forEach((c) => {
      if (PINNED.has(c.Names[0])) {
        c.State = "pinned";
      }
    });

    res.send(data);
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
    const data = await _got.post(CONTAINER_STOP(containerId));
    logger.info(`Container ${containerId?.substring(0, 12)} stopped`);
    res.sendStatus(data.statusCode);
  } catch (error) {
    const err = error as DockerError;
    logger.error("Error stopping container:", err.message);
    res.sendStatus(err.statusCode || 500);
  }
});

router.post("/prune", async (_req: Request, res: Response) => {
  logger.debug("Pruning containers");

  try {
    const data = await _got.post(CONTAINER_PRUNE);
    logger.info("Containers pruned");
    res.send(data.body);
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
    const data = await _got(CONTAINER(containerId));
    res.send(data.body);
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
    const url = force === "true" 
      ? `${CONTAINER_REMOVE(containerId)}?force=true`
      : CONTAINER_REMOVE(containerId);
    const data = await _got.delete(url);
    logger.info(`Container ${containerId?.substring(0, 12)} removed`);
    res.sendStatus(data.statusCode);
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
    const data = await _got.post(CONTAINER_START(containerId));
    logger.info(`Container ${containerId?.substring(0, 12)} started`);
    res.sendStatus(data.statusCode);
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
    const data = await _got(CONTAINER_LOGS(containerId));

    const logs = data.body.split("\n");
    const text: string[] = [];

    logs.forEach((log: string) => {
      // header parsing can go here
      text.push(`${log.slice(8)}`);
    });

    res.send(JSON.stringify(text));
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
    const data = await _got.post(CONTAINER_RESTART(containerId));
    logger.info(`Container ${containerId?.substring(0, 12)} restarted`);
    res.sendStatus(data.statusCode);
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
    const data = await _got.post(CONTAINER_RENAME(containerId, name));
    logger.info(
      `Container ${containerId?.substring(0, 12)} renamed to ${name}`,
    );
    res.sendStatus(data.statusCode);
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
    const data = await _got.post(CONTAINER_PAUSE(containerId));
    logger.info(`Container ${containerId?.substring(0, 12)} paused`);
    res.sendStatus(data.statusCode);
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
    const data = await _got.post(CONTAINER_UNPAUSE(containerId));
    logger.info(`Container ${containerId?.substring(0, 12)} unpaused`);
    res.sendStatus(data.statusCode);
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
    const data = await _got(CONTAINER_STATS(containerId));
    const stats: ContainerStats = JSON.parse(data.body);

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
  } catch (error) {
    const err = error as DockerError;
    logger.error("Error fetching stats:", err.message);
    res.status(500).send({ error: "Failed to get stats" });
  }
});

export default router;
