import express from "express";
import got from "got";
import logger from "../utils/logger.js";

const router = express.Router();

const DOCKER_SOCK = process.env.DOCKER_SOCK;

const IMAGES = `${DOCKER_SOCK}/images/json`;
const IMAGE_REMOVE = (id) => `${DOCKER_SOCK}/images/${id}`;

// Validate image ID to prevent SSRF
const VALID_IMAGE_ID = /^[a-zA-Z0-9_:@.-]+$/;
const isValidImageId = (id) => {
  if (!id || typeof id !== 'string') return false;
  return VALID_IMAGE_ID.test(id) && id.length <= 127;
};

router.get("/", async (_req, res) => {
  logger.debug("Fetching images");

  try {
    let data = await got(IMAGES);
    data = JSON.parse(data.body);
    res.send(data);
  } catch (error) {
    logger.error("Error fetching images:", error.message);
    res.status(500).send({ error: "Failed to fetch images" });
  }
});

router.delete("/:imageId", async (req, res) => {
  const { imageId } = req.params;
  if (!isValidImageId(imageId)) {
    return res.status(400).send({ error: "Invalid image ID" });
  }
  logger.debug("Removing image:", imageId?.substring(0, 12));

  try {
    const data = await got.delete(IMAGE_REMOVE(imageId));
    logger.info(`Image ${imageId?.substring(0, 12)} removed`);
    res.sendStatus(data.statusCode);
  } catch (error) {
    logger.error("Error removing image:", error.message);
    res.sendStatus(error.statusCode || 500);
  }
});

export default router;
