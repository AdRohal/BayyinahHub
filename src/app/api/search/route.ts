import { NextRequest, NextResponse } from "next/server";

// Strip Arabic diacritics (tashkeel) for text matching
function stripDiacritics(text: string): string {
  return text.replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED]/g, "");
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
      console.log(`📚 Collection request: ${collectionParam} → ${bookName}`);
    } else if (query) {
      // Try to match query to a collection
      const normalized = query.toLowerCase();
      for (const [key, value] of Object.entries(collectionMap)) {
        if (normalized.includes(key.replace(/_/g, " ")) || normalized.includes(key)) {
          bookName = value;
          console.log(`📚 Detected collection from query: ${key} → ${bookName}`);
          break;
        }
      }
      
      if (!bookName) {
        // Treat as topic/text search - fetch multiple collections
        console.log(`🔍 Topic search: "${query}" - fetching from major collections`);
        isTopicSearch = true;
      }
    }

    if (isTopicSearch) {
      // Topic search - fetch from multiple collections
      const collectionsToSearch = [
        "ara-bukhari",
        "ara-muslim",
        "ara-malik",
        "ara-tirmidhi",
        "ara-abudawud",
        "ara-nasai",
        "ara-ibnmajah",
      ];

      for (const collection of collectionsToSearch) {
        try {
          console.log(`📡 Fetching ${collection}...`);
          const apiUrl = `https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/${collection}.json`;
          
          const response = await fetch(apiUrl, {
            headers: {
              "Accept": "application/json",
              "User-Agent": "BayyinahHub/1.0"
            },
            signal: AbortSignal.timeout(10000),
          });

          if (response.ok) {
            const data = await response.json();
            
            if (data.hadiths && Array.isArray(data.hadiths)) {
              const searchTerm = stripDiacritics(query!);
              const filtered = data.hadiths
                .filter((h: any) => {
                  const text = stripDiacritics(h.text || "");
                  const book = stripDiacritics(h.book?.name || "");
                  const chapter = stripDiacritics(h.chapter?.name || h.chapter || "");
                  
                  // Match if query appears in text, book name, or chapter
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

              allResults.push(...filtered);
              console.log(`✅ ${collection}: Found ${filtered.length} hadiths`);
            }
          }
        } catch (e) {
          console.warn(`⚠️  Failed to fetch ${collection}:`, e);
        }
      }
    } else {
      // Collection-specific search
      if (!bookName) {
        return NextResponse.json({ results: [] });
      }

      // Fetch entire collection from Fawazahmed0 API
      console.log(`📡 Fetching from Fawazahmed0 Hadith API...`);
      const apiUrl = `https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/${bookName}.json`;
      
      const response = await fetch(apiUrl, {
        headers: {
          "Accept": "application/json",
          "User-Agent": "BayyinahHub/1.0"
        },
        signal: AbortSignal.timeout(30000),
      });

      if (!response.ok) {
        console.error(`❌ API error: ${response.status}`);
        return NextResponse.json({ 
          results: [],
          error: `Failed to fetch from API: ${response.status}`
        });
      }

      const data = await response.json();
      
      // Parse the collection data
      if (data.hadiths && Array.isArray(data.hadiths)) {
        console.log(`📥 Received ${data.hadiths.length} hadiths from collection`);
        
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

        console.log(`✅ Parsed ${allResults.length} valid hadiths`);
      } else {
        console.error(`❌ Unexpected response format:`, Object.keys(data).slice(0, 5));
        return NextResponse.json({
          results: [],
          error: "Unexpected API response format"
        });
      }
    }

  } catch (error) {
    console.error("❌ Error fetching from Fawazahmed0 API:", error);
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
  console.log(`\n📊 === RESULTS ===`);
  console.log(`📥 Total fetched: ${allResults.length}`);
  console.log(`🔄 After dedup: ${uniqueResults.length} unique`);
  console.log(`✂️  Returning: ${returning} (limited to ${limit})\n`);

  return NextResponse.json({ 
    results: uniqueResults.slice(0, limit),
    total: uniqueResults.length,
    source: "fawazahmed0-hadith-api"
  });
}

