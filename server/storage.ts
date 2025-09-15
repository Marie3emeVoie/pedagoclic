import {
  users,
  weeklyReports,
  type User,
  type UpsertUser,
  type InsertWeeklyReport,
  type WeeklyReport,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Weekly report operations
  createWeeklyReport(report: InsertWeeklyReport): Promise<WeeklyReport>;
  getWeeklyReportsByUser(userId: string): Promise<WeeklyReport[]>;
  getWeeklyReportById(id: string): Promise<WeeklyReport | undefined>;
  updateWeeklyReport(id: string, report: Partial<InsertWeeklyReport>): Promise<WeeklyReport>;
  deleteWeeklyReport(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.

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

  // Weekly report operations
  async createWeeklyReport(report: InsertWeeklyReport): Promise<WeeklyReport> {
    const [weeklyReport] = await db
      .insert(weeklyReports)
      .values(report)
      .returning();
    return weeklyReport;
  }

  async getWeeklyReportsByUser(userId: string): Promise<WeeklyReport[]> {
    return await db
      .select()
      .from(weeklyReports)
      .where(eq(weeklyReports.userId, userId))
      .orderBy(desc(weeklyReports.createdAt));
  }

  async getWeeklyReportById(id: string): Promise<WeeklyReport | undefined> {
    const [report] = await db
      .select()
      .from(weeklyReports)
      .where(eq(weeklyReports.id, id));
    return report;
  }

  async updateWeeklyReport(id: string, report: Partial<InsertWeeklyReport>): Promise<WeeklyReport> {
    const [updatedReport] = await db
      .update(weeklyReports)
      .set({ ...report, updatedAt: new Date() })
      .where(eq(weeklyReports.id, id))
      .returning();
    return updatedReport;
  }

  async deleteWeeklyReport(id: string): Promise<void> {
    await db.delete(weeklyReports).where(eq(weeklyReports.id, id));
  }
}

export const storage = new DatabaseStorage();
