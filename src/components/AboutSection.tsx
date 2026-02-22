"use client";

import { motion } from "framer-motion";

const features = [
  {
    icon: (
      <svg className="w-8 h-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "أحاديث موثوقة",
    description: "نستخدم أحاديث صحيحة من أفضل المصادر الإسلامية المعروفة عالميًا",
  },
  {
    icon: (
      <svg className="w-8 h-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    title: "بحث ذكي",
    description: "محرك بحث قوي يساعدك في إيجاد ما تبحث عنه بسرعة وسهولة",
  },
  {
    icon: (
      <svg className="w-8 h-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: "ذكاء اصطناعي",
    description: "شرح مبسط للأحاديث باستخدام التقنيات الحديثة دون تحريف المعنى",
  },
  {
    icon: (
      <svg className="w-8 h-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    title: "نصوص أصلية",
    description: "نعرض النصوص كما هي من المصادر الأصلية مع الإشارة الكاملة",
  },
];


export default function AboutSection() {
  return (
    <section id="about" className="py-24 bg-cream-pattern relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-text mb-4">
            عن <span className="text-gradient-gold">مركز البيّنة</span>
          </h2>
          <p className="text-text/60 max-w-3xl mx-auto text-lg leading-relaxed">
            منصة رقمية موثوقة متخصصة في جعل أحاديث النبي صلى الله عليه وسلم متاحة للجميع بطريقة منظمة وسهلة الفهم، 
            مع الحفاظ على أصالة النصوص والمصادر
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid md:grid-cols-2 gap-8 mb-20"
        >
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex gap-4 p-6 bg-white rounded-2xl border border-gold/10 hover:border-gold/30 transition-all"
            >
              <div className="flex-shrink-0 w-12 h-12 bg-gold/10 rounded-xl flex items-center justify-center">
                {feature.icon}
              </div>
              <div>
                <h3 className="font-bold text-text mb-2">{feature.title}</h3>
                <p className="text-text/60 text-sm">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Mission Statement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-l from-navy to-navy-dark rounded-3xl p-12 mb-20 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 islamic-pattern opacity-20" />
          <div className="relative z-10">
            <h3 className="text-3xl font-bold text-cream-light mb-4">رسالتنا</h3>
            <p className="text-cream-light/80 max-w-2xl mx-auto text-lg leading-relaxed">
              توفير منصة موثوقة وسهلة الاستخدام للبحث في أحاديث النبي صلى الله عليه وسلم، 
              مع شروحات مبسطة وتنظيم ذكي، دون الخروج عن أصالة النصوص أو إصدار فتاوى جديدة
            </p>
          </div>
        </motion.div>

        {/* Commitment */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-3 px-6 py-4 bg-gold/5 rounded-full border border-gold/20 mb-4">
            <svg className="w-5 h-5 text-gold" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="font-semibold text-text">التزامنا بالشفافية والأمانة العلمية</span>
          </div>
          <p className="text-text/50 text-sm max-w-3xl mx-auto">
            لا نصدر فتاوى • نعرض النصوص كما هي • نذكر المصادر دائمًا • الذكاء الاصطناعي للتنظيم والشرح فقط
          </p>
        </motion.div>
      </div>
    </section>
  );
}
