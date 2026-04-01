import "./lib/env/server"; // Validate server env vars at build time
import "./lib/env/client"; // Validate client env vars at build time

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  skipProxyUrlNormalize: true,

  // When developing alongside the monorepo, tsconfig paths point to raw TypeScript
  // source files in ../atproto-packages/packages/. These entries tell Turbopack to
  // compile those packages from source instead of expecting pre-built dist/.
  // In standalone/Vercel builds the vendor tarballs include dist/ so this is a no-op.
  transpilePackages: [
    "@gainforest/atproto-auth-next",
    "@gainforest/atproto-mutations-core",
    "@gainforest/atproto-mutations-next",
    "@gainforest/internal-utils",
    "@gainforest/generated",
  ],

  images: {
    unoptimized: process.env.NODE_ENV === "development",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  experimental: {
    viewTransition: true,
    serverActions: {
      bodySizeLimit: "15mb",
    },
  },
};

export default nextConfig;
