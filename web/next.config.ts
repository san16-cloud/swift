import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    // Add any environment variables that need to be exposed to the browser
  },
  // Set the port to 3050
  experimental: {},
  // Configure output for static exports (required for Cloudflare Pages)
  output: 'export',
  // Disable image optimization since Cloudflare Pages doesn't support it
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
