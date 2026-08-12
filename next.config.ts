import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_ACTIONS === "true";
const repositoryName = "cauldron_calculator";

const nextConfig: NextConfig = {
  ...(isGitHubPages ? {
    output: "export" as const,
    basePath: `/${repositoryName}`,
    trailingSlash: true,
  } : {}),
};

export default nextConfig;
