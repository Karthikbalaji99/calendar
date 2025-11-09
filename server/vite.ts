import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import viteConfig from "../vite.config";

const viteLogger = createLogger();

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
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html",
      );

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
  // Try dist/public next to bundled server (esbuild), else project-level dist/public
  let distPath = path.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    distPath = path.resolve(import.meta.dirname, "..", "dist", "public");
  }

  if (!fs.existsSync(distPath)) {
    // In serverless environments, avoid crashing the function. Return a helpful message.
    app.get("*", (_req, res) => {
      res
        .status(500)
        .set({ "Content-Type": "text/plain" })
        .end(
          `Client build not found. Expected at ${distPath}. Ensure 'npm run build' runs and vercel.json includes dist/public.`,
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
