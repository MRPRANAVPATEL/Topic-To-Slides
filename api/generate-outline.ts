import { generateOutlineHandler } from '../server/generator.ts';

export default async function handler(req: any, res: any) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        return res.status(400).json({ error: 'Invalid JSON request body.' });
      }
    }

    const result = await generateOutlineHandler(body || {});
    return res.status(200).json(result);
  } catch (error: any) {
    console.error('Vercel API error in generate-outline:', error);
    const statusCode = error?.statusCode || 500;
    return res.status(statusCode).json({
      error: error?.message || 'Failed to generate presentation outline with Gemini.',
    });
  }
}
