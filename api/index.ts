import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "../server/routes";

const app = express();
app.set("trust proxy", 1);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Logging for Vercel
app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.url}`);
  next();
});

// Health check to verify environment
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    env: process.env.NODE_ENV,
    hasDbUrl: !!process.env.DATABASE_URL,
    vercel: !!process.env.VERCEL
  });
});

// We perform route registration. 
// Note: In serverless, top-level await is generally supported in newer Node runtimes.
await registerRoutes(app);

// Global error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error("API ERROR HANDLER:", err);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({ 
    message: err.message || "Internal Server Error",
    error_details: err.stack
  });
});

export default app;
