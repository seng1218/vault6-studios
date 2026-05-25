import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  turbopack: {
    resolveConditions: ["workerd"],
  },
};

export default nextConfig;
