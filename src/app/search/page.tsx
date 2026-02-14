"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

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

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<HadithResult[]>([]);
  const [suggestions, setSuggestions] = useState<HadithResult[]>([]);
  const [aiExplanation, setAiExplanation] = useState<AIExplanation | null>(null);
  const [loading, setLoading] = useState(false);
  const [suggestionsLoading, setSuggestionsLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);

  // Load popular hadith suggestions on mount
  useEffect(() => {
    const loadSuggestions = async () => {
      try {
        const populartopics = ["الصدقة", "الصبر", "بر الوالدين", "الصلاة", "النية", "الرحمة"];
        let allSuggestions: HadithResult[] = [];
        
        // Fetch from multiple topics with high limit to get comprehensive suggestions
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
        
        // Remove duplicates
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
    loadSuggestions();
  }, []);

  const handleSearch = async (e: React.FormEvent, searchQuery?: string) => {
    e.preventDefault();
    const finalQuery = searchQuery || query;
    if (!finalQuery.trim()) return;

    setLoading(true);
    setSearched(true);
    setShowSuggestions(false);
    setAiExplanation(null);

    try {
      // Check if the query is a collection name to fetch all hadiths from that collection
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
      setAiExplanation(data);
    } catch {
      setAiExplanation(null);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream islamic-pattern">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
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
                onFocus={() => setShowSuggestions(true)}
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
                          <Image src="/logos/logo.png" alt="Logo" width={14} height={14} className="object-contain" />
                          {hadith.collection}
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

        {/* Results */}
        <AnimatePresence mode="wait">
          {loading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-20"
            >
              <div className="w-16 h-16 border-4 border-gold/20 border-t-gold rounded-full animate-spin mx-auto mb-4" />
              <p className="text-text/50">جاري البحث في الأحاديث...</p>
            </motion.div>
          )}

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
              <p className="text-text/50 text-sm mb-6">
                تم العثور على {results.length} نتيجة
              </p>

              {results.map((hadith, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-2xl p-6 sm:p-8 border border-gold/10 shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Source badge */}
                  <div className="flex items-center gap-3 mb-4 flex-wrap">
                    <div className="flex items-center gap-2 px-3 py-1 bg-gold/10 rounded-full">
                      <Image src="/logos/logo.png" alt="Logo" width={16} height={16} className="object-contain" />
                      <span className="text-gold-deep text-xs font-semibold">{hadith.collection}</span>
                    </div>
                    <span className="text-text/40 text-xs">
                      حديث رقم: {hadith.hadithNumber}
                    </span>
                    {hadith.grade && (
                      <span className="inline-flex items-center px-3 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full">
                        ✓ {hadith.grade}
                      </span>
                    )}
                  </div>

                  {/* Book & chapter */}
                  {hadith.bookName && (
                    <p className="text-text/40 text-sm mb-3">
                      {hadith.bookName} {hadith.chapterName && `• ${hadith.chapterName}`}
                    </p>
                  )}

                  {/* Hadith text */}
                  <div className="hadith-text text-text font-medium leading-loose mb-6 p-4 bg-cream-light/50 rounded-xl border border-gold/5" dir="rtl">
                    {hadith.hadithArabic}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleExplain(hadith.hadithArabic)}
                      disabled={aiLoading}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-navy text-cream-light text-sm font-medium rounded-xl hover:bg-navy-dark transition-colors disabled:opacity-50"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      شرح مبسط بالذكاء الاصطناعي
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(hadith.hadithArabic);
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-card text-text/60 text-sm rounded-xl hover:bg-card/80 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      نسخ
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI Explanation panel */}
        <AnimatePresence>
          {aiLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-8 bg-navy rounded-2xl p-8 text-center"
            >
              <div className="w-10 h-10 border-3 border-gold/20 border-t-gold rounded-full animate-spin mx-auto mb-3" />
              <p className="text-cream-light/60 text-sm">جاري تحليل الحديث وشرحه...</p>
            </motion.div>
          )}

          {!aiLoading && aiExplanation && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-8 bg-gradient-to-bl from-navy to-navy-dark rounded-2xl p-8 border border-gold/10"
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

              {/* Disclaimer */}
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

        {/* Initial state - show suggestions */}
        {!searched && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-12"
          >
            <p className="text-center text-text/50 text-sm font-semibold mb-6">أحاديث شهيرة</p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                      <Image src="/logos/logo.png" alt="Logo" width={24} height={24} className="object-contain" />
                    </div>
                    <p className="text-sm text-text/70 leading-relaxed mb-3 group-hover:text-text line-clamp-3" dir="rtl">
                      {hadith.hadithArabic}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs bg-gold/10 text-gold-deep px-2.5 py-1 rounded-full flex items-center gap-1">
                        <Image src="/logos/logo.png" alt="Logo" width={12} height={12} className="object-contain" />
                        {hadith.collection}
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
      </div>
    </div>
  );
}
