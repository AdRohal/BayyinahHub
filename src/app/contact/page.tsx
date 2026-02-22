"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function ContactPage() {
  const contactMethods = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      ),
      title: "البريد الإلكتروني",
      value: "Rohal.dev@hotmail.com",
      href: "mailto:Rohal.dev@hotmail.com",
      description: "تواصل معنا عبر البريد الإلكتروني",
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
        </svg>
      ),
      title: "GitHub",
      value: "@AdRohal",
      href: "https://github.com/AdRohal",
      description: "تابع المشاريع على GitHub",
    },
  ];

  return (
    <main className="bg-gradient-to-b from-cream to-white">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-navy to-navy-dark text-cream-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              اتصل <span className="text-gradient-gold">بنا</span>
            </h1>
            <p className="text-cream-light/70 max-w-2xl mx-auto text-lg">
              لديك اقتراح أو سؤال؟ نسعد بسماع آرائك وملاحظاتك
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid md:grid-cols-2 gap-8"
          >
            {contactMethods.map((method, index) => (
              <motion.a
                key={index}
                href={method.href}
                target={method.href.startsWith("http") ? "_blank" : "_self"}
                rel={method.href.startsWith("http") ? "noopener noreferrer" : ""}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2, duration: 0.5 }}
                className="group p-8 bg-white rounded-2xl border border-gold/10 hover:border-gold/30 hover:shadow-xl hover:shadow-gold/5 transition-all duration-300 hover:-translate-y-1 cursor-pointer"
              >
                <div className="w-16 h-16 bg-cream-light rounded-2xl flex items-center justify-center text-gold mb-6 group-hover:bg-gold/10 transition-colors">
                  {method.icon}
                </div>
                <h3 className="text-xl font-bold text-text mb-2">{method.title}</h3>
                <p className="text-gold font-semibold mb-3 text-lg">{method.value}</p>
                <p className="text-text/60">{method.description}</p>
              </motion.a>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-cream">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-text mb-6">استكشف المزيد</h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/search"
                className="px-8 py-3 bg-gold hover:bg-gold-hover text-navy font-semibold rounded-full transition-all duration-200 hover:shadow-lg hover:shadow-gold/20"
              >
                ابدأ البحث
              </Link>
              <Link
                href="/about"
                className="px-8 py-3 bg-white border-2 border-gold/30 text-gold hover:border-gold hover:bg-gold/5 font-semibold rounded-full transition-all duration-200"
              >
                عن مركز البيّنة
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
