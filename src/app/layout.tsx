import type { Metadata } from "next";
import { Noto_Sans_Arabic } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Analytics } from "@vercel/analytics/react";

const notoSansArabic = Noto_Sans_Arabic({
  variable: "--font-noto-sans-arabic",
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "مركز البيّنة | Bayyinah Hub",
  description:
    "فهم السنة بوضوح وذكاء - منصة عربية تعتمد على مصادر السنة الصحيحة مع تنظيم وشرح مدعوم بالذكاء الاصطناعي",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `
            // Suppress development console messages
            const originalLog = console.log;
            const originalWarn = console.warn;
            const originalError = console.error;
            
            console.log = function(...args) {
              const msg = args[0]?.toString() || '';
              if (!msg.includes('[HMR]') && !msg.includes('[Vercel') && !msg.includes('[pageview]') && !msg.includes('[Fast Refresh]')) {
                originalLog.apply(console, args);
              }
            };
            
            console.warn = function(...args) {
              const msg = args[0]?.toString() || '';
              if (!msg.includes('[HMR]') && !msg.includes('[Vercel') && !msg.includes('debug') && !msg.includes('[Fast Refresh]')) {
                originalWarn.apply(console, args);
              }
            };
            
            console.error = function(...args) {
              const msg = args[0]?.toString() || '';
              if (!msg.includes('development') && !msg.includes('[Fast Refresh]')) {
                originalError.apply(console, args);
              }
            };
          `
        }} />
      </head>
      <body suppressHydrationWarning className={`${notoSansArabic.variable} antialiased`}>
        <Navbar />
        <main>{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
