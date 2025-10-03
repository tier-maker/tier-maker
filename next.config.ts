import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // 确保静态资源正确处理
  assetPrefix: process.env.NODE_ENV === 'production' ? './' : '',
  // 如果部署到子路径，需要设置 basePath 和 assetPrefix
  // basePath: '/tier',
  // assetPrefix: '/tier/',
};

export default nextConfig;
