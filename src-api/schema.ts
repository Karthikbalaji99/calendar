import { z } from "zod";

// Shared Zod schemas and TypeScript types for JSON storage

export const idSchema = z.string().min(1);
export const ownerSchema = z.enum(["panda", "cookie", "both"]);
export const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

// Users (kept for completeness, not actively used)
export const insertUserSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});
export const userSchema = insertUserSchema.extend({
  id: idSchema,
});

// Memories
export const insertMemorySchema = z.object({
  imageUrl: z
    .string()
    .url()
    .refine((v) => /^https?:\/\//i.test(v), { message: "imageUrl must be http(s) URL" }),
  caption: z.string().optional().default(""),
  date: dateString,
  owner: ownerSchema,
});
export const memorySchema = insertMemorySchema.extend({
  id: idSchema,
  createdAt: z.string(),
});

// Gratitude Logs
export const insertGratitudeLogSchema = z.object({
  date: dateString,
  from: z.enum(["panda", "cookie"]),
  to: z.enum(["panda", "cookie"]),
  content: z.string().min(1),
});
export const gratitudeLogSchema = insertGratitudeLogSchema.extend({
  id: idSchema,
  createdAt: z.string(),
});

// Journal Entries
export const insertJournalEntrySchema = z.object({
  date: dateString,
  owner: z.enum(["panda", "cookie"]),
  content: z.string().min(1),
  images: z.array(z.string()).optional().default([]),
  stickers: z.string().optional().default("[]"),
});
export const journalEntrySchema = insertJournalEntrySchema.extend({
  id: idSchema,
  createdAt: z.string(),
});

// Tasks
export const insertTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  owner: ownerSchema,
  completed: z.boolean().optional().default(false),
  dueDate: dateString.optional(),
});
export const taskSchema = insertTaskSchema.extend({
  id: idSchema,
  createdAt: z.string(),
  completed: z.boolean(),
});

// Habits
export const insertHabitSchema = z.object({
  name: z.string().min(1),
  owner: ownerSchema,
  color: z.string().min(1),
});
export const habitSchema = insertHabitSchema.extend({
  id: idSchema,
  createdAt: z.string(),
});

// Habit Checkins
export const insertHabitCheckinSchema = z.object({
  habitId: idSchema,
  date: dateString,
  completed: z.boolean().optional().default(false),
});
export const habitCheckinSchema = insertHabitCheckinSchema.extend({
  id: idSchema,
  createdAt: z.string(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = z.infer<typeof userSchema>;
export type InsertMemory = z.infer<typeof insertMemorySchema>;
export type Memory = z.infer<typeof memorySchema>;
export type InsertGratitudeLog = z.infer<typeof insertGratitudeLogSchema>;
export type GratitudeLog = z.infer<typeof gratitudeLogSchema>;
export type InsertJournalEntry = z.infer<typeof insertJournalEntrySchema>;
export type JournalEntry = z.infer<typeof journalEntrySchema>;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = z.infer<typeof taskSchema>;
export type InsertHabit = z.infer<typeof insertHabitSchema>;
export type Habit = z.infer<typeof habitSchema>;
export type InsertHabitCheckin = z.infer<typeof insertHabitCheckinSchema>;
export type HabitCheckin = z.infer<typeof habitCheckinSchema>;
