/** @type {import('next').NextConfig} */
const nextConfig = {
    assetPrefix: './',
    reactStrictMode: false,
    output: 'export',
    webpack: (
        config
    ) => {
        config.module.rules.push({
            test: /\.glsl$/,
            loader: 'raw-loader'
        },)
        config.resolve.fallback = { fs: false };
        return config
    },
};

export default nextConfig;
