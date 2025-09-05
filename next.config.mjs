import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
    trailingSlash: false,
    reactStrictMode: false,
    images: {
        domains: ['overzaki.fra1.cdn.digitaloceanspaces.com'],
    },
    /*i18n: {
        defaultLocale: 'en',
        locales: ['en', 'ar'],
    },*/
    modularizeImports: {
        '@mui/material': {
            transform: '@mui/material/{{member}}',
        },
        '@mui/lab': {
            transform: '@mui/lab/{{member}}',
        },
    },
    webpack(config) {
        config.module.rules.push({
            test: /\.svg$/,
            use: ['@svgr/webpack'],
        });
        return config;
    },
};


export default withNextIntl(nextConfig);
