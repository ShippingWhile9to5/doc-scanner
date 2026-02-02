import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    // Handle PDF.js worker
    if (!isServer) {
      config.resolve.alias.canvas = false;
    }

    return config;
  },
  // Add empty turbopack config to silence the warning in Next.js 16
  turbopack: {},
};

export default nextConfig;
