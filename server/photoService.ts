export interface PhotoItem {
  url: string;
  thumbUrl: string;
  photographer: string;
  photographerUrl?: string;
  source: 'Unsplash' | 'Gradient';
  alt: string;
}

// In-memory cache to save Unsplash demo quota (50 requests/hour)
const queryCache = new Map<string, PhotoItem[]>();

// Rate-limit tracking: if HTTP 403 or 429 is received, stop requests
let rateLimitHitTimestamp = 0;
const RATE_LIMIT_COOLDOWN_MS = 60 * 60 * 1000; // 1 hour cooldown

export function isRateLimited(): boolean {
  if (!rateLimitHitTimestamp) return false;
  const elapsed = Date.now() - rateLimitHitTimestamp;
  if (elapsed < RATE_LIMIT_COOLDOWN_MS) {
    return true;
  }
  // Cooldown passed, reset flag
  rateLimitHitTimestamp = 0;
  return false;
}

export function markRateLimited() {
  rateLimitHitTimestamp = Date.now();
  console.warn('Unsplash rate limit hit (403/429). Switching to colorful gradients.');
}

/**
 * Searches Unsplash for landscape photos.
 * Returns photo candidates, or null if no results / rate limited / failed.
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
    )}&orientation=landscape&per_page=6&content_filter=high`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Client-ID ${accessKey}`,
        'Accept-Version': 'v1',
      },
    });

    if (res.status === 403 || res.status === 429) {
      markRateLimited();
      return { photos: [], rateLimited: true };
    }

    if (!res.ok) {
      console.warn(`Unsplash request returned status ${res.status}: ${res.statusText}`);
      return null;
    }

    const data = await res.json();
    if (!data.results || data.results.length === 0) {
      return { photos: [], rateLimited: false };
    }

    const photos: PhotoItem[] = data.results.map((photo: any) => ({
      url: photo.urls.regular, // High-quality 1080p / 1600px wide landscape JPEG
      thumbUrl: photo.urls.small,
      photographer: photo.user?.name || 'Unsplash Contributor',
      photographerUrl: photo.user?.links?.html || 'https://unsplash.com',
      source: 'Unsplash' as const,
      alt: photo.alt_description || photo.description || query,
    }));

    queryCache.set(cleanQuery, photos);
    return { photos, rateLimited: false };
  } catch (err) {
    console.warn('Unsplash search network failure:', err);
    return null;
  }
}

/**
 * Extracts a broad, single root keyword from the topic to use as a fallback search.
 */
function extractBroaderTopicWord(topic: string): string {
  const words = topic
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(
      (w) =>
        w.length > 3 &&
        !['introduction', 'overview', 'advanced', 'simple', 'student', 'guide', 'basics', 'future', 'topic'].includes(
          w
        )
    );

  return words[0] || 'nature';
}

/**
 * Main search function for a single slide:
 * 1. Unsplash search using the slide's imageQuery.
 * 2. If nothing returned, retry once with a broader one-word query based on deck topic.
 * 3. If that also fails or rate-limit hit, return null (gradient background will be used).
 */
export async function searchPhotoForSlide(
  imageQuery: string,
  topic: string
): Promise<{ photo: PhotoItem | null; candidates: PhotoItem[]; rateLimited: boolean }> {
  // 1. Primary search with slide's imageQuery
  const primaryResult = await searchUnsplashDirect(imageQuery);

  if (primaryResult?.rateLimited) {
    return { photo: null, candidates: [], rateLimited: true };
  }

  if (primaryResult && primaryResult.photos.length > 0) {
    return {
      photo: primaryResult.photos[0],
      candidates: primaryResult.photos,
      rateLimited: false,
    };
  }

  // 2. Retry once with a broader one-word query based on deck topic
  const broadWord = extractBroaderTopicWord(topic);
  if (broadWord && broadWord.toLowerCase() !== imageQuery.toLowerCase()) {
    console.log(`Unsplash returned no photos for "${imageQuery}". Retrying once with broader keyword: "${broadWord}"`);
    const retryResult = await searchUnsplashDirect(broadWord);

    if (retryResult?.rateLimited) {
      return { photo: null, candidates: [], rateLimited: true };
    }

    if (retryResult && retryResult.photos.length > 0) {
      return {
        photo: retryResult.photos[0],
        candidates: retryResult.photos,
        rateLimited: false,
      };
    }
  }

  // 3. If both fail, return null so gradient background is used
  return {
    photo: null,
    candidates: [],
    rateLimited: isRateLimited(),
  };
}
