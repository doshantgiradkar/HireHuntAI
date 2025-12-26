import "./src/server-shim.js";
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // This tells Next.js to use the Node.js version of these packages
    serverComponentsExternalPackages: ["pdfjs-dist", "pdf-parse"],
  },
  webpack: (config) => {
    // This ignores the 'canvas' dependency which is often optional
    // but causes warnings/errors in server environments
    config.resolve.alias.canvas = false;

    return config;
  },
};

export default nextConfig;
