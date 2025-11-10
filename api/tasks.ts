import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../src-api/storage.js';
import { insertTaskSchema } from '../src-api/schema.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Extract ID from URL if present (e.g., /api/tasks/123)
    const url = req.url || '';
    const pathMatch = url.match(/\/api\/tasks\/([a-zA-Z0-9-]+)/);
    const taskId = pathMatch ? pathMatch[1] : null;

    // Handle PATCH /api/tasks/:id
    if (req.method === 'PATCH' && taskId) {
      const { completed } = req.body;
      
      if (typeof completed !== 'boolean') {
        return res.status(400).json({ error: 'Invalid completed value' });
      }
      
      const task = await storage.updateTask(taskId, { completed });
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }
      return res.status(200).json(task);
    }

    // Handle GET /api/tasks
    if (req.method === 'GET' && !taskId) {
      const tasks = await storage.getAllTasks();
      return res.status(200).json(tasks);
    }
    
    // Handle POST /api/tasks
    if (req.method === 'POST' && !taskId) {
      const validatedData = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(validatedData);
      return res.status(200).json(task);
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error in /api/tasks:', error);
    return res.status(500).json({ error: 'Failed to process request' });
  }
}