import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { registerRoutes } from "../server/routes";
import { pool } from "../server/db";

const app = express();
app.set("trust proxy", 1);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

const PostgresStore = connectPg(session);
const sessionStore = new PostgresStore({
  pool: pool,
  createTableIfMissing: false,
  tableName: "sessions",
});

// Session configuration for serverless
app.use(
  session({
    store: sessionStore,
    secret: process.env.SESSION_SECRET || "fallback-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true, // Always true for Vercel (HTTPS)
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
    },
  })
);

// Register all routes
try {
  await registerRoutes(app);
} catch (error) {
  console.error("Failed to register routes:", error);
}

// Global error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error("API Error:", err);
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ 
    message,
    details: process.env.NODE_ENV !== "production" ? err.stack : undefined
  });
});

export default app;
