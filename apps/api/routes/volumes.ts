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
  logger.error("No Docker endpoints configured for volumes. Set DOCKER_ENDPOINTS or DOCKER_SOCK");
}

// URL builders - now endpoint-aware
const VOLUMES = (endpoint: string) => `${endpoint}/volumes`;

// Helper to extract hostname from endpoint URL
const getNodeName = (endpoint: string): string => {
  try {
    const url = new URL(endpoint);
    return url.hostname;
  } catch {
    return 'unknown';
  }
};

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

    // Send response with optional error info
    const response: { volumes: VolumeData[]; errors?: typeof nodeErrors } = {
      volumes: allVolumes
    };
    if (nodeErrors.length > 0) {
      response.errors = nodeErrors;
    }

    res.send(response);
  } catch (error) {
    const err = error as DockerError;
    logger.error("Error fetching volumes:", err.message);
    res.status(500).send({ error: "Failed to fetch volumes" });
  }
});

export default router;
