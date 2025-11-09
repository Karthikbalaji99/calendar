import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../src-api/storage.js';
import { insertTaskSchema } from '../src-api/schema.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Check if there's an ID in the path (e.g., /api/tasks/123)
    const pathParts = req.url?.split('/').filter(Boolean);
    const hasId = pathParts && pathParts.length > 2; // ['api', 'tasks', 'id']
    const id = hasId ? pathParts[2] : null;

    // Handle PATCH /api/tasks/:id
    if (req.method === 'PATCH' && id) {
      const { completed } = req.body;
      
      if (typeof completed !== 'boolean') {
        return res.status(400).json({ error: 'Invalid completed value' });
      }
      
      const task = await storage.updateTask(id, { completed });
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }
      return res.status(200).json(task);
    }

    // Handle GET /api/tasks
    if (req.method === 'GET' && !id) {
      const tasks = await storage.getAllTasks();
      return res.status(200).json(tasks);
    }
    
    // Handle POST /api/tasks
    if (req.method === 'POST' && !id) {
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