import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* config options here */
    experimental: {
        serverComponentsExternalPackages: ['@cloudflare/next-on-pages']
    }
};

export default nextConfig;
