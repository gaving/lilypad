import express from "express";
import got from "got";
import logger from "../utils/logger.js";

const router = express.Router();

const DOCKER_SOCK = process.env.DOCKER_SOCK;

const INFO = `${DOCKER_SOCK}/info`;

router.get("/", async (_req, res) => {
  logger.debug("Fetching Docker info");

  try {
    const data = await got(INFO);
    res.send(data.body);
  } catch (error) {
    logger.error("Error fetching info:", error.message);
    res.status(500).send({ error: "Failed to fetch info" });
  }
});

export default router;
