import type { Request, Response } from "express";
import express from "express";
import got from "got";
import { parseEndpoints, getNodeName } from "../utils/docker-endpoints.js";
import logger from "../utils/logger.js";

const router: express.Router = express.Router();

// Parse and normalize Docker endpoints
const ENDPOINTS = parseEndpoints();

// URL builders - now endpoint-aware
const VOLUMES = (endpoint: string) => `${endpoint}/volumes`;

interface DockerError extends Error {
  statusCode?: number;
}

interface VolumeData {
  Name: string;
  Driver: string;
  Mountpoint: string;
  CreatedAt?: string;
  Labels?: { [key: string]: string };
  Node?: string;
}

interface VolumesResponse {
  Volumes: VolumeData[];
  Warnings?: string[];
}

router.get("/", async (_req: Request, res: Response) => {
  logger.debug("Fetching volumes from all nodes");

  try {
    // Query all endpoints in parallel
    const results = await Promise.allSettled(
      ENDPOINTS.map(async (endpoint) => {
        const data = await got(VOLUMES(endpoint));
        const response: VolumesResponse = JSON.parse(data.body);
        
        // Add node information to each volume
        const nodeName = getNodeName(endpoint);
        const volumes = response.Volumes || [];
        return volumes.map(volume => ({
          ...volume,
          Node: nodeName
        }));
      })
    );

    // Merge results from all nodes
    let allVolumes: VolumeData[] = [];
    const nodeErrors: { node: string; error: string }[] = [];

    results.forEach((result, index) => {
      const nodeName = getNodeName(ENDPOINTS[index]);
      if (result.status === 'fulfilled') {
        allVolumes = allVolumes.concat(result.value);
      } else {
        logger.error(`Failed to fetch volumes from ${nodeName}:`, result.reason);
        nodeErrors.push({ node: nodeName, error: String(result.reason) });
      }
    });

    // Send response as array (backward compatibility)
    if (nodeErrors.length > 0) {
      logger.warn(`Volume fetch completed with ${nodeErrors.length} node errors:`, nodeErrors);
    }

    res.send(allVolumes);
  } catch (error) {
    const err = error as DockerError;
    logger.error("Error fetching volumes:", err.message);
    res.status(500).send({ error: "Failed to fetch volumes" });
  }
});

export default router;
