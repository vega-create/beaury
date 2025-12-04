import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    // 禁用靜態優化以避免 build 時需要環境變數
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;
