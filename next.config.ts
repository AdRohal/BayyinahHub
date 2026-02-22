import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ═══════════════════════════════════════
  // SECURITY CONFIGURATION
  // ═══════════════════════════════════════

  // Hide X-Powered-By header (prevents revealing it's Next.js)
  poweredByHeader: false,

  // Enable gzip compression for smaller response sizes
  compress: true,

  // Enable React strict mode (helps catch bugs)
  reactStrictMode: true,

  // ═══════════════════════════════════════
  // SECURITY HEADERS (Headers Configuration)
  // ═══════════════════════════════════════
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Prevents MIME type sniffing
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Prevents clickjacking
          { key: "X-Frame-Options", value: "DENY" },
          // Enables browser XSS filters
          { key: "X-XSS-Protection", value: "1; mode=block" },
          // Controls referrer information
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Restricts browser features
          { key: "Permissions-Policy", value: "geolocation=(), microphone=(), camera=()" },
          // Enforce HTTPS
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" },
          // Content Security Policy
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; " +
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://cdn-cookieyes.com https://api.openai.com https://va.vercel-scripts.com; " +
              "style-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com; " +
              "img-src 'self' data: https:; " +
              "font-src 'self' data:; " +
              "connect-src 'self' https://api.openai.com https://cdn.jsdelivr.net https://api.vercel.com https://va.vercel-scripts.com; " +
              "frame-ancestors 'none'; " +
              "base-uri 'self'; " +
              "form-action 'self';",
          },
        ],
      },
      {
        source: "/api/:path*",
        headers: [
          // Prevent caching of API responses
          { key: "Cache-Control", value: "no-store, no-cache, must-revalidate, proxy-revalidate" },
          { key: "Pragma", value: "no-cache" },
          { key: "Expires", value: "0" },
        ],
      },
    ];
  },

  // ═══════════════════════════════════════
  // PERFORMANCE OPTIMIZATION
  // ═══════════════════════════════════════
  experimental: {
    optimizePackageImports: ["@vercel/analytics"],
  },

  // ═══════════════════════════════════════
  // ENVIRONMENT VARIABLES
  // ═══════════════════════════════════════
  env: {
    // These are public variables that are safe to expose to the browser
    // NOTE: Never add sensitive keys like API_KEY here!
  },

  // ═══════════════════════════════════════
  // BUILD OPTIMIZATION
  // ═══════════════════════════════════════
  productionBrowserSourceMaps: false, // Disable source maps in production for security
};

export default nextConfig;
