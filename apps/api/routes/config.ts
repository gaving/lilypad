import type { Request, Response } from "express";
import express from "express";

const router = express.Router();

interface ConfigResponse {
  containerTag: string;
  containerDesc: string;
  containerIcon: string;
  launchUrl: string;
}

router.get("/", (_req: Request, res: Response<ConfigResponse>) => {
  const config: ConfigResponse = {
    containerTag: process.env.CONTAINER_TAG || "org.domain.review.name",
    containerDesc: process.env.CONTAINER_DESC || "org.domain.review.desc",
    containerIcon: process.env.CONTAINER_ICON || "org.domain.review.icon",
    launchUrl: process.env.LAUNCH_URL || "org.domain.review.url",
  };

  res.json(config);
});

export default router;
