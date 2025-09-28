import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // 如果部署到子路径，需要设置 basePath 和 assetPrefix
  // basePath: '/tier',
  // assetPrefix: '/tier/',
};

export default nextConfig;
