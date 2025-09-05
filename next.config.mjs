import { PHASE_DEVELOPMENT_SERVER } from 'next/constants.js'

export default (phase) => {
    const isDev = phase === PHASE_DEVELOPMENT_SERVER
    /**
     * @type {import('next').NextConfig}
     */
    const nextConfig = {
        assetPrefix: isDev ? undefined : './',
        reactStrictMode: false,
        output: 'export',
        webpack: (
            config
        ) => {
            config.module.rules.push({
                test: /\.(vert|frag)$/,
                loader: 'raw-loader'
            })
            config.resolve.fallback = { fs: false };
            return config
        },
        env: {
            COMMIT: process.env.COMMIT
        }
    };
    return nextConfig
  }

