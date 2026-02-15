import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable gzip compression for smaller response sizes
  compress: true,
  // Optimize production builds
  reactStrictMode: true,
  // Power-prefix for faster static file serving
  poweredByHeader: false,
  // Disable debug logging
  logging: {
    fetches: {
      full: false,
      level: "error",
    },
  },
  // Disable HMR console messages
  experimental: {
    optimizePackageImports: ["@vercel/analytics"],
  },
};

export default nextConfig;
