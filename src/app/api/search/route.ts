import { NextRequest, NextResponse } from "next/server";

// ─── In-memory cache for fetched collections ───
// Avoids re-fetching multi-MB JSON files from CDN on every request.
// TTL = 10 minutes; safe for a single-instance Next.js server.
interface CacheEntry {
  data: any;
  timestamp: number;
}
const collectionCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

function getCachedCollection(key: string): any | null {
  const entry = collectionCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    collectionCache.delete(key);
    return null;
  }
  return entry.data;
}

function setCachedCollection(key: string, data: any): void {
  collectionCache.set(key, { data, timestamp: Date.now() });
}

// Strip Arabic diacritics (tashkeel) for text matching
function stripDiacritics(text: string): string {
  return text.replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED]/g, "");
}

// Fetch a collection from CDN with caching
async function fetchCollection(collection: string): Promise<any | null> {
  const cached = getCachedCollection(collection);
  if (cached) {
    return cached;
  }

  const apiUrl = `https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/${collection}.json`;
  const response = await fetch(apiUrl, {
    headers: {
      "Accept": "application/json",
      "User-Agent": "BayyinahHub/1.0",
    },
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) return null;

  const data = await response.json();
  setCachedCollection(collection, data);
  return data;
}

// Map collection names to API book names
const collectionMap: Record<string, string> = {
  "bukhari": "ara-bukhari",
  "sahih_bukhari": "ara-bukhari",
  "البخاري": "ara-bukhari",
  
  "muslim": "ara-muslim",
  "sahih_muslim": "ara-muslim",
  "مسلم": "ara-muslim",
  
  "tirmidhi": "ara-tirmidhi",
  "الترمذي": "ara-tirmidhi",
  
  "abudawud": "ara-abudawud",
  "abu_dawood": "ara-abudawud",
  "أبو داود": "ara-abudawud",
  
  "nasai": "ara-nasai",
  "النسائي": "ara-nasai",
  
  "ibnmajah": "ara-ibnmajah",
  "ibn_majah": "ara-ibnmajah",
  "ابن ماجه": "ara-ibnmajah",
  
  "malik": "ara-malik",
  "مالك": "ara-malik",
  
  "ahmad": "ara-ahmad",
  "أحمد": "ara-ahmad",
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");
  const limit = parseInt(searchParams.get("limit") || "1000");
  const collectionParam = searchParams.get("collection");

  if (!query && !collectionParam) {
    return NextResponse.json({ results: [] });
  }

  let allResults: any[] = [];

  try {
    let bookName = "";
    let isTopicSearch = false;
    
    // Determine which collection to fetch
    if (collectionParam) {
      bookName = collectionMap[collectionParam.toLowerCase()] || collectionParam;
    } else if (query) {
      // Try to match query to a collection
      const normalized = query.toLowerCase();
      for (const [key, value] of Object.entries(collectionMap)) {
        if (normalized.includes(key.replace(/_/g, " ")) || normalized.includes(key)) {
          bookName = value;
          break;
        }
      }
      
      if (!bookName) {
        // Treat as topic/text search - fetch multiple collections
        isTopicSearch = true;
      }
    }

    if (isTopicSearch) {
      // Topic search - fetch from multiple collections in parallel
      const collectionsToSearch = [
        "ara-bukhari",
        "ara-muslim",
        "ara-malik",
        "ara-tirmidhi",
        "ara-abudawud",
        "ara-nasai",
        "ara-ibnmajah",
      ];

      const searchTerm = stripDiacritics(query!);

      const results = await Promise.allSettled(
        collectionsToSearch.map(async (collection) => {
          try {
            const data = await fetchCollection(collection);
            if (!data?.hadiths || !Array.isArray(data.hadiths)) return [];

            return data.hadiths
              .filter((h: any) => {
                const text = stripDiacritics(h.text || "");
                const book = stripDiacritics(h.book?.name || "");
                const chapter = stripDiacritics(h.chapter?.name || h.chapter || "");
                return text.includes(searchTerm) ||
                       book.includes(searchTerm) ||
                       chapter.includes(searchTerm);
              })
              .map((h: any) => ({
                hadithNumber: h.hadithnumber?.toString() || h.number?.toString() || "",
                collection: data.collection_name || h.collection || collection,
                bookName: h.book?.name || h.bookName || "",
                chapterName: h.chapter?.name || h.chapterName || h.chapter || "",
                hadithArabic: h.text || "",
                hadithEnglish: h.text || "",
                grade: (typeof h.grade === "object" ? h.grade?.grade : h.grade) || (typeof h.grades?.[0] === "object" ? h.grades?.[0]?.grade : h.grades?.[0]) || "",
                narrator: h.narrator || h.reporter || "",
                source: "fawazahmed0"
              }));
          } catch (e) {
            return [];
          }
        })
      );

      for (const result of results) {
        if (result.status === "fulfilled") {
          allResults.push(...result.value);
        }
      }
    } else {
      // Collection-specific search
      if (!bookName) {
        return NextResponse.json({ results: [] });
      }

      const data = await fetchCollection(bookName);

      if (!data) {
        return NextResponse.json({
          results: [],
          error: `Failed to fetch from API`
        });
      }

      if (data.hadiths && Array.isArray(data.hadiths)) {


        allResults = data.hadiths.map((h: any) => ({
          hadithNumber: h.hadithnumber?.toString() || h.number?.toString() || "",
          collection: data.collection_name || h.collection || bookName,
          bookName: h.book?.name || h.bookName || "",
          chapterName: h.chapter?.name || h.chapterName || h.chapter || "",
          hadithArabic: h.text || h.english || h.translation || "",
          hadithEnglish: h.text || h.english || h.translation || "",
          grade: (typeof h.grade === "object" ? h.grade?.grade : h.grade) || (typeof h.grades?.[0] === "object" ? h.grades?.[0]?.grade : h.grades?.[0]) || "",
          narrator: h.narrator || h.reporter || "",
          source: "fawazahmed0"
        })).filter((h: any) => h.hadithArabic && h.hadithArabic.trim().length > 10);
      } else {
        return NextResponse.json({
          results: [],
          error: "Unexpected API response format"
        });
      }
    }

  } catch (error) {
    return NextResponse.json({ 
      results: [],
      error: "Failed to fetch hadiths",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }

  // Remove duplicates
  const uniqueResults = Array.from(
    new Map(allResults.map(h => [h.hadithArabic.trim(), h])).values()
  );

  // Sort by hadith number
  uniqueResults.sort((a, b) => {
    const numA = parseInt(a.hadithNumber) || 0;
    const numB = parseInt(b.hadithNumber) || 0;
    return numA - numB;
  });

  const returning = Math.min(uniqueResults.length, limit);


  return NextResponse.json({ 
    results: uniqueResults.slice(0, limit),
    total: uniqueResults.length,
    source: "fawazahmed0-hadith-api"
  }, {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}

