import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}

export function serveStatic(app: Express) {
  const moduleDir = typeof __dirname !== "undefined" ? __dirname : path.dirname(fileURLToPath(import.meta.url));
  const candidates = [
    path.resolve(process.cwd(), "dist", "public"),
    path.resolve(moduleDir, "public"),
    path.resolve(moduleDir, "..", "dist", "public"),
    path.resolve(moduleDir, "..", "..", "dist", "public"),
  ];
  const distPath = candidates.find((p) => fs.existsSync(p));

  if (!distPath) {
    app.get("*", (_req, res) => {
      res
        .status(500)
        .set({ "Content-Type": "text/plain" })
        .end(
          `Client build not found. Looked in: \n- ${candidates.join("\n- ")}\nMake sure 'npm run build' runs and vercel.json includes dist/public.`,
        );
    });
    return;
  }

  app.use((req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    return (express.static(distPath) as any)(req, res, next);
  });

  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}