/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    output: 'export',
    webpack: (
        config
    ) => {
        config.module.rules.push({
            test: /\.glsl$/,
            loader: 'raw-loader'
        },)
        return config
    },
};

export default nextConfig;
