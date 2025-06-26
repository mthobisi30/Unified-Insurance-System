import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import fs from "fs";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertDocumentSchema, insertTaskSchema, insertMeetingSchema, insertEmailArchiveSchema } from "@shared/schema";
import { z } from "zod";

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /\.(pdf|doc|docx|xls|xlsx)$/i;
    if (allowedTypes.test(file.originalname)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, Word, and Excel files are allowed.'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Team routes
  app.get('/api/teams', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const teams = await storage.getUserTeams(userId);
      res.json(teams);
    } catch (error) {
      console.error("Error fetching teams:", error);
      res.status(500).json({ message: "Failed to fetch teams" });
    }
  });

  app.post('/api/teams/:teamId/select', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const teamId = parseInt(req.params.teamId);
      await storage.updateUserCurrentTeam(userId, teamId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error selecting team:", error);
      res.status(500).json({ message: "Failed to select team" });
    }
  });

  // Dashboard routes
  app.get('/api/dashboard/metrics', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.currentTeamId) {
        return res.status(400).json({ message: "No team selected" });
      }
      
      const metrics = await storage.getDashboardMetrics(user.currentTeamId);
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching dashboard metrics:", error);
      res.status(500).json({ message: "Failed to fetch dashboard metrics" });
    }
  });

  app.get('/api/dashboard/recent-activity', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.currentTeamId) {
        return res.status(400).json({ message: "No team selected" });
      }
      
      const activity = await storage.getRecentActivity(user.currentTeamId, 10);
      res.json(activity);
    } catch (error) {
      console.error("Error fetching recent activity:", error);
      res.status(500).json({ message: "Failed to fetch recent activity" });
    }
  });

  // Document routes
  app.get('/api/documents', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.currentTeamId) {
        return res.status(400).json({ message: "No team selected" });
      }
      
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const documents = await storage.getDocuments(user.currentTeamId, limit);
      res.json(documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  app.post('/api/documents/upload', isAuthenticated, upload.array('files'), async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.currentTeamId) {
        return res.status(400).json({ message: "No team selected" });
      }

      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
      }

      const { category, description } = req.body;
      const uploadedDocuments = [];

      for (const file of files) {
        const documentData = insertDocumentSchema.parse({
          name: file.filename,
          originalName: file.originalname,
          filePath: file.path,
          fileSize: file.size,
          mimeType: file.mimetype,
          category: category || 'General',
          description: description || '',
          uploadedBy: req.user.claims.sub,
          teamId: user.currentTeamId,
          status: 'pending'
        });

        const document = await storage.createDocument(documentData);
        uploadedDocuments.push(document);

        // Log activity
        await storage.createActivityLog({
          userId: req.user.claims.sub,
          teamId: user.currentTeamId,
          action: 'upload',
          entityType: 'document',
          entityId: document.id,
          description: `Document uploaded: ${file.originalname}`
        });
      }

      res.json(uploadedDocuments);
    } catch (error) {
      console.error("Error uploading documents:", error);
      res.status(500).json({ message: "Failed to upload documents" });
    }
  });

  app.get('/api/documents/search', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
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

  // Task routes
  app.get('/api/tasks', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.currentTeamId) {
        return res.status(400).json({ message: "No team selected" });
      }
      
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const tasks = await storage.getTasks(user.currentTeamId, limit);
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.post('/api/tasks', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.currentTeamId) {
        return res.status(400).json({ message: "No team selected" });
      }

      const taskData = insertTaskSchema.parse({
        ...req.body,
        createdBy: req.user.claims.sub,
        teamId: user.currentTeamId
      });

      const task = await storage.createTask(taskData);

      // Log activity
      await storage.createActivityLog({
        userId: req.user.claims.sub,
        teamId: user.currentTeamId,
        action: 'create',
        entityType: 'task',
        entityId: task.id,
        description: `Task created: ${task.title}`
      });

      res.json(task);
    } catch (error) {
      console.error("Error creating task:", error);
      res.status(500).json({ message: "Failed to create task" });
    }
  });

  app.patch('/api/tasks/:id', isAuthenticated, async (req: any, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const updates = req.body;
      
      const task = await storage.updateTask(taskId, updates);

      // Log activity
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.currentTeamId) {
        await storage.createActivityLog({
          userId: req.user.claims.sub,
          teamId: user.currentTeamId,
          action: 'update',
          entityType: 'task',
          entityId: task.id,
          description: `Task updated: ${task.title}`
        });
      }

      res.json(task);
    } catch (error) {
      console.error("Error updating task:", error);
      res.status(500).json({ message: "Failed to update task" });
    }
  });

  // Meeting routes
  app.get('/api/meetings', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.currentTeamId) {
        return res.status(400).json({ message: "No team selected" });
      }
      
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const meetings = await storage.getMeetings(user.currentTeamId, limit);
      res.json(meetings);
    } catch (error) {
      console.error("Error fetching meetings:", error);
      res.status(500).json({ message: "Failed to fetch meetings" });
    }
  });

  app.post('/api/meetings', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.currentTeamId) {
        return res.status(400).json({ message: "No team selected" });
      }

      const meetingData = insertMeetingSchema.parse({
        ...req.body,
        organizer: req.user.claims.sub,
        teamId: user.currentTeamId
      });

      const meeting = await storage.createMeeting(meetingData);

      // Log activity
      await storage.createActivityLog({
        userId: req.user.claims.sub,
        teamId: user.currentTeamId,
        action: 'create',
        entityType: 'meeting',
        entityId: meeting.id,
        description: `Meeting scheduled: ${meeting.title}`
      });

      res.json(meeting);
    } catch (error) {
      console.error("Error creating meeting:", error);
      res.status(500).json({ message: "Failed to create meeting" });
    }
  });

  // Email archive routes
  app.get('/api/email-archives', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.currentTeamId) {
        return res.status(400).json({ message: "No team selected" });
      }
      
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const emails = await storage.getEmailArchives(user.currentTeamId, limit);
      res.json(emails);
    } catch (error) {
      console.error("Error fetching email archives:", error);
      res.status(500).json({ message: "Failed to fetch email archives" });
    }
  });

  app.post('/api/email-archives', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.currentTeamId) {
        return res.status(400).json({ message: "No team selected" });
      }

      const emailData = insertEmailArchiveSchema.parse({
        ...req.body,
        archivedBy: req.user.claims.sub,
        teamId: user.currentTeamId
      });

      const email = await storage.createEmailArchive(emailData);

      // Log activity
      await storage.createActivityLog({
        userId: req.user.claims.sub,
        teamId: user.currentTeamId,
        action: 'archive',
        entityType: 'email',
        entityId: email.id,
        description: `Email archived: ${email.subject}`
      });

      res.json(email);
    } catch (error) {
      console.error("Error archiving email:", error);
      res.status(500).json({ message: "Failed to archive email" });
    }
  });

  // Initialize default teams if they don't exist
  app.post('/api/setup', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Check if user already has teams
      const userTeams = await storage.getUserTeams(userId);
      if (userTeams.length > 0) {
        return res.json({ message: "User already has teams" });
      }

      // Create default teams
      const defaultTeams = [
        { name: "Personal Lines", description: "Personal insurance operations" },
        { name: "Commercial", description: "Commercial insurance operations" },
        { name: "Corporate", description: "Corporate insurance operations" },
        { name: "Claims", description: "Claims processing and management" }
      ];

      const createdTeams = [];
      for (const teamData of defaultTeams) {
        const team = await storage.createTeam(teamData);
        await storage.addUserToTeam(userId, team.id, "member");
        createdTeams.push(team);
      }

      // Set first team as current
      if (createdTeams.length > 0) {
        await storage.updateUserCurrentTeam(userId, createdTeams[0].id);
      }

      res.json({ teams: createdTeams });
    } catch (error) {
      console.error("Error setting up user:", error);
      res.status(500).json({ message: "Failed to set up user" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
