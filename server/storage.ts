import {
  users,
  teams,
  teamMembers,
  documents,
  tasks,
  meetings,
  emailArchives,
  activityLog,
  type UpsertUser,
  type User,
  type Team,
  type InsertTeam,
  type Document,
  type InsertDocument,
  type Task,
  type InsertTask,
  type Meeting,
  type InsertMeeting,
  type EmailArchive,
  type InsertEmailArchive,
  type ActivityLog,
  type InsertActivityLog,
  type TeamMember,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, ilike, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Team operations
  getTeams(): Promise<Team[]>;
  getTeam(id: number): Promise<Team | undefined>;
  createTeam(team: InsertTeam): Promise<Team>;
  getUserTeams(userId: string): Promise<Team[]>;
  addUserToTeam(userId: string, teamId: number, role?: string): Promise<void>;
  updateUserCurrentTeam(userId: string, teamId: number): Promise<void>;
  
  // Document operations
  getDocuments(teamId: number, limit?: number): Promise<Document[]>;
  getDocument(id: number): Promise<Document | undefined>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocumentStatus(id: number, status: string): Promise<void>;
  searchDocuments(teamId: number, query: string): Promise<Document[]>;
  
  // Task operations
  getTasks(teamId: number, limit?: number): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, updates: Partial<Task>): Promise<Task>;
  getUserTasks(userId: string, teamId: number): Promise<Task[]>;
  
  // Meeting operations
  getMeetings(teamId: number, limit?: number): Promise<Meeting[]>;
  getMeeting(id: number): Promise<Meeting | undefined>;
  createMeeting(meeting: InsertMeeting): Promise<Meeting>;
  updateMeeting(id: number, updates: Partial<Meeting>): Promise<Meeting>;
  getTodaysMeetings(teamId: number): Promise<Meeting[]>;
  
  // Email archive operations
  getEmailArchives(teamId: number, limit?: number): Promise<EmailArchive[]>;
  createEmailArchive(emailArchive: InsertEmailArchive): Promise<EmailArchive>;
  searchEmailArchives(teamId: number, query: string): Promise<EmailArchive[]>;
  
  // Activity log operations
  getRecentActivity(teamId: number, limit?: number): Promise<ActivityLog[]>;
  createActivityLog(activity: InsertActivityLog): Promise<ActivityLog>;
  
  // Dashboard metrics
  getDashboardMetrics(teamId: number): Promise<{
    activeTasks: number;
    documentsToday: number;
    meetingsToday: number;
    pendingReviews: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Team operations
  async getTeams(): Promise<Team[]> {
    return await db.select().from(teams).orderBy(teams.name);
  }

  async getTeam(id: number): Promise<Team | undefined> {
    const [team] = await db.select().from(teams).where(eq(teams.id, id));
    return team;
  }

  async createTeam(team: InsertTeam): Promise<Team> {
    const [newTeam] = await db.insert(teams).values(team).returning();
    return newTeam;
  }

  async getUserTeams(userId: string): Promise<Team[]> {
    const userTeams = await db
      .select({ team: teams })
      .from(teamMembers)
      .innerJoin(teams, eq(teamMembers.teamId, teams.id))
      .where(eq(teamMembers.userId, userId))
      .orderBy(teams.name);
    
    return userTeams.map(({ team }) => team);
  }

  async addUserToTeam(userId: string, teamId: number, role: string = "member"): Promise<void> {
    await db.insert(teamMembers).values({
      userId,
      teamId,
      role,
    });
  }

  async updateUserCurrentTeam(userId: string, teamId: number): Promise<void> {
    await db.update(users).set({ currentTeamId: teamId }).where(eq(users.id, userId));
  }

  // Document operations
  async getDocuments(teamId: number, limit: number = 50): Promise<Document[]> {
    return await db
      .select()
      .from(documents)
      .where(eq(documents.teamId, teamId))
      .orderBy(desc(documents.createdAt))
      .limit(limit);
  }

  async getDocument(id: number): Promise<Document | undefined> {
    const [document] = await db.select().from(documents).where(eq(documents.id, id));
    return document;
  }

  async createDocument(document: InsertDocument): Promise<Document> {
    const [newDocument] = await db.insert(documents).values(document).returning();
    return newDocument;
  }

  async updateDocumentStatus(id: number, status: string): Promise<void> {
    await db.update(documents).set({ status }).where(eq(documents.id, id));
  }

  async searchDocuments(teamId: number, query: string): Promise<Document[]> {
    return await db
      .select()
      .from(documents)
      .where(
        and(
          eq(documents.teamId, teamId),
          or(
            ilike(documents.name, `%${query}%`),
            ilike(documents.description, `%${query}%`),
            ilike(documents.category, `%${query}%`)
          )
        )
      )
      .orderBy(desc(documents.createdAt));
  }

  // Task operations
  async getTasks(teamId: number, limit: number = 50): Promise<Task[]> {
    return await db
      .select()
      .from(tasks)
      .where(eq(tasks.teamId, teamId))
      .orderBy(desc(tasks.createdAt))
      .limit(limit);
  }

  async getTask(id: number): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task;
  }

  async createTask(task: InsertTask): Promise<Task> {
    const [newTask] = await db.insert(tasks).values(task).returning();
    return newTask;
  }

  async updateTask(id: number, updates: Partial<Task>): Promise<Task> {
    const [updatedTask] = await db
      .update(tasks)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(tasks.id, id))
      .returning();
    return updatedTask;
  }

  async getUserTasks(userId: string, teamId: number): Promise<Task[]> {
    return await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.assignedTo, userId), eq(tasks.teamId, teamId)))
      .orderBy(desc(tasks.createdAt));
  }

  // Meeting operations
  async getMeetings(teamId: number, limit: number = 50): Promise<Meeting[]> {
    return await db
      .select()
      .from(meetings)
      .where(eq(meetings.teamId, teamId))
      .orderBy(desc(meetings.startTime))
      .limit(limit);
  }

  async getMeeting(id: number): Promise<Meeting | undefined> {
    const [meeting] = await db.select().from(meetings).where(eq(meetings.id, id));
    return meeting;
  }

  async createMeeting(meeting: InsertMeeting): Promise<Meeting> {
    const [newMeeting] = await db.insert(meetings).values(meeting).returning();
    return newMeeting;
  }

  async updateMeeting(id: number, updates: Partial<Meeting>): Promise<Meeting> {
    const [updatedMeeting] = await db
      .update(meetings)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(meetings.id, id))
      .returning();
    return updatedMeeting;
  }

  async getTodaysMeetings(teamId: number): Promise<Meeting[]> {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    return await db
      .select()
      .from(meetings)
      .where(
        and(
          eq(meetings.teamId, teamId),
          sql`${meetings.startTime} >= ${startOfDay} AND ${meetings.startTime} < ${endOfDay}`
        )
      )
      .orderBy(meetings.startTime);
  }

  // Email archive operations
  async getEmailArchives(teamId: number, limit: number = 50): Promise<EmailArchive[]> {
    return await db
      .select()
      .from(emailArchives)
      .where(eq(emailArchives.teamId, teamId))
      .orderBy(desc(emailArchives.emailDate))
      .limit(limit);
  }

  async createEmailArchive(emailArchive: InsertEmailArchive): Promise<EmailArchive> {
    const [newEmailArchive] = await db.insert(emailArchives).values(emailArchive).returning();
    return newEmailArchive;
  }

  async searchEmailArchives(teamId: number, query: string): Promise<EmailArchive[]> {
    return await db
      .select()
      .from(emailArchives)
      .where(
        and(
          eq(emailArchives.teamId, teamId),
          or(
            ilike(emailArchives.subject, `%${query}%`),
            ilike(emailArchives.sender, `%${query}%`),
            ilike(emailArchives.body, `%${query}%`)
          )
        )
      )
      .orderBy(desc(emailArchives.emailDate));
  }

  // Activity log operations
  async getRecentActivity(teamId: number, limit: number = 20): Promise<ActivityLog[]> {
    return await db
      .select()
      .from(activityLog)
      .where(eq(activityLog.teamId, teamId))
      .orderBy(desc(activityLog.createdAt))
      .limit(limit);
  }

  async createActivityLog(activity: InsertActivityLog): Promise<ActivityLog> {
    const [newActivity] = await db.insert(activityLog).values(activity).returning();
    return newActivity;
  }

  // Dashboard metrics
  async getDashboardMetrics(teamId: number): Promise<{
    activeTasks: number;
    documentsToday: number;
    meetingsToday: number;
    pendingReviews: number;
  }> {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const [activeTasksResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(tasks)
      .where(and(eq(tasks.teamId, teamId), eq(tasks.status, "pending")));

    const [documentsTodayResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(documents)
      .where(
        and(
          eq(documents.teamId, teamId),
          sql`${documents.createdAt} >= ${startOfDay} AND ${documents.createdAt} < ${endOfDay}`
        )
      );

    const [meetingsTodayResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(meetings)
      .where(
        and(
          eq(meetings.teamId, teamId),
          sql`${meetings.startTime} >= ${startOfDay} AND ${meetings.startTime} < ${endOfDay}`
        )
      );

    const [pendingReviewsResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(documents)
      .where(and(eq(documents.teamId, teamId), eq(documents.status, "pending")));

    return {
      activeTasks: activeTasksResult.count,
      documentsToday: documentsTodayResult.count,
      meetingsToday: meetingsTodayResult.count,
      pendingReviews: pendingReviewsResult.count,
    };
  }
}

export const storage = new DatabaseStorage();
