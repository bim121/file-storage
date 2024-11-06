import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "limitless-dachshund-675.convex.cloud"
      }
    ]
  }
};

export default nextConfig;
