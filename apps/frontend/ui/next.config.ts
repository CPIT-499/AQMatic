import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    // Using updated property name as per error message
  },
  // Next.js v15+ uses this property instead of serverComponentsExternalPackages
  serverExternalPackages: ['@prisma/client', 'bcrypt'],
  // This explicitly configures which routes use which runtime (Node.js is the default)
  // The middleware will use its own runtime setting from middleware.ts file
  serverRuntimeConfig: {
    // Will only be available on the server side
  },
  publicRuntimeConfig: {
    // Will be available on both server and client
  },
};

export default nextConfig;
