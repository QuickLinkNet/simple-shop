import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cache Components: "use cache" + cacheLife() statt fetch-Optionen.
  // Statische Shell wird beim Build erzeugt, URL-abhängige Teile streamen.
  cacheComponents: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.dummyjson.com",
        pathname: "/product-images/**",
      },
    ],
  },
};

export default nextConfig;
