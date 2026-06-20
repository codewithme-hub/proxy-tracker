import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import passport from "./config/passport.js";
import { env } from "./config/env.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";

import authRoutes from "./routes/authRoutes.js";
import groupRoutes from "./routes/groupRoutes.js";
import semesterRoutes from "./routes/semesterRoutes.js";
import proxyRoutes from "./routes/proxyRoutes.js";

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: env.clientUrl,
      credentials: true,
    })
  );
  app.use(express.json());
  app.use(cookieParser());
  app.use(passport.initialize());

  app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

  app.use("/api/auth", authRoutes);
  app.use("/api/groups", groupRoutes);
  // Nested resources under a group: /api/groups/:groupId/semesters, /:groupId/proxies
  app.use("/api/groups/:groupId/semesters", semesterRoutes);
  app.use("/api/groups/:groupId/proxies", proxyRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
