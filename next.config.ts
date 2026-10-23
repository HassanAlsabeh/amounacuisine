import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingRoot: process.cwd(),
  // embedded Postgres for local development; loaded from node_modules, not bundled
  serverExternalPackages: ["@electric-sql/pglite"],
  allowedDevOrigins: ["*.trycloudflare.com"],
  async redirects() {
    return [{ source: "/", destination: "/ar", permanent: false }];
  },
  images: {
    // Vercel's free plan includes 5,000 image resizes a month. Keep resized photos for 31 days
    // instead of re-resizing every minute; admin uploads get new URLs, so changes still show at once.
    minimumCacheTTL: 2678400,
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      // photos uploaded from the admin panel (Vercel Blob)
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
};

export default nextConfig;
