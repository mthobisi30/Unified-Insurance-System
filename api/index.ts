import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { registerRoutes } from "../server/routes";

const app = express();
app.set("trust proxy", 1);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Detailed logging for Vercel
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
    hasSessionSecret: !!process.env.SESSION_SECRET,
    vercel: !!process.env.VERCEL
  });
});

const PostgresStore = connectPg(session);
const sessionStore = new PostgresStore({
  conString: process.env.DATABASE_URL,
  createTableIfMissing: false,
  tableName: "sessions",
});

// Session configuration
app.use(
  session({
    store: sessionStore,
    secret: process.env.SESSION_SECRET || "fallback-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
    },
  })
);

// Register routes with error handling
try {
  await registerRoutes(app);
} catch (error) {
  console.error("FATAL: Failed to register routes:", error);
  app.use((req, res) => {
    res.status(500).json({ 
      message: "Server failed to initialize", 
      error: error instanceof Error ? error.message : String(error) 
    });
  });
}

// Global error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error("API ERROR HANDLER:", err);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({ 
    message: err.message || "Internal Server Error",
    error_details: err.stack // Show stack trace for debugging
  });
});

export default app;
