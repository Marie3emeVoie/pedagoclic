import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertWeeklyReportSchema } from "@shared/schema";
import { z } from "zod";

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

  // Weekly reports routes
  app.post('/api/weekly-reports', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const reportData = insertWeeklyReportSchema.parse({
        ...req.body,
        userId,
      });
      
      const report = await storage.createWeeklyReport(reportData);
      res.json(report);
    } catch (error) {
      console.error("Error creating weekly report:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create weekly report" });
      }
    }
  });

  app.get('/api/weekly-reports', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const reports = await storage.getWeeklyReportsByUser(userId);
      res.json(reports);
    } catch (error) {
      console.error("Error fetching weekly reports:", error);
      res.status(500).json({ message: "Failed to fetch weekly reports" });
    }
  });

  app.get('/api/weekly-reports/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const report = await storage.getWeeklyReportById(id);
      
      if (!report) {
        return res.status(404).json({ message: "Weekly report not found" });
      }
      
      res.json(report);
    } catch (error) {
      console.error("Error fetching weekly report:", error);
      res.status(500).json({ message: "Failed to fetch weekly report" });
    }
  });

  app.put('/api/weekly-reports/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.claims.sub;
      
      // Verify the report belongs to the user
      const existingReport = await storage.getWeeklyReportById(id);
      if (!existingReport || existingReport.userId !== userId) {
        return res.status(404).json({ message: "Weekly report not found" });
      }
      
      const updateData = insertWeeklyReportSchema.partial().parse(req.body);
      const updatedReport = await storage.updateWeeklyReport(id, updateData);
      res.json(updatedReport);
    } catch (error) {
      console.error("Error updating weekly report:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update weekly report" });
      }
    }
  });

  app.delete('/api/weekly-reports/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.claims.sub;
      
      // Verify the report belongs to the user
      const existingReport = await storage.getWeeklyReportById(id);
      if (!existingReport || existingReport.userId !== userId) {
        return res.status(404).json({ message: "Weekly report not found" });
      }
      
      await storage.deleteWeeklyReport(id);
      res.json({ message: "Weekly report deleted successfully" });
    } catch (error) {
      console.error("Error deleting weekly report:", error);
      res.status(500).json({ message: "Failed to delete weekly report" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
