import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        // pathname: "/photo-*",
      },
      {
        protocol: "https",
        hostname: (process.env.NEXT_PUBLIC_STRAPI_URL || "").split("://")[1],
        port: "",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "1337",
      },
    ],
  },
};

export default nextConfig;
