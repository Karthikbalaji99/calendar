import express, { type Request, type Response, type NextFunction } from "express";
import { registerRoutes } from "./routes.js";
import serverless from "serverless-http";

const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Reconstruct the original path from query params
app.use((req, res, next) => {
  const route = req.query.route as string;
  if (route) {
    req.url = `/${route}`;
    // Don't modify req.path directly, let Express recalculate it from req.url
  }
  console.log('Reconstructed request:', {
    method: req.method,
    path: req.path,
    url: req.url,
    query: req.query
  });
  next();
});

try {
  await registerRoutes(app);
} catch (error) {
  console.error('Failed to register routes:', error);
}

app.use('*', (req, res) => {
  console.log('No route matched for:', req.method, req.url);
  res.status(404).json({ 
    error: 'Not found',
    path: req.path,
    url: req.url
  });
});

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err);
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message, error: err.stack });
});

export default serverless(app);