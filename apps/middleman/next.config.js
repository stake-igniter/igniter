/** @type {import('next').NextConfig} */

const nextConfig = {
  experimental: {
    turbo: {
      rules: {
        "*.svg": {
          loaders: ["@svgr/webpack"],
          as: "*.js",
        },
      },
    },
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });

    config.resolve.fallback = { fs: false };

    return config;
  },
  output: "standalone",
  redirects: async () => [
    {
      source: "/app",
      destination: "/app/overview",
      permanent: false,
    },
    {
      source: "/admin",
      destination: "/admin/redirect",
      permanent: false,
    }
  ],
};

export default nextConfig;
