#!/usr/bin/env python3
import re

# Read the file
with open('src/app/search/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the old AI explanation panel section with the modal
old_explanation = '''        {/* AI Explanation panel */}
        <AnimatePresence>
          {activeExplainIndex !== null && aiLoading && (
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

          {activeExplainIndex !== null && !aiLoading && aiExplanation && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-8 bg-gradient-to-bl from-navy to-navy-dark rounded-2xl p-8 border border-gold/10"
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
                  {/* Summary */}
                  <div className="mb-6">
                    <h4 className="text-gold/80 text-sm font-semibold mb-2">الملخص</h4>
                    <p className="text-cream-light/80 leading-relaxed" dir="rtl">{aiExplanation.summary}</p>
                  </div>

                  {/* Explanation */}
                  <div className="mb-6">
                    <h4 className="text-gold/80 text-sm font-semibold mb-2">الشرح</h4>
                    <p className="text-cream-light/70 leading-relaxed whitespace-pre-line" dir="rtl">{aiExplanation.explanation}</p>
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
                </>
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
        </AnimatePresence>'''

new_explanation = '''        {/* AI Explanation panel removed - now shows in modal */}'''

content = content.replace(old_explanation, new_explanation)

# Add modal at the end before closing div
modal_section = '''
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
                  {/* Hadith details - always visible */}
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
                        className="inline-flex items-center gap-2 px-6 py-3 bg-navy hover:bg-navy-dark disabled:bg-navy/50 text-cream-light font-semibold rounded-xl transition-all transition-shadow hover:shadow-lg hover:shadow-navy/20 disabled:cursor-not-allowed"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0114 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        {aiLoading ? "جاري الشرح..." : "شرح بالذكاء الاصطناعي"}
                      </button>
                    ) : null}
                  </div>

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
                            {/* Summary */}
                            <div className="mb-6">
                              <h4 className="text-gold/80 text-sm font-semibold mb-2">الملخص</h4>
                              <p className="text-cream-light/80 leading-relaxed" dir="rtl">{aiExplanation.summary}</p>
                            </div>

                            {/* Explanation */}
                            <div className="mb-6">
                              <h4 className="text-gold/80 text-sm font-semibold mb-2">الشرح</h4>
                              <p className="text-cream-light/70 leading-relaxed whitespace-pre-line" dir="rtl">{aiExplanation.explanation}</p>
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
                          </>
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
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>'''

# Find the closing div and insert modal before it
content = content.replace('      </div>\n    </div>\n  );\n}', modal_section + '\n      </div>\n    </div>\n  );\n}')

# Write the updated content
with open('src/app/search/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('✅ Updated search page with modal and new card styling')
