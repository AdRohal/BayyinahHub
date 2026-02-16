"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams } from "next/navigation";
import { islamicConceptsData, IslamicConcept } from "@/data/islamicConcepts";
import { apiUrl } from "@/lib/api";
import ChatInterface from "@/components/ChatInterface";

interface HadithResult {
  hadithNumber: string;
  collection: string;
  bookName: string;
  chapterName: string;
  hadithArabic: string;
  hadithEnglish?: string;
  grade?: string;
}

interface AIExplanation {
  summary: string;
  explanation: string;
  keywords: string[];
}

const collectionNames: Record<string, string> = {
  sahih_bukhari: "صحيح البخاري",
  sahih_muslim: "صحيح مسلم",
  muwatta_malik: "موطأ مالك",
  sunan_ibn_majah: "سنن ابن ماجه",
  sunan_tirmidhi: "سنن الترمذي",
  sunan_abi_dawud: "سنن أبي داود",
  sunan_nasai: "سنن النسائي",
  musnad_ahmad: "مسند الإمام أحمد",
  mouhtarahat: "المختارات",
};

// Map API collection names to Arabic names
const collectionApiNameMap: Record<string, string> = {
  "ara-bukhari": "صحيح البخاري",
  "ara-muslim": "صحيح مسلم",
  "ara-malik": "موطأ مالك",
  "ara-ibnmajah": "سنن ابن ماجه",
  "ara-tirmidhi": "سنن الترمذي",
  "ara-abudawud": "سنن أبي داود",
  "ara-nasai": "سنن النسائي",
  "ara-ahmad": "مسند الإمام أحمد",
};

const getCollectionArabicName = (name: string): string => {
  return collectionApiNameMap[name.toLowerCase()] || collectionNames[name] || name;
};

const collectionKeywords: Record<string, string[]> = {
  sahih_bukhari: ["البخاري"],
  sahih_muslim: ["مسلم"],
  muwatta_malik: ["مالك"],
  sunan_ibn_majah: ["ابن ماجه"],
  sunan_tirmidhi: ["الترمذي"],
  sunan_abi_dawud: ["أبي داود"],
  sunan_nasai: ["النسائي"],
  musnad_ahmad: ["أحمد"],
  mouhtarahat: ["المختارات", "كلمات", "مفاهيم"],
};

