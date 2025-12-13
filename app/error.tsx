'use client'

import { useEffect } from 'react'
import { resetPreset } from './stores/usePresetStore'

export default function Error({
    error,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        const result = confirm("An unexpected error occurred!\nMaybe there is a problem with the preset configs.\nClick OK to reset the preset configs.")
        const reset = async () => {
            await resetPreset({ reactive: false })
            location.reload()
        }
        if (result) {
            reset()
        }
    }, [error])

    return (
        <div>
        </div>
    )
}
