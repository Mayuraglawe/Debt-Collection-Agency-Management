import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Disable inline style warnings during builds - we use inline styles for dynamic theming
    ignoreDuringBuilds: false,
  },
  typescript: {
    // Disable type checking errors during builds
    ignoreBuildErrors: false,
  },
  // Disable experimental features that may cause warnings
  experimental: {},
};

export default nextConfig;
