import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
import express from "express";
import got from "got";

const _got = got.extend({ enableUnixSockets: true });

dotenv.config();

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

router.get("/", async (req, res) => {
  try {
    let data = await _got(CONTAINERS);
    data = JSON.parse(data.body);

    data.map((c) => {
      if (PINNED.has(c.Names[0])) {
        c.State = "pinned";
      }
    });

    res.send(data);
  } catch (error) {
    console.error(error);
  }
});

router.post("/pin", async (req, res) => {
  try {
    if (PINNED.has(req.body.containerName)) {
      PINNED.delete(req.body.containerName);
    } else {
      PINNED.add(req.body.containerName);
    }
    res.sendStatus(200);
  } catch (error) {
    res.sendStatus(error.statusCode);
    console.error("Error", error);
  }
});

router.post("/stop", async (req, res) => {
  console.log(CONTAINER_STOP(req.body.containerId));

  try {
    const data = await _got.post(CONTAINER_STOP(req.body.containerId));
    res.sendStatus(await data.statusCode);
  } catch (error) {
    res.sendStatus(error.statusCode);
    console.error("Error", error);
  }
});

router.post("/prune", async (req, res) => {
  console.log(CONTAINER_PRUNE);

  try {
    const data = await _got.post(CONTAINER_PRUNE);
    res.send(await data.body);
  } catch (error) {
    res.sendStatus(error.statusCode);
    console.error("Error", error);
  }
});

router.get("/:containerId", async (req, res) => {
  console.log(CONTAINER(req.params.containerId));

  try {
    const data = await _got(CONTAINER(req.params.containerId));
    res.send(data.body);
  } catch (error) {
    console.error(error);
  }
});

router.delete("/:containerId", async (req, res) => {
  console.log(CONTAINER_REMOVE(req.params.containerId));

  try {
    const data = await _got.delete(CONTAINER_REMOVE(req.params.containerId));
    res.sendStatus(await data.statusCode);
  } catch (error) {
    res.sendStatus(error.statusCode);
    console.error("Error", error);
  }
});

router.post("/:containerId", async (req, res) => {
  console.log(CONTAINER_START(req.params.containerId));

  try {
    const data = await _got.post(CONTAINER_START(req.params.containerId));
    res.sendStatus(await data.statusCode);
  } catch (error) {
    res.sendStatus(error.statusCode);
    console.error("Error", error);
  }
});

router.get("/:containerId/logs", async (req, res) => {
  console.log(CONTAINER_LOGS(req.params.containerId));

  try {
    const data = await _got(CONTAINER_LOGS(req.params.containerId));

    let logs = data.body.split("\n");
    let text = [];

    logs.map((log) => {
      // header parsing can go here
      text.push(`${log.slice(8)}`);
    });

    res.send(JSON.stringify(text));
  } catch (error) {
    console.error(error);
  }
});

router.post("/:containerId/restart", async (req, res) => {
  console.log(CONTAINER_RESTART(req.params.containerId));

  try {
    const data = await _got.post(CONTAINER_RESTART(req.params.containerId));
    res.sendStatus(await data.statusCode);
  } catch (error) {
    res.sendStatus(error.statusCode);
    console.error("Error", error);
  }
});

router.post("/:containerId/rename", async (req, res) => {
  console.log(CONTAINER_RENAME(req.params.containerId, req.query.name));

  try {
    const data = await _got.post(
      CONTAINER_RENAME(req.params.containerId, req.query.name),
    );
    res.sendStatus(await data.statusCode);
  } catch (error) {
    res.sendStatus(error.statusCode);
    console.error("Error", error);
  }
});

router.post("/:containerId/pause", async (req, res) => {
  console.log(CONTAINER_PAUSE(req.params.containerId));

  try {
    const data = await _got.post(CONTAINER_PAUSE(req.params.containerId));
    res.sendStatus(await data.statusCode);
  } catch (error) {
    res.sendStatus(error.statusCode);
    console.error("Error", error);
  }
});

router.post("/:containerId/unpause", async (req, res) => {
  console.log(CONTAINER_UNPAUSE(req.params.containerId));

  try {
    const data = await _got.post(CONTAINER_UNPAUSE(req.params.containerId));
    res.sendStatus(await data.statusCode);
  } catch (error) {
    res.sendStatus(error.statusCode);
    console.error("Error", error);
  }
});

router.get("/:containerId/stats", async (req, res) => {
  console.log(CONTAINER_STATS(req.params.containerId));

  try {
    const data = await _got(CONTAINER_STATS(req.params.containerId));
    const stats = JSON.parse(data.body);
    
    // Calculate CPU percentage
    const cpuDelta = stats.cpu_stats.cpu_usage.total_usage - stats.precpu_stats.cpu_usage.total_usage;
    const systemDelta = stats.cpu_stats.system_cpu_usage - stats.precpu_stats.system_cpu_usage;
    const cpuPercent = (cpuDelta / systemDelta) * stats.cpu_stats.online_cpus * 100;
    
    // Calculate memory usage
    const memoryUsage = stats.memory_stats.usage || 0;
    const memoryLimit = stats.memory_stats.limit || 1;
    const memoryPercent = (memoryUsage / memoryLimit) * 100;
    
    res.send({
      cpuPercent: Math.round(cpuPercent * 100) / 100,
      memoryPercent: Math.round(memoryPercent * 100) / 100,
      memoryUsage: Math.round(memoryUsage / 1024 / 1024 * 100) / 100, // MB
      memoryLimit: Math.round(memoryLimit / 1024 / 1024 * 100) / 100, // MB
    });
  } catch (error) {
    res.status(500).send({ error: "Failed to get stats" });
    console.error("Error getting stats:", error);
  }
});

export default router;
