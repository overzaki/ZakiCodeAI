const createNextIntlPlugin = require('next-intl/plugin');
const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/n8n/:path*',
        destination: 'https://overzakiar.app.n8n.cloud/webhook/:path*',
      },
    ];
  },
};

module.exports = withNextIntl(nextConfig);