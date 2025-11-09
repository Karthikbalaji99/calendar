import {
  users,
  memories,
  gratitudeLogs,
  journalEntries,
  tasks,
  habits,
  habitCheckins,
  type User,
  type InsertUser,
  type Memory,
  type InsertMemory,
  type GratitudeLog,
  type InsertGratitudeLog,
  type JournalEntry,
  type InsertJournalEntry,
  type Task,
  type InsertTask,
  type Habit,
  type InsertHabit,
  type HabitCheckin,
  type InsertHabitCheckin,
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getAllMemories(): Promise<Memory[]>;
  createMemory(memory: InsertMemory): Promise<Memory>;

  getAllGratitudeLogs(): Promise<GratitudeLog[]>;
  createGratitudeLog(log: InsertGratitudeLog): Promise<GratitudeLog>;

  getAllJournalEntries(): Promise<JournalEntry[]>;
  createJournalEntry(entry: InsertJournalEntry): Promise<JournalEntry>;

  getAllTasks(): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: string, updates: Partial<Task>): Promise<Task | undefined>;

  getAllHabits(): Promise<Habit[]>;
  createHabit(habit: InsertHabit): Promise<Habit>;

  getAllHabitCheckins(): Promise<HabitCheckin[]>;
  createOrUpdateHabitCheckin(checkin: InsertHabitCheckin): Promise<HabitCheckin>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getAllMemories(): Promise<Memory[]> {
    return await db.select().from(memories).orderBy(memories.createdAt);
  }

  async createMemory(memory: InsertMemory): Promise<Memory> {
    const [newMemory] = await db
      .insert(memories)
      .values(memory)
      .returning();
    return newMemory;
  }

  async getAllGratitudeLogs(): Promise<GratitudeLog[]> {
    return await db.select().from(gratitudeLogs).orderBy(gratitudeLogs.createdAt);
  }

  async createGratitudeLog(log: InsertGratitudeLog): Promise<GratitudeLog> {
    const [newLog] = await db
      .insert(gratitudeLogs)
      .values(log)
      .returning();
    return newLog;
  }

  async getAllJournalEntries(): Promise<JournalEntry[]> {
    return await db.select().from(journalEntries).orderBy(journalEntries.createdAt);
  }

  async createJournalEntry(entry: InsertJournalEntry): Promise<JournalEntry> {
    const [newEntry] = await db
      .insert(journalEntries)
      .values(entry)
      .returning();
    return newEntry;
  }

  async getAllTasks(): Promise<Task[]> {
    return await db.select().from(tasks).orderBy(tasks.createdAt);
  }

  async createTask(task: InsertTask): Promise<Task> {
    const [newTask] = await db
      .insert(tasks)
      .values(task)
      .returning();
    return newTask;
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task | undefined> {
    const [updated] = await db
      .update(tasks)
      .set(updates)
      .where(eq(tasks.id, id))
      .returning();
    return updated || undefined;
  }

  async getAllHabits(): Promise<Habit[]> {
    return await db.select().from(habits).orderBy(habits.createdAt);
  }

  async createHabit(habit: InsertHabit): Promise<Habit> {
    const [newHabit] = await db
      .insert(habits)
      .values(habit)
      .returning();
    return newHabit;
  }

  async getAllHabitCheckins(): Promise<HabitCheckin[]> {
    return await db.select().from(habitCheckins).orderBy(habitCheckins.date);
  }

  async createOrUpdateHabitCheckin(checkin: InsertHabitCheckin): Promise<HabitCheckin> {
    const existing = await db
      .select()
      .from(habitCheckins)
      .where(
        and(eq(habitCheckins.habitId, checkin.habitId), eq(habitCheckins.date, checkin.date))
      );

    if (existing.length > 0) {
      const [updated] = await db
        .update(habitCheckins)
        .set({ completed: checkin.completed })
        .where(eq(habitCheckins.id, existing[0].id))
        .returning();
      return updated;
    }

    const [newCheckin] = await db
      .insert(habitCheckins)
      .values(checkin)
      .returning();
    return newCheckin;
  }
}

export const storage = new DatabaseStorage();
