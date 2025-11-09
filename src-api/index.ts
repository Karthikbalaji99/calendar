import express, { type Request, type Response, type NextFunction } from "express";
import { registerRoutes } from "./routes.js";
import serverless from "serverless-http";

const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Debug logging
app.use((req, res, next) => {
  console.log('Full request:', {
    method: req.method,
    path: req.path,
    url: req.url,
    originalUrl: req.originalUrl,
    baseUrl: req.baseUrl
  });
  next();
});

try {
  await registerRoutes(app);
} catch (error) {
  console.error('Failed to register routes:', error);
}

// Add a 404 handler to see what routes are being hit
app.use('*', (req, res) => {
  console.log('No route matched for:', req.method, req.originalUrl);
  res.status(404).json({ 
    error: 'Not found',
    path: req.path,
    url: req.url,
    originalUrl: req.originalUrl
  });
});

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err);
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message, error: err.stack });
});

// Remove basePath - let's handle it differently
export default serverless(app);