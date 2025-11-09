import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../../src-api/storage.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('PATCH handler called:', req.method, req.query, req.body);
  
  try {
    const { id } = req.query;
    
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid task ID' });
    }
    
    if (req.method === 'PATCH') {
      const { completed } = req.body || {};
      
      console.log('Parsed body:', { completed });
      
      if (typeof completed !== 'boolean') {
        return res.status(400).json({ error: 'Invalid completed value', received: typeof completed });
      }
      
      const task = await storage.updateTask(id, { completed });
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }
      return res.status(200).json(task);
    }
    
    console.log('Method not allowed:', req.method);
    return res.status(405).json({ error: 'Method not allowed', method: req.method });
  } catch (error: any) {
    console.error('Error in /api/tasks/[id]:', error);
    return res.status(500).json({ error: 'Failed to update task', details: error.message });
  }
}