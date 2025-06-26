import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (mandatory for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  currentTeamId: integer("current_team_id"),
  role: varchar("role").default("member"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Teams table
export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Team members junction table
export const teamMembers = pgTable("team_members", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  teamId: integer("team_id").notNull(),
  role: varchar("role").default("member"),
  joinedAt: timestamp("joined_at").defaultNow(),
});

// Documents table
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  originalName: varchar("original_name").notNull(),
  filePath: varchar("file_path").notNull(),
  fileSize: integer("file_size").notNull(),
  mimeType: varchar("mime_type").notNull(),
  category: varchar("category").notNull(),
  description: text("description"),
  status: varchar("status").default("pending"),
  uploadedBy: varchar("uploaded_by").notNull(),
  teamId: integer("team_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tasks table
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  description: text("description"),
  priority: varchar("priority").default("medium"),
  status: varchar("status").default("pending"),
  assignedTo: varchar("assigned_to"),
  createdBy: varchar("created_by").notNull(),
  teamId: integer("team_id").notNull(),
  dueDate: timestamp("due_date"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Meetings table
export const meetings = pgTable("meetings", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  description: text("description"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  location: varchar("location"),
  meetingLink: varchar("meeting_link"),
  organizer: varchar("organizer").notNull(),
  teamId: integer("team_id").notNull(),
  status: varchar("status").default("scheduled"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Email archives table
export const emailArchives = pgTable("email_archives", {
  id: serial("id").primaryKey(),
  subject: varchar("subject").notNull(),
  sender: varchar("sender").notNull(),
  recipient: varchar("recipient").notNull(),
  body: text("body"),
  attachments: jsonb("attachments"),
  emailDate: timestamp("email_date").notNull(),
  archivedBy: varchar("archived_by").notNull(),
  teamId: integer("team_id").notNull(),
  category: varchar("category"),
  tags: text("tags").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Activity log table
export const activityLog = pgTable("activity_log", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  teamId: integer("team_id").notNull(),
  action: varchar("action").notNull(),
  entityType: varchar("entity_type").notNull(),
  entityId: integer("entity_id"),
  description: text("description").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  currentTeam: one(teams, {
    fields: [users.currentTeamId],
    references: [teams.id],
  }),
  teamMemberships: many(teamMembers),
  documents: many(documents),
  assignedTasks: many(tasks, { relationName: "assignedTasks" }),
  createdTasks: many(tasks, { relationName: "createdTasks" }),
  meetings: many(meetings),
  emailArchives: many(emailArchives),
  activityLogs: many(activityLog),
}));

export const teamsRelations = relations(teams, ({ many }) => ({
  members: many(teamMembers),
  documents: many(documents),
  tasks: many(tasks),
  meetings: many(meetings),
  emailArchives: many(emailArchives),
  activityLogs: many(activityLog),
}));

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  user: one(users, {
    fields: [teamMembers.userId],
    references: [users.id],
  }),
  team: one(teams, {
    fields: [teamMembers.teamId],
    references: [teams.id],
  }),
}));

export const documentsRelations = relations(documents, ({ one }) => ({
  uploader: one(users, {
    fields: [documents.uploadedBy],
    references: [users.id],
  }),
  team: one(teams, {
    fields: [documents.teamId],
    references: [teams.id],
  }),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  assignee: one(users, {
    fields: [tasks.assignedTo],
    references: [users.id],
    relationName: "assignedTasks",
  }),
  creator: one(users, {
    fields: [tasks.createdBy],
    references: [users.id],
    relationName: "createdTasks",
  }),
  team: one(teams, {
    fields: [tasks.teamId],
    references: [teams.id],
  }),
}));

export const meetingsRelations = relations(meetings, ({ one }) => ({
  organizer: one(users, {
    fields: [meetings.organizer],
    references: [users.id],
  }),
  team: one(teams, {
    fields: [meetings.teamId],
    references: [teams.id],
  }),
}));

export const emailArchivesRelations = relations(emailArchives, ({ one }) => ({
  archiver: one(users, {
    fields: [emailArchives.archivedBy],
    references: [users.id],
  }),
  team: one(teams, {
    fields: [emailArchives.teamId],
    references: [teams.id],
  }),
}));

export const activityLogRelations = relations(activityLog, ({ one }) => ({
  user: one(users, {
    fields: [activityLog.userId],
    references: [users.id],
  }),
  team: one(teams, {
    fields: [activityLog.teamId],
    references: [teams.id],
  }),
}));

// Insert schemas
export const insertTeamSchema = createInsertSchema(teams).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  completedAt: true,
});

export const insertMeetingSchema = createInsertSchema(meetings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEmailArchiveSchema = createInsertSchema(emailArchives).omit({
  id: true,
  createdAt: true,
});

export const insertActivityLogSchema = createInsertSchema(activityLog).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Team = typeof teams.$inferSelect;
export type InsertTeam = z.infer<typeof insertTeamSchema>;
export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Meeting = typeof meetings.$inferSelect;
export type InsertMeeting = z.infer<typeof insertMeetingSchema>;
export type EmailArchive = typeof emailArchives.$inferSelect;
export type InsertEmailArchive = z.infer<typeof insertEmailArchiveSchema>;
export type ActivityLog = typeof activityLog.$inferSelect;
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;
export type TeamMember = typeof teamMembers.$inferSelect;
