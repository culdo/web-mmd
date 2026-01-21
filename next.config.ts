import { PHASE_DEVELOPMENT_SERVER } from 'next/constants.js'
import type { NextConfig } from 'next'

export default async (phase: string) => {
    const isDev = phase === PHASE_DEVELOPMENT_SERVER
    let firebaseConfig: string;

    if (process.env.FIREBASE_CONFIG) {
        firebaseConfig = process.env.FIREBASE_CONFIG
    } else {
        // @ts-ignore
        firebaseConfig = JSON.stringify((await import("@/app/modules/firebase/config.json")))
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
            FIREBASE_CONFIG: firebaseConfig
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

