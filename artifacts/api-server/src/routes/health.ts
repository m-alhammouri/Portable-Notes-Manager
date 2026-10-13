import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import {
  GetApplicationHealthResponse,
  HealthCheckResponse,
} from "@workspace/api-zod";
import { sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/healthz", (_req, res) => {
  const data = HealthCheckResponse.parse({ status: "ok" });
  res.json(data);
});

router.get("/health", async (req, res): Promise<void> => {
  try {
    await db.execute(sql`select 1`);
    const data = GetApplicationHealthResponse.parse({
      status: "ok",
      database: true,
      version: process.env.APP_VERSION ?? "0.1.0",
    });
    res.json(data);
  } catch (err) {
    req.log.error({ err }, "Database health check failed");
    const data = GetApplicationHealthResponse.parse({
      status: "error",
      database: false,
      version: process.env.APP_VERSION ?? "0.1.0",
    });
    res.status(503).json(data);
  }
});

export default router;
