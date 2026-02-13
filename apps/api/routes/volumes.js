import express from "express";
import got from "got";
import logger from "../utils/logger.js";

const router = express.Router();

const DOCKER_SOCK = process.env.DOCKER_SOCK;

const VOLUMES = `${DOCKER_SOCK}/volumes`;

router.get("/", async (_req, res) => {
  logger.debug("Fetching volumes");

  try {
    const data = await got(VOLUMES);
    res.send(data.body);
  } catch (error) {
    logger.error("Error fetching volumes:", error.message);
    res.status(500).send({ error: "Failed to fetch volumes" });
  }
});

export default router;
