import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../src-api/storage.js';
import { insertHabitSchema } from '../src-api/schema.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === 'GET') {
      const habits = await storage.getAllHabits();
      return res.status(200).json(habits);
    }
    
    if (req.method === 'POST') {
      const validatedData = insertHabitSchema.parse(req.body);
      const habit = await storage.createHabit(validatedData);
      return res.status(200).json(habit);
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error in /api/habits:', error);
    return res.status(500).json({ error: 'Failed to process request' });
  }
}