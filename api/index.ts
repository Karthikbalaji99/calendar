import express, { type Request, type Response, type NextFunction } from "express";
import cookieParser from "cookie-parser";
import crypto from "crypto";
import { registerRoutes } from "./routes.js";
import { serveStatic, log } from "./vite-prod.js";
import serverless from "serverless-http";

const app = express();

// Body + cookies
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());

// Simple password gate (same as server/index.ts)
const SITE_PASSWORD = process.env.SITE_PASSWORD;
const COOKIE_NAME = "site_auth";
const hash = (v: string) => crypto.createHash("sha256").update(v).digest("hex");
const isAuthed = (req: Request) => SITE_PASSWORD && req.cookies?.[COOKIE_NAME] === hash(SITE_PASSWORD);
function renderLogin(nextUrl = "/", error?: string) {
  const err = error ? `<div style="color:#b91c1c;margin-bottom:8px">${error}</div>` : "";
  return `<!doctype html><html><head><meta charset=\"utf-8\"/><meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"/><title>Protected</title>
  <style>body{font-family:Inter,system-ui,Arial,sans-serif;background:#FFCBF2;margin:0;display:flex;align-items:center;justify-content:center;min-height:100vh}
  .card{background:#F3C4FB;border:1px solid #7b88a8;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,.06);padding:24px;min-width:320px}
  label{display:block;margin:6px 0 4px;color:#1f2937;font-size:14px}
  input{width:100%;padding:10px;border:1px solid #7b88a8;border-radius:8px}
  button{margin-top:12px;width:100%;padding:10px;border:0;border-radius:8px;background:#7380a4;color:#fff;font-weight:600}</style></head>
  <body><form class=card method=post action=\"/__auth?next=${encodeURIComponent(nextUrl)}\">${err}
  <label for=password>Enter Password</label><input id=password name=password type=password autofocus required/>
  <button type=submit>Unlock</button></form></body></html>`;
}

if (SITE_PASSWORD) {
  app.post("/__auth", (req: Request, res: Response) => {
    const pw = (req.body?.password ?? "") as string;
    if (pw && SITE_PASSWORD && pw === SITE_PASSWORD) {
      res.cookie(COOKIE_NAME, hash(SITE_PASSWORD), { httpOnly: true, sameSite: "lax", secure: true, maxAge: 1000 * 60 * 60 * 24 * 30 });
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
        return res.status(401).set({ "Content-Type": "text/html" }).send(renderLogin(req.originalUrl));
      }
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  });
}

// Register routes and static serving (production)
void registerRoutes(app);

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
  log(`error ${status}: ${message}`);
});

serveStatic(app);

export default serverless(app);
