import type { NextConfig } from "next";
import { hostname } from "os";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: 'nextauth.b-cdn.net',
        protocol: 'https',
      },
    ],
  },
};

export default nextConfig;
