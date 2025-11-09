import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../../src-api/storage.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { id } = req.query;
    
    if (req.method === 'PATCH') {
      const { completed } = req.body;
      
      if (typeof completed !== 'boolean') {
        return res.status(400).json({ error: 'Invalid completed value' });
      }
      
      const task = await storage.updateTask(id as string, { completed });
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }
      return res.status(200).json(task);
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error in /api/tasks/[id]:', error);
    return res.status(400).json({ error: 'Failed to update task' });
  }
}