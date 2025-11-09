import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../src-api/storage.js';
import { insertMemorySchema } from '../src-api/schema';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === 'GET') {
      const memories = await storage.getAllMemories();
      return res.status(200).json(memories);
    }
    
    if (req.method === 'POST') {
      const validatedData = insertMemorySchema.parse(req.body);
      const memory = await storage.createMemory(validatedData);
      return res.status(200).json(memory);
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error in /api/memories:', error);
    return res.status(500).json({ error: 'Failed to process request' });
  }
}