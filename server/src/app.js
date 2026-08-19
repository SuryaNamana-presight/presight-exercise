import cors from "cors";
import express from "express";
import fs from "node:fs";
import path from "node:path";
import { config } from "./config.js";
import { authRouter } from "./auth/router.js";
import { requireAuth } from "./auth/middleware.js";
import { usersRouter } from "./users/router.js";

export const app = express();
app.disable("x-powered-by");
app.use(cors());
app.use(express.json({ limit: "50kb" }));
app.get("/api/health", (_request, response) => response.json({ status: "ok" }));
app.use("/api/auth", authRouter);
app.use("/api/users", requireAuth, usersRouter);

if (fs.existsSync(config.clientPath)) {
  app.use(express.static(config.clientPath, { maxAge: "1y", immutable: true }));
  app.get("/{*path}", (_request, response) =>
    response.sendFile(path.join(config.clientPath, "index.html")),
  );
}

app.use((error, _request, response, _next) => {
  console.error(error);
  response
    .status(500)
    .json({ message: "Something went wrong while loading the directory." });
});
