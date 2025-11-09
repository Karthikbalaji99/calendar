import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import { supabase } from "./supabase";
import { storage } from "./storage";
import {
  insertMemorySchema,
  insertGratitudeLogSchema,
  insertJournalEntrySchema,
  insertTaskSchema,
  insertHabitSchema,
  insertHabitCheckinSchema,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024 } });

  app.post("/api/upload", upload.single("file"), async (req: Request & { file?: Express.Multer.File }, res) => {
    try {
      if (!req.file) {
        res.status(400).json({ error: "file required" });
        return;
      }
      const ext = path.extname(req.file.originalname || "").toLowerCase() || ".png";
      const filename = `${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`;
      const { data, error } = await supabase.storage
        .from("memories")
        .upload(filename, req.file.buffer, { contentType: req.file.mimetype, upsert: false });
      if (error) {
        const msg = String(error.message || error).toLowerCase();
        if (msg.includes("row-level security") || msg.includes("rls")) {
          return res.status(403).json({ error: "Storage write blocked by RLS. Use service role key on server or allow uploads via policies." });
        }
        if (msg.includes("bucket") && msg.includes("not") && msg.includes("exist")) {
          return res.status(400).json({ error: "Missing storage bucket 'memories'. Create a public bucket named 'memories' in Supabase Storage." });
        }
        throw error;
      }
      const { data: pub } = supabase.storage.from("memories").getPublicUrl(data.path);
      res.json({ url: pub.publicUrl });
    } catch (e: any) {
      console.error("upload error", e);
      res.status(500).json({ error: e?.message || "upload failed" });
    }
  });
  app.get("/api/memories", async (req, res) => {
    try {
      const memories = await storage.getAllMemories();
      res.json(memories);
    } catch (error) {
      console.error("Error fetching memories:", error);
      res.status(500).json({ error: "Failed to fetch memories" });
    }
  });

  app.post("/api/memories", async (req, res) => {
    try {
      const validatedData = insertMemorySchema.parse(req.body);
      const memory = await storage.createMemory(validatedData);
      res.json(memory);
    } catch (error) {
      console.error("Error creating memory:", error);
      res.status(400).json({ error: "Invalid memory data" });
    }
  });

  app.get("/api/gratitude", async (req, res) => {
    try {
      const logs = await storage.getAllGratitudeLogs();
      res.json(logs);
    } catch (error) {
      console.error("Error fetching gratitude logs:", error);
      res.status(500).json({ error: "Failed to fetch gratitude logs" });
    }
  });

  app.post("/api/gratitude", async (req, res) => {
    try {
      const validatedData = insertGratitudeLogSchema.parse(req.body);
      const log = await storage.createGratitudeLog(validatedData);
      res.json(log);
    } catch (error) {
      console.error("Error creating gratitude log:", error);
      res.status(400).json({ error: "Invalid gratitude log data" });
    }
  });

  app.get("/api/journal", async (req, res) => {
    try {
      const entries = await storage.getAllJournalEntries();
      res.json(entries);
    } catch (error) {
      console.error("Error fetching journal entries:", error);
      res.status(500).json({ error: "Failed to fetch journal entries" });
    }
  });

  app.post("/api/journal", async (req, res) => {
    try {
      const validatedData = insertJournalEntrySchema.parse(req.body);
      const entry = await storage.createJournalEntry(validatedData);
      res.json(entry);
    } catch (error) {
      console.error("Error creating journal entry:", error);
      res.status(400).json({ error: "Invalid journal entry data" });
    }
  });

  app.get("/api/tasks", async (req, res) => {
    try {
      const tasks = await storage.getAllTasks();
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ error: "Failed to fetch tasks" });
    }
  });

  app.post("/api/tasks", async (req, res) => {
    try {
      const validatedData = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(validatedData);
      res.json(task);
    } catch (error) {
      console.error("Error creating task:", error);
      res.status(400).json({ error: "Invalid task data" });
    }
  });

  app.patch("/api/tasks/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { completed } = req.body;
      
      if (typeof completed !== "boolean") {
        res.status(400).json({ error: "Invalid completed value" });
        return;
      }
      
      const task = await storage.updateTask(id, { completed });
      if (!task) {
        res.status(404).json({ error: "Task not found" });
        return;
      }
      res.json(task);
    } catch (error) {
      console.error("Error updating task:", error);
      res.status(400).json({ error: "Failed to update task" });
    }
  });

  app.get("/api/habits", async (req, res) => {
    try {
      const habits = await storage.getAllHabits();
      res.json(habits);
    } catch (error) {
      console.error("Error fetching habits:", error);
      res.status(500).json({ error: "Failed to fetch habits" });
    }
  });

  app.post("/api/habits", async (req, res) => {
    try {
      const validatedData = insertHabitSchema.parse(req.body);
      const habit = await storage.createHabit(validatedData);
      res.json(habit);
    } catch (error) {
      console.error("Error creating habit:", error);
      res.status(400).json({ error: "Invalid habit data" });
    }
  });

  app.get("/api/habits/checkins", async (req, res) => {
    try {
      const checkins = await storage.getAllHabitCheckins();
      res.json(checkins);
    } catch (error) {
      console.error("Error fetching habit checkins:", error);
      res.status(500).json({ error: "Failed to fetch habit checkins" });
    }
  });

  app.post("/api/habits/checkins", async (req, res) => {
    try {
      const validatedData = insertHabitCheckinSchema.parse(req.body);
      const checkin = await storage.createOrUpdateHabitCheckin(validatedData);
      res.json(checkin);
    } catch (error) {
      console.error("Error creating/updating habit checkin:", error);
      res.status(400).json({ error: "Invalid habit checkin data" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
