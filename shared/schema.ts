import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const weeklyReports = pgTable("weekly_reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  // Basic information
  studentFirstName: varchar("student_first_name").notNull(),
  studentLastName: varchar("student_last_name").notNull(),
  studentClass: varchar("student_class").notNull(),
  observerName: varchar("observer_name").notNull(),
  weekStartDate: varchar("week_start_date").notNull(),
  weekEndDate: varchar("week_end_date").notNull(),
  
  // Skills assessment
  autonomySkills: jsonb("autonomy_skills").notNull(),
  autonomyComment: text("autonomy_comment"),
  fineMotorSkills: jsonb("fine_motor_skills").notNull(),
  fineMotorComment: text("fine_motor_comment"),
  communicationSkills: jsonb("communication_skills").notNull(),
  communicationComment: text("communication_comment"),
  socialSkills: jsonb("social_skills").notNull(),
  socialComment: text("social_comment"),
  
  // Daily tracking
  dailyTracking: jsonb("daily_tracking").notNull(),
  
  // Home tracking
  homeObjectiveWorked: boolean("home_objective_worked").default(false),
  homeStatus: varchar("home_status"),
  familyComment: text("family_comment"),
  
  // Final observations
  finalObservation: text("final_observation"),
  freeComments: text("free_comments"),
  
  // Meta
  userId: varchar("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertWeeklyReportSchema = createInsertSchema(weeklyReports).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertWeeklyReport = z.infer<typeof insertWeeklyReportSchema>;
export type WeeklyReport = typeof weeklyReports.$inferSelect;
