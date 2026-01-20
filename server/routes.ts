import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import fs from "fs";
import { storage } from "./storage";

// Default user for non-authenticated access
const DEFAULT_USER = {
  id: "default-user",
  email: "user@example.com",
  firstName: "Guest",
  lastName: "User",
};

// Ensure uploads directory exists
// On Vercel, the only writable directory is /tmp
const uploadsDir = process.env.VERCEL 
  ? path.join("/tmp", "uploads")
  : path.join(process.cwd(), "uploads");

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

export async function registerRoutes(app: Express): Promise<void> {
  // =====================
  // AUTH ROUTES (MOCKED)
  // =====================

  // Helper to ensure default user and return user info
  const getAppUser = async () => {
    return await storage.upsertUser(DEFAULT_USER);
  };

  // Mocked auth user endpoint
  app.get("/api/auth/user", async (req, res) => {
    const user = await getAppUser();
    res.json({ user });
  });

  // Setup user teams - automatically runs for the default user
  app.post("/api/setup", async (req, res) => {
    try {
      const user = await getAppUser();
      
      // Check if user already has teams
      const existingTeams = await storage.getUserTeams(user.id);
      if (existingTeams.length > 0) {
        return res.json({ message: "Setup already complete", teams: existingTeams });
      }

      // Create default insurance teams
      const teamNames = [
        "Personal Lines",
        "Commercial",
        "Corporate",
        "Claims"
      ];

      const createdTeams = [];
      for (const name of teamNames) {
        const team = await storage.createTeam({
          name,
          description: `${name} dedicated operations team`,
        });
        await storage.addUserToTeam(user.id, team.id, "admin");
        createdTeams.push(team);
      }

      // Set the first team as current
      if (createdTeams.length > 0) {
        await storage.updateUserCurrentTeam(user.id, createdTeams[0].id);
      }

      res.status(201).json({ message: "Setup successful", teams: createdTeams });
    } catch (error) {
      console.error("Setup error:", error);
      res.status(500).json({ message: "Failed to initialize environment" });
    }
  });

  // =====================
  // TEAM ROUTES
  // =====================

  // Get user's teams
  app.get("/api/teams", async (req, res) => {
    try {
      const user = await getAppUser();
      const teams = await storage.getUserTeams(user.id);
      res.json(teams);
    } catch (error) {
      console.error("Error getting teams:", error);
      res.status(500).json({ message: "Failed to get teams" });
    }
  });

  // Select active team
  app.post("/api/teams/:id/select", async (req, res) => {
    try {
      const user = await getAppUser();
      const teamId = parseInt(req.params.id);
      await storage.updateUserCurrentTeam(user.id, teamId);
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
  app.get("/api/documents", async (req, res) => {
    try {
      const user = await getAppUser();
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
  app.post("/api/documents/upload", upload.single("file"), async (req, res) => {
    try {
      const user = await getAppUser();
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
        uploadedBy: user.id,
        teamId: user.currentTeamId,
      });

      // Log activity
      await storage.createActivityLog({
        userId: user.id,
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
  app.get("/api/documents/search", async (req, res) => {
    try {
      const user = await getAppUser();
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
  app.get("/api/tasks", async (req, res) => {
    try {
      const user = await getAppUser();
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
  app.post("/api/tasks", async (req, res) => {
    try {
      const user = await getAppUser();
      if (!user?.currentTeamId) {
        return res.status(400).json({ message: "No team selected" });
      }

      const task = await storage.createTask({
        ...req.body,
        createdBy: user.id,
        teamId: user.currentTeamId,
      });

      // Log activity
      await storage.createActivityLog({
        userId: user.id,
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
  app.patch("/api/tasks/:id", async (req, res) => {
    try {
      const user = await getAppUser();
      const taskId = parseInt(req.params.id);
      const task = await storage.updateTask(taskId, req.body);

      if (user?.currentTeamId) {
        await storage.createActivityLog({
          userId: user.id,
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
  app.get("/api/meetings", async (req, res) => {
    try {
      const user = await getAppUser();
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
  app.post("/api/meetings", async (req, res) => {
    try {
      const user = await getAppUser();
      if (!user?.currentTeamId) {
        return res.status(400).json({ message: "No team selected" });
      }

      const meeting = await storage.createMeeting({
        ...req.body,
        organizer: user.id,
        teamId: user.currentTeamId,
      });

      // Log activity
      await storage.createActivityLog({
        userId: user.id,
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
  app.get("/api/email-archives", async (req, res) => {
    try {
      const user = await getAppUser();
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
  app.post("/api/email-archives", async (req, res) => {
    try {
      const user = await getAppUser();
      if (!user?.currentTeamId) {
        return res.status(400).json({ message: "No team selected" });
      }

      const emailArchive = await storage.createEmailArchive({
        ...req.body,
        archivedBy: user.id,
        teamId: user.currentTeamId,
      });

      // Log activity
      await storage.createActivityLog({
        userId: user.id,
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
  app.get("/api/email-archives/search", async (req, res) => {
    try {
      const user = await getAppUser();
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
  app.get("/api/dashboard/metrics", async (req, res) => {
    try {
      const user = await getAppUser();
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
  app.get("/api/dashboard/recent-activity", async (req, res) => {
    try {
      const user = await getAppUser();
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
}
