import "./src/server-shim.js";
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next.js 15+: moved out of experimental
  serverExternalPackages: ["pdfjs-dist", "pdf-parse"],
  devIndicators: false,

  webpack: (config) => {
    // Ignore the optional 'canvas' dependency to prevent build warnings
    config.resolve.alias.canvas = false;

    return config;
  },
};

export default nextConfig;
