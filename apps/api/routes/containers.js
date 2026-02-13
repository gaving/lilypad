import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
import express from "express";
import got from "got";
import logger from "../utils/logger.js";

const _got = got.extend({ enableUnixSockets: true });

dotenv.config({ quiet: true });

const router = express.Router();

const DOCKER_SOCK = process.env.DOCKER_SOCK;

const CONTAINERS = `${DOCKER_SOCK}/containers/json?all=true`;
const CONTAINER_STOP = (id) => `${DOCKER_SOCK}/containers/${id}/stop`;
const CONTAINER_PRUNE = `${DOCKER_SOCK}/containers/prune`;
const CONTAINER = (id) =>
  `${DOCKER_SOCK}/containers/json?all=true&filters={"id":["${id}"]}`;
const CONTAINER_REMOVE = (id) => `${DOCKER_SOCK}/containers/${id}?v=1`;
const CONTAINER_START = (id) => `${DOCKER_SOCK}/containers/${id}/start`;
const CONTAINER_RESTART = (id) => `${DOCKER_SOCK}/containers/${id}/restart`;
const CONTAINER_RENAME = (id, name) =>
  `${DOCKER_SOCK}/containers/${id}/rename?name=${name}`;
const CONTAINER_PAUSE = (id) => `${DOCKER_SOCK}/containers/${id}/pause`;
const CONTAINER_UNPAUSE = (id) => `${DOCKER_SOCK}/containers/${id}/unpause`;
const CONTAINER_LOGS = (id) =>
  `${DOCKER_SOCK}/containers/${id}/logs?stdout=true&stderr=true&tail=200`;
const CONTAINER_STATS = (id) =>
  `${DOCKER_SOCK}/containers/${id}/stats?stream=false`;

const PINNED = new Set();

// Filter to only return containers managed by Lilypad (ones with the label)
const CONTAINER_TAG = process.env.CONTAINER_TAG || "org.domain.review.name";

router.get("/", async (_req, res) => {
  try {
    let data = await _got(CONTAINERS);
    data = JSON.parse(data.body);

    // Filter to only include containers with the Lilypad label
    data = data.filter((c) => c.Labels && CONTAINER_TAG in c.Labels);

    data.forEach((c) => {
      if (PINNED.has(c.Names[0])) {
        c.State = "pinned";
      }
    });

    res.send(data);
  } catch (error) {
    logger.error("Failed to fetch containers:", error.message);
    res.status(500).send({ error: "Failed to fetch containers" });
  }
});

router.post("/pin", async (req, res) => {
  try {
    const { containerName } = req.body;
    if (PINNED.has(containerName)) {
      PINNED.delete(containerName);
      logger.info(`Container ${containerName} unpinned`);
    } else {
      PINNED.add(containerName);
      logger.info(`Container ${containerName} pinned`);
    }
    res.sendStatus(200);
  } catch (error) {
    logger.error("Error pinning container:", error.message);
    res.sendStatus(error.statusCode || 500);
  }
});

router.post("/stop", async (req, res) => {
  const { containerId } = req.body;
  logger.debug("Stopping container:", containerId?.substring(0, 12));

  try {
    const data = await _got.post(CONTAINER_STOP(containerId));
    logger.info(`Container ${containerId?.substring(0, 12)} stopped`);
    res.sendStatus(data.statusCode);
  } catch (error) {
    logger.error("Error stopping container:", error.message);
    res.sendStatus(error.statusCode || 500);
  }
});

router.post("/prune", async (_req, res) => {
  logger.debug("Pruning containers");

  try {
    const data = await _got.post(CONTAINER_PRUNE);
    logger.info("Containers pruned");
    res.send(data.body);
  } catch (error) {
    logger.error("Error pruning containers:", error.message);
    res.sendStatus(error.statusCode || 500);
  }
});

router.get("/:containerId", async (req, res) => {
  const { containerId } = req.params;
  logger.debug("Fetching container:", containerId?.substring(0, 12));

  try {
    const data = await _got(CONTAINER(containerId));
    res.send(data.body);
  } catch (error) {
    logger.error("Error fetching container:", error.message);
    res.status(500).send({ error: "Failed to fetch container" });
  }
});

