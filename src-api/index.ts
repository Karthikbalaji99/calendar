import express, { type Request, type Response, type NextFunction } from "express";
import { registerRoutes } from "./routes.js";
import serverless from "serverless-http";

const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Add debug logging to see what path we're receiving
app.use((req, res, next) => {
  console.log('Request:', req.method, req.path, req.url);
  next();
});

try {
  await registerRoutes(app);
} catch (error) {
  console.error('Failed to register routes:', error);
}

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err);
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message, error: err.stack });
});

// Use basePath option to handle /api prefix
export default serverless(app, {
  basePath: '/api'
});