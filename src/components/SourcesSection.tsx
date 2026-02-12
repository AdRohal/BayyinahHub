"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const sources = [
  {
    name: "sunnah.com",
    description: "موقع متخصص في جمع الأحاديث الصحيحة من مختلف المراجع الإسلامية",
    logo: "/logos/sunnah.png",
    width: 140,
    height: 36,
    url: "https://sunnah.com",
  },
  {
    name: "dorar.net",
    description: "منصة علمية موثوقة لنشر الأحاديث والعلوم الإسلامية",
    logo: "/logos/dorar.svg",
    width: 120,
    height: 36,
    url: "https://dorar.net",
  },
  {
    name: "حصن المسلم",
    description: "تطبيق حصن المسلم الشهير للأذكار والأحاديث المختارة",
    logo: "/logos/hisnmuslim.svg",
    width: 130,
    height: 36,
    url: "https://hisnmuslim.com",
  },
];

export default function SourcesSection() {
  return (
    <section className="py-24 bg-cream relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* AI-powered banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-l from-navy to-navy-dark rounded-3xl p-12 mb-16 text-center relative overflow-hidden"
        >
          {/* Decorative pattern */}
          <div className="absolute inset-0 islamic-pattern opacity-30" />

          <div className="relative z-10">
            <div className="flex items-center justify-center gap-3 mb-8">
              <svg className="w-8 h-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <h3 className="text-3xl sm:text-4xl font-bold text-cream-light">
                مدعوم من <span className="text-gold">مصادر موثوقة</span>
              </h3>
            </div>

            {/* Source cards in grid */}
            <div className="grid md:grid-cols-3 gap-6 mt-8">
              {sources.map((source, i) => (
                <motion.a
                  key={i}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                  className="bg-white/5 rounded-2xl p-6 border border-gold/20 hover:border-gold/40 transition-all hover:bg-white/10 group"
                >
                  <div className="flex items-center justify-center mb-4 h-12">
                    <Image
                      src={source.logo}
                      alt={source.name}
                      width={source.width}
                      height={source.height}
                      className={`h-10 w-auto opacity-70 group-hover:opacity-100 transition-opacity ${
                        source.logo.endsWith(".png") ? "" : "brightness-0 invert"
                      }`}
                    />
                  </div>
                  <p className="text-cream-light/70 text-sm text-center group-hover:text-cream-light transition-colors">
                    {source.description}
                  </p>
                </motion.a>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Trust note */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <p className="text-text/50 text-sm max-w-3xl mx-auto leading-relaxed">
            التنظيم الذكي • يعرض النصوص كما هي من المصدر • لا يُصدر فتاوى • مصدر موثوق يُذكر دائمًا مع الحديث
          </p>
        </motion.div>
      </div>
    </section>
  );
}
