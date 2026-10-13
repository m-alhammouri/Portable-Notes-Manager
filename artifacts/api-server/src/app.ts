import express, { type Express } from "express";
import cors from "cors";
import path from "node:path";
import { existsSync } from "node:fs";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

if (process.env.NODE_ENV === "production") {
  const frontendDir = path.resolve(
    process.env.FRONTEND_DIST_DIR ??
      "artifacts/portable-notes-manager/dist/public",
  );
  const indexFile = path.join(frontendDir, "index.html");

  if (existsSync(indexFile)) {
    app.use(express.static(frontendDir));
    app.get("/{*splat}", (_req, res) => {
      res.sendFile(indexFile);
    });
  }
}

export default app;
