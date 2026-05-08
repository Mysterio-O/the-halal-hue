import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      
    ],
  },
  allowedDevOrigins:["192.168.0.188", 'localhost', '127.0.0.1']
};

export default nextConfig;