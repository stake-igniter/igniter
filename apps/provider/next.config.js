/** @type {import('next').NextConfig} */

const nextConfig = {
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  transpilePackages: ['@igniter/logger', '@igniter/db'],
  webpack: (config) => {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    })

    config.resolve.fallback = { fs: false }

    return config
  },
  output: 'standalone',
}

export default nextConfig
