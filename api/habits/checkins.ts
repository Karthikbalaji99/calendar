import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../../src-api/storage.js';
import { insertHabitCheckinSchema } from '../../src-api/schema.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === 'GET') {
      const checkins = await storage.getAllHabitCheckins();
      return res.status(200).json(checkins);
    }
    
    if (req.method === 'POST') {
      const validatedData = insertHabitCheckinSchema.parse(req.body);
      const checkin = await storage.createOrUpdateHabitCheckin(validatedData);
      return res.status(200).json(checkin);
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error in /api/habits/checkins:', error);
    return res.status(500).json({ error: 'Failed to process request' });
  }
}