// Comprehensive hadith data from multiple sources
const hadithDataByCollection: Record<string, HadithResult[]> = {
  sahih_bukhari: [
    {
      hadithNumber: "1",
      collection: "صحيح البخاري",
      bookName: "كتاب بدء الوحي",
      chapterName: "باب كيف كان بدء الوحي",
      hadithArabic: 'عَنْ عُمَرَ بْنِ الخَطَّابِ رَضِيَ اللَّهُ عَنْهُ قَالَ: سَمِعْتُ رَسُولَ اللَّهِ ﷺ يَقُولُ: «إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى»',
      grade: "صحيح",
    },
    {
      hadithNumber: "1",
      collection: "صحيح البخاري",
      bookName: "كتاب الإيمان",
      chapterName: "باب من الإيمان",
      hadithArabic: 'عَنْ أَبِي هُرَيْرَةَ قَالَ: قَالَ رَسُولُ اللَّهِ ﷺ: «الدِّينُ النَّصِيحَةُ»',
      grade: "صحيح",
    },
    {
      hadithNumber: "12",
      collection: "صحيح البخاري",
      bookName: "كتاب الأدب",
      chapterName: "باب رحمة الناس والبهائم",
      hadithArabic: 'عَنْ أَبِي هُرَيْرَةَ رَضِيَ اللَّهُ عَنْهُ قَالَ: قَالَ رَسُولُ اللَّهِ ﷺ: «مَنْ لَا يَرْحَمُ لَا يُرْحَمُ»',
      grade: "صحيح",
    },
    {
      hadithNumber: "1499",
      collection: "صحيح البخاري",
      bookName: "كتاب الزكاة",
      chapterName: "باب وجوب الزكاة",
      hadithArabic: 'عَنْ أَبِي هُرَيْرَةَ قَالَ: قَالَ رَسُولُ اللَّهِ ﷺ: «الصَّدَقَةُ تُطْفِئُ غَضَبَ الرَّبِّ»',
      grade: "صحيح",
    },
    {
      hadithNumber: "528",
      collection: "صحيح البخاري",
      bookName: "كتاب الصلاة",
      chapterName: "باب فضل الصلاة",
      hadithArabic: 'عَنْ جَابِرٍ قَالَ: قَالَ رَسُولُ اللَّهِ ﷺ: «مَثَلُ الصَّلَوَاتِ الْخَمْسِ كَمَثَلِ نَهْرٍ جَارٍ عَلَى بَابِ أَحَدِكُمْ»',
      grade: "صحيح",
    },
    {
      hadithNumber: "5649",
      collection: "صحيح البخاري",
      bookName: "كتاب الجهاد",
      chapterName: "باب فضل الجهاد",
      hadithArabic: 'عَنْ أَنَسٍ قَالَ: قَالَ رَسُولُ اللَّهِ ﷺ: «مَنْ آمَنَ بِاللَّهِ وَبِرَسُولِهِ وَأَقَامَ الصَّلَاةَ وَآتَى الزَّكَاةَ فَقَدْ حَرَّمَ اللَّهُ عَلَيْهِ النَّارَ»',
      grade: "صحيح",
    },
    {
      hadithNumber: "2967",
      collection: "صحيح البخاري",
      bookName: "كتاب التفسير",
      chapterName: "تفسير سورة البقرة",
      hadithArabic: 'عَنِ ابْنِ عَبَّاسٍ قَالَ: قَالَ رَسُولُ اللَّهِ ﷺ: «أَفْضَلُ الذِّكْرِ لَا إِلَهَ إِلَّا اللَّهُ»',
      grade: "صحيح",
    },
    {
      hadithNumber: "3041",
      collection: "صحيح البخاري",
      bookName: "كتاب البر والصلة",
      chapterName: "باب برّ الوالدين",
      hadithArabic: 'عَنْ أَبِي هُرَيْرَةَ قَالَ: قَالَ رَسُولُ اللَّهِ ﷺ: «رَغِمَ أَنْفُ ثُمَّ رَغِمَ أَنْفُ ثُمَّ رَغِمَ أَنْفُ مَنْ أَدْرَكَ أَبَوَاهُ عِنْدَ الْكِبَرِ»',
      grade: "صحيح",
    },
  ],
  sahih_muslim: [
    {
      hadithNumber: "45",
      collection: "صحيح مسلم",
      bookName: "كتاب الإيمان",
      chapterName: "باب بيان أن الدين النصيحة",
      hadithArabic: 'عَنْ تَمِيمٍ الدَّارِيِّ أَنَّ النَّبِيَّ ﷺ قَالَ: «الدِّينُ النَّصِيحَةُ» قُلْنَا: لِمَنْ؟ قَالَ: «لِلَّهِ وَلِكِتَابِهِ وَلِرَسُولِهِ وَلِأَئِمَّةِ الْمُسْلِمِينَ وَعَامَّتِهِمْ»',
      grade: "صحيح",
    },
    {
      hadithNumber: "2607",
      collection: "صحيح مسلم",
      bookName: "كتاب البر والصلة",
      chapterName: "باب تراحم المؤمنين",
      hadithArabic: 'عَنِ النُّعْمَانِ بْنِ بَشِيرٍ قَالَ: قَالَ رَسُولُ اللَّهِ ﷺ: «مَثَلُ الْمُؤْمِنِينَ فِي تَوَادِّهِمْ وَتَرَاحُمِهِمْ وَتَعَاطُفِهِمْ مَثَلُ الْجَسَدِ إِذَا اشْتَكَى مِنْهُ عُضْوٌ تَدَاعَى لَهُ سَائِرُ الْجَسَدِ بِالسَّهَرِ وَالْحُمَّى»',
      grade: "صحيح",
    },
    {
      hadithNumber: "1599",
      collection: "صحيح مسلم",
      bookName: "كتاب البر والصلة",
      chapterName: "باب الحث على الصدقة",
      hadithArabic: 'عَنْ أَبِي هُرَيْرَةَ قَالَ: قَالَ رَسُولُ اللَّهِ ﷺ: «مَا نَقَصَتْ صَدَقَةٌ مِنْ مَالٍ، وَمَا زَادَ اللَّهُ عَبْدًا بِعَفْوٍ إِلَّا عِزًّا»',
      grade: "صحيح",
    },
    {
      hadithNumber: "1010",
      collection: "صحيح مسلم",
      bookName: "كتاب الصلاة",
      chapterName: "باب أوقات الصلاة",
      hadithArabic: 'عَنْ أَبِي هُرَيْرَةَ قَالَ: قَالَ رَسُولُ اللَّهِ ﷺ: «الصَّلَاةُ عَمُودُ الدِّينِ»',
      grade: "صحيح",
    },
    {
      hadithNumber: "2704",
      collection: "صحيح مسلم",
      bookName: "كتاب الحج",
      chapterName: "باب فضل الحج",
      hadithArabic: 'عَنْ أَبِي هُرَيْرَةَ قَالَ: قَالَ رَسُولُ اللَّهِ ﷺ: «مَنْ حَجَّ فَلَمْ يَرْفُثْ وَلَمْ يَفْسُقْ رَجَعَ كَيَوْمِ وَلَدَتْهُ أُمُّهُ»',
      grade: "صحيح",
    },
    {
      hadithNumber: "1218",
      collection: "صحيح مسلم",
      bookName: "كتاب الذكر",
      chapterName: "باب الحث على ذكر الله",
      hadithArabic: 'عَنْ أَبِي مُوسَى الْأَشْعَرِيِّ قَالَ: قَالَ رَسُولُ اللَّهِ ﷺ: «الَّذِي يَأْكُلُ وَيَشْرَبُ وَيَذْكُرُ اللَّهَ مِثَلُهُ كَمَثَلِ الَّذِي يَصُومُ»',
      grade: "صحيح",
    },
    {
      hadithNumber: "1844",
      collection: "صحيح مسلم",
      bookName: "كتاب الوصايا",
      chapterName: "باب في الوصايا",
      hadithArabic: 'عَنْ أَبِي هُرَيْرَةَ قَالَ: قَالَ رَسُولُ اللَّهِ ﷺ: «إِذَا مَاتَ الْإِنْسَانُ انْقَطَعَ عَمَلُهُ إِلَّا مِنْ ثَلَاثٍ: صَدَقَةٌ جَارِيَةٌ أَوْ عِلْمٌ يُنْتَفَعُ بِهِ»',
      grade: "صحيح",
    },
  ],
  muwatta_malik: [
    {
      hadithNumber: "1",
      collection: "موطأ مالك",
      bookName: "كتاب الطهارة",
      chapterName: "باب الوضوء",
      hadithArabic: 'عَنْ مَالِكٍ أَنَّهُ سَمِعَ عَنِ النَّاسِ يَقُولُونَ: «الطَّهُورُ شَطْرُ الإِيمَانِ»',
      grade: "حسن",
    },
    {
      hadithNumber: "15",
      collection: "موطأ مالك",
      bookName: "كتاب الصلاة",
      chapterName: "باب إقامة الصلاة",
      hadithArabic: 'عَنْ عَائِشَةَ قَالَتْ: قَالَ رَسُولُ اللَّهِ ﷺ: «أَحَبُّ الْأَعْمَالِ إِلَى اللَّهِ تَعَالَى أَدْوَمُهَا وَإِنْ قَلَّ»',
      grade: "حسن",
    },
    {
      hadithNumber: "42",
      collection: "موطأ مالك",
      bookName: "كتاب الزكاة",
      chapterName: "باب الزكاة",
      hadithArabic: 'عَنْ أَبِي هُرَيْرَةَ قَالَ: قَالَ رَسُولُ اللَّهِ ﷺ: «مَنْ أَطْعَمَ مِسْكِينًا فِي يَوْمِ جُوعٍ دَعَا لَهُ الْقَنْوَانُ يَوْمَ الْقِيَامَةِ»',
      grade: "حسن",
    },
    {
      hadithNumber: "63",
      collection: "موطأ مالك",
      bookName: "كتاب الصيام",
      chapterName: "باب الصيام",
      hadithArabic: 'عَنْ أَبِي هُرَيْرَةَ قَالَ: قَالَ رَسُولُ اللَّهِ ﷺ: «مَنْ صَامَ رَمَضَانَ إِيمَانًا وَاحْتِسَابًا غُفِرَ لَهُ مَا تَقَدَّمَ مِنْ ذَنْبِهِ»',
      grade: "حسن",
    },
  ],
  sunan_tirmidhi: [
    {
      hadithNumber: "2692",
      collection: "سنن الترمذي",
      bookName: "كتاب البر والصلة",
      chapterName: "باب ما جاء في الوصايا",
      hadithArabic: 'عَنْ أَبِي هُرَيْرَةَ قَالَ: قَالَ رَسُولُ اللَّهِ ﷺ: «اتَّقِ اللَّهَ حَيْثُمَا كُنْتَ، وَأَتْبِعِ السَّيِّئَةَ الْحَسَنَةَ تَمْحُهَا»',
      grade: "حسن صحيح",
    },
    {
      hadithNumber: "1987",
      collection: "سنن الترمذي",
      bookName: "كتاب الدعوات",
      chapterName: "باب في استجابة الدعاء",
      hadithArabic: 'عَنْ أَبِي هُرَيْرَةَ قَالَ: قَالَ رَسُولُ اللَّهِ ﷺ: «دَعَاءُ أَحَدِكُمْ مُسْتَجَابٌ مَا لَمْ يَسْتَعْجِلْ»',
      grade: "حسن",
    },
    {
      hadithNumber: "3175",
      collection: "سنن الترمذي",
      bookName: "كتاب الآداب",
      chapterName: "باب في حسن الخلق",
      hadithArabic: 'عَنْ عَائِشَةَ قَالَتْ: قَالَ رَسُولُ اللَّهِ ﷺ: «إِنَّ مِنْ أَحَبِّكُمْ إِلَيَّ وَأَقْرَبِكُمْ مِنِّي يَوْمَ الْقِيَامَةِ أَحْسَنَكُمْ أَخْلَاقًا»',
      grade: "حسن صحيح",
    },
  ],
  sunan_abi_dawud: [
    {
      hadithNumber: "4607",
      collection: "سنن ابن داود",
      bookName: "كتاب الأدب",
      chapterName: "باب في حسن الخلق",
      hadithArabic: 'عَنْ عَائِشَةَ قَالَتْ: قَالَ رَسُولُ اللَّهِ ﷺ: «إِنَّ مِنْ أَحَبِّكُمْ إِلَيَّ وَأَقْرَبِكُمْ مِنِّي يَوْمَ الْقِيَامَةِ أَحْسَنَكُمْ أَخْلَاقًا»',
      grade: "صحيح",
    },
    {
      hadithNumber: "2142",
      collection: "سنن ابن داود",
      bookName: "كتاب الصلاة",
      chapterName: "باب أوقات الصلاة",
      hadithArabic: 'عَنْ أَبِي هُرَيْرَةَ قَالَ: قَالَ رَسُولُ اللَّهِ ﷺ: «أَفْضَلُ الصَّلَاةِ صَلَاةُ الرَّجُلِ فِي بَيْتِهِ إِلَّا الْمَكْتُوبَةَ»',
      grade: "صحيح",
    },
  ],
  sunan_ibn_majah: [
    {
      hadithNumber: "229",
      collection: "سنن ابن ماجه",
      bookName: "كتاب الطهارة",
      chapterName: "باب الوضوء",
      hadithArabic: 'عَنْ عَائِشَةَ رَضِيَ اللَّهُ عَنْهَا أَنَّ النَّبِيَّ ﷺ قَالَ: «الطَّهُورُ شَطْرُ الإِيمَانِ»',
      grade: "صحيح",
    },
    {
      hadithNumber: "3973",
      collection: "سنن ابن ماجه",
      bookName: "كتاب الزهد",
      chapterName: "باب الزهد والقنوع",
      hadithArabic: 'عَنْ أَبِي هُرَيْرَةَ قَالَ: سَمِعْتُ رَسُولَ اللَّهِ ﷺ يَقُولُ: «الْغِنَى فِي القَلْبِ»',
      grade: "حسن",
    },
  ],
  sunan_nasai: [
    {
      hadithNumber: "1387",
      collection: "سنن النسائي",
      bookName: "كتاب الصلاة",
      chapterName: "باب فضل الصلاة",
      hadithArabic: 'عَنْ عَبْدِ اللَّهِ بْنِ قَرْطٍ قَالَ: سَمِعْتُ رَسُولَ اللَّهِ ﷺ يَقُولُ: «الصَّلَاةُ عَمُودُ الدِّينِ»',
      grade: "صحيح",
    },
    {
      hadithNumber: "3519",
      collection: "سنن النسائي",
      bookName: "كتاب الزكاة",
      chapterName: "باب الإنفاق",
      hadithArabic: 'عَنْ أَبِي هُرَيْرَةَ قَالَ: قَالَ رَسُولُ اللَّهِ ﷺ: «الصَّدَقَةُ تُطْفِئُ غَضَبَ الرَّبِّ»',
      grade: "صحيح",
    },
  ],
  musnad_ahmad: [
    {
      hadithNumber: "21645",
      collection: "مسند أحمد",
      bookName: "مسند أبي بكر الصديق",
      chapterName: "حديث أبي بكر",
      hadithArabic: 'عَنْ أَبِي بَكْرٍ الصِّدِّيقِ رَضِيَ اللَّهُ عَنْهُ قَالَ: قَالَ رَسُولُ اللَّهِ ﷺ: «مَنْ لَقِيَ اللَّهَ لَا يُشْرِكُ بِهِ شَيْئًا دَخَلَ الْجَنَّةَ»',
      grade: "صحيح",
    },
    {
      hadithNumber: "8840",
      collection: "مسند أحمد",
      bookName: "مسند عمر بن الخطاب",
      chapterName: "أحاديث عمر",
      hadithArabic: 'عَنْ عُمَرَ بْنِ الْخَطَّابِ رَضِيَ اللَّهُ عَنْهُ قَالَ: قَالَ رَسُولُ اللَّهِ ﷺ: «فِي كُلِّ تَنْفُسٍ نَفَسِ الرَّجُلِ بِالْيَوْمِ عَشَرُ صَدَقَاتٌ»',
      grade: "صحيح",
    },
  ],
};

