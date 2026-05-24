import { PHASE_DEVELOPMENT_SERVER } from 'next/constants.js'
import type { NextConfig } from 'next'

export default async (phase: string) => {
    const isDev = phase === PHASE_DEVELOPMENT_SERVER
    let appConfig = process.env.APP_CONFIG;
    if (!appConfig) {
        try {
            // @ts-ignore
            appConfig = JSON.stringify((await import("@/app.json")))
        } catch (e) {
            appConfig = JSON.stringify({})
        }
    }

    const nextConfig: NextConfig = {
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
            COMMIT: process.env.COMMIT,
            APP_CONFIG: appConfig
        },
        async rewrites() {
            return [
                {
                    source: '/:path.html',
                    destination: '/:path'
                },
            ]
        },
    };
    return nextConfig
}

