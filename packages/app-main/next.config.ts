import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["common", "@chat-assistant/database"],
};

export default nextConfig;
