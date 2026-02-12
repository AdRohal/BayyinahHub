"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-cream-light to-cream islamic-pattern">
      {/* Decorative elements */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-gold/5 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-10 w-64 h-64 bg-gold/5 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-10 items-center">
          {/* Text content - RIGHT side (RTL) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="text-center lg:text-right order-2 lg:order-1"
          >
            {/* Logo badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="inline-flex items-center gap-2 mb-4"
            >
              <Image src="/logos/logo.png" alt="Bayyinah Hub" width={36} height={36} className="object-contain" />
              <div>
                <span className="text-xl font-bold text-gold">مركز البيّنة</span>
                <span className="block text-[10px] text-gold/60 tracking-widest" style={{ direction: "ltr", textAlign: "right" }}>
                  Bayyinah Hub
                </span>
              </div>
            </motion.div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-text leading-tight mb-4">
              فهم السنة{" "}
              <span className="text-gradient-gold">بوضوح وذكاء</span>
            </h1>

            <p className="text-base text-text/70 mb-2 max-w-md mx-auto lg:mx-0 leading-relaxed">
              اسأل عن أي حديث صحيح، واحصل على نصه كاملاً من مصادره الموثوقة.
            </p>
            <p className="text-sm text-text/50 mb-6 max-w-md mx-auto lg:mx-0">
              مع تنظيم وتلخيص وشرح مبسط مدعوم بالذكاء الاصطناعي، دون إنشاء محتوى ديني جديد.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Link
                href="/search"
                className="inline-flex items-center justify-center px-7 py-3.5 bg-gold hover:bg-gold-hover text-navy font-bold text-base rounded-full transition-all duration-300 hover:shadow-xl hover:shadow-gold/30 gold-glow"
              >
                ابدأ بالبحث
                <svg className="w-5 h-5 mr-2 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>

            {/* Trust badge */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="mt-6 flex items-center gap-2 justify-center lg:justify-start text-sm text-text/50"
            >
              <svg className="w-5 h-5 text-gold" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>أحاديث صحيحة • تنظيم مدعوم بالذكاء الاصطناعي</span>
            </motion.div>
          </motion.div>

          {/* Visual / Stacked Cards - LEFT side (RTL), Zoviz-style */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="flex justify-center order-1 lg:order-2"
          >
            <div className="relative w-[320px] h-[360px] sm:w-[360px] sm:h-[400px]">
              {/* Back card - most rotated */}
              <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: -6 }}
                transition={{ delay: 0.5, duration: 0.6, ease: "easeOut" }}
                className="absolute top-4 right-4 w-[240px] h-[300px] sm:w-[270px] sm:h-[330px] bg-card rounded-2xl shadow-lg border border-gold/5"
              />
              {/* Middle card */}
              <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: -3 }}
                transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
                className="absolute top-2 right-2 w-[240px] h-[300px] sm:w-[270px] sm:h-[330px] bg-card/90 rounded-2xl shadow-md border border-gold/5"
              />
              {/* Front card - main */}
              <motion.div
                initial={{ rotate: 0, y: 10 }}
                animate={{ rotate: 0, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
                className="absolute top-0 right-0 w-[240px] h-[300px] sm:w-[270px] sm:h-[330px] bg-white rounded-2xl shadow-2xl border border-gold/10 flex flex-col items-center justify-center p-6"
              >
                <div className="w-24 h-24 sm:w-28 sm:h-28 bg-cream rounded-xl flex items-center justify-center mb-5 shadow-inner">
                  <Image src="/logos/logo.png" alt="Bayyinah Hub Logo" width={56} height={56} className="object-contain" />
                </div>
                <h3 className="text-xl font-bold text-gold mb-1">مركز البيّنة</h3>
                <p className="text-xs text-text/40 tracking-wider" style={{ direction: "ltr" }}>Bayyinah Hub</p>
              </motion.div>

              {/* Small floating accent card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="absolute -bottom-2 -left-2 sm:bottom-2 sm:left-2 w-[100px] h-[100px] bg-white rounded-xl shadow-lg border border-gold/10 flex flex-col items-center justify-center"
              >
                <svg className="w-8 h-8 text-gold mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span className="text-[9px] text-gold/70 font-semibold">أحاديث صحيحة</span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
