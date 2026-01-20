import express from "express";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { registerRoutes } from "../server/routes";

const app = express();
app.set("trust proxy", 1);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const PostgresStore = connectPg(session);
const sessionStore = new PostgresStore({
  conString: process.env.DATABASE_URL,
  createTableIfMissing: false, // Table already exists in schema
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
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
    },
  })
);

// Register all routes
await registerRoutes(app);

export default app;
