import Link from "next/link";
import Logo from "./Logo";

const footerLinks = {
  "مركز البيّنة": [
    { label: "الرئيسية", href: "/" },
    { label: "عن المركز", href: "#about" },
    { label: "اتصل بنا", href: "#contact" },
  ],
  "الأنشطة": [
    { label: "الأحاديث الصحيحة", href: "/search" },
    { label: "شرح الحديث", href: "/search" },
    { label: "البحث المتقدم", href: "/search" },
  ],
  "كوّن المعرفة": [
    { label: "الرئيسية", href: "/" },
    { label: "المصادر المعتمدة", href: "#sources" },
    { label: "اتصل بنا", href: "#contact" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-navy-dark text-cream-light">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <Logo size="md" />
            <p className="text-cream-light/50 text-sm mt-4 leading-relaxed">
              منصة رقمية موثوقة لفهم السنة النبوية بوضوح وذكاء.
            </p>
            <p className="text-cream-light/30 text-xs mt-3">
              © {new Date().getFullYear()} مركز البيّنة. جميع الحقوق محفوظة.
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-gold font-semibold mb-4 text-sm">{title}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-cream-light/50 hover:text-gold text-sm transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gold/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Source links */}
            <div className="flex items-center gap-6">
              <a href="https://sunnah.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-100 transition-opacity">
                <img src="/logos/sunnah.png" alt="sunnah.com" className="h-7 w-auto brightness-0 invert opacity-40 hover:opacity-70 transition-opacity" />
              </a>
              <a href="https://dorar.net" target="_blank" rel="noopener noreferrer" className="hover:opacity-100 transition-opacity">
                <img src="/logos/dorar.svg" alt="dorar.net" className="h-7 w-auto brightness-0 invert opacity-40 hover:opacity-70 transition-opacity" />
              </a>
              <a href="https://hisnmuslim.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-100 transition-opacity">
                <img src="/logos/hisnmuslim.svg" alt="حصن المسلم" className="h-7 w-auto brightness-0 invert opacity-40 hover:opacity-70 transition-opacity" />
              </a>
            </div>

            {/* Social */}
            <div className="flex items-center gap-4">
              {["instagram", "twitter", "facebook"].map((social) => (
                <button
                  key={social}
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-gold/20 transition-colors border border-gold/10"
                  aria-label={social}
                >
                  {social === "instagram" && (
                    <svg className="w-4 h-4 text-cream-light/60" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                    </svg>
                  )}
                  {social === "twitter" && (
                    <svg className="w-4 h-4 text-cream-light/60" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                    </svg>
                  )}
                  {social === "facebook" && (
                    <svg className="w-4 h-4 text-cream-light/60" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Disclaimer */}
          <p className="text-center text-cream-light/20 text-xs mt-6">
            مركز البيّنة منصة تنظيم رقمية • لا يُصدر فتاوى ولا يحل محل العلماء • الذكاء الاصطناعي يُستخدم فقط في تنظيم وتبسيط النصوص الأصلية
          </p>
        </div>
      </div>
    </footer>
  );
}
