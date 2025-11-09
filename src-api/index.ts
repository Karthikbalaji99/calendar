import express, { type Request, type Response, type NextFunction } from "express";
import { registerRoutes } from "./routes.js";
import serverless from "serverless-http";

const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use((req, res, next) => {
  console.log('Request received:', req.method, req.url, req.path);
  next();
});

registerRoutes(app);

app.use('*', (req, res) => {
  console.log('No route matched:', req.method, req.url);
  res.status(404).json({ 
    error: 'Not found',
    requestedPath: req.url
  });
});

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err);
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
});

export default serverless(app, {
  binary: true
});