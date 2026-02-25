import type { Request, Response } from "express";
import express from "express";
import got from "got";
import { parseEndpoints, getNodeName } from "../utils/docker-endpoints.js";
import logger from "../utils/logger.js";

const router: express.Router = express.Router();

// Parse and normalize Docker endpoints
const ENDPOINTS = parseEndpoints();

// URL builders - now endpoint-aware
const NETWORKS = (endpoint: string) => `${endpoint}/networks`;

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

    // Send response as array (backward compatibility)
    if (nodeErrors.length > 0) {
      logger.warn(`Network fetch completed with ${nodeErrors.length} node errors:`, nodeErrors);
    }

    res.send(allNetworks);
  } catch (error) {
    const err = error as DockerError;
    logger.error("Error fetching networks:", err.message);
    res.status(500).send({ error: "Failed to fetch networks" });
  }
});

export default router;
