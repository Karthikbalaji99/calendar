import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../src-api/storage';
import { insertGratitudeLogSchema } from '../src-api/schema';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === 'GET') {
      const logs = await storage.getAllGratitudeLogs();
      return res.status(200).json(logs);
    }
    
    if (req.method === 'POST') {
      const validatedData = insertGratitudeLogSchema.parse(req.body);
      const log = await storage.createGratitudeLog(validatedData);
      return res.status(200).json(log);
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error in /api/gratitude:', error);
    return res.status(500).json({ error: 'Failed to process request' });
  }
}