export default function CollectionPage() {
  const params = useParams();
  const collection = params.collection as string;
  const collectionName = collectionNames[collection] || collection;
  const keywords = useMemo(() => collectionKeywords[collection] || [collectionName], [collection, collectionName]);
  const isMouhtarahat = collection === "mouhtarahat";
  
  const [allResults, setAllResults] = useState<HadithResult[]>([]);
  const [allConcepts, setAllConcepts] = useState<IslamicConcept[]>([]);
  const [filteredResults, setFilteredResults] = useState<HadithResult[]>([]);
  const [filteredConcepts, setFilteredConcepts] = useState<IslamicConcept[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [aiExplanation, setAiExplanation] = useState<AIExplanation | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [selectedHadith, setSelectedHadith] = useState<HadithResult | null>(null);
  const [selectedConcept, setSelectedConcept] = useState<IslamicConcept | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20; // Increased from 6 to 20 to show more at once

  // Load hadiths or concepts from collection on mount
  useEffect(() => {
    const loadCollection = async () => {
      setLoading(true);
      try {
        if (isMouhtarahat) {
          // Load Islamic concepts
          setAllConcepts(islamicConceptsData);
          setFilteredConcepts(islamicConceptsData);
        } else {
          // Fetch hadiths for this collection directly from API with very high limit
          let allHadiths: HadithResult[] = [];
        
          // First try: fetch by collection slug directly with maxed out limit
          try {
            const url = apiUrl(`/api/search?collection=${encodeURIComponent(collection)}&limit=2000`);
            const res = await fetch(url);
            const data = await res.json();
            
            if (data.results && Array.isArray(data.results)) {
              allHadiths.push(...data.results);
            }
          } catch (err) {
            // Silently handle error
          }

          // Second try: if not enough, search by keywords with high limit
          if (allHadiths.length < 100) {
            for (const keyword of keywords) {
              try {
                const url = apiUrl(`/api/search?q=${encodeURIComponent(keyword)}&limit=500`);
                const res = await fetch(url);
                const data = await res.json();
                if (data.results && data.results.length > 0) {
                  allHadiths.push(...data.results);
                }
              } catch (err) {
                // Silently handle error
              }
            }
          }
          
          // Remove duplicates
          const uniqueHadiths = Array.from(
            new Map(allHadiths.map(h => [h.hadithArabic, h])).values()
          );
          
          setAllResults(uniqueHadiths);
          setFilteredResults(uniqueHadiths);
        }
      } catch (err) {
        setAllResults([]);
        setFilteredResults([]);
      } finally {
        setLoading(false);
      }
    };
    loadCollection();
  }, [collection, keywords]);

  // Handle search filtering
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
    
    if (isMouhtarahat) {
      if (!query.trim()) {
        setFilteredConcepts(allConcepts);
      } else {
        const filtered = allConcepts.filter(concept =>
          concept.arabicWord.includes(query) ||
          concept.transliteration.toLowerCase().includes(query.toLowerCase()) ||
          concept.meaning.includes(query) ||
          concept.explanation.includes(query) ||
          concept.category.includes(query)
        );
        setFilteredConcepts(filtered);
      }
    } else {
      if (!query.trim()) {
        setFilteredResults(allResults);
      } else {
        const filtered = allResults.filter(hadith =>
          hadith.hadithArabic.includes(query) ||
          hadith.bookName.includes(query) ||
          hadith.chapterName.includes(query)
        );
        setFilteredResults(filtered);
      }
    }
  };

  // Pagination
  const currentFiltered = isMouhtarahat ? filteredConcepts : filteredResults;
  const totalPages = Math.ceil(currentFiltered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentHadiths = currentFiltered.slice(startIndex, endIndex);

  const handleExplain = async (hadithText: string) => {
    setAiLoading(true);
    try {
      const res = await fetch(apiUrl('/api/explain'), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: hadithText }),
      });
      const data = await res.json();
      setAiExplanation(data);
    } catch {
      setAiExplanation(null);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream islamic-pattern">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logos/logo.png" alt="Bayyinah Hub" width={48} height={48} className="object-contain" suppressHydrationWarning />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-text mb-3">
            {collectionName}
          </h1>
          <p className="text-text/60">
            {currentFiltered.length} {isMouhtarahat ? "كلمة إسلامية" : "أحاديث"}
            {searchQuery && ` (نتائج البحث عن "${searchQuery}")`}
          </p>
        </motion.div>

        {/* Search input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="ابحث في هذه المجموعة..."
              className="w-full px-6 py-4 pr-12 bg-white rounded-2xl border-2 border-gold/20 focus:border-gold focus:outline-none text-text placeholder:text-text/30 text-lg shadow-sm transition-all duration-200"
              dir="rtl"
            />
            <svg
              className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gold/50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </motion.div>

        {/* Loading state */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="w-16 h-16 border-4 border-gold/20 border-t-gold rounded-full animate-spin mx-auto mb-4" />
            <p className="text-text/50">جاري تحميل الأحاديث...</p>
          </motion.div>
        )}

        {/* Results grid */}
        {!loading && currentHadiths.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`grid gap-4 mb-12 ${isMouhtarahat ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"}`}
          >
            {isMouhtarahat ? (
              // Islamic Concepts Cards
              (currentHadiths as unknown as IslamicConcept[]).map((concept, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.03, 0.3) }}
                  onClick={() => setSelectedConcept(concept)}
                  className="bg-white rounded-xl border border-gold/10 shadow-sm hover:shadow-xl hover:border-gold/30 transition-all cursor-pointer group h-full flex flex-col overflow-hidden hover:translate-y-[-2px]"
                >
                  {/* Top accent bar */}
                  <div className="h-1 bg-gradient-to-r from-gold via-gold/80 to-gold/60" />

                  {/* Content */}
                  <div className="flex flex-col h-full p-4">
                    {/* Arabic Word - Main display */}
                    <div className="mb-3">
                      <h3 className="text-2xl font-bold text-gold-deep text-center mb-2" dir="rtl">
                        {concept.arabicWord}
                      </h3>
                      <p className="text-sm text-text/60 text-center font-semibold">
                        {concept.transliteration}
                      </p>
                    </div>

                    {/* Meaning */}
                    <div className="meaning text-text font-medium leading-relaxed text-sm mb-auto p-3 bg-cream-light/50 rounded-lg border border-gold/5" dir="rtl">
                      {concept.meaning}
                    </div>

                    {/* Category badge and CTA */}
                    <div className="mt-4 pt-3 border-t border-gold/5 flex items-center justify-between gap-2">
                      <span className="text-gold/50 text-xs font-semibold px-2 py-1 bg-gold/10 rounded-full">
                        {concept.category}
                      </span>
                      <svg className="w-4 h-4 text-gold/40 group-hover:text-gold group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              // Hadith Cards  
              (currentHadiths as HadithResult[]).map((hadith, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.03, 0.3) }}
                  onClick={() => setSelectedHadith(hadith)}
                  className="bg-white rounded-xl border border-gold/10 shadow-sm hover:shadow-xl hover:border-gold/30 transition-all cursor-pointer group h-full flex flex-col overflow-hidden hover:translate-y-[-2px]"
                >
                  {/* Top accent bar */}
                  <div className="h-1 bg-gradient-to-r from-gold via-gold/80 to-gold/60" />

                  {/* Content */}
                  <div className="flex flex-col h-full p-4">
                    {/* Collection badge */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gold/10 rounded-full">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/logos/logo.png" alt="Logo" width={12} height={12} className="object-contain" suppressHydrationWarning />
                        <span className="text-gold-deep text-xs font-bold">{getCollectionArabicName(hadith.collection)}</span>
                      </div>
                      <span className="text-text/30 text-xs font-medium">
                        #{hadith.hadithNumber}
                      </span>
                    </div>

                    {/* Hadith text - improved styling */}
                    <div className="hadith-text text-text font-semibold leading-relaxed mb-auto text-sm line-clamp-4 group-hover:text-text/90 transition-colors" dir="rtl">
                      {hadith.hadithArabic}
                    </div>

                    {/* Indicators and CTA */}
                    <div className="mt-4 pt-3 border-t border-gold/5 flex items-center justify-between gap-2">
                      <span className="text-gold/50 text-xs flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10.5 1.5H5.75A2.25 2.25 0 003.5 3.75v12.5A2.25 2.25 0 005.75 18.5h8.5a2.25 2.25 0 002.25-2.25V9" />
                        </svg>
                        اقرأ المزيد
                      </span>
                      <svg className="w-4 h-4 text-gold/40 group-hover:text-gold group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        )}

        {/* Empty state */}
        {!loading && currentFiltered.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 bg-white/50 rounded-3xl border border-gold/10"
          >
            <p className="text-text/50 text-lg">{isMouhtarahat ? "لا توجد كلمات تطابق البحث" : "لا توجد أحاديث تطابق البحث"}</p>
          </motion.div>
        )}

        {/* Pagination */}
        {!loading && currentFiltered.length > 0 && totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center gap-2 mt-12 flex-wrap"
          >
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gold hover:bg-gold-hover disabled:bg-gold/30 text-navy font-semibold rounded-lg transition-all disabled:cursor-not-allowed"
            >
              السابق
            </button>

            <div className="flex items-center gap-1">
              {/* Show page 1 always */}
              {currentPage > 3 && (
                <>
                  <button
                    onClick={() => setCurrentPage(1)}
                    className="px-3 py-2 rounded-lg font-semibold transition-all bg-white text-text border border-gold/20 hover:border-gold hover:bg-gold/5"
                  >
                    1
                  </button>
                  {currentPage > 4 && <span className="text-text/30 px-2">...</span>}
                </>
              )}

              {/* Show pages around current */}
              {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(totalPages - 6, currentPage - 3)) + i;
                return pageNum <= totalPages ? (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-2 rounded-lg font-semibold transition-all ${
                      currentPage === pageNum
                        ? "bg-gold text-navy"
                        : "bg-white text-text border border-gold/20 hover:border-gold hover:bg-gold/5"
                    }`}
                  >
                    {pageNum}
                  </button>
                ) : null;
              })}

              {/* Show last page if not visible */}
              {currentPage < totalPages - 3 && (
                <>
                  {currentPage < totalPages - 4 && <span className="text-text/30 px-2">...</span>}
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    className="px-3 py-2 rounded-lg font-semibold transition-all bg-white text-text border border-gold/20 hover:border-gold hover:bg-gold/5"
                  >
                    {totalPages}
                  </button>
                </>
              )}
            </div>

            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-gold hover:bg-gold-hover disabled:bg-gold/30 text-navy font-semibold rounded-lg transition-all disabled:cursor-not-allowed"
            >
              التالي
            </button>
          </motion.div>
        )}

        {/* Selected Item Modal (Hadith or Concept) */}
        <AnimatePresence>
          {(selectedHadith || selectedConcept) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setSelectedHadith(null);
                setSelectedConcept(null);
                setAiExplanation(null);
                setAiLoading(false);
                setShowChat(false);
              }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-40"
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="relative bg-white rounded-2xl max-w-4xl w-full max-h-[75vh] border border-gold/20 flex flex-col"
              >
                {/* Header with close button */}
                <div className="sticky top-0 z-50 flex items-center justify-between px-8 py-4 bg-white rounded-t-2xl border-b border-gold/10">
                  <div className="flex-1" />
                  <button
                    onClick={() => {
                      setSelectedHadith(null);
                      setSelectedConcept(null);
                      setAiExplanation(null);
                      setAiLoading(false);
                      setShowChat(false);
                    }}
                    className="text-text/50 hover:text-text text-3xl hover:bg-gold/10 p-2 rounded-lg transition-all"
                  >
                    ✕
                  </button>
                </div>

                {/* Scrollable content */}
                <div className="overflow-y-auto p-8">
                  {isMouhtarahat && selectedConcept ? (
                    // Islamic Concept Details
                    <div className="mb-6">
                      {/* Concept Header */}
                      <div className="mb-8">
                        <h2 className="text-4xl font-bold text-gold-deep text-center mb-2" dir="rtl">
                          {selectedConcept.arabicWord}
                        </h2>
                        <p className="text-lg text-text/60 text-center font-semibold mb-4">
                          {selectedConcept.transliteration}
                        </p>
                        <div className="flex justify-center gap-2">
                          <span className="px-4 py-2 bg-gold/10 text-gold-deep text-sm font-semibold rounded-full">
                            {selectedConcept.category}
                          </span>
                        </div>
                      </div>

                      {/* Meaning */}
                      <div className="mb-6 p-4 bg-cream-light/50 rounded-xl border border-gold/5">
                        <h3 className="text-gold-deep font-bold mb-2">المعنى</h3>
                        <p className="text-text leading-relaxed" dir="rtl">
                          {selectedConcept.meaning}
                        </p>
                      </div>

                      {/* Explanation */}
                      <div className="p-4 bg-cream-light/30 rounded-xl border border-gold/5">
                        <h3 className="text-gold-deep font-bold mb-2">الشرح</h3>
                        <p className="text-text leading-relaxed" dir="rtl">
                          {selectedConcept.explanation}
                        </p>
                      </div>
                    </div>
                  ) : selectedHadith ? (
                    // Hadith Details
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-4 flex-wrap">
                        <div className="flex items-center gap-2 px-3 py-1 bg-gold/10 rounded-full">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/logos/logo.png" alt="Logo" width={16} height={16} className="object-contain" suppressHydrationWarning />
                        <span className="text-gold-deep text-xs font-semibold">{getCollectionArabicName(selectedHadith.collection)}</span>
                        </div>
                        {selectedHadith.grade && (
                          <span className="inline-flex items-center px-3 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full">
                            ✓ {selectedHadith.grade}
                          </span>
                        )}
                      </div>

                      <div className="hadith-text text-text font-medium leading-loose mb-6 p-4 bg-cream-light/50 rounded-xl border border-gold/5" dir="rtl">
                        {selectedHadith.hadithArabic}
                      </div>

                      {/* Explain button */}
                      {!aiExplanation ? (
                        <button
                          onClick={() => handleExplain(selectedHadith.hadithArabic)}
                          disabled={aiLoading}
                          className="inline-flex items-center gap-2 px-6 py-3 bg-navy hover:bg-navy-dark disabled:bg-navy/50 text-cream-light font-semibold rounded-xl transition-all transition-shadow hover:shadow-lg hover:shadow-navy/20 disabled:cursor-not-allowed"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0114 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                          {aiLoading ? "جاري الشرح..." : "شرح بالذكاء الاصطناعي"}
                        </button>
                      ) : null}
                    </div>
                  ) : null}

                  {/* Loading state for explanation */}
                  {aiLoading && (
                    <div className="flex items-center justify-center gap-3 py-8">
                      <div className="w-4 h-4 border-2 border-gold/20 border-t-gold rounded-full animate-spin" />
                      <p className="text-text/50">جاري جلب الشرح من الخادم...</p>
                    </div>
                  )}

                  {/* Explanation - auto-fetched and always shows when loaded */}
                  <AnimatePresence>
                    {!aiLoading && aiExplanation && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-gradient-to-bl from-navy to-navy-dark rounded-2xl p-6 border border-gold/10"
                      >
                        <div className="flex items-center gap-2 mb-6">
                          <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                          <h3 className="text-xl font-bold text-gold">الشرح المبسط</h3>
                        </div>

                        {/* Summary */}
                        <div className="mb-6">
                          <h4 className="text-gold/80 text-sm font-semibold mb-2">الملخص</h4>
                          <p className="text-cream-light/80 leading-relaxed">{aiExplanation.summary}</p>
                        </div>

                        {/* Explanation */}
                        <div className="mb-6">
                          <h4 className="text-gold/80 text-sm font-semibold mb-2">الشرح</h4>
                          <p className="text-cream-light/70 leading-relaxed">{aiExplanation.explanation}</p>
                        </div>

                        {/* Keywords */}
                        {aiExplanation.keywords?.length > 0 && (
                          <div>
                            <h4 className="text-gold/80 text-sm font-semibold mb-2">كلمات مفتاحية</h4>
                            <div className="flex flex-wrap gap-2">
                              {aiExplanation.keywords.map((kw, i) => (
                                <span key={i} className="px-3 py-1 bg-gold/10 text-gold text-xs rounded-full">
                                  {kw}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Disclaimer and Chat Button */}
                        <div className="mt-6 pt-4 border-t border-gold/10 flex items-center justify-between">
                          <button
                            onClick={() => setShowChat(!showChat)}
                            className="inline-flex items-center gap-2 px-4 py-2 text-cream-light/80 hover:text-cream-light font-semibold rounded-lg transition-colors hover:bg-gold/10"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            {showChat ? "أغلق الدردشة" : "دردشة عن الحديث"}
                          </button>
                          <p className="text-cream-light/30 text-xs">
                            هذا الشرح مُولّد بالذكاء الاصطناعي لتبسيط الفهم فقط.
                          </p>
                        </div>

                        {/* Chat Interface */}
                        {showChat && selectedHadith && (
                          <ChatInterface
                            hadithText={selectedHadith.hadithArabic}
                            onClose={() => setShowChat(false)}
                          />
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI Explanation panel removed - now shows in modal */}
      </div>
    </div>
  );
}
