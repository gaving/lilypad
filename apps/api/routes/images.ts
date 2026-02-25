import type { Request, Response } from "express";
import express from "express";
import got from "got";
import logger from "../utils/logger.js";

const router: express.Router = express.Router();

// Support both legacy single-endpoint and new multi-endpoint configuration
const DOCKER_SOCK = process.env.DOCKER_SOCK;
const DOCKER_ENDPOINTS = process.env.DOCKER_ENDPOINTS;

// Parse endpoints - use DOCKER_ENDPOINTS if available, fall back to DOCKER_SOCK
const ENDPOINTS: string[] = DOCKER_ENDPOINTS
  ? DOCKER_ENDPOINTS.split(',').map(e => e.trim()).filter(e => e)
  : DOCKER_SOCK
  ? [DOCKER_SOCK]
  : [];

if (ENDPOINTS.length === 0) {
  logger.error("No Docker endpoints configured for images. Set DOCKER_ENDPOINTS or DOCKER_SOCK");
}

// URL builders - now endpoint-aware
const IMAGES = (endpoint: string) => `${endpoint}/images/json`;
const IMAGE_REMOVE = (endpoint: string, id: string) => `${endpoint}/images/${id}`;

// Helper to extract hostname from endpoint URL
const getNodeName = (endpoint: string): string => {
  try {
    const url = new URL(endpoint);
    return url.hostname;
  } catch {
    return 'unknown';
  }
};

// Validate image ID to prevent SSRF
const VALID_IMAGE_ID = /^[a-zA-Z0-9_:@.-]+$/;
const isValidImageId = (id: string | undefined): boolean => {
  if (!id || typeof id !== 'string') return false;
  return VALID_IMAGE_ID.test(id) && id.length <= 127;
};

interface DockerError extends Error {
  statusCode?: number;
}

interface ImageData {
  Id: string;
  RepoTags?: string[];
  Size: number;
  Created: number;
  Node?: string;
}

router.get("/", async (_req: Request, res: Response) => {
  logger.debug("Fetching images from all nodes");

  try {
    // Query all endpoints in parallel
    const results = await Promise.allSettled(
      ENDPOINTS.map(async (endpoint) => {
        const data = await got(IMAGES(endpoint));
        const images: ImageData[] = JSON.parse(data.body);
        
        // Add node information to each image
        const nodeName = getNodeName(endpoint);
        return images.map(image => ({
          ...image,
          Node: nodeName
        }));
      })
    );

    // Merge results from all nodes
    let allImages: ImageData[] = [];
    const nodeErrors: { node: string; error: string }[] = [];

    results.forEach((result, index) => {
      const nodeName = getNodeName(ENDPOINTS[index]);
      if (result.status === 'fulfilled') {
        allImages = allImages.concat(result.value);
      } else {
        logger.error(`Failed to fetch images from ${nodeName}:`, result.reason);
        nodeErrors.push({ node: nodeName, error: String(result.reason) });
      }
    });

    // Send response with optional error info
    const response: { images: ImageData[]; errors?: typeof nodeErrors } = {
      images: allImages
    };
    if (nodeErrors.length > 0) {
      response.errors = nodeErrors;
    }

    res.send(response);
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
    // Try to remove from all endpoints - image will only exist on some
    const results = await Promise.allSettled(
      ENDPOINTS.map(endpoint => got.delete(IMAGE_REMOVE(endpoint, imageId)))
    );
    
    const successCount = results.filter(r => r.status === 'fulfilled').length;
    logger.info(`Image ${imageId?.substring(0, 12)} removed from ${successCount}/${ENDPOINTS.length} nodes`);
    res.sendStatus(200);
  } catch (error) {
    const err = error as DockerError;
    logger.error("Error removing image:", err.message);
    res.sendStatus(err.statusCode || 500);
  }
});

export default router;
