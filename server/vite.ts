import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { type Server } from "http";

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  // Dynamically import Vite and config only in development to avoid bundling in serverless/production
  const { createServer: createViteServer, createLogger } = await import("vite");
  const { default: viteConfig } = await import("../vite.config");
  const viteLogger = createLogger();
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  // Never let Vite touch API routes
  app.use((req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    return (vite.middlewares as any)(req, res, next);
  });
  app.get("*", async (req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    const url = req.originalUrl;

    try {
      const moduleDir = typeof __dirname !== "undefined" ? __dirname : path.dirname(fileURLToPath(import.meta.url));
      const clientTemplate = path.resolve(moduleDir, "..", "client", "index.html");

      // always reload the index.html file from disk in case it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      const v = Date.now();
      template = template.replace(`src="/src/main.tsx"`, `src="/src/main.tsx?v=${v}"`);
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
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
    // In serverless environments, avoid crashing the function. Return a helpful message.
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

  // In production, also never serve SPA for API
  app.use((req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    return (express.static(distPath) as any)(req, res, next);
  });

  // fall through to index.html if the file doesn't exist (GET only)
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
