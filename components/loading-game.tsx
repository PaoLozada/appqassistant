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
    <div className="fixed inset-0 bg-neutral-900/80 backdrop-blur-sm flex flex-col items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-xl shadow-custom-lg p-3 sm:p-6 max-w-4xl w-full max-h-[95vh] flex flex-col">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3">
          <h2 className="text-xl sm:text-2xl font-bold text-primary-custom text-center sm:text-left">
            Generando Plan de Pruebas
          </h2>

          {/* Puntuación y controles */}
          <div className="flex flex-wrap justify-center sm:justify-end items-center gap-2 sm:gap-4">
            <div className="bg-neutral-100 px-3 py-1 sm:px-4 sm:py-2 rounded-lg">
              <span className="font-bold text-primary-custom">Puntos: {score}</span>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              {/* Botón para música */}
              <button
                onClick={() => setMusicEnabled(!musicEnabled)}
                className="text-neutral-500 hover:text-neutral-700 bg-neutral-100 p-2 rounded-full"
                aria-label={musicEnabled ? "Desactivar música" : "Activar música"}
              >
                {musicEnabled ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                  >
                    <path d="M6 13c0 1.105-1.12 2-2.5 2S1 14.105 1 13c0-1.104 1.12-2 2.5-2s2.5.896 2.5 2zm9-2c0 1.105-1.12 2-2.5 2s-2.5-.895-2.5-2 1.12-2 2.5-2 2.5.895 2.5 2z" />
                    <path fillRule="evenodd" d="M14 11V2h1v9h-1zM6 3v10H5V3h1z" />
                    <path d="M5 2.905a1 1 0 0 1 .9-.995l8-.8a1 1 0 0 1 1.1.995V3L5 4V2.905z" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                  >
                    <path d="M6 13c0 1.105-1.12 2-2.5 2S1 14.105 1 13c0-1.104 1.12-2 2.5-2s2.5.896 2.5 2zm9-2c0 1.105-1.12 2-2.5 2s-2.5-.895-2.5-2 1.12-2 2.5-2 2.5.895 2.5 2z" />
                    <path d="M14 11V3.224l-2.38.235C10.772 3.584 10 4.457 10 5.5v5.528c0 1.043.772 1.916 1.62 2.041L14 13.28V11zm-1-9.8V1l8-.8v12.8l-8-.8V1.2z" />
                  </svg>
                )}
              </button>

              {/* Botón para efectos de sonido */}
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="text-neutral-500 hover:text-neutral-700 bg-neutral-100 p-2 rounded-full"
                aria-label={soundEnabled ? "Desactivar efectos de sonido" : "Activar efectos de sonido"}
              >
                {soundEnabled ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                  >
                    <path d="M11.536 14.01A1 1 0 0 0 12.013 13c0-.18-.064-.352-.193-.493l-.398-.312a.93.93 0 0 0-.53-.178H11c.068.091.085.195.085.308v.002c0 .234-.055.488-.156.732l-.129.276.282.307c.067.073.124.147.173.22z" />
                    <path d="M10.293 5.707 4 12V7a1 1 0 0 1 1-1h3l2.647-2.646a.5.5 0 0 1 .708.708z" />
                    <path d="M10.293 5.707 4 12V7a1 1 0 0 1 1-1h3l2.647-2.646a.5.5 0 0 1 .708.708z" />
                    <path d="M10.797 14.244c.076.058.163.116.267.174A10.1 10.1 0 0 0 13.5 13.5c.717 0 1.285-.13 1.7-.33a1 1 0 0 0 .5-.857V3.5a1 1 0 0 0-.5-.857c-.415-.2-.983-.33-1.7-.33-1.59 0-2.503.927-3.207 1.686l-.695.71-1.276-.466a3 3 0 0 0-.848-.137H4.5a1 1 0 0 0-1 1v7a1 1 0 0 0 .276.7L9.62 15.9c.412.408 1.334-.317.707-.707L4.71 9.57l-.01-.01z" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                  >
                    <path d="M6.717 3.55A.5.5 0 0 1 7 4v8a.5.5 0 0 1-.812.39L3.825 10.5H1.5A.5.5 0 0 1 1 10V6a.5.5 0 0 1 .5-.5h2.325l2.363-1.89a.5.5 0 0 1 .529-.06z" />
                    <path d="M10.707 11.182A4.486 4.486 0 0 0 12.025 8a4.486 4.486 0 0 0-1.318-3.182L10 5.525A3.489 3.489 0 0 1 11.025 8c0 .966-.392 1.841-1.025 2.475l.707.707z" />
                    <path d="M13.646 14.646a.5.5 0 0 1-.708 0L12 13.707l-.938.938a.5.5 0 0 1-.707 0l-.646-.647.707-.707.646.647.938-.938.646.647.707.707-.647.646z" />
                  </svg>
                )}
              </button>

              {/* Botón para cerrar */}
              {onClose && (
                <button
                  onClick={handleClose}
                  className="text-neutral-500 hover:text-neutral-700 bg-neutral-100 p-2 rounded-full"
                  aria-label="Cerrar juego"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                  >
                    <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="text-center mb-2 sm:mb-4">
          <p className="text-neutral-600 text-sm sm:text-base">{message}</p>
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
            <p className="text-center text-sm text-white mt-2">Generando plan de pruebas...</p>
          </div>
        </div>

        <div className="mt-2 sm:mt-4 text-center text-xs sm:text-sm text-neutral-500">
          <p>
            <span className="inline-block mx-1">🐞 +10 puntos</span>
            <span className="inline-block mx-1">✨ -15 puntos</span>
            <span className="inline-block mx-1">☕ -5 puntos</span>
          </p>
        </div>
      </div>
    </div>
  )
}
