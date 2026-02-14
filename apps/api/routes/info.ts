import type { Request, Response } from "express";
import express from "express";
import got from "got";
import logger from "../utils/logger.js";

const router: express.Router = express.Router();

const DOCKER_SOCK = process.env.DOCKER_SOCK;

const INFO = `${DOCKER_SOCK}/info`;

interface DockerError extends Error {
  statusCode?: number;
}

router.get("/", async (_req: Request, res: Response) => {
  logger.debug("Fetching Docker info");

  try {
    const data = await got(INFO);
    res.send(data.body);
  } catch (error) {
    const err = error as DockerError;
    logger.error("Error fetching info:", err.message);
    res.status(500).send({ error: "Failed to fetch info" });
  }
});

export default router;
