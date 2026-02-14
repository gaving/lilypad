import type { Request, Response, Router } from "express";
import express from "express";

const router: Router = express.Router();

interface ConfigResponse {
  namespace: string;
}

router.get("/", (_req: Request, res: Response<ConfigResponse>) => {
  const config: ConfigResponse = {
    namespace: process.env.NAMESPACE || "org.domain.review",
  };

  res.json(config);
});

export default router;
