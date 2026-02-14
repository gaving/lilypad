import type { Request, Response } from "express";
import express from "express";
import got from "got";
import logger from "../utils/logger.js";

const router: express.Router = express.Router();

const DOCKER_SOCK = process.env.DOCKER_SOCK;

const IMAGES = `${DOCKER_SOCK}/images/json`;
const IMAGE_REMOVE = (id: string) => `${DOCKER_SOCK}/images/${id}`;

// Validate image ID to prevent SSRF
const VALID_IMAGE_ID = /^[a-zA-Z0-9_:@.-]+$/;
const isValidImageId = (id: string | undefined): boolean => {
  if (!id || typeof id !== 'string') return false;
  return VALID_IMAGE_ID.test(id) && id.length <= 127;
};

interface DockerError extends Error {
  statusCode?: number;
}

router.get("/", async (_req: Request, res: Response) => {
  logger.debug("Fetching images");

  try {
    const data = await got(IMAGES);
    const images = JSON.parse(data.body);
    res.send(images);
  } catch (error) {
    const err = error as DockerError;
    logger.error("Error fetching images:", err.message);
    res.status(500).send({ error: "Failed to fetch images" });
  }
});

router.delete("/:imageId", async (req: Request, res: Response): Promise<void> => {
  const { imageId } = req.params as { imageId: string };
  if (!isValidImageId(imageId)) {
    res.status(400).send({ error: "Invalid image ID" });
    return;
  }
  logger.debug("Removing image:", imageId?.substring(0, 12));

  try {
    const data = await got.delete(IMAGE_REMOVE(imageId));
    logger.info(`Image ${imageId?.substring(0, 12)} removed`);
    res.sendStatus(data.statusCode);
  } catch (error) {
    const err = error as DockerError;
    logger.error("Error removing image:", err.message);
    res.sendStatus(err.statusCode || 500);
  }
});

export default router;
