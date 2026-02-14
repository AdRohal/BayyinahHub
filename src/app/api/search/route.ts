import { NextRequest, NextResponse } from "next/server";

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
        // If no collection match, treat as text search
        console.log(`🔍 Text search: "${query}"`);
        return NextResponse.json({ results: [] }); // Text search not supported yet
      }
    }

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
        hadithArabic: h.text || h.english || h.translation || "", // Fawazahmed API returns 'text' in English
        hadithEnglish: h.text || h.english || h.translation || "",
        grade: h.grade || h.grades?.[0] || "",
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
    new Map(allResults.map(h => [h.hadithEnglish.trim(), h])).values()
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