router.delete("/:containerId", async (req, res) => {
  const { containerId } = req.params;
  const { force } = req.query;
  logger.debug("Removing container:", containerId?.substring(0, 12), force ? "(force)" : "");

  try {
    const url = force === "true" 
      ? `${CONTAINER_REMOVE(containerId)}?force=true`
      : CONTAINER_REMOVE(containerId);
    const data = await _got.delete(url);
    logger.info(`Container ${containerId?.substring(0, 12)} removed`);
    res.sendStatus(data.statusCode);
  } catch (error) {
    logger.error("Error removing container:", error.message);
    res.sendStatus(error.statusCode || 500);
  }
});

router.post("/:containerId", async (req, res) => {
  const { containerId } = req.params;
  logger.debug("Starting container:", containerId?.substring(0, 12));

  try {
    const data = await _got.post(CONTAINER_START(containerId));
    logger.info(`Container ${containerId?.substring(0, 12)} started`);
    res.sendStatus(data.statusCode);
  } catch (error) {
    logger.error("Error starting container:", error.message);
    res.sendStatus(error.statusCode || 500);
  }
});

router.get("/:containerId/logs", async (req, res) => {
  const { containerId } = req.params;
  logger.debug("Fetching logs for container:", containerId?.substring(0, 12));

  try {
    const data = await _got(CONTAINER_LOGS(containerId));

    const logs = data.body.split("\n");
    const text = [];

    logs.forEach((log) => {
      // header parsing can go here
      text.push(`${log.slice(8)}`);
    });

    res.send(JSON.stringify(text));
  } catch (error) {
    logger.error("Error fetching logs:", error.message);
    res.status(500).send({ error: "Failed to fetch logs" });
  }
});

router.post("/:containerId/restart", async (req, res) => {
  const { containerId } = req.params;
  logger.debug("Restarting container:", containerId?.substring(0, 12));

  try {
    const data = await _got.post(CONTAINER_RESTART(containerId));
    logger.info(`Container ${containerId?.substring(0, 12)} restarted`);
    res.sendStatus(data.statusCode);
  } catch (error) {
    logger.error("Error restarting container:", error.message);
    res.sendStatus(error.statusCode || 500);
  }
});

router.post("/:containerId/rename", async (req, res) => {
  const { containerId } = req.params;
  const { name } = req.query;
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
    logger.error("Error renaming container:", error.message);
    res.sendStatus(error.statusCode || 500);
  }
});

router.post("/:containerId/pause", async (req, res) => {
  const { containerId } = req.params;
  logger.debug("Pausing container:", containerId?.substring(0, 12));

  try {
    const data = await _got.post(CONTAINER_PAUSE(containerId));
    logger.info(`Container ${containerId?.substring(0, 12)} paused`);
    res.sendStatus(data.statusCode);
  } catch (error) {
    logger.error("Error pausing container:", error.message);
    res.sendStatus(error.statusCode || 500);
  }
});

router.post("/:containerId/unpause", async (req, res) => {
  const { containerId } = req.params;
  logger.debug("Unpausing container:", containerId?.substring(0, 12));

  try {
    const data = await _got.post(CONTAINER_UNPAUSE(containerId));
    logger.info(`Container ${containerId?.substring(0, 12)} unpaused`);
    res.sendStatus(data.statusCode);
  } catch (error) {
    logger.error("Error unpausing container:", error.message);
    res.sendStatus(error.statusCode || 500);
  }
});

router.get("/:containerId/stats", async (req, res) => {
  const { containerId } = req.params;
  logger.debug("Fetching stats for container:", containerId?.substring(0, 12));

  try {
    const data = await _got(CONTAINER_STATS(containerId));
    const stats = JSON.parse(data.body);

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
    logger.error("Error fetching stats:", error.message);
    res.status(500).send({ error: "Failed to get stats" });
  }
});

export default router;
