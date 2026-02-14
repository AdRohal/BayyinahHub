"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
  error?: string;
}

// Map collection API names to Arabic names
const collectionNameMap: Record<string, string> = {
  "ara-bukhari": "صحيح البخاري",
  "ara-muslim": "صحيح مسلم",
  "ara-malik": "موطأ مالك",
  "ara-ibnmajah": "سنن ابن ماجه",
  "ara-tirmidhi": "سنن الترمذي",
  "ara-abudawud": "سنن أبي داود",
  "ara-nasai": "سنن النسائي",
  "ara-ahmad": "مسند الإمام أحمد",
};

const getCollectionName = (apiName: string): string => {
  return collectionNameMap[apiName.toLowerCase()] || apiName;
};

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<HadithResult[]>([]);
  const [suggestions, setSuggestions] = useState<HadithResult[]>([]);
  const [aiExplanation, setAiExplanation] = useState<AIExplanation | null>(null);
  const [loading, setLoading] = useState(false);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedHadith, setSelectedHadith] = useState<HadithResult | null>(null);
  const itemsPerPage = 12; // 12 results per page for 4-column grid

  // Load popular hadith suggestions on user focus
  const loadSuggestions = async () => {
    if (suggestions.length > 0 || suggestionsLoading) return;
    
    setSuggestionsLoading(true);
    try {
      const populartopics = ["الصدقة", "الصبر", "بر الوالدين", "الصلاة", "النية", "الرحمة"];
      let allSuggestions: HadithResult[] = [];
      
      for (const topic of populartopics) {
        try {
          const res = await fetch(`/api/search?q=${encodeURIComponent(topic)}&limit=300`);
          const data = await res.json();
          if (data.results && data.results.length > 0) {
            allSuggestions.push(...data.results);
          }
        } catch (err) {
          console.error(`Failed to fetch topic ${topic}:`, err);
        }
        if (allSuggestions.length >= 6) break;
      }
      
      const uniqueSuggestions = Array.from(
        new Map(allSuggestions.map(h => [h.hadithArabic, h])).values()
      );
      
      setSuggestions(uniqueSuggestions.slice(0, 6));
    } catch (err) {
      console.error("Error loading suggestions:", err);
      setSuggestions([]);
    } finally {
      setSuggestionsLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent, searchQuery?: string) => {
    e.preventDefault();
    const finalQuery = searchQuery || query;
    if (!finalQuery.trim()) return;

    setLoading(true);
    setSearched(true);
    setShowSuggestions(false);
    setAiExplanation(null);
    setCurrentPage(1);

    try {
      const collectionNames = ["البخاري", "bukhari", "مسلم", "muslim", "مالك", "malik", "الترمذي", "tirmidhi", "أبي داود", "abi dawud", "ابن داود", "النسائي", "nasai", "ابن ماجه", "ibn majah", "أحمد", "ahmad"];
      const isCollectionSearch = collectionNames.some(name => finalQuery.toLowerCase().includes(name.toLowerCase()));
      
      const url = isCollectionSearch 
        ? `/api/search?collection=${encodeURIComponent(finalQuery.trim())}&limit=100000`
        : `/api/search?q=${encodeURIComponent(finalQuery.trim())}&limit=100000`;
      
      console.log(`🔍 Searching: ${url}`);
      const res = await fetch(url);
      const data = await res.json();
      console.log(`✅ Found ${data.results?.length || 0} results`);
      setResults(data.results || []);
    } catch (err) {
      console.error("Error during search:", err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (hadith: HadithResult) => {
    setQuery(hadith.hadithArabic.substring(0, 30));
    setResults([hadith]);
    setShowSuggestions(false);
    setSearched(true);
    setAiExplanation(null);
  };

  const handleExplain = async (hadithText: string) => {
    setAiLoading(true);
    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: hadithText }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setAiExplanation({ summary: "", explanation: "", keywords: [], error: data.error || "حدث خطأ أثناء جلب الشرح" });
      } else {
        setAiExplanation(data);
      }
    } catch {
      setAiExplanation({ summary: "", explanation: "", keywords: [], error: "حدث خطأ في الاتصال بالخادم" });
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
          className="text-center mb-10"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-text mb-3">
            البحث في الأحاديث <span className="text-gradient-gold">الصحيحة</span>
          </h1>
          <p className="text-text/60">
            اكتب سؤالك أو كلمة مفتاحية للبحث في الأحاديث
          </p>
        </motion.div>

        {/* Search form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSearch}
          className="relative mb-12"
        >
          <div className="flex gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => {
                  setShowSuggestions(true);
                  loadSuggestions();
                }}
                placeholder="ابحث عن حديث... مثال: الصدقة، الصبر، بر الوالدين"
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
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="px-8 py-4 bg-gold hover:bg-gold-hover disabled:bg-gold/50 text-navy font-bold rounded-2xl transition-all duration-200 hover:shadow-lg hover:shadow-gold/20 disabled:cursor-not-allowed"
            >
              {loading ? (
                <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                "ابحث"
              )}
            </button>
          </div>

          {/* Suggestions dropdown */}
          <AnimatePresence>
            {showSuggestions && !searched && !query.trim() && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 right-0 mt-3 bg-white rounded-2xl border border-gold/20 shadow-lg z-10"
              >
                {suggestionsLoading ? (
                  <div className="p-6 text-center">
                    <div className="w-8 h-8 border-2 border-gold/20 border-t-gold rounded-full animate-spin mx-auto" />
                    <p className="text-text/50 text-sm mt-2">جاري تحميل المقترحات...</p>
                  </div>
                ) : suggestions.length > 0 ? (
                  <div className="p-4 space-y-2">
                    <p className="text-text/50 text-xs font-semibold px-2 py-1">أحاديث مقترحة</p>
                    {suggestions.map((hadith, i) => (
                      <motion.button
                        key={i}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        onClick={() => handleSuggestionClick(hadith)}
                        className="w-full text-right px-4 py-3 rounded-lg hover:bg-gold/5 transition-colors group"
                      >
                        <p className="text-text/70 text-sm leading-relaxed group-hover:text-text truncate" dir="rtl">
                          {hadith.hadithArabic.substring(0, 80)}...
                        </p>
                        <p className="text-gold/60 text-xs mt-1 group-hover:text-gold flex items-center gap-1 justify-end">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src="/logos/logo.png" alt="Logo" width={14} height={14} className="object-contain" suppressHydrationWarning />
                          {getCollectionName(hadith.collection)}
                        </p>
                      </motion.button>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center">
                    <p className="text-text/50 text-sm">لم تتم تحميل المقترحات</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.form>

        {/* Loading Overlay */}
        <AnimatePresence>
          {loading && (
            <motion.div
              key="loading-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-cream/80 backdrop-blur-sm z-50 flex items-center justify-center"
            >
              <div className="text-center">
                <div className="w-20 h-20 border-4 border-gold/20 border-t-gold rounded-full animate-spin mx-auto mb-6" />
                <p className="text-text text-lg font-medium">جاري البحث في الأحاديث...</p>
                <p className="text-text/50 text-sm mt-2">يرجى الانتظار حتى انتهاء جلب البيانات</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence mode="wait">
          {!loading && searched && results.length === 0 && (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center py-20 bg-white/50 rounded-3xl border border-gold/10"
            >
              <svg className="w-16 h-16 text-gold/30 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-text/50 text-lg mb-2">لم يتم العثور على نتائج</p>
              <p className="text-text/30 text-sm">حاول البحث بكلمات مختلفة</p>
            </motion.div>
          )}

          {!loading && results.length > 0 && (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {(() => {
                const totalPages = Math.ceil(results.length / itemsPerPage);
                const startIndex = (currentPage - 1) * itemsPerPage;
                const endIndex = startIndex + itemsPerPage;
                const currentResults = results.slice(startIndex, endIndex);

                return (
                  <>
                    <p className="text-text/50 text-sm mb-6">
                      تم العثور على {results.length} نتيجة
                      {totalPages > 1 && ` (الصفحة ${currentPage} من ${totalPages})`}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {currentResults.map((hadith, i) => (
                        <motion.div
                          key={startIndex + i}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: Math.min(i * 0.03, 0.3) }}
                          onClick={() => {
                            setSelectedHadith(hadith);
                            setAiExplanation(null);
                            setAiLoading(false);
                          }}
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
                                <span className="text-gold-deep text-xs font-bold">{getCollectionName(hadith.collection)}</span>
                              </div>
                              <span className="text-text/30 text-xs font-medium">
                                #{hadith.hadithNumber}
                              </span>
                            </div>

                            {/* Hadith text - slim version */}
                            <div className="hadith-text text-text font-semibold leading-relaxed mb-auto text-sm line-clamp-4 group-hover:text-text/90 transition-colors" dir="rtl">
                              {hadith.hadithArabic}
                            </div>

                            {/* Bottom CTA */}
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
                      ))}
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
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
                  </>
                );
              })()}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Initial state - show suggestions */}
        {!searched && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-12"
          >
            <p className="text-center text-text/50 text-sm font-semibold mb-6">أحاديث شهيرة</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {suggestionsLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
                    <div className="h-20 bg-gold/10 rounded mb-3" />
                    <div className="h-4 bg-gold/10 rounded w-2/3" />
                  </div>
                ))
              ) : suggestions.length > 0 ? (
                suggestions.map((hadith, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    onClick={() => handleSuggestionClick(hadith)}
                    className="group relative bg-white rounded-xl p-5 border border-gold/10 hover:border-gold/30 transition-all hover:shadow-md text-right"
                  >
                    <div className="absolute top-3 left-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/logos/logo.png" alt="Logo" width={24} height={24} className="object-contain" suppressHydrationWarning />
                    </div>
                    <p className="text-sm text-text/70 leading-relaxed mb-3 group-hover:text-text line-clamp-3" dir="rtl">
                      {hadith.hadithArabic}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs bg-gold/10 text-gold-deep px-2.5 py-1 rounded-full flex items-center gap-1">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/logos/logo.png" alt="Logo" width={12} height={12} className="object-contain" suppressHydrationWarning />
                        {getCollectionName(hadith.collection)}
                      </span>
                      {hadith.grade && (
                        <span className="text-xs bg-green-50 text-green-700 px-2.5 py-1 rounded-full">
                          ✓ {hadith.grade}
                        </span>
                      )}
                    </div>
                  </motion.button>
                ))
              ) : (
                <div className="col-span-3 text-center py-12">
                  <p className="text-text/40 text-sm">لا توجد أحاديث مقترحة حالياً</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Selected Hadith Modal */}
        <AnimatePresence>
          {selectedHadith && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setSelectedHadith(null);
                setAiExplanation(null);
                setAiLoading(false);
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
                      setAiExplanation(null);
                      setAiLoading(false);
                    }}
                    className="text-text/50 hover:text-text text-3xl hover:bg-gold/10 p-2 rounded-lg transition-all"
                  >
                    ✕
                  </button>
                </div>

                {/* Scrollable content */}
                <div className="overflow-y-auto p-8">
                  {/* Hadith details */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-4 flex-wrap">
                      <div className="flex items-center gap-2 px-3 py-1 bg-gold/10 rounded-full">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/logos/logo.png" alt="Logo" width={16} height={16} className="object-contain" suppressHydrationWarning />
                        <span className="text-gold-deep text-xs font-semibold">{getCollectionName(selectedHadith.collection)}</span>
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
                        className="inline-flex items-center gap-2 px-6 py-3 bg-navy hover:bg-navy-dark disabled:bg-navy/50 text-cream-light font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-navy/20 disabled:cursor-not-allowed"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0114 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        {aiLoading ? "جاري الشرح..." : "شرح بالذكاء الاصطناعي"}
                      </button>
                    ) : null}
                  </div>

                  {/* Loading state */}
                  {aiLoading && (
                    <div className="flex items-center justify-center gap-3 py-8">
                      <div className="w-4 h-4 border-2 border-gold/20 border-t-gold rounded-full animate-spin" />
                      <p className="text-text/50">جاري جلب الشرح من الخادم...</p>
                    </div>
                  )}

                  {/* Explanation */}
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
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0114 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                          <h3 className="text-xl font-bold text-gold">الشرح المبسط</h3>
                        </div>

                        {/* Error state */}
                        {aiExplanation.error ? (
                          <div className="text-center py-6">
                            <svg className="w-12 h-12 text-red-400/60 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                            <p className="text-red-400/80 text-sm font-medium mb-1">تعذّر جلب الشرح</p>
                            <p className="text-cream-light/40 text-xs">{aiExplanation.error}</p>
                          </div>
                        ) : (
                          <>
                            <div className="mb-6">
                              <h4 className="text-gold/80 text-sm font-semibold mb-2">الملخص</h4>
                              <p className="text-cream-light/80 leading-relaxed" dir="rtl">{aiExplanation.summary}</p>
                            </div>

                            <div className="mb-6">
                              <h4 className="text-gold/80 text-sm font-semibold mb-2">الشرح</h4>
                              <p className="text-cream-light/70 leading-relaxed whitespace-pre-line" dir="rtl">{aiExplanation.explanation}</p>
                            </div>

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
                          </>
                        )}

                        <div className="mt-6 pt-4 border-t border-gold/10">
                          <p className="text-cream-light/30 text-xs flex items-center gap-1">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            هذا الشرح مُولّد بالذكاء الاصطناعي لتبسيط الفهم فقط، ولا يُعد فتوى أو مرجعًا شرعيًا.
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
