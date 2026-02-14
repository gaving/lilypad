import type { Request, Response } from "express";
import express from "express";
import got from "got";
import logger from "../utils/logger.js";

const router: express.Router = express.Router();

const DOCKER_SOCK = process.env.DOCKER_SOCK;

const VOLUMES = `${DOCKER_SOCK}/volumes`;

interface DockerError extends Error {
  statusCode?: number;
}

router.get("/", async (_req: Request, res: Response) => {
  logger.debug("Fetching volumes");

  try {
    const data = await got(VOLUMES);
    res.send(data.body);
  } catch (error) {
    const err = error as DockerError;
    logger.error("Error fetching volumes:", err.message);
    res.status(500).send({ error: "Failed to fetch volumes" });
  }
});

export default router;
