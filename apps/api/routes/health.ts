import type { Request, Response } from "express";
import express from "express";
import got from "got";
import { parseEndpoints, getNodeName } from "../utils/docker-endpoints.js";
import logger from "../utils/logger.js";

const router: express.Router = express.Router();

// Parse and normalize Docker endpoints
const ENDPOINTS = parseEndpoints();

interface NodeStatus {
  name: string;
  endpoint: string;
  status: 'healthy' | 'unhealthy';
  latency?: number;
  error?: string;
}

interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  nodes: NodeStatus[];
  totalNodes: number;
  healthyNodes: number;
}

// Ping endpoint for Docker socket (health check)
const PING = (endpoint: string) => `${endpoint}/_ping`;

router.get("/", async (_req: Request, res: Response) => {
  logger.debug("Health check requested");

  if (ENDPOINTS.length === 0) {
    res.status(503).send({
      status: 'unhealthy',
      error: 'No Docker endpoints configured',
      nodes: []
    });
    return;
  }

  const nodeStatuses: NodeStatus[] = [];

  // Check all endpoints in parallel
  const checks = await Promise.allSettled(
    ENDPOINTS.map(async (endpoint) => {
      const nodeName = getNodeName(endpoint);
      const checkStart = Date.now();
      
      try {
        await got(PING(endpoint), { timeout: { request: 5000 } });
        const latency = Date.now() - checkStart;
        
        return {
          name: nodeName,
          endpoint: endpoint.replace(/:\/\/[^:]+:[0-9]+/, '://***:***'), // Hide credentials if any
          status: 'healthy' as const,
          latency
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return {
          name: nodeName,
          endpoint: endpoint.replace(/:\/\/[^:]+:[0-9]+/, '://***:***'),
          status: 'unhealthy' as const,
          error: errorMessage
        };
      }
    })
  );

  checks.forEach(check => {
    if (check.status === 'fulfilled') {
      nodeStatuses.push(check.value);
    } else {
      nodeStatuses.push({
        name: 'unknown',
        endpoint: 'unknown',
        status: 'unhealthy',
        error: 'Check failed'
      });
    }
  });

  const healthyNodes = nodeStatuses.filter(n => n.status === 'healthy').length;
  const totalNodes = nodeStatuses.length;
  
  let overallStatus: HealthResponse['status'];
  if (healthyNodes === totalNodes) {
    overallStatus = 'healthy';
  } else if (healthyNodes > 0) {
    overallStatus = 'degraded';
  } else {
    overallStatus = 'unhealthy';
  }

  const response: HealthResponse = {
    status: overallStatus,
    nodes: nodeStatuses,
    totalNodes,
    healthyNodes
  };

  // Return 503 if completely unhealthy, 200 otherwise
  const statusCode = overallStatus === 'unhealthy' ? 503 : 200;
  res.status(statusCode).send(response);
});

export default router;
