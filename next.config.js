/** @type {import('next').NextConfig} */
const nextConfig = {
    typescript: {
        ignoreBuildErrors: false,
    },
    eslint: {
        ignoreDuringBuilds: false,
    },
    // Optimize for offline builds and restricted environments
    output: 'standalone',
    swcMinify: true,
    // Disable external font optimization to avoid Google Fonts access
    optimizeFonts: false,
    // Configure static optimization
    staticPageGenerationTimeout: 120,
};

module.exports = nextConfig;
