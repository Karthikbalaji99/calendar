import {
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
import { getSupabase } from "./supabase";

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
// Helpers to map snake_case DB rows to camelCase API types
const mapMemory = (r: any): Memory => ({
  id: r.id,
  imageUrl: r.image_url,
  caption: r.caption ?? "",
  date: r.date,
  owner: r.owner,
  createdAt: r.created_at,
});

const mapGratitude = (r: any): GratitudeLog => ({
  id: r.id,
  date: r.date,
  from: r.from,
  to: r.to,
  content: r.content,
  createdAt: r.created_at,
});

const mapJournal = (r: any): JournalEntry => ({
  id: r.id,
  date: r.date,
  owner: r.owner,
  content: r.content,
  images: r.images ?? [],
  stickers: r.stickers ?? "[]",
  createdAt: r.created_at,
});

const mapTask = (r: any): Task => ({
  id: r.id,
  title: r.title,
  description: r.description ?? "",
  owner: r.owner,
  completed: !!r.completed,
  dueDate: r.due_date ?? undefined,
  createdAt: r.created_at,
});

const mapHabit = (r: any): Habit => ({
  id: r.id,
  name: r.name,
  owner: r.owner,
  color: r.color,
  createdAt: r.created_at,
});

const mapHabitCheckin = (r: any): HabitCheckin => ({
  id: r.id,
  habitId: r.habit_id,
  date: r.date,
  completed: !!r.completed,
  createdAt: r.created_at,
});

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("users")
      .select("id, username, password")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data ? (data as User) : undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("users")
      .select("id, username, password")
      .eq("username", username)
      .maybeSingle();
    if (error) throw error;
    return data ? (data as User) : undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("users")
      .insert(insertUser)
      .select("id, username, password")
      .single();
    if (error) throw error;
    return data as User;
  }

  async getAllMemories(): Promise<Memory[]> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("memories")
      .select("*")
      .order("created_at", { ascending: true });
    if (error) throw error;
    return (data || []).map(mapMemory);
  }

  async createMemory(memory: InsertMemory): Promise<Memory> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("memories")
      .insert({
        image_url: memory.imageUrl,
        caption: memory.caption ?? null,
        date: memory.date,
        owner: memory.owner,
      })
      .select("*")
      .single();
    if (error) throw error;
    return mapMemory(data);
  }

  async getAllGratitudeLogs(): Promise<GratitudeLog[]> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("gratitude_logs")
      .select("*")
      .order("created_at", { ascending: true });
    if (error) throw error;
    return (data || []).map(mapGratitude);
  }

  async createGratitudeLog(log: InsertGratitudeLog): Promise<GratitudeLog> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("gratitude_logs")
      .insert(log)
      .select("*")
      .single();
    if (error) throw error;
    return mapGratitude(data);
  }

  async getAllJournalEntries(): Promise<JournalEntry[]> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("journal_entries")
      .select("*")
      .order("created_at", { ascending: true });
    if (error) throw error;
    return (data || []).map(mapJournal);
  }

  async createJournalEntry(entry: InsertJournalEntry): Promise<JournalEntry> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("journal_entries")
      .insert({
        date: entry.date,
        owner: entry.owner,
        content: entry.content,
        images: entry.images ?? [],
        stickers: entry.stickers ?? "[]",
      })
      .select("*")
      .single();
    if (error) throw error;
    return mapJournal(data);
  }

  async getAllTasks(): Promise<Task[]> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: true });
    if (error) throw error;
    return (data || []).map(mapTask);
  }

  async createTask(task: InsertTask): Promise<Task> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("tasks")
      .insert({
        title: task.title,
        description: task.description ?? null,
        owner: task.owner,
        completed: task.completed ?? false,
        due_date: task.dueDate ?? null,
      })
      .select("*")
      .single();
    if (error) throw error;
    return mapTask(data);
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task | undefined> {
    const payload: any = {};
    if (updates.title !== undefined) payload.title = updates.title;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.owner !== undefined) payload.owner = updates.owner;
    if (updates.completed !== undefined) payload.completed = updates.completed;
    if (updates.dueDate !== undefined) payload.due_date = updates.dueDate ?? null;

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("tasks")
      .update(payload)
      .eq("id", id)
      .select("*")
      .maybeSingle();
    if (error) throw error;
    return data ? mapTask(data) : undefined;
  }

  async getAllHabits(): Promise<Habit[]> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("habits")
      .select("*")
      .order("created_at", { ascending: true });
    if (error) throw error;
    return (data || []).map(mapHabit);
  }

  async createHabit(habit: InsertHabit): Promise<Habit> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("habits")
      .insert(habit)
      .select("*")
      .single();
    if (error) throw error;
    return mapHabit(data);
  }

  async getAllHabitCheckins(): Promise<HabitCheckin[]> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("habit_checkins")
      .select("*")
      .order("date", { ascending: true });
    if (error) throw error;
    return (data || []).map(mapHabitCheckin);
  }

  async createOrUpdateHabitCheckin(checkin: InsertHabitCheckin): Promise<HabitCheckin> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("habit_checkins")
      .upsert(
        {
          habit_id: checkin.habitId,
          date: checkin.date,
          completed: checkin.completed ?? false,
        },
        { onConflict: "habit_id,date" }
      )
      .select("*")
      .single();
    if (error) throw error;
    return mapHabitCheckin(data);
  }
}

export const storage = new DatabaseStorage();
