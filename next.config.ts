import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
  outputFileTracingIncludes: {
    "/": ["./src/generated/prisma/*.node"],
  },
};

export default nextConfig;
