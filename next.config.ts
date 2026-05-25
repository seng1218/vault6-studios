import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  turbopack: {
    resolveAlias: {
      "@prisma/client": "./node_modules/.prisma/client/wasm.js",
    },
  },
};

export default nextConfig;
