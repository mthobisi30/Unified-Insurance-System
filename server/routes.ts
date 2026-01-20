import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import multer from "multer";
import path from "path";
import fs from "fs";
import { storage } from "./storage";

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: uploadsDir,
    filename: (_req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + "-" + file.originalname);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (_req, file, cb) => {
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "image/jpeg",
      "image/png",
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  },
});

// Session configuration
function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  return session({
    secret: process.env.SESSION_SECRET || "fallback-secret-change-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl,
    },
  });
}

// Simple authentication middleware - for demo purposes
// In production, implement proper authentication (e.g., NextAuth, Passport with providers)
const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.session && (req.session as any).userId) {
    return next();
  }
  return res.status(401).json({ message: "Unauthorized" });
};

// Extend session type
declare module "express-session" {
  interface SessionData {
    userId: string;
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
    };
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup session middleware
  app.use(getSession());

  // =====================
  // AUTH ROUTES
  // =====================

  // Get current user
  app.get("/api/auth/user", (req, res) => {
    if (req.session && req.session.userId) {
      res.json({ user: req.session.user });
    } else {
      res.json({ user: null });
    }
  });

  // Demo login - creates or gets a demo user
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, firstName, lastName } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      // Create a simple user ID from email
      const userId = `user_${email.replace(/[^a-zA-Z0-9]/g, "_")}`;
      
      // Upsert user
      const user = await storage.upsertUser({
        id: userId,
        email,
        firstName: firstName || "Demo",
        lastName: lastName || "User",
      });

      // Set session
      req.session.userId = userId;
      req.session.user = {
        id: userId,
        email: user.email || email,
        firstName: user.firstName || "Demo",
        lastName: user.lastName || "User",
      };

      res.json({ user: req.session.user });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Logout
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  // =====================
  // SETUP ROUTE
  // =====================

  // Initialize user with default teams
  app.post("/api/setup", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      
      // Check if user already has teams
      const existingTeams = await storage.getUserTeams(userId);
      if (existingTeams.length > 0) {
        return res.json({ teams: existingTeams, message: "Already set up" });
      }

      // Create default insurance teams
      const defaultTeams = [
        { name: "Personal Lines", description: "Auto, Home, and Personal Insurance" },
        { name: "Commercial", description: "Business and Commercial Insurance" },
        { name: "Corporate", description: "Large Corporate Accounts" },
        { name: "Claims", description: "Claims Processing and Management" },
      ];

      const createdTeams = [];
      for (const teamData of defaultTeams) {
        const team = await storage.createTeam(teamData);
        await storage.addUserToTeam(userId, team.id, "admin");
        createdTeams.push(team);
      }

      // Set first team as current
      if (createdTeams.length > 0) {
        await storage.updateUserCurrentTeam(userId, createdTeams[0].id);
      }

      res.json({ teams: createdTeams, message: "Setup complete" });
    } catch (error) {
      console.error("Setup error:", error);
      res.status(500).json({ message: "Setup failed" });
    }
  });

  // =====================
  // TEAM ROUTES
  // =====================

  // Get user's teams
  app.get("/api/teams", isAuthenticated, async (req: any, res) => {
    try {
      const teams = await storage.getUserTeams(req.session.userId);
      res.json(teams);
    } catch (error) {
      console.error("Error getting teams:", error);
      res.status(500).json({ message: "Failed to get teams" });
    }
  });

  // Select active team
  app.post("/api/teams/:id/select", isAuthenticated, async (req: any, res) => {
    try {
      const teamId = parseInt(req.params.id);
      await storage.updateUserCurrentTeam(req.session.userId, teamId);
      res.json({ message: "Team selected" });
    } catch (error) {
      console.error("Error selecting team:", error);
      res.status(500).json({ message: "Failed to select team" });
    }
  });

  // =====================
  // DOCUMENT ROUTES
  // =====================

  // Get documents for current team
  app.get("/api/documents", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user?.currentTeamId) {
        return res.status(400).json({ message: "No team selected" });
      }
      const documents = await storage.getDocuments(user.currentTeamId);
      res.json(documents);
    } catch (error) {
      console.error("Error getting documents:", error);
      res.status(500).json({ message: "Failed to get documents" });
    }
  });

  // Upload document
  app.post("/api/documents/upload", isAuthenticated, upload.single("file"), async (req: any, res) => {
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user?.currentTeamId) {
        return res.status(400).json({ message: "No team selected" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const document = await storage.createDocument({
        name: req.body.name || req.file.originalname,
        originalName: req.file.originalname,
        filePath: req.file.path,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        category: req.body.category || "General",
        description: req.body.description || "",
        uploadedBy: req.session.userId,
        teamId: user.currentTeamId,
      });

      // Log activity
      await storage.createActivityLog({
        userId: req.session.userId,
        teamId: user.currentTeamId,
        action: "upload",
        entityType: "document",
        entityId: document.id,
        description: `Uploaded document: ${document.name}`,
      });

      res.json(document);
    } catch (error) {
      console.error("Error uploading document:", error);
      res.status(500).json({ message: "Failed to upload document" });
    }
  });

  // Search documents
  app.get("/api/documents/search", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user?.currentTeamId) {
        return res.status(400).json({ message: "No team selected" });
      }
      
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ message: "Search query is required" });
      }

      const documents = await storage.searchDocuments(user.currentTeamId, query);
      res.json(documents);
    } catch (error) {
      console.error("Error searching documents:", error);
      res.status(500).json({ message: "Failed to search documents" });
    }
  });

  // =====================
  // TASK ROUTES
  // =====================

  // Get tasks for current team
  app.get("/api/tasks", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user?.currentTeamId) {
        return res.status(400).json({ message: "No team selected" });
      }
      const tasks = await storage.getTasks(user.currentTeamId);
      res.json(tasks);
    } catch (error) {
      console.error("Error getting tasks:", error);
      res.status(500).json({ message: "Failed to get tasks" });
    }
  });

  // Create task
  app.post("/api/tasks", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user?.currentTeamId) {
        return res.status(400).json({ message: "No team selected" });
      }

      const task = await storage.createTask({
        ...req.body,
        createdBy: req.session.userId,
        teamId: user.currentTeamId,
      });

      // Log activity
      await storage.createActivityLog({
        userId: req.session.userId,
        teamId: user.currentTeamId,
        action: "create",
        entityType: "task",
        entityId: task.id,
        description: `Created task: ${task.title}`,
      });

      res.json(task);
    } catch (error) {
      console.error("Error creating task:", error);
      res.status(500).json({ message: "Failed to create task" });
    }
  });

  // Update task
  app.patch("/api/tasks/:id", isAuthenticated, async (req: any, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const task = await storage.updateTask(taskId, req.body);

      const user = await storage.getUser(req.session.userId);
      if (user?.currentTeamId) {
        await storage.createActivityLog({
          userId: req.session.userId,
          teamId: user.currentTeamId,
          action: "update",
          entityType: "task",
          entityId: task.id,
          description: `Updated task: ${task.title}`,
        });
      }

      res.json(task);
    } catch (error) {
      console.error("Error updating task:", error);
      res.status(500).json({ message: "Failed to update task" });
    }
  });

  // =====================
  // MEETING ROUTES
  // =====================

  // Get meetings for current team
  app.get("/api/meetings", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user?.currentTeamId) {
        return res.status(400).json({ message: "No team selected" });
      }
      const meetings = await storage.getMeetings(user.currentTeamId);
      res.json(meetings);
    } catch (error) {
      console.error("Error getting meetings:", error);
      res.status(500).json({ message: "Failed to get meetings" });
    }
  });

  // Create meeting
  app.post("/api/meetings", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user?.currentTeamId) {
        return res.status(400).json({ message: "No team selected" });
      }

      const meeting = await storage.createMeeting({
        ...req.body,
        organizer: req.session.userId,
        teamId: user.currentTeamId,
      });

      // Log activity
      await storage.createActivityLog({
        userId: req.session.userId,
        teamId: user.currentTeamId,
        action: "create",
        entityType: "meeting",
        entityId: meeting.id,
        description: `Scheduled meeting: ${meeting.title}`,
      });

      res.json(meeting);
    } catch (error) {
      console.error("Error creating meeting:", error);
      res.status(500).json({ message: "Failed to create meeting" });
    }
  });

  // =====================
  // EMAIL ARCHIVE ROUTES
  // =====================

  // Get email archives for current team
  app.get("/api/email-archives", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user?.currentTeamId) {
        return res.status(400).json({ message: "No team selected" });
      }
      const emails = await storage.getEmailArchives(user.currentTeamId);
      res.json(emails);
    } catch (error) {
      console.error("Error getting email archives:", error);
      res.status(500).json({ message: "Failed to get email archives" });
    }
  });

  // Create email archive
  app.post("/api/email-archives", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user?.currentTeamId) {
        return res.status(400).json({ message: "No team selected" });
      }

      const emailArchive = await storage.createEmailArchive({
        ...req.body,
        archivedBy: req.session.userId,
        teamId: user.currentTeamId,
      });

      // Log activity
      await storage.createActivityLog({
        userId: req.session.userId,
        teamId: user.currentTeamId,
        action: "archive",
        entityType: "email",
        entityId: emailArchive.id,
        description: `Archived email: ${emailArchive.subject}`,
      });

      res.json(emailArchive);
    } catch (error) {
      console.error("Error archiving email:", error);
      res.status(500).json({ message: "Failed to archive email" });
    }
  });

  // Search email archives
  app.get("/api/email-archives/search", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user?.currentTeamId) {
        return res.status(400).json({ message: "No team selected" });
      }
      
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ message: "Search query is required" });
      }

      const emails = await storage.searchEmailArchives(user.currentTeamId, query);
      res.json(emails);
    } catch (error) {
      console.error("Error searching email archives:", error);
      res.status(500).json({ message: "Failed to search email archives" });
    }
  });

  // =====================
  // DASHBOARD ROUTES
  // =====================

  // Get dashboard metrics
  app.get("/api/dashboard/metrics", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user?.currentTeamId) {
        return res.status(400).json({ message: "No team selected" });
      }
      const metrics = await storage.getDashboardMetrics(user.currentTeamId);
      res.json(metrics);
    } catch (error) {
      console.error("Error getting dashboard metrics:", error);
      res.status(500).json({ message: "Failed to get dashboard metrics" });
    }
  });

  // Get recent activity
  app.get("/api/dashboard/recent-activity", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user?.currentTeamId) {
        return res.status(400).json({ message: "No team selected" });
      }
      const activity = await storage.getRecentActivity(user.currentTeamId);
      res.json(activity);
    } catch (error) {
      console.error("Error getting recent activity:", error);
      res.status(500).json({ message: "Failed to get recent activity" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
