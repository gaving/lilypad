import logger from "./logger.js";

/**
 * Normalizes Docker endpoint URLs to work with both Unix sockets and HTTP endpoints
 * 
 * Supports:
 * - Unix socket paths: /var/run/docker.sock → http://unix:/var/run/docker.sock:
 * - HTTP URLs: http://localhost:2375 → http://localhost:2375 (passes through)
 * - HTTPS URLs: https://host:2376 → https://host:2376 (passes through)
 * - Already formatted Unix URLs: http://unix:/var/run/docker.sock: (passes through)
 */
export const normalizeEndpoint = (endpoint: string): string => {
  const trimmed = endpoint.trim();
  
  // If it's already HTTP(S), use as-is
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  
  // If it's a Unix socket path, convert to got's format
  if (trimmed.startsWith('/')) {
    return `http://unix:${trimmed}:`;
  }
  
  // Unknown format, log warning but try to use as-is
  logger.warn(`Unrecognized Docker endpoint format: ${trimmed}`);
  return trimmed;
};

/**
 * Parses Docker endpoints from environment variables
 * Supports both legacy DOCKER_SOCK and new DOCKER_ENDPOINTS
 */
export const parseEndpoints = (): string[] => {
  const DOCKER_SOCK = process.env.DOCKER_SOCK;
  const DOCKER_ENDPOINTS = process.env.DOCKER_ENDPOINTS;

  const endpoints: string[] = DOCKER_ENDPOINTS
    ? DOCKER_ENDPOINTS.split(',').map(normalizeEndpoint).filter(e => e)
    : DOCKER_SOCK
    ? [normalizeEndpoint(DOCKER_SOCK)]
    : [];

  if (endpoints.length === 0) {
    logger.error("No Docker endpoints configured. Set DOCKER_ENDPOINTS or DOCKER_SOCK");
  }

  return endpoints;
};

/**
 * Extracts node name/hostname from endpoint URL
 */
export const getNodeName = (endpoint: string): string => {
  try {
    const url = new URL(endpoint);
    return url.hostname;
  } catch {
    return 'unknown';
  }
};
