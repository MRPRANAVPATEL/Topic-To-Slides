import { isRateLimited } from '../server/photoService.ts';

export default async function handler(req: any, res: any) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  return res.status(200).json({
    hasUnsplashKey: !!process.env.UNSPLASH_ACCESS_KEY?.trim(),
    isRateLimited: isRateLimited(),
  });
}
