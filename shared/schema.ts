import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, date } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const memories = pgTable("memories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  imageUrl: text("image_url").notNull(),
  caption: text("caption"),
  date: date("date").notNull(),
  owner: text("owner").notNull(), // "panda", "cookie", or "both"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const gratitudeLogs = pgTable("gratitude_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  date: date("date").notNull(),
  from: text("from").notNull(), // "panda" or "cookie"
  to: text("to").notNull(), // "panda" or "cookie"
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const journalEntries = pgTable("journal_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  date: date("date").notNull(),
  owner: text("owner").notNull(), // "panda" or "cookie"
  content: text("content").notNull(),
  images: text("images").array().default(sql`'{}'`),
  stickers: text("stickers").default('[]'), // JSON string of sticker positions
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  owner: text("owner").notNull(), // "panda", "cookie", or "both"
  completed: boolean("completed").default(false).notNull(),
  dueDate: date("due_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const habits = pgTable("habits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  owner: text("owner").notNull(), // "panda", "cookie", or "both"
  color: text("color").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const habitCheckins = pgTable("habit_checkins", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  habitId: varchar("habit_id").notNull().references(() => habits.id, { onDelete: 'cascade' }),
  date: date("date").notNull(),
  completed: boolean("completed").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const habitsRelations = relations(habits, ({ many }) => ({
  checkins: many(habitCheckins),
}));

export const habitCheckinsRelations = relations(habitCheckins, ({ one }) => ({
  habit: one(habits, {
    fields: [habitCheckins.habitId],
    references: [habits.id],
  }),
}));

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertMemorySchema = createInsertSchema(memories).omit({
  id: true,
  createdAt: true,
});

export const insertGratitudeLogSchema = createInsertSchema(gratitudeLogs).omit({
  id: true,
  createdAt: true,
});

export const insertJournalEntrySchema = createInsertSchema(journalEntries).omit({
  id: true,
  createdAt: true,
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
});

export const insertHabitSchema = createInsertSchema(habits).omit({
  id: true,
  createdAt: true,
});

export const insertHabitCheckinSchema = createInsertSchema(habitCheckins).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Memory = typeof memories.$inferSelect;
export type InsertMemory = z.infer<typeof insertMemorySchema>;
export type GratitudeLog = typeof gratitudeLogs.$inferSelect;
export type InsertGratitudeLog = z.infer<typeof insertGratitudeLogSchema>;
export type JournalEntry = typeof journalEntries.$inferSelect;
export type InsertJournalEntry = z.infer<typeof insertJournalEntrySchema>;
export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Habit = typeof habits.$inferSelect;
export type InsertHabit = z.infer<typeof insertHabitSchema>;
export type HabitCheckin = typeof habitCheckins.$inferSelect;
export type InsertHabitCheckin = z.infer<typeof insertHabitCheckinSchema>;
