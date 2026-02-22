"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Logo from "./Logo";

const navLinks = [
  { label: "الرئيسية", href: "/" },
  { label: "الأنشطة", href: "/features" },
  { label: "عن مركز البيّنة", href: "/about" },
];

const hadithCollections = [
  { label: "صحيح البخاري", value: "sahih_bukhari" },
  { label: "صحيح مسلم", value: "sahih_muslim" },
  { label: "موطأ مالك", value: "muwatta_malik" },
  { label: "سنن ابن ماجه", value: "sunan_ibn_majah" },
  { label: "سنن الترمذي", value: "sunan_tirmidhi" },
  { label: "سنن ابن داود", value: "sunan_abi_dawud" },
  { label: "سنن النسائي", value: "sunan_nasai" },
  { label: "مسند أحمد", value: "musnad_ahmad" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();

  const handleCollectionClick = (collectionValue: string) => {
    setDropdownOpen(false);
    router.push(`/collections/${collectionValue}`);
  };

  return (
    <nav className="sticky top-0 z-50 bg-navy/95 backdrop-blur-md border-b border-gold/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <Logo size="sm" />
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm text-cream-light/80 hover:text-gold transition-colors rounded-lg hover:bg-white/5"
              >
                {link.label}
              </Link>
            ))}

            {/* Collections Dropdown */}
            <div className="relative group">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="px-4 py-2 text-sm text-cream-light/80 hover:text-gold transition-colors rounded-lg hover:bg-white/5 flex items-center gap-2"
              >
                المجموعات
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-96 bg-navy border border-gold/20 rounded-lg shadow-lg z-50 p-4">
                  <div className="grid grid-cols-2 gap-2">
                    {hadithCollections.map((collection) => (
                      <button
                        key={collection.value}
                        onClick={() => handleCollectionClick(collection.value)}
                        className="text-right px-3 py-2.5 text-sm text-cream-light/80 hover:text-gold hover:bg-gold/10 transition-colors rounded flex items-center justify-start gap-2"
                      >
                        <Image src="/logos/logo.png" alt="Logo" width={16} height={16} className="object-contain" />
                        <span>{collection.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* CTA */}
          <div className="hidden md:block">
            <Link
              href="/search"
              className="inline-flex items-center px-5 py-2 bg-gold hover:bg-gold-hover text-navy font-semibold text-sm rounded-full transition-all duration-200 hover:shadow-lg hover:shadow-gold/20"
            >
              ابدأ البحث
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-cream-light p-2"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-navy border-t border-gold/10">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 text-cream-light/80 hover:text-gold hover:bg-white/5 rounded-lg transition-colors"
              >
                {link.label}
              </Link>
            ))}

            {/* Mobile Collections */}
            <div className="px-4 py-3">
              <p className="text-sm text-gold/60 font-semibold mb-3">المجموعات الحديثية</p>
              <div className="grid grid-cols-2 gap-2">
                {hadithCollections.map((collection) => (
                  <button
                    key={collection.value}
                    onClick={() => {
                      handleCollectionClick(collection.value);
                      setMobileOpen(false);
                    }}
                    className="text-right px-3 py-2 text-sm text-cream-light/80 hover:text-gold hover:bg-gold/10 rounded transition-colors flex items-center justify-start gap-2"
                  >
                    <Image src="/logos/logo.png" alt="Logo" width={14} height={14} className="object-contain" />
                    <span>{collection.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <Link
              href="/search"
              onClick={() => setMobileOpen(false)}
              className="block mt-2 px-4 py-3 bg-gold text-navy font-semibold rounded-full text-center"
            >
              ابدأ البحث
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
