import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: {
      "@prisma/client": "./node_modules/.prisma/client/wasm.js",
    },
  },
};

export default nextConfig;
