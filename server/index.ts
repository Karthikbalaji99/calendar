import express, { type Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import crypto from "crypto";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();

declare module 'http' {
  interface IncomingMessage {
    rawBody: unknown
  }
}
app.use(express.json({
  limit: "50mb",
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  },
}));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());

// Simple site-wide password gate (optional: enabled when SITE_PASSWORD is set)
const SITE_PASSWORD = process.env.SITE_PASSWORD;
const COOKIE_NAME = "site_auth";
const hash = (v: string) => crypto.createHash("sha256").update(v).digest("hex");
const isAuthed = (req: Request) => SITE_PASSWORD && req.cookies?.[COOKIE_NAME] === hash(SITE_PASSWORD);

function renderLogin(nextUrl = "/", error?: string) {
  const err = error ? `<div style="color:#b91c1c;margin-bottom:8px">${error}</div>` : "";
  return `<!doctype html>
  <html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>Protected</title>
  <style>
    body{font-family:Inter,system-ui,Arial,sans-serif;background:#FFCBF2;margin:0;display:flex;align-items:center;justify-content:center;min-height:100vh}
    .card{background:#F3C4FB;border:1px solid #7b88a8;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,.06);padding:24px;min-width:320px}
    label{display:block;margin:6px 0 4px;color:#1f2937;font-size:14px}
    input{width:100%;padding:10px;border:1px solid #7b88a8;border-radius:8px}
    button{margin-top:12px;width:100%;padding:10px;border:0;border-radius:8px;background:#7380a4;color:#fff;font-weight:600}
  </style></head>
  <body><form class="card" method="post" action="/__auth?next=${encodeURIComponent(nextUrl)}">${err}
    <label for="password">Enter Password</label>
    <input id="password" name="password" type="password" autofocus required />
    <button type="submit">Unlock</button>
  </form></body></html>`;
}

if (SITE_PASSWORD) {
  // API protection and HTML login for GET requests
  app.post("/__auth", (req: Request, res: Response) => {
    const pw = (req.body?.password ?? "") as string;
    if (pw && SITE_PASSWORD && pw === SITE_PASSWORD) {
      res.cookie(COOKIE_NAME, hash(SITE_PASSWORD), {
        httpOnly: true,
        sameSite: "lax",
        secure: app.get("env") !== "development",
        maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
      });
      const next = (req.query?.next as string) || "/";
      return res.redirect(next);
    }
    return res.status(401).send(renderLogin("/", "Invalid password"));
  });

  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith("/__auth")) return next();
    const authed = isAuthed(req);
    if (!authed) {
      if (req.path.startsWith("/api")) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      if (req.method === "GET") {
        return res.status(401).send(renderLogin(req.originalUrl));
      }
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  });
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // Ensure API routes never fall through to the SPA middleware
  app.all("/api/*", (_req, res) => {
    res.status(404).json({ message: "Unknown API route" });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  const host = process.env.HOST || "127.0.0.1";
  server.listen({
    port,
    host,
  }, () => {
    log(`serving on http://${host}:${port}`);
  });
})();
