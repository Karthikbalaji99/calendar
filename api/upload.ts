import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabase } from '../src-api/supabase';
import multiparty from 'multiparty';
import { readFile } from 'fs/promises';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = new multiparty.Form();
    
    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Form parse error:', err);
        return res.status(500).json({ error: 'Failed to parse upload' });
      }

      const fileArray = files.file;
      if (!fileArray || fileArray.length === 0) {
        return res.status(400).json({ error: 'file required' });
      }

      const file = fileArray[0];
      const buffer = await readFile(file.path);
      const ext = path.extname(file.originalFilename || '').toLowerCase() || '.png';
      const filename = `${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`;
      
      const supabase = getSupabase();
      const { data, error } = await supabase.storage
        .from('memories')
        .upload(filename, buffer, { contentType: file.headers['content-type'], upsert: false });
      
      if (error) {
        const msg = String(error.message || error).toLowerCase();
        if (msg.includes('row-level security') || msg.includes('rls')) {
          return res.status(403).json({ error: 'Storage write blocked by RLS. Use service role key on server or allow uploads via policies.' });
        }
        if (msg.includes('bucket') && msg.includes('not') && msg.includes('exist')) {
          return res.status(400).json({ error: 'Missing storage bucket \'memories\'. Create a public bucket named \'memories\' in Supabase Storage.' });
        }
        throw error;
      }
      
      const { data: pub } = supabase.storage.from('memories').getPublicUrl(data.path);
      return res.status(200).json({ url: pub.publicUrl });
    });
  } catch (e: any) {
    console.error('upload error', e);
    return res.status(500).json({ error: e?.message || 'upload failed' });
  }
}