export interface PhotoItem {
  url: string;
  thumbUrl: string;
  photographer: string;
  photographerUrl?: string;
  source: 'Unsplash' | 'Gradient' | 'AI' | 'Wikimedia' | 'Stock';
  alt: string;
}

// In-memory cache to save API calls
const queryCache = new Map<string, PhotoItem[]>();

// Rate-limit tracking for Unsplash
let rateLimitHitTimestamp = 0;
const RATE_LIMIT_COOLDOWN_MS = 60 * 60 * 1000; // 1 hour cooldown

export function isRateLimited(): boolean {
  if (!rateLimitHitTimestamp) return false;
  const elapsed = Date.now() - rateLimitHitTimestamp;
  if (elapsed < RATE_LIMIT_COOLDOWN_MS) {
    return true;
  }
  rateLimitHitTimestamp = 0;
  return false;
}

export function markRateLimited() {
  rateLimitHitTimestamp = Date.now();
  console.warn('Unsplash rate limit hit (403/429). Switching to AI and open image providers.');
}

/**
 * Curated high-resolution open CDN photos for instant, rock-solid fallback.
 */
const CURATED_TOPIC_PHOTOS: Record<string, string[]> = {
  tech: [
    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1280&q=80',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1280&q=80',
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1280&q=80',
    'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1280&q=80',
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1280&q=80',
  ],
  business: [
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1280&q=80',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1280&q=80',
    'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1280&q=80',
    'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1280&q=80',
    'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1280&q=80',
  ],
  education: [
    'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1280&q=80',
    'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1280&q=80',
    'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1280&q=80',
    'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1280&q=80',
  ],
  science: [
    'https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&w=1280&q=80',
    'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1280&q=80',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1280&q=80',
    'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=1280&q=80',
  ],
  nature: [
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1280&q=80',
    'https://images.unsplash.com/photo-1426604966848-d7adac402bff?auto=format&fit=crop&w=1280&q=80',
    'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1280&q=80',
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1280&q=80',
  ],
  health: [
    'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=1280&q=80',
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1280&q=80',
    'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&w=1280&q=80',
  ],
  finance: [
    'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=1280&q=80',
    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1280&q=80',
    'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1280&q=80',
  ],
  creative: [
    'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=1280&q=80',
    'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1280&q=80',
    'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1280&q=80',
    'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=1280&q=80',
  ],
};

function getCuratedPhoto(category: string, index: number): PhotoItem {
  const cat = CURATED_TOPIC_PHOTOS[category] || CURATED_TOPIC_PHOTOS.tech;
  const url = cat[Math.abs(index) % cat.length];
  return {
    url,
    thumbUrl: url,
    photographer: 'Unsplash Photography',
    photographerUrl: 'https://unsplash.com',
    source: 'Stock',
    alt: `${category} presentation photograph`,
  };
}

/**
 * Generates a prompt-tailored, cinematic 16:9 presentation image via Pollinations AI.
 */
function buildAiGeneratedPhoto(query: string, topic: string, seedOffset = 1): PhotoItem {
  const cleanTopic = topic.replace(/[^\w\s-]/g, '').trim();
  const cleanQuery = query.replace(/[^\w\s-]/g, '').trim();
  const prompt = `${cleanTopic} ${cleanQuery} cinematic presentation slide background professional 4k high definition`;
  
  // Deterministic seed so the image stays stable across re-renders
  let hash = 0;
  const str = `${cleanTopic}_${cleanQuery}_${seedOffset}`;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const seed = (Math.abs(hash) % 89999) + 10001;

  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(
    prompt
  )}?width=1280&height=720&nologo=true&seed=${seed}`;

  return {
    url,
    thumbUrl: url,
    photographer: 'AI Presentation Artist',
    photographerUrl: 'https://pollinations.ai',
    source: 'AI',
    alt: `${cleanQuery} AI visual`,
  };
}

/**
 * Searches Wikimedia Commons / Wikipedia for authentic real-world photography.
 */
async function searchWikimediaDirect(query: string): Promise<PhotoItem[]> {
  try {
    const cleanQuery = query.trim().replace(/[^\w\s-]/g, '');
    const url = `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(
      cleanQuery
    )}&gsrlimit=4&prop=pageimages|info&pithumbsize=1280&format=json&origin=*`;

    const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) return [];

    const data = await res.json();
    if (!data?.query?.pages) return [];

    const photos: PhotoItem[] = [];
    for (const page of Object.values<any>(data.query.pages)) {
      const src = page.thumbnail?.source;
      if (
        src &&
        typeof src === 'string' &&
        !src.endsWith('.svg.png') &&
        !src.endsWith('.svg') &&
        !src.includes('flag') &&
        !src.includes('icon')
      ) {
        photos.push({
          url: src,
          thumbUrl: src,
          photographer: 'Wikimedia Commons Contributor',
          photographerUrl: `https://en.wikipedia.org/?curid=${page.pageid}`,
          source: 'Wikimedia',
          alt: page.title || query,
        });
      }
    }
    return photos;
  } catch {
    return [];
  }
}

/**
 * Searches Unsplash for landscape photos if access key is available.
 */
