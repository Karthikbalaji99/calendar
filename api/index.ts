import express, { type Request, type Response, type NextFunction } from "express";
import { registerRoutes } from "./routes.js";
import serverless from "serverless-http";

const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

await registerRoutes(app);

// DON'T serve static files in the API function!
// Remove this line:
// serveStatic(app);

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
});

export const handler = serverless(app);
export default handler;