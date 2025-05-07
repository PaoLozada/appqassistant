"use client"

import { useEffect, useRef } from "react"

interface SoundEffectsProps {
    soundEnabled?: boolean
}

export default function SoundEffects({ soundEnabled = true }: SoundEffectsProps) {
    const catchBugSound = useRef<HTMLAudioElement | null>(null)
    const catchFeatureSound = useRef<HTMLAudioElement | null>(null)
    const catchCoffeeSound = useRef<HTMLAudioElement | null>(null)

    useEffect(() => {
        if (typeof window !== "undefined") {
            catchBugSound.current = new Audio("/sounds/catch-bug.mp3")
            catchFeatureSound.current = new Audio("/sounds/catch-feature.mp3")
            catchCoffeeSound.current = new Audio("/sounds/catch-coffee.mp3")
        }

        // Cleanup
        return () => {
            if (catchBugSound.current) {
                catchBugSound.current.pause()
                catchBugSound.current = null
            }
            if (catchFeatureSound.current) {
                catchFeatureSound.current.pause()
                catchFeatureSound.current = null
            }
            if (catchCoffeeSound.current) {
                catchCoffeeSound.current.pause()
                catchCoffeeSound.current = null
            }
        }
    }, [])

    const playSound = (type: "bug" | "feature" | "coffee") => {
        if (!soundEnabled) return

        try {
            if (type === "bug" && catchBugSound.current) {
                catchBugSound.current.currentTime = 0
                catchBugSound.current.play()
            } else if (type === "feature" && catchFeatureSound.current) {
                catchFeatureSound.current.currentTime = 0
                catchFeatureSound.current.play()
            } else if (type === "coffee" && catchCoffeeSound.current) {
                catchCoffeeSound.current.currentTime = 0
                catchCoffeeSound.current.play()
            }
        } catch (error) {
            console.error("Error playing sound:", error)
        }
    }

    return null
}

export function useGameSounds() {
    const soundEffectsRef = useRef<{
        playSound: (type: "bug" | "feature" | "coffee") => void
    }>({
        playSound: () => { },
    })

    return soundEffectsRef.current
}