async function searchUnsplashDirect(
  query: string
): Promise<{ photos: PhotoItem[]; rateLimited: boolean } | null> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY?.trim();
  if (!accessKey) {
    return null;
  }

  if (isRateLimited()) {
    return { photos: [], rateLimited: true };
  }

  const cleanQuery = query.trim().toLowerCase();
  if (queryCache.has(cleanQuery)) {
    const cached = queryCache.get(cleanQuery)!;
    if (cached.length > 0) {
      return { photos: cached, rateLimited: false };
    }
  }

  try {
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
      cleanQuery
    )}&orientation=landscape&per_page=5&content_filter=high`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Client-ID ${accessKey}`,
        'Accept-Version': 'v1',
      },
      signal: AbortSignal.timeout(3500),
    });

    if (res.status === 403 || res.status === 429) {
      markRateLimited();
      return { photos: [], rateLimited: true };
    }

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    if (!data.results || data.results.length === 0) {
      return { photos: [], rateLimited: false };
    }

    const photos: PhotoItem[] = data.results.map((photo: any) => ({
      url: photo.urls.regular,
      thumbUrl: photo.urls.small,
      photographer: photo.user?.name || 'Unsplash Contributor',
      photographerUrl: photo.user?.links?.html || 'https://unsplash.com',
      source: 'Unsplash' as const,
      alt: photo.alt_description || photo.description || query,
    }));

    queryCache.set(cleanQuery, photos);
    return { photos, rateLimited: false };
  } catch {
    return null;
  }
}

/**
 * Main search function for a single slide:
 * 1. Checks Unsplash (if key present and valid).
 * 2. Checks Wikimedia Commons for authentic topic images.
 * 3. Generates high-resolution tailored AI presentation visuals.
 * 4. Merges candidates so user can swap anytime.
 * Guaranteed to NEVER return null for photo - slides will always have rich imagery.
 */
export async function searchPhotoForSlide(
  imageQuery: string,
  topic: string,
  slideIndex = 1
): Promise<{ photo: PhotoItem; candidates: PhotoItem[]; rateLimited: boolean }> {
  const candidates: PhotoItem[] = [];
  const cleanQuery = imageQuery.trim();

  // 1. Try Unsplash if configured
  const unsplashResult = await searchUnsplashDirect(cleanQuery);
  if (unsplashResult && unsplashResult.photos.length > 0) {
    candidates.push(...unsplashResult.photos);
  }

  // 2. Fetch authentic Wikimedia Commons photos in parallel/fallback
  if (candidates.length < 3) {
    const wikiPhotos = await searchWikimediaDirect(cleanQuery);
    if (wikiPhotos.length > 0) {
      candidates.push(...wikiPhotos);
    }
  }

  // 3. Generate high-quality AI presentation visual tailored specifically to the slide query
  const aiPhoto1 = buildAiGeneratedPhoto(cleanQuery, topic, slideIndex);
  const aiPhoto2 = buildAiGeneratedPhoto(cleanQuery, topic, slideIndex + 99);
  candidates.push(aiPhoto1, aiPhoto2);

  // 4. Select curated high-res topic photo
  const lowerTopic = (topic + ' ' + cleanQuery).toLowerCase();
  let category = 'tech';
  if (lowerTopic.includes('business') || lowerTopic.includes('market') || lowerTopic.includes('money') || lowerTopic.includes('manage') || lowerTopic.includes('work') || lowerTopic.includes('startup')) {
    category = 'business';
  } else if (lowerTopic.includes('school') || lowerTopic.includes('student') || lowerTopic.includes('learn') || lowerTopic.includes('teach') || lowerTopic.includes('educat') || lowerTopic.includes('book')) {
    category = 'education';
  } else if (lowerTopic.includes('health') || lowerTopic.includes('med') || lowerTopic.includes('doctor') || lowerTopic.includes('fit') || lowerTopic.includes('hospital')) {
    category = 'health';
  } else if (lowerTopic.includes('finance') || lowerTopic.includes('bank') || lowerTopic.includes('crypto') || lowerTopic.includes('invest') || lowerTopic.includes('economy')) {
    category = 'finance';
  } else if (lowerTopic.includes('bio') || lowerTopic.includes('science') || lowerTopic.includes('space') || lowerTopic.includes('physic') || lowerTopic.includes('chem')) {
    category = 'science';
  } else if (lowerTopic.includes('nature') || lowerTopic.includes('environment') || lowerTopic.includes('climate') || lowerTopic.includes('earth') || lowerTopic.includes('ocean') || lowerTopic.includes('plant')) {
    category = 'nature';
  } else if (lowerTopic.includes('art') || lowerTopic.includes('design') || lowerTopic.includes('creative') || lowerTopic.includes('music')) {
    category = 'creative';
  }
  const curatedPhoto = getCuratedPhoto(category, slideIndex);

  // If Unsplash API returned results, place them first; otherwise use the curated Unsplash photo as primary
  // so Google Slides API and browsers load the images instantly without network delays or timeouts.
  const primaryPhoto = candidates[0] || curatedPhoto;
  
  // Ensure both curated and AI photos are in candidates for the user to pick or swap anytime
  const allCandidates = [
    primaryPhoto,
    ...(primaryPhoto.url !== curatedPhoto.url ? [curatedPhoto] : []),
    aiPhoto1,
    aiPhoto2,
    ...candidates.filter(c => c.url !== primaryPhoto.url && c.url !== curatedPhoto.url),
  ];

  return {
    photo: primaryPhoto,
    candidates: allCandidates,
    rateLimited: isRateLimited(),
  };
}
