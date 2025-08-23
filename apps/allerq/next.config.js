const withNextIntl = require('next-intl/plugin')(
  // This is the default location for the i18n config
  './src/i18n.ts'
);

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    '@kitchen-os/ui',
    '@kitchen-os/auth',
    '@kitchen-os/database',
    '@kitchen-os/utils'
  ],
  assetPrefix: process.env.NODE_ENV === 'production' ? '' : '',
  basePath: '',
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config) => {
    // Exclude broken files from compilation
    config.module.rules.push({
      test: /\.broken\.(ts|tsx|js|jsx)$/,
      loader: 'ignore-loader'
    });
    return config;
  }
};

module.exports = withNextIntl(nextConfig);
