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
  logger.error("No Docker endpoints configured for networks. Set DOCKER_ENDPOINTS or DOCKER_SOCK");
}

// URL builders - now endpoint-aware
const NETWORKS = (endpoint: string) => `${endpoint}/networks`;

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

interface NetworkData {
  Id: string;
  Name: string;
  Driver: string;
  Scope: string;
  Created?: string;
  Labels?: { [key: string]: string };
  Node?: string;
}

router.get("/", async (_req: Request, res: Response) => {
  logger.debug("Fetching networks from all nodes");

  try {
    // Query all endpoints in parallel
    const results = await Promise.allSettled(
      ENDPOINTS.map(async (endpoint) => {
        const data = await got(NETWORKS(endpoint));
        const networks: NetworkData[] = JSON.parse(data.body);
        
        // Add node information to each network
        const nodeName = getNodeName(endpoint);
        return networks.map(network => ({
          ...network,
          Node: nodeName
        }));
      })
    );

    // Merge results from all nodes
    let allNetworks: NetworkData[] = [];
    const nodeErrors: { node: string; error: string }[] = [];

    results.forEach((result, index) => {
      const nodeName = getNodeName(ENDPOINTS[index]);
      if (result.status === 'fulfilled') {
        allNetworks = allNetworks.concat(result.value);
      } else {
        logger.error(`Failed to fetch networks from ${nodeName}:`, result.reason);
        nodeErrors.push({ node: nodeName, error: String(result.reason) });
      }
    });

    // Send response with optional error info
    const response: { networks: NetworkData[]; errors?: typeof nodeErrors } = {
      networks: allNetworks
    };
    if (nodeErrors.length > 0) {
      response.errors = nodeErrors;
    }

    res.send(response);
  } catch (error) {
    const err = error as DockerError;
    logger.error("Error fetching networks:", err.message);
    res.status(500).send({ error: "Failed to fetch networks" });
  }
});

export default router;
