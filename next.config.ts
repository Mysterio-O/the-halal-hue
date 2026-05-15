import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: process.env.NEXT_PUBLIC_SUPABASE_HOST_NAME!,
      },
      
    ],
  },
  allowedDevOrigins:["192.168.0.188", 'localhost', '127.0.0.1']
};

export default nextConfig;