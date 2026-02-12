"use client";

import { motion } from "framer-motion";

const features = [
  {
    icon: (
      <svg className="w-10 h-10 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "مصدر موثوق",
    description: "أحاديث من الكتاب والسنة الصحيحة مع ذكر المصدر ورقم الحديث",
  },
  {
    icon: (
      <svg className="w-10 h-10 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    title: "شرح مبسط",
    description: "افهم الحديث وتعرف على معناه بأسلوب سهل ومبسط باستخدام الذكاء الاصطناعي",
  },
  {
    icon: (
      <svg className="w-10 h-10 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    title: "استفسار حديث",
    description: "ابحث بسهولة في الأحاديث الصحيحة واستعرض النتائج بشكل منظم",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-cream relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-text mb-4">
            كيف يمكن لمركز البيّنة{" "}
            <span className="text-gradient-gold">مساعدتك؟</span>
          </h2>
          <p className="text-text/60 max-w-2xl mx-auto text-lg">
            تجربة في البحث عن الأحاديث الصحيحة بطريقة موثوقة ومنظمة بدون تعقيد
          </p>
        </motion.div>

        {/* Feature cards */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-8"
        >
          {features.map((feature, i) => (
            <motion.div
              key={i}
              variants={item}
              className="group bg-white/80 backdrop-blur-sm rounded-2xl p-8 text-center border border-gold/10 hover:border-gold/30 transition-all duration-300 hover:shadow-xl hover:shadow-gold/5 hover:-translate-y-1"
            >
              <div className="w-24 h-24 bg-cream-light rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-gold/10 transition-colors">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-text mb-3">{feature.title}</h3>
              <p className="text-text/60 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
