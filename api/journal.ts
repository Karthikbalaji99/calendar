import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../src-api/storage';
import { insertJournalEntrySchema } from '../src-api/schema';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === 'GET') {
      const entries = await storage.getAllJournalEntries();
      return res.status(200).json(entries);
    }
    
    if (req.method === 'POST') {
      const validatedData = insertJournalEntrySchema.parse(req.body);
      const entry = await storage.createJournalEntry(validatedData);
      return res.status(200).json(entry);
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error in /api/journal:', error);
    return res.status(500).json({ error: 'Failed to process request' });
  }
}