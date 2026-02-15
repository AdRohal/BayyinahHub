import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable gzip compression for smaller response sizes
  compress: true,
  // Optimize production builds
  reactStrictMode: true,
  // Power-prefix for faster static file serving
  poweredByHeader: false,

};

export default nextConfig;
