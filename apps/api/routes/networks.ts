import type { Request, Response } from "express";
import express from "express";
import got from "got";
import logger from "../utils/logger.js";

const router: express.Router = express.Router();

const DOCKER_SOCK = process.env.DOCKER_SOCK;

const NETWORKS = `${DOCKER_SOCK}/networks`;

interface DockerError extends Error {
  statusCode?: number;
}

router.get("/", async (_req: Request, res: Response) => {
  logger.debug("Fetching networks");

  try {
    const data = await got(NETWORKS);
    res.send(data.body);
  } catch (error) {
    const err = error as DockerError;
    logger.error("Error fetching networks:", err.message);
    res.status(500).send({ error: "Failed to fetch networks" });
  }
});

export default router;
