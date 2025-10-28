"use client"

import { useState, useEffect, useRef } from "react"
import "@/styles/loading-game.css"

interface Bug {
  id: number
  x: number
  y: number
  rotation: number
  scale: number
  speedX: number
  speedY: number
  type: "bug" | "feature" | "coffee"
}

interface PointAnimation {
  id: number
  x: number
  y: number
  value: number
  color: string
}

interface SplatAnimation {
  id: number
  x: number
  y: number
  emoji: string
}

interface LoadingGameProps {
  onClose?: () => void
}

export default function LoadingGame({ onClose }: LoadingGameProps) {
  const [bugs, setBugs] = useState<Bug[]>([])
  const [score, setScore] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const [message, setMessage] = useState("¡Atrapa los bugs mientras generamos tu plan!")
  const [pointAnimations, setPointAnimations] = useState<PointAnimation[]>([])
  const [splatAnimations, setSplatAnimations] = useState<SplatAnimation[]>([])
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [musicEnabled, setMusicEnabled] = useState(true)

  const containerRef = useRef<HTMLDivElement>(null)
  const requestRef = useRef<number | null>(null)
  const lastBugTime = useRef<number>(Date.now())
  const bugInterval = useRef<number>(800) // Tiempo entre bugs en ms (reducido de 1200 a 800)

  // Referencias para los sonidos
  const catchBugSound = useRef<HTMLAudioElement | null>(null)
  const catchFeatureSound = useRef<HTMLAudioElement | null>(null)
  const catchCoffeeSound = useRef<HTMLAudioElement | null>(null)
  const backgroundMusic = useRef<HTMLAudioElement | null>(null)

  // Cargar sonidos
  useEffect(() => {
    if (typeof window !== "undefined") {
      catchBugSound.current = new Audio("/sounds/pop.mp3")
      catchFeatureSound.current = new Audio("/sounds/wrong.mp3")
      catchCoffeeSound.current = new Audio("/sounds/bonus.mp3")
      backgroundMusic.current = new Audio("/sounds/game-music.mp3")

      // Configurar música de fondo para que se repita
      if (backgroundMusic.current) {
        backgroundMusic.current.loop = true
        backgroundMusic.current.volume = 0.5 // Volumen al 50%
      }

      // Precargar sonidos
      catchBugSound.current.load()
      catchFeatureSound.current.load()
      catchCoffeeSound.current.load()
      backgroundMusic.current.load()

      // Iniciar música de fondo si está habilitada
      if (musicEnabled && backgroundMusic.current) {
        backgroundMusic.current.play().catch((e) => {
          console.log("Error al reproducir música de fondo:", e)
          // La mayoría de navegadores requieren interacción del usuario antes de reproducir audio
        })
      }
    }

    return () => {
      // Limpiar sonidos
      if (catchBugSound.current) catchBugSound.current = null
      if (catchFeatureSound.current) catchFeatureSound.current = null
      if (catchCoffeeSound.current) catchCoffeeSound.current = null
      if (backgroundMusic.current) {
        backgroundMusic.current.pause()
        backgroundMusic.current = null
      }
    }
  }, [])

  // Controlar la música de fondo
  useEffect(() => {
    if (backgroundMusic.current) {
      if (musicEnabled) {
        backgroundMusic.current.play().catch((e) => {
          console.log("Error al reproducir música de fondo:", e)
        })
      } else {
        backgroundMusic.current.pause()
      }
    }
  }, [musicEnabled])

  // Función para reproducir sonidos
  const playSound = (type: "bug" | "feature" | "coffee") => {
    if (!soundEnabled) return

    try {
      if (type === "bug" && catchBugSound.current) {
        catchBugSound.current.currentTime = 0
        catchBugSound.current.play().catch((e) => console.log("Error playing sound:", e))
      } else if (type === "feature" && catchFeatureSound.current) {
        catchFeatureSound.current.currentTime = 0
        catchFeatureSound.current.play().catch((e) => console.log("Error playing sound:", e))
      } else if (type === "coffee" && catchCoffeeSound.current) {
        catchCoffeeSound.current.currentTime = 0
        catchCoffeeSound.current.play().catch((e) => console.log("Error playing sound:", e))
      }
    } catch (error) {
      console.error("Error playing sound:", error)
    }
  }

  // Iniciar el juego
  const startGame = () => {
    setGameStarted(true)
    setScore(0)
    setBugs([])
    lastBugTime.current = Date.now()

    // Intentar iniciar la música cuando el usuario interactúa con el juego
    if (musicEnabled && backgroundMusic.current) {
      backgroundMusic.current.play().catch((e) => {
        console.log("Error al reproducir música de fondo:", e)
      })
    }
  }

  // Función para atrapar un bug
  const catchBug = (id: number, type: string, x: number, y: number) => {
    setBugs((prevBugs) => prevBugs.filter((bug) => bug.id !== id))

    let pointValue = 0
    let pointColor = ""
    let splatEmoji = ""

    // Diferentes puntos según el tipo
    if (type === "bug") {
      pointValue = 10
      pointColor = "text-green-500"
      splatEmoji = "💥"
      setScore((prev) => prev + 10)
      setMessage("¡Bug atrapado! +10 puntos")
      playSound("bug")
    } else if (type === "feature") {
      pointValue = -15
      pointColor = "text-red-500"
      splatEmoji = "❌"
      setScore((prev) => prev - 15)
      setMessage("¡Cuidado! Las features restan -15 puntos")
      playSound("feature")
    } else if (type === "coffee") {
      pointValue = -5
      pointColor = "text-yellow-500"
      splatEmoji = "☕"
      setScore((prev) => prev - 5)
      setMessage("¡El café te distrae! -5 puntos")
      playSound("coffee")
    }

    // Añadir animación de puntos
    const newPointAnimation: PointAnimation = {
      id: Date.now(),
      x,
      y,
      value: pointValue,
      color: pointColor,
    }
    setPointAnimations((prev) => [...prev, newPointAnimation])

    // Añadir animación de splat
    const newSplatAnimation: SplatAnimation = {
      id: Date.now() + 1,
      x,
      y,
      emoji: splatEmoji,
    }
    setSplatAnimations((prev) => [...prev, newSplatAnimation])

    // Eliminar animaciones después de un tiempo
    setTimeout(() => {
      setPointAnimations((prev) => prev.filter((anim) => anim.id !== newPointAnimation.id))
      setSplatAnimations((prev) => prev.filter((anim) => anim.id !== newSplatAnimation.id))
    }, 1000)

    // Mostrar mensaje por un tiempo limitado
    setTimeout(() => {
      setMessage("¡Atrapa los bugs mientras generamos tu plan!")
    }, 1500)
  }

  // Generar un nuevo bug desde los bordes
  const generateBug = () => {
    if (!containerRef.current) return

    const { width, height } = containerRef.current.getBoundingClientRect()

    // Tipos de bugs con diferentes probabilidades (más bugs que antes)
    const types = ["bug", "bug", "bug", "bug", "feature", "feature", "coffee"]
    const randomType = types[Math.floor(Math.random() * types.length)] as "bug" | "feature" | "coffee"

    // Determinar desde qué borde aparecerá el bug (0: arriba, 1: derecha, 2: abajo, 3: izquierda)
    const edge = Math.floor(Math.random() * 4)

    let x = 0
    let y = 0
    let speedX = (Math.random() * 2 - 1) * 2
    let speedY = (Math.random() * 2 - 1) * 2

    // Asegurar que la velocidad no sea cero
    if (Math.abs(speedX) < 0.5) speedX = speedX > 0 ? 0.5 : -0.5
    if (Math.abs(speedY) < 0.5) speedY = speedY > 0 ? 0.5 : -0.5

    // Posicionar el bug según el borde seleccionado
    switch (edge) {
      case 0: // Arriba
        x = Math.random() * width
        y = -50
        speedY = Math.abs(speedY) // Asegurar que se mueva hacia abajo
        break
      case 1: // Derecha
        x = width + 50
        y = Math.random() * height
        speedX = -Math.abs(speedX) // Asegurar que se mueva hacia la izquierda
        break
      case 2: // Abajo
        x = Math.random() * width
        y = height + 50
        speedY = -Math.abs(speedY) // Asegurar que se mueva hacia arriba
        break
      case 3: // Izquierda
        x = -50
        y = Math.random() * height
        speedX = Math.abs(speedX) // Asegurar que se mueva hacia la derecha
        break
    }

    // Asegurar un tamaño mínimo para que sean clickeables
    const scale = 1.0 + Math.random() * 0.5 // Tamaño entre 1.0 y 1.5 (más grande que antes)

    const newBug: Bug = {
      id: Date.now(),
      x,
      y,
      rotation: Math.random() * 360,
      scale,
      speedX,
      speedY,
      type: randomType,
    }

    setBugs((prevBugs) => [...prevBugs, newBug])
    lastBugTime.current = Date.now()

    // Ajustar el intervalo según la puntuación para aumentar la dificultad
    bugInterval.current = Math.max(400, 1200 - score * 10)
  }

  // Actualizar el juego en cada frame
  const updateGame = (time: number) => {
    // Generar nuevos bugs periódicamente
    if (Date.now() - lastBugTime.current > bugInterval.current && bugs.length < 15) {
      generateBug()
    }

    // Mover los bugs existentes
    setBugs((prevBugs) =>
      prevBugs
        .map((bug) => {
          // Aplicar velocidad actual
          const newX = bug.x + bug.speedX
          const newY = bug.y + bug.speedY

          // Pequeña variación aleatoria en la velocidad para movimiento más natural
          const speedX = bug.speedX + (Math.random() * 0.4 - 0.2)
          const speedY = bug.speedY + (Math.random() * 0.4 - 0.2)

          // Limitar la velocidad máxima
          const maxSpeed = 3
          const newSpeedX = Math.max(-maxSpeed, Math.min(maxSpeed, speedX))
          const newSpeedY = Math.max(-maxSpeed, Math.min(maxSpeed, speedY))

          return {
            ...bug,
            x: newX,
            y: newY,
            speedX: newSpeedX,
            speedY: newSpeedY,
            rotation: bug.rotation + (Math.random() * 2 - 1) * 3, // Rotación suave
          }
        })
        .filter((bug) => {
          // Eliminar bugs que están muy lejos de la pantalla
          if (!containerRef.current) return true
          const { width, height } = containerRef.current.getBoundingClientRect()
          return bug.x > -100 && bug.x < width + 100 && bug.y > -100 && bug.y < height + 100
        }),
    )

    requestRef.current = requestAnimationFrame(updateGame)
  }

  // Iniciar y detener el loop del juego
  useEffect(() => {
    if (gameStarted) {
      requestRef.current = requestAnimationFrame(updateGame)
    }
    return () => {
      if (requestRef.current !== null) {
        cancelAnimationFrame(requestRef.current)
        requestRef.current = null
      }
    }
  }, [gameStarted, bugs.length])

  // Iniciar el juego automáticamente
  useEffect(() => {
    startGame()
  }, [])

  // Manejar el cierre del juego
  const handleClose = () => {
    // Detener la música antes de cerrar
    if (backgroundMusic.current) {
      backgroundMusic.current.pause()
    }
    if (onClose) onClose()
  }

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center z-50 p-2 sm:p-4 cinematic-modal-overlay">
      <div className="futuristic-success p-3 sm:p-6 max-w-4xl w-full max-h-[95vh] flex flex-col">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3">
          <h2 className="text-xl sm:text-2xl font-bold text-center sm:text-left"
            style={{ color: "var(--text-secondary)" }}>
            Generando Plan de Pruebas
          </h2>

          {/* Puntuación y controles */}
          <div className="flex flex-wrap justify-center sm:justify-end items-center gap-2 sm:gap-4">
            <div className="bg-neutral-100 px-3 py-1 sm:px-4 sm:py-2 rounded-lg">
              <span className="font-bold"
                style={{ color: "var(--text-secondary)" }}
              >Puntos: {score}</span>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              {/* Música */}
              <button
                onClick={() => setMusicEnabled(!musicEnabled)}
                className="btn-3d btn-3d-primary"
                aria-label={musicEnabled ? "Desactivar música" : "Activar música"}
              >
                <i className={`bi ${musicEnabled ? "bi-music-note-beamed" : "bi-music-note-list"}`}></i>
              </button>

              {/* Efectos */}
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="btn-3d btn-3d-primary"
                aria-label={soundEnabled ? "Desactivar efectos de sonido" : "Activar efectos de sonido"}
              >
                <i className={`bi ${soundEnabled ? "bi-volume-up-fill" : "bi-volume-mute-fill"}`}></i>
              </button>

              {/* Cerrar */}
              {onClose && (
                <button
                  onClick={handleClose}
                  className="btn-3d btn-3d-primary"
                  aria-label="Cerrar juego"
                >
                  <i className="bi bi-x-lg"></i>
                </button>
              )}
            </div>

          </div>
        </div>

        <div className="text-center mb-2 sm:mb-4">
          <p className="text-sm sm:text-base"
            style={{ color: "var(--text-secondary)" }}>{message}</p>
        </div>

        <div
          ref={containerRef}
          className="relative flex-1 game-background rounded-lg border border-neutral-200 overflow-hidden"
          style={{ minHeight: "300px", height: "calc(100vh - 220px)" }}
        >
          {bugs.map((bug) => (
            <div
              key={bug.id}
              className="absolute cursor-pointer bug-element"
              style={{
                left: bug.x,
                top: bug.y,
                transform: `rotate(${bug.rotation}deg) scale(${bug.scale})`,
                transition: "transform 0.3s ease",
              }}
              onClick={(e) => {
                e.stopPropagation() // Evitar propagación del evento
                catchBug(bug.id, bug.type, bug.x, bug.y)
              }}
            >
              <div className="bug-hitbox">
                {bug.type === "bug" && <div className="text-4xl">🐞</div>}
                {bug.type === "feature" && <div className="text-4xl">✨</div>}
                {bug.type === "coffee" && <div className="text-4xl">☕</div>}
              </div>
            </div>
          ))}

          {/* Animaciones de puntos */}
          {pointAnimations.map((anim) => (
            <div key={anim.id} className={`point-animation ${anim.color}`} style={{ left: anim.x, top: anim.y }}>
              {anim.value > 0 ? `+${anim.value}` : anim.value}
            </div>
          ))}

          {/* Animaciones de splat */}
          {splatAnimations.map((anim) => (
            <div key={anim.id} className="bug-splat" style={{ left: anim.x, top: anim.y }}>
              {anim.emoji}
            </div>
          ))}

          {/* Animación de carga en el fondo */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-64">
            <div className="h-2 bg-neutral-800/50 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-primary loading-progress"></div>
            </div>
            <p className="text-center text-sm"
             style={{ color: "var(--text-secondary)" }}>Generando plan de pruebas...</p>
          </div>
        </div>

        <div className="mt-2 sm:mt-4 text-center text-xs sm:text-sm"
         style={{ color: "var(--text-secondary)" }}>
          <p>
            <span className="inline-block mx-1">🐞 +10</span>
            <span className="inline-block mx-1">✨ -15</span>
            <span className="inline-block mx-1">☕ -5</span>
          </p>
        </div>
      </div>
    </div>
  )
}
