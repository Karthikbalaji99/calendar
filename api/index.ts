import express, { type Request, type Response, type NextFunction } from "express";
import { registerRoutes } from "./routes.js";
import { serveStatic, log } from "./vite-prod.js";
import serverless from "serverless-http";

const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

await registerRoutes(app); // direct await instead of deferred Promise
serveStatic(app);

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
  log(`error ${status}: ${message}`);
});

export const handler = serverless(app);
export default handler;
