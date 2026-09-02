import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  agentRules: false,
  reactCompiler: true,
  async redirects() {
    return [
      { source: "/rewards", destination: "/rewards/coins", permanent: false },
    ];
  },
};

export default nextConfig;
