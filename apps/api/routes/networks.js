import express from "express";
import got from "got";
import logger from "../utils/logger.js";

const router = express.Router();

const DOCKER_SOCK = process.env.DOCKER_SOCK;

const NETWORKS = `${DOCKER_SOCK}/networks`;

router.get("/", async (_req, res) => {
  logger.debug("Fetching networks");

  try {
    const data = await got(NETWORKS);
    res.send(data.body);
  } catch (error) {
    logger.error("Error fetching networks:", error.message);
    res.status(500).send({ error: "Failed to fetch networks" });
  }
});

export default router;
