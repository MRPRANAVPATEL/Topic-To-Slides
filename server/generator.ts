import { GoogleGenAI, Type } from '@google/genai';
import {
  searchPhotoForSlide,
  isRateLimited,
  PhotoItem,
} from './photoService.ts';

// Vibrant and harmonious color palettes for slides (one accent color per slide section)
export const PALETTES = [
  ['#4F46E5', '#059669', '#D97706', '#E11D48', '#7C3AED', '#0D9488'], // Classic Vibrant
  ['#2563EB', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6', '#06B6D4'], // Modern Tech
  ['#1E40AF', '#15803D', '#B45309', '#BE123C', '#6D28D9', '#0F766E'], // Deep Elegant
  ['#3B82F6', '#14B8A6', '#F97316', '#EF4444', '#A855F7', '#6366F1'], // Energetic Pop
];

export async function generateOutlineHandler(payload: {
  topic?: string;
  level?: string;
  layoutMode?: string;
}) {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error(
      'GEMINI_API_KEY environment variable is not configured. Please set GEMINI_API_KEY in your environment variables or Vercel Project Settings.'
    );
  }

  const { topic, level = 'student', layoutMode = 'background-overlay' } = payload;

  if (!topic || typeof topic !== 'string' || !topic.trim()) {
    const err: any = new Error('Please provide a valid topic.');
    err.statusCode = 400;
    throw err;
  }

  const trimmedTopic = topic.trim();
  const validLevel = ['simple', 'student', 'advanced'].includes(level)
    ? level
    : 'student';

  const selectedPalette = PALETTES[Math.floor(Math.random() * PALETTES.length)];

  // Initialize Gemini SDK with User-Agent header for telemetry
  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  const prompt = `Generate a structured, visually engaging presentation outline for the topic "${trimmedTopic}" at a "${validLevel}" understanding level.

Level Guidelines:
- "simple": Plain everyday language, memorable analogies, beginner-friendly, zero unnecessary jargon.
- "student": Educational framework, foundational definitions, structured step-by-step reasoning, classroom-ready examples.
- "advanced": Technical depth, strategic framework, metrics, industry nuances, actionable takeaways.

Structure & Layout Requirements:
1. Exactly 6 slides in total with VARIED layout types across the deck:
   - Slide 1: slideType "title" — Full-bleed topic photo, catchy main presentation title, subtitle, 3 key summary highlight bullets, and a one-line speaker note.
   - Slide 2: slideType "bullets" — Core concepts or foundations with 3 to 4 punchy bullet points and a one-line speaker note.
   - Slide 3: slideType "quote" — A powerful thesis quote or central philosophy statement, with quoteAuthor and 2 supporting bullets, and a one-line speaker note.
   - Slide 4: slideType "stats" — Key quantified pillars or 2-3 key metrics with numbers (e.g. "95% accuracy", "3x speedup") and short labels, 2 context bullets, and a one-line speaker note.
   - Slide 5: slideType "bullets" — Practical applications, case study, or actionable framework with 3 to 4 bullets, and a one-line speaker note.
   - Slide 6: slideType "closing" — Big takeaways, future horizon, or summary with 3 punchy bullets, and a one-line speaker note.

2. Image queries:
   For EVERY slide, return "imageQuery": exactly 2 to 4 plain English words describing a specific, high-quality, relevant landscape photo on Unsplash (e.g., "coral reef underwater", "solar panels sunrise", "ancient library architecture", "cybersecurity code dark", "brain neural synapses").

3. Section styling:
   Assign each of the 6 slides a distinct accent color hex code from this palette:
   Slide 1: ${selectedPalette[0]}
   Slide 2: ${selectedPalette[1]}
   Slide 3: ${selectedPalette[2]}
   Slide 4: ${selectedPalette[3]}
   Slide 5: ${selectedPalette[4]}
   Slide 6: ${selectedPalette[5]}`;

  let response: any = null;
  let lastError: any = null;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction:
            'You are a world-class presentation strategist and visual art director. You create engaging, highly structured slide deck outlines tailored precisely to the user topic, with varied slide types and specific photo search queries.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: {
                type: Type.STRING,
                description: 'Overall presentation title',
              },
              subtitle: {
                type: Type.STRING,
                description: 'Engaging subtitle or target takeaway',
              },
              slides: {
                type: Type.ARRAY,
                description: 'The 6 slides with varied layouts',
                items: {
                  type: Type.OBJECT,
                  properties: {
                    slideNumber: {
                      type: Type.INTEGER,
                      description: 'Slide index from 1 to 6',
                    },
                    slideType: {
                      type: Type.STRING,
                      description: 'One of: title, bullets, quote, stats, closing',
                    },
                    sectionTitle: {
                      type: Type.STRING,
                      description: 'Short section label (e.g. Title, Foundations, Core Thesis, Metrics, Applications, Takeaways)',
                    },
                    title: {
                      type: Type.STRING,
                      description: 'Short slide title (3 to 7 words)',
                    },
                    subtitle: {
                      type: Type.STRING,
                      description: 'Optional subtitle for title or key slides',
                    },
                    imageQuery: {
                      type: Type.STRING,
                      description: '2 to 4 plain words describing a relevant photo on Unsplash',
                    },
                    bullets: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description: '3 to 4 bullet points',
                    },
                    quoteAuthor: {
                      type: Type.STRING,
                      description: 'Author or attribution for quote slide',
                    },
                    speakerNote: {
                      type: Type.STRING,
                      description: 'A single concise sentence speaker note guidance',
                    },
                    accentColor: {
                      type: Type.STRING,
                      description: 'Hex color string like #4F46E5',
                    },
                    isTitleSlide: {
                      type: Type.BOOLEAN,
                      description: 'True for slide 1, false for slides 2-6',
                    },
                  },
                  required: [
                    'slideNumber',
                    'slideType',
                    'sectionTitle',
                    'title',
                    'imageQuery',
                    'bullets',
                    'speakerNote',
                    'accentColor',
                    'isTitleSlide',
                  ],
                },
              },
            },
            required: ['title', 'subtitle', 'slides'],
          },
        },
      });

      if (response?.text) break;
    } catch (err: any) {
      lastError = err;
      console.warn(`Gemini call attempt ${attempt} failed:`, err?.message || err);
      if (attempt < 3) {
        await new Promise((r) => setTimeout(r, 1200 * attempt));
      }
    }
  }

  const text = response?.text;
  if (!text) {
    let cleanMessage = lastError?.message || 'Gemini did not return outline data.';
    try {
      const parsed = JSON.parse(cleanMessage);
      if (parsed.error?.message) {
        cleanMessage = parsed.error.message;
      }
    } catch (_) {}
    throw new Error(cleanMessage);
  }

  const outlineData = JSON.parse(text);

  // Format raw slide items (capped at max 10 slides per user requirement)
  const rawSlides = (outlineData.slides || []).slice(0, 10).map((s: any, idx: number) => ({
    id: `slide_${idx + 1}_${Date.now()}`,
    slideNumber: idx + 1,
    slideType: s.slideType || (idx === 0 ? 'title' : 'bullets'),
    sectionTitle: s.sectionTitle || (idx === 0 ? 'Title & Overview' : `Section ${idx}`),
    title: s.title || `Slide ${idx + 1}`,
    subtitle: s.subtitle || (idx === 0 ? outlineData.subtitle : ''),
    imageQuery: s.imageQuery || `${trimmedTopic} concept`,
    bullets: Array.isArray(s.bullets) && s.bullets.length > 0 ? s.bullets : ['Key takeaway point'],
    quoteAuthor: s.quoteAuthor || (s.slideType === 'quote' ? 'Industry Thought Leader' : undefined),
    speakerNote: s.speakerNote || 'Introduce this topic clearly to the audience.',
    accentColor: s.accentColor || selectedPalette[idx % selectedPalette.length],
    isTitleSlide: idx === 0 || !!s.isTitleSlide,
  }));

  // Step 2: Unsplash search per slide with demo-limit preservation
  // Rules:
  // - Reuse same photo when two slides have the same query
  // - Reuse title slide photo for the closing slide (slide 6)
  // - If 403 or 429 rate limit is received, stop requests and use gradient backgrounds
  const queryToPhotoMap = new Map<string, { photo: PhotoItem | null; candidates: PhotoItem[] }>();
  let rateLimitReached = isRateLimited();
  let titleSlidePhoto: PhotoItem | null = null;
  let titleSlideCandidates: PhotoItem[] = [];

  const slidesWithPhotos: any[] = [];

  for (let idx = 0; idx < rawSlides.length; idx++) {
    const slide = rawSlides[idx];
    const isClosingSlide = idx === rawSlides.length - 1 || slide.slideType === 'closing';

    // Rule: Reuse title slide photo for the closing slide
    if (isClosingSlide && titleSlidePhoto) {
      slidesWithPhotos.push({
        ...slide,
        photo: titleSlidePhoto,
        candidatePhotos: titleSlideCandidates,
        hasImage: true,
      });
      continue;
    }

    // If already hit rate limit, stop requests and use gradient
    if (rateLimitReached) {
      slidesWithPhotos.push({
        ...slide,
        photo: null,
        candidatePhotos: [],
        hasImage: false,
      });
      continue;
    }

    const cleanQuery = slide.imageQuery.trim().toLowerCase();

    // Rule: Reuse same photo when two slides have the same query
    if (queryToPhotoMap.has(cleanQuery)) {
      const cachedMatch = queryToPhotoMap.get(cleanQuery)!;
      if (idx === 0) {
        titleSlidePhoto = cachedMatch.photo;
        titleSlideCandidates = cachedMatch.candidates;
      }
      slidesWithPhotos.push({
        ...slide,
        photo: cachedMatch.photo,
        candidatePhotos: cachedMatch.candidates,
        hasImage: !!cachedMatch.photo,
      });
      continue;
    }

    // Execute search for this slide
    try {
      const searchResult = await searchPhotoForSlide(slide.imageQuery, trimmedTopic);

      if (searchResult.rateLimited) {
        rateLimitReached = true;
        slidesWithPhotos.push({
          ...slide,
          photo: null,
          candidatePhotos: [],
          hasImage: false,
        });
        continue;
      }

      queryToPhotoMap.set(cleanQuery, {
        photo: searchResult.photo,
        candidates: searchResult.candidates,
      });

      if (idx === 0) {
        titleSlidePhoto = searchResult.photo;
        titleSlideCandidates = searchResult.candidates;
      }

      slidesWithPhotos.push({
        ...slide,
        photo: searchResult.photo,
        candidatePhotos: searchResult.candidates,
        hasImage: !!searchResult.photo,
      });
    } catch (err) {
      console.warn(`Unsplash search failed for slide ${idx + 1}:`, err);
      slidesWithPhotos.push({
        ...slide,
        photo: null,
        candidatePhotos: [],
        hasImage: false,
      });
    }
  }

  const photoNotice = rateLimitReached
    ? 'Photo limit reached, using colors for the rest. Try again in an hour.'
    : undefined;

  return {
    topic: trimmedTopic,
    level: validLevel,
    title: outlineData.title || `${trimmedTopic} Presentation`,
    subtitle: outlineData.subtitle || `A structured presentation on ${trimmedTopic}`,
    layoutMode: layoutMode || 'background-overlay',
    buildBulletsAcrossSlides: false,
    slides: slidesWithPhotos,
    photoNotice,
  };
}
