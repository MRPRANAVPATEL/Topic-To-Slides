import 'dotenv/config';
import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { searchPhotoForSlide, isRateLimited } from './server/photoService.ts';
import { generateOutlineHandler } from './server/generator.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Helper endpoint to check Unsplash API configuration status
app.get('/api/config-status', (_req: Request, res: Response) => {
  res.json({
    hasUnsplashKey: !!process.env.UNSPLASH_ACCESS_KEY?.trim(),
    isRateLimited: isRateLimited(),
  });
});

// Endpoint to swap photo or search photos for a query
app.post('/api/search-photos', async (req: Request, res: Response) => {
  try {
    const { query, topic = '' } = req.body;
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Valid search query required.' });
    }

    const result = await searchPhotoForSlide(query, topic);
    return res.json({
      primary: result.photo,
      candidates: result.candidates,
      rateLimited: result.rateLimited,
      notice: result.rateLimited
        ? 'Photo limit reached, using colors for the rest. Try again in an hour.'
        : undefined,
    });
  } catch (error: any) {
    console.error('Photo search error:', error);
    return res.status(500).json({ error: 'Failed to search photos.' });
  }
});

// Main endpoint to generate outline with Gemini and attach Unsplash photos
app.post('/api/generate-outline', async (req: Request, res: Response) => {
  try {
    const result = await generateOutlineHandler(req.body);
    return res.json(result);
  } catch (error: any) {
    console.error('Error generating outline:', error);
    const statusCode = error?.statusCode || 500;
    return res.status(statusCode).json({
      error: error?.message || 'Failed to generate presentation outline with Gemini.',
    });
  }
});

// Setup dev server with Vite middlewares or serve static in production
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Topic to Slides server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
