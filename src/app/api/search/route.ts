import { NextRequest, NextResponse } from "next/server";

const SUNNAH_API_BASE = "https://api.sunnah.com/v1";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");

  if (!query || !query.trim()) {
    return NextResponse.json({ results: [] });
  }

  const apiKey = process.env.SUNNAH_API_KEY;

  // If no API key configured, return demo data for development
  if (!apiKey) {
    return NextResponse.json({
      results: getDemoResults(query),
    });
  }

  try {
    const response = await fetch(
      `${SUNNAH_API_BASE}/hadiths?q=${encodeURIComponent(query)}&limit=10`,
      {
        headers: {
          "X-API-Key": apiKey,
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json({
        results: getDemoResults(query),
      });
    }

    const data = await response.json();

    const results = (data.data || []).map(
      (h: {
        hadithNumber: string;
        collection: { name?: string }[];
        bookNumber?: string;
        chapterNumber?: string;
        body: string;
        grades?: { grade: string }[];
      }) => ({
        hadithNumber: h.hadithNumber || "",
        collection: h.collection?.[0]?.name || "مجموعة غير معروفة",
        bookName: h.bookNumber ? `كتاب ${h.bookNumber}` : "",
        chapterName: h.chapterNumber ? `باب ${h.chapterNumber}` : "",
        hadithArabic: h.body || "",
        grade: h.grades?.[0]?.grade || "",
      })
    );

    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({
      results: getDemoResults(query),
    });
  }
}

function getDemoResults(query: string) {
  const demoData = [
    {
      hadithNumber: "1",
      collection: "صحيح البخاري",
      bookName: "كتاب بدء الوحي",
      chapterName: "باب كيف كان بدء الوحي",
      hadithArabic:
        'عَنْ عُمَرَ بْنِ الخَطَّابِ رَضِيَ اللَّهُ عَنْهُ قَالَ: سَمِعْتُ رَسُولَ اللَّهِ ﷺ يَقُولُ: «إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى، فَمَنْ كَانَتْ هِجْرَتُهُ إِلَى اللَّهِ وَرَسُولِهِ فَهِجْرَتُهُ إِلَى اللَّهِ وَرَسُولِهِ، وَمَنْ كَانَتْ هِجْرَتُهُ لِدُنْيَا يُصِيبُهَا أَوِ امْرَأَةٍ يَنْكِحُهَا فَهِجْرَتُهُ إِلَى مَا هَاجَرَ إِلَيْهِ»',
      grade: "صحيح",
    },
    {
      hadithNumber: "6011",
      collection: "صحيح البخاري",
      bookName: "كتاب الأدب",
      chapterName: "باب رحمة الناس والبهائم",
      hadithArabic:
        'عَنْ أَبِي هُرَيْرَةَ رَضِيَ اللَّهُ عَنْهُ قَالَ: قَالَ رَسُولُ اللَّهِ ﷺ: «مَنْ لَا يَرْحَمُ لَا يُرْحَمُ»',
      grade: "صحيح",
    },
    {
      hadithNumber: "45",
      collection: "صحيح مسلم",
      bookName: "كتاب الإيمان",
      chapterName: "باب بيان أن الدين النصيحة",
      hadithArabic:
        'عَنْ تَمِيمٍ الدَّارِيِّ أَنَّ النَّبِيَّ ﷺ قَالَ: «الدِّينُ النَّصِيحَةُ» قُلْنَا: لِمَنْ؟ قَالَ: «لِلَّهِ وَلِكِتَابِهِ وَلِرَسُولِهِ وَلِأَئِمَّةِ الْمُسْلِمِينَ وَعَامَّتِهِمْ»',
      grade: "صحيح",
    },
    {
      hadithNumber: "2607",
      collection: "صحيح مسلم",
      bookName: "كتاب البر والصلة",
      chapterName: "باب تراحم المؤمنين",
      hadithArabic:
        'عَنِ النُّعْمَانِ بْنِ بَشِيرٍ قَالَ: قَالَ رَسُولُ اللَّهِ ﷺ: «مَثَلُ الْمُؤْمِنِينَ فِي تَوَادِّهِمْ وَتَرَاحُمِهِمْ وَتَعَاطُفِهِمْ مَثَلُ الْجَسَدِ إِذَا اشْتَكَى مِنْهُ عُضْوٌ تَدَاعَى لَهُ سَائِرُ الْجَسَدِ بِالسَّهَرِ وَالْحُمَّى»',
      grade: "صحيح",
    },
  ];

  const q = query.toLowerCase();
  const filtered = demoData.filter(
    (h) =>
      h.hadithArabic.includes(query) ||
      h.bookName.includes(query) ||
      h.chapterName.includes(query) ||
      h.hadithArabic.toLowerCase().includes(q)
  );

  return filtered.length > 0 ? filtered : demoData;
}
