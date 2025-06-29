import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* config options here */
    experimental: {
        serverExternalPackages: ['@cloudflare/next-on-pages']
    }
};

export default nextConfig;
