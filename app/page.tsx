"use client"

import { useState, useEffect } from "react"
import { generateTestPlan } from "@/lib/test-plan-generator"
import type { TestPlan, TestPlanInput } from "@/lib/types"
import { sendEmail } from "@/lib/send-email"
import type { Risk, TestCase } from "@/lib/types"
import "bootstrap-icons/font/bootstrap-icons.css"
import LoadingGame from "@/components/loading-game"
import SectionHeader from "@/components/section-header"
import ActionButton from "@/components/action-button"
import { ListItem } from "@/components/list-item"


// Definición de tipos de aplicación y subtipos
const applicationTypes = ["Web", "API", "Escritorio", "Móvil"]

const applicationSubtypes: Record<string, string[]> = {
  Web: ["E-commerce", "Blog", "Portal informativo", "Red social", "Dashboard", "Aplicación SaaS"],
  API: ["REST", "GraphQL", "SOAP", "Microservicios"],
  Escritorio: ["Productividad", "Diseño", "Juego", "Utilidad del sistema"],
  Móvil: ["Android", "iOS", "Juego móvil", "Aplicación híbrida"],
}

// Características predefinidas por tipo y subtipo
const applicationFeatures: Record<string, Record<string, string[]>> = {
  Web: {
    "E-commerce": [
      "Catálogo de productos",
      "Carrito de compras",
      "Pasarela de pago",
      "Gestión de pedidos",
      "Búsqueda avanzada",
      "Reseñas de productos",
    ],
    Blog: ["Publicación de artículos", "Comentarios", "Categorías", "Etiquetas", "Búsqueda", "Suscripción"],
    "Portal informativo": [
      "Noticias",
      "Categorías",
      "Búsqueda",
      "Multimedia",
      "Comentarios",
      "Compartir en redes sociales",
    ],
    "Red social": ["Perfiles de usuario", "Publicaciones", "Comentarios", "Mensajería", "Notificaciones", "Grupos"],
    Dashboard: ["Gráficos interactivos", "Filtros", "Exportación de datos", "Alertas", "Informes personalizados"],
    "Aplicación SaaS": ["Registro de usuarios", "Suscripciones", "Panel de administración", "Integraciones", "API"],
  },
  API: {
    REST: ["Endpoints CRUD", "Autenticación", "Paginación", "Filtrado", "Documentación", "Versionado"],
    GraphQL: ["Queries", "Mutations", "Subscriptions", "Resolvers", "Tipos personalizados", "Directivas"],
    SOAP: ["WSDL", "Mensajes XML", "Seguridad WS", "Transacciones", "Enrutamiento"],
    Microservicios: [
      "Servicios independientes",
      "API Gateway",
      "Descubrimiento de servicios",
      "Balanceo de carga",
      "Tolerancia a fallos",
    ],
  },
  Escritorio: {
    Productividad: ["Edición de documentos", "Gestión de archivos", "Sincronización", "Atajos de teclado", "Plugins"],
    Diseño: ["Herramientas de dibujo", "Capas", "Efectos", "Exportación en múltiples formatos", "Plugins"],
    Juego: ["Gráficos 2D/3D", "Sistema de físicas", "IA", "Guardado de partidas", "Multijugador"],
    "Utilidad del sistema": ["Monitoreo de recursos", "Optimización", "Backup", "Seguridad", "Programación de tareas"],
  },
  Móvil: {
    Android: ["Material Design", "Notificaciones push", "Almacenamiento local", "Permisos", "Sensores"],
    iOS: ["Human Interface Guidelines", "Notificaciones push", "Core Data", "Permisos", "Sensores"],
    "Juego móvil": ["Gráficos optimizados", "Controles táctiles", "Compras in-app", "Logros", "Multijugador"],
    "Aplicación híbrida": [
      "UI multiplataforma",
      "Acceso a APIs nativas",
      "Rendimiento optimizado",
      "Almacenamiento local",
    ],
  },
}

export default function Home() {
  // Estado para el formulario de entrada
  const [description, setDescription] = useState("")
  const [teamSize, setTeamSize] = useState(3)
  const [testTypes, setTestTypes] = useState<string[]>([])
  const [automationAllowed, setAutomationAllowed] = useState(true)
  const [performanceTestingAllowed, setPerformanceTestingAllowed] = useState(true)

  // Nuevos estados para el tipo de aplicación
  const [applicationType, setApplicationType] = useState<string>("")
  const [applicationSubtype, setApplicationSubtype] = useState<string>("")
  const [availableSubtypes, setAvailableSubtypes] = useState<string[]>([])
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([])
  const [availableFeatures, setAvailableFeatures] = useState<string[]>([])

  // Estado para el plan de pruebas generado
  const [testPlan, setTestPlan] = useState<TestPlan | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState("objectives")
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards")

  // Estados para la edición
  const [editingObjective, setEditingObjective] = useState<{ index: number; value: string } | null>(null)
  const [editingIncludedScope, setEditingIncludedScope] = useState<{ index: number; value: string } | null>(null)
  const [editingExcludedScope, setEditingExcludedScope] = useState<{ index: number; value: string } | null>(null)
  const [editingRisk, setEditingRisk] = useState<{ index: number; field: string; value: string } | null>(null)
  const [editingTestCase, setEditingTestCase] = useState<{
    index: number
    field: string
    value: string | string[]
  } | null>(null)
  const [editingTimeEstimation, setEditingTimeEstimation] = useState<{
    index: number
    field: string
    value: string | number
  } | null>(null)
  const [editingTimeEstimationFactor, setEditingTimeEstimationFactor] = useState<{
    index: number
    value: string
  } | null>(null)
  const [editingStrategy, setEditingStrategy] = useState<{ field: string; value: string } | null>(null)
  const [editingStrategyTechnique, setEditingStrategyTechnique] = useState<{
    index: number
    field: string
    value: string
  } | null>(null)
  const [editingEntryCriteria, setEditingEntryCriteria] = useState<{ index: number; value: string } | null>(null)
  const [editingExitCriteria, setEditingExitCriteria] = useState<{ index: number; value: string } | null>(null)
  const [editingEnvironment, setEditingEnvironment] = useState<{ index: number; field: string; value: string } | null>(
    null,
  )
  const [editingTestData, setEditingTestData] = useState<{ index: number; value: string } | null>(null)
  const [editingTool, setEditingTool] = useState<{ index: number; field: string; value: string } | null>(null)

  // Añadir un nuevo estado para el caso de prueba activo (para ver detalles)
  const [activeTestCaseDetails, setActiveTestCaseDetails] = useState<number | null>(null)

  // Estado para el envío de correo
  const [emailTo, setEmailTo] = useState("")
  const [emailSubject, setEmailSubject] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  // Estado para el formato de envío
  const [emailFormat, setEmailFormat] = useState<"html" | "pdf">("html")

  // Establecer Dark
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Establecer dark mode por defecto
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  // Estado para el caso de prueba activo en la vista de tabla
  //const [activeTestCaseDetails, setActiveTestCaseDetails, setActiveTestCaseDetails] = useState<number | null>(null)
  const [showLoadingGame, setShowLoadingGame] = useState(false)
  // Efecto para actualizar subtipos disponibles cuando cambia el tipo de aplicación
  useEffect(() => {
    if (applicationType) {
      setAvailableSubtypes(applicationSubtypes[applicationType] || [])
      setApplicationSubtype("")
      setSelectedFeatures([])
      setAvailableFeatures([])
    } else {
      setAvailableSubtypes([])
      setApplicationSubtype("")
      setSelectedFeatures([])
      setAvailableFeatures([])
    }
  }, [applicationType])

  // Efecto para actualizar características disponibles cuando cambia el subtipo
  useEffect(() => {
    if (applicationType && applicationSubtype) {
      setAvailableFeatures(applicationFeatures[applicationType]?.[applicationSubtype] || [])
      setSelectedFeatures([])
    } else {
      setAvailableFeatures([])
      setSelectedFeatures([])
    }
  }, [applicationType, applicationSubtype])

  // Función para manejar la selección de tipos de prueba
  const handleTestTypeChange = (type: string) => {
    if (testTypes.includes(type)) {
      setTestTypes(testTypes.filter((t) => t !== type))
    } else {
      setTestTypes([...testTypes, type])
    }
  }

  // Función para manejar la selección de características
  const handleFeatureChange = (feature: string) => {
    if (selectedFeatures.includes(feature)) {
      setSelectedFeatures(selectedFeatures.filter((f) => f !== feature))
    } else {
      setSelectedFeatures([...selectedFeatures, feature])
    }
  }

  // Función para generar el plan de pruebas
  const handleGenerateTestPlan = async () => {
    if (!description) {
      alert("Por favor, proporciona una descripción del sistema a probar.")
      return
    }

    setIsGenerating(true)
    setShowLoadingGame(true) // Mostrar el juego de carga
    try {
      const input: TestPlanInput = {
        description,
        teamSize,
        testTypes,
        automationAllowed,
        performanceTestingAllowed,
        applicationType,
        applicationSubtype,
        applicationFeatures: selectedFeatures,
      }

      console.log("Generando plan con input:", input)

      try {
        console.log("Intentando generar plan con OpenAI desde la API interna...")
        const response = await fetch("/api/generate-ai-plan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        })

        if (!response.ok) {
          throw new Error("Error desde la API interna")
        }

        const data = await response.json()
        console.log("Plan generado:", data)
        setTestPlan(data)
      } catch (error) {
        console.error("❌ Error al generar plan con IA:", error)
        console.log("⚠️ Usando generador predeterminado como fallback...")
        const fallbackPlan = generateTestPlan(input)
        fallbackPlan.source = "Generador predeterminado (fallback por error en OpenAI)"
        setTestPlan(fallbackPlan)
      }

      // Asunto predeterminado para el email
      setEmailSubject(`Plan de Pruebas: ${description.substring(0, 50)}${description.length > 50 ? "..." : ""}`)
    } catch (error) {
      console.error("⚠️ Error general en la generación:", error)
      alert("Ocurrió un error inesperado. Por favor, intenta de nuevo.")
    } finally {
      setIsGenerating(false)
      setShowLoadingGame(false) // Ocultar el juego de carga
    }
  }

  // Funciones para añadir y editar objetivos
  const handleAddObjective = () => {
    if (!testPlan) return
    const newObjective = "Nuevo objetivo"
    setTestPlan({
      ...testPlan,
      objectives: [newObjective, ...testPlan.objectives],
    })
  }

  const handleDeleteObjective = (index: number) => {
    if (!testPlan) return
    const updatedObjectives = [...testPlan.objectives]
    updatedObjectives.splice(index, 1)
    setTestPlan({
      ...testPlan,
      objectives: updatedObjectives,
    })
  }

  const handleEditObjective = (index: number, value: string) => {
    if (!testPlan) return
    const updatedObjectives = [...testPlan.objectives]
    updatedObjectives[index] = value
    setTestPlan({
      ...testPlan,
      objectives: updatedObjectives,
    })
  }

  // Funciones para añadir y editar alcance
  const handleAddIncludedScope = () => {
    if (!testPlan) return
    const newItem = "Nuevo elemento incluido"
    setTestPlan({
      ...testPlan,
      scope: {
        ...testPlan.scope,
        included: [newItem, ...testPlan.scope.included],
      },
    })
  }

  const handleDeleteIncludedScope = (index: number) => {
    if (!testPlan) return
    const updatedIncluded = [...testPlan.scope.included]
    updatedIncluded.splice(index, 1)
    setTestPlan({
      ...testPlan,
      scope: {
        ...testPlan.scope,
        included: updatedIncluded,
      },
    })
  }

  const handleEditIncludedScope = (index: number, value: string) => {
    if (!testPlan) return
    const updatedIncluded = [...testPlan.scope.included]
    updatedIncluded[index] = value
    setTestPlan({
      ...testPlan,
      scope: {
        ...testPlan.scope,
        included: updatedIncluded,
      },
    })
  }

  const handleAddExcludedScope = () => {
    if (!testPlan) return
    const newItem = "Nuevo elemento excluido"
    setTestPlan({
      ...testPlan,
      scope: {
        ...testPlan.scope,
        excluded: [newItem, ...testPlan.scope.excluded],
      },
    })
  }

  const handleDeleteExcludedScope = (index: number) => {
    if (!testPlan) return
    const updatedExcluded = [...testPlan.scope.excluded]
    updatedExcluded.splice(index, 1)
    setTestPlan({
      ...testPlan,
      scope: {
        ...testPlan.scope,
        excluded: updatedExcluded,
      },
    })
  }

  const handleEditExcludedScope = (index: number, value: string) => {
    if (!testPlan) return
    const updatedExcluded = [...testPlan.scope.excluded]
    updatedExcluded[index] = value
    setTestPlan({
      ...testPlan,
      scope: {
        ...testPlan.scope,
        excluded: updatedExcluded,
      },
    })
  }

  // Funciones para añadir y editar riesgos
  const handleAddRisk = () => {
    if (!testPlan) return
    const newRisk: Risk = {
      description: "Nueva descripción de riesgo",
      impact: "Medio",
      probability: "Media",
      mitigation: "Nueva estrategia de mitigación",
    }
    setTestPlan({
      ...testPlan,
      risks: [newRisk, ...testPlan.risks],
    })
  }

  const handleDeleteRisk = (index: number) => {
    if (!testPlan) return
    const updatedRisks = [...testPlan.risks]
    updatedRisks.splice(index, 1)
    setTestPlan({
      ...testPlan,
      risks: updatedRisks,
    })
  }

  const handleEditRisk = (index: number, field: keyof Risk, value: string) => {
    if (!testPlan) return
    const updatedRisks = [...testPlan.risks]
    updatedRisks[index] = {
      ...updatedRisks[index],
      [field]: value,
    }
    setTestPlan({
      ...testPlan,
      risks: updatedRisks,
    })
  }

  // Funciones para añadir y editar casos de prueba
  const handleAddTestCase = () => {
    if (!testPlan) return
    const newTestCase: TestCase = {
      title: "Nuevo caso de prueba",
      priority: "Media",
      preconditions: ["Precondición 1"],
      steps: ["Paso 1"],
      expectedResult: "Resultado esperado",
      type: "Funcional",
      automatable: true,
    }
    setTestPlan({
      ...testPlan,
      testCases: [newTestCase, ...testPlan.testCases],
    })
  }

  const handleDeleteTestCase = (index: number) => {
    if (!testPlan) return
    const updatedTestCases = [...testPlan.testCases]
    updatedTestCases.splice(index, 1)
    setTestPlan({
      ...testPlan,
      testCases: updatedTestCases,
    })
  }

  const handleEditTestCase = (index: number, field: keyof TestCase, value: string | string[] | boolean) => {
    if (!testPlan) return
    const updatedTestCases = [...testPlan.testCases]

    // Convertir el valor si es necesario
    let processedValue = value
    if (field === "automatable" && typeof value === "string") {
      processedValue = value === "true"
    }

    updatedTestCases[index] = {
      ...updatedTestCases[index],
      [field]: processedValue,
    }
    setTestPlan({
      ...testPlan,
      testCases: updatedTestCases,
    })
  }

  // Funciones para añadir y editar estimación de tiempos
  const handleAddTimeEstimationPhase = () => {
    if (!testPlan) return
    const newPhase = {
      name: "Nueva fase",
      duration: 1,
      resources: 4,
      justification: "Justificación de la duración",
    }
    const updatedPhases = [newPhase, ...testPlan.timeEstimation.phases]

    // Recalcular el tiempo total
    const totalDays = updatedPhases.reduce((sum, phase) => sum + phase.duration, 0)

    setTestPlan({
      ...testPlan,
      timeEstimation: {
        ...testPlan.timeEstimation,
        phases: updatedPhases,
        totalDays: totalDays,
      },
    })
  }

  const handleDeleteTimeEstimationPhase = (index: number) => {
    if (!testPlan) return
    const updatedPhases = [...testPlan.timeEstimation.phases]
    updatedPhases.splice(index, 1)

    // Recalcular el tiempo total
    const totalDays = updatedPhases.reduce((sum, phase) => sum + phase.duration, 0)

    setTestPlan({
      ...testPlan,
      timeEstimation: {
        ...testPlan.timeEstimation,
        phases: updatedPhases,
        totalDays: totalDays,
      },
    })
  }

  const handleEditTimeEstimation = (index: number, field: string, value: string | number) => {
    if (!testPlan) return
    const updatedPhases = [...testPlan.timeEstimation.phases]
    updatedPhases[index] = {
      ...updatedPhases[index],
      [field]: field === "duration" ? Number(value) : value,
    }

    // Recalcular el tiempo total
    const totalDays = updatedPhases.reduce((sum, phase) => sum + phase.duration, 0)

    setTestPlan({
      ...testPlan,
      timeEstimation: {
        ...testPlan.timeEstimation,
        phases: updatedPhases,
        totalDays: totalDays, // Actualizar el tiempo total
      },
    })
  }

  const handleAddTimeEstimationFactor = () => {
    if (!testPlan) return
    const newFactor = "Nuevo factor considerado"
    setTestPlan({
      ...testPlan,
      timeEstimation: {
        ...testPlan.timeEstimation,
        factors: [newFactor, ...testPlan.timeEstimation.factors],
      },
    })
  }

  const handleDeleteTimeEstimationFactor = (index: number) => {
    if (!testPlan) return
    const updatedFactors = [...testPlan.timeEstimation.factors]
    updatedFactors.splice(index, 1)
    setTestPlan({
      ...testPlan,
      timeEstimation: {
        ...testPlan.timeEstimation,
        factors: updatedFactors,
      },
    })
  }

  const handleEditTimeEstimationFactor = (index: number, value: string) => {
    if (!testPlan) return
    const updatedFactors = [...testPlan.timeEstimation.factors]
    updatedFactors[index] = value
    setTestPlan({
      ...testPlan,
      timeEstimation: {
        ...testPlan.timeEstimation,
        factors: updatedFactors,
      },
    })
  }

  // Funciones para editar estrategia
  const handleEditStrategy = (field: string, value: string) => {
    if (!testPlan) return
    setTestPlan({
      ...testPlan,
      strategy: {
        ...testPlan.strategy,
        [field]: value,
      },
    })
  }

  const handleEditStrategyTechnique = (index: number, field: string, value: string) => {
    if (!testPlan) return
    const updatedTechniques = [...testPlan.strategy.techniques]
    updatedTechniques[index] = {
      ...updatedTechniques[index],
      [field]: value,
    }
    setTestPlan({
      ...testPlan,
      strategy: {
        ...testPlan.strategy,
        techniques: updatedTechniques,
      },
    })
    setEditingStrategyTechnique(null) // Asegurarse de que se cierre el modo de edición
  }

  const handleEditEntryCriteria = (index: number, value: string) => {
    if (!testPlan) return
    const updatedCriteria = [...testPlan.strategy.entryCriteria]
    updatedCriteria[index] = value
    setTestPlan({
      ...testPlan,
      strategy: {
        ...testPlan.strategy,
        entryCriteria: updatedCriteria,
      },
    })
  }

  const handleEditExitCriteria = (index: number, value: string) => {
    if (!testPlan) return
    const updatedCriteria = [...testPlan.strategy.exitCriteria]
    updatedCriteria[index] = value
    setTestPlan({
      ...testPlan,
      strategy: {
        ...testPlan.strategy,
        exitCriteria: updatedCriteria,
      },
    })
  }

  // Funciones para añadir elementos a las listas de estrategia
  const handleAddStrategyTechnique = () => {
    if (!testPlan) return
    const newTechnique = { name: "Nueva Técnica", description: "Descripción de la nueva técnica" }
    setTestPlan({
      ...testPlan,
      strategy: {
        ...testPlan.strategy,
        techniques: [newTechnique, ...testPlan.strategy.techniques],
      },
    })
  }

  const handleAddEntryCriteria = () => {
    if (!testPlan) return
    const newCriteria = "Nuevo criterio de entrada"
    setTestPlan({
      ...testPlan,
      strategy: {
        ...testPlan.strategy,
        entryCriteria: [newCriteria, ...testPlan.strategy.entryCriteria],
      },
    })
  }

  const handleAddExitCriteria = () => {
    if (!testPlan) return
    const newCriteria = "Nuevo criterio de salida"
    setTestPlan({
      ...testPlan,
      strategy: {
        ...testPlan.strategy,
        exitCriteria: [newCriteria, ...testPlan.strategy.exitCriteria],
      },
    })
  }

  // Funciones para eliminar elementos de las listas de estrategia
  const handleDeleteStrategyTechnique = (index: number) => {
    if (!testPlan) return
    const updatedTechniques = [...testPlan.strategy.techniques]
    updatedTechniques.splice(index, 1)
    setTestPlan({
      ...testPlan,
      strategy: {
        ...testPlan.strategy,
        techniques: updatedTechniques,
      },
    })
  }

  const handleDeleteEntryCriteria = (index: number) => {
    if (!testPlan) return
    const updatedCriteria = [...testPlan.strategy.entryCriteria]
    updatedCriteria.splice(index, 1)
    setTestPlan({
      ...testPlan,
      strategy: {
        ...testPlan.strategy,
        entryCriteria: updatedCriteria,
      },
    })
  }

  const handleDeleteExitCriteria = (index: number) => {
    if (!testPlan) return
    const updatedCriteria = [...testPlan.strategy.exitCriteria]
    updatedCriteria.splice(index, 1)
    setTestPlan({
      ...testPlan,
      strategy: {
        ...testPlan.strategy,
        exitCriteria: updatedCriteria,
      },
    })
  }

  const handleAddEnvironment = () => {
    if (!testPlan) return
    const newEnvironment = {
      name: "Nuevo Entorno",
      purpose: "Propósito del nuevo entorno",
      configuration: "Configuración",
    }
    setTestPlan({
      ...testPlan,
      environment: {
        ...testPlan.environment,
        environments: [newEnvironment, ...testPlan.environment.environments],
      },
    })
  }

  const handleDeleteEnvironment = (index: number) => {
    if (!testPlan) return
    const updatedEnvironments = [...testPlan.environment.environments]
    updatedEnvironments.splice(index, 1)
    setTestPlan({
      ...testPlan,
      environment: {
        ...testPlan.environment,
        environments: updatedEnvironments,
      },
    })
  }

  const handleAddTestData = () => {
    if (!testPlan) return
    const newTestData = "Nuevo dato de prueba"
    setTestPlan({
      ...testPlan,
      environment: {
        ...testPlan.environment,
        testData: [newTestData, ...testPlan.environment.testData],
      },
    })
  }

  const handleDeleteTestData = (index: number) => {
    if (!testPlan) return
    const updatedTestData = [...testPlan.environment.testData]
    updatedTestData.splice(index, 1)
    setTestPlan({
      ...testPlan,
      environment: {
        ...testPlan.environment,
        testData: updatedTestData,
      },
    })
  }

  const handleAddTool = () => {
    if (!testPlan) return
    const newTool = { name: "Nueva Herramienta", purpose: "Propósito de la nueva herramienta" }
    setTestPlan({
      ...testPlan,
      environment: {
        ...testPlan.environment,
        tools: [newTool, ...testPlan.environment.tools],
      },
    })
  }

  const handleDeleteTool = (index: number) => {
    if (!testPlan) return
    const updatedTools = [...testPlan.environment.tools]
    updatedTools.splice(index, 1)
    setTestPlan({
      ...testPlan,
      environment: {
        ...testPlan.environment,
        tools: updatedTools,
      },
    })
  }

  const handleSendEmail = async () => {
    if (!testPlan || !emailTo) return

    setIsSending(true)

    try {
      const result = await sendEmail({
        to: emailTo,
        from: "dev@paolozada.com", // Remitente fijo
        subject:
          emailSubject || `Plan de Pruebas: ${description.substring(0, 50)}${description.length > 50 ? "..." : ""}`,
        planName: emailSubject || `Plan de Pruebas`,
        testPlan: testPlan,
        format: emailFormat, // Añadimos el formato seleccionado
      })

      if (result.success) {
        setEmailSent(true)
        //setTimeout(() => setEmailSent(false), 3000)
        setEmailTo("")
        setEmailSubject("")
      } else {
        alert(`Error al enviar el correo: ${result.message}`)
      }
    } catch (error) {
      console.error("Error al enviar el correo:", error)
      alert("Ocurrió un error al enviar el correo. Por favor, intenta de nuevo.")
    } finally {
      setIsSending(false)
    }
  }

  // Corregir la función handleEditEnvironment
  const handleEditEnvironment = (index: number, field: string, value: string) => {
    if (!testPlan) return
    const updatedEnvironments = [...testPlan.environment.environments]
    updatedEnvironments[index] = {
      ...updatedEnvironments[index],
      [field]: value,
    }
    setTestPlan({
      ...testPlan,
      environment: {
        ...testPlan.environment,
        environments: updatedEnvironments,
      },
    })
    setEditingEnvironment(null) // Cerrar el modo de edición
  }

  // Corregir la función handleEditTestData
  const handleEditTestData = (index: number, value: string) => {
    if (!testPlan) return
    const updatedTestData = [...testPlan.environment.testData]
    updatedTestData[index] = value
    setTestPlan({
      ...testPlan,
      environment: {
        ...testPlan.environment,
        testData: updatedTestData,
      },
    })
    setEditingTestData(null) // Cerrar el modo de edición
  }

  // Corregir la función handleEditTool
  const handleEditTool = (index: number, field: string, value: string) => {
    if (!testPlan) return
    const updatedTools = [...testPlan.environment.tools]
    updatedTools[index] = {
      ...updatedTools[index],
      [field]: value,
    }
    setTestPlan({
      ...testPlan,
      environment: {
        ...testPlan.environment,
        tools: updatedTools,
      },
    })
    setEditingTool(null) // Cerrar el modo de edición
  }

  // Renderizar la interfaz de usuario
  return (

    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''} bg-white/85 dark:bg-black/85 text-foreground`}>
                
       <div className="container mx-auto py-8 px-4">
        {showLoadingGame && <LoadingGame onClose={() => setShowLoadingGame(false)} />}

        <div className="bg-white/60 text-black dark:bg-black/60 dark:text-six-custom border dark:border-black p-6 rounded-lg shadow-xl mb-8 border border-gray-100 backdrop-blur">
        <div className="logo_tittle flex flex-col md:flex-row items-center justify-between gap-0">
        {/* Logo */}
        <div className="logo_pl flex-shrink-0 scale-90 md:scale-100">
          <img
            src="/img/iconPL.png"
            alt="Icono de la app"
            className="w-10 h-auto md:w-24"
          />
                    <h1 className="text-3xl font-bold relative pb-3 mb-2 text-primary-custom dark:text-primary-custom_drk">
            QAssistant
            <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-white/10 dark:bg-black/10 backdrop-blur"></span>
          </h1>
        </div>

        {/* Título y textos */}
        <div className="tittle_app flex-1 text-center mx-auto">

          <p className="bg-white/10 dark:bg-transparent text-primary-custom dark:text-primary-custom_drk text-center mt-2 font-bold">
            Genera planes de prueba profesionales para tus proyectos
          </p>
          {testPlan?.source && (
            <p className="text-center mt-3 text-sm p-2 rounded bg-white/10 dark:bg-transparent text-black dark:text-six-custom">
              <span className="font-medium">Generado: </span> {testPlan.source}
            </p>
          )}
        </div>
            <div> 
              <div className="container mx-auto px-4">
                <div onClick={() => setIsDarkMode(!isDarkMode)}
                  className="flex justify-end items-center"
                  role="button"
                  aria-label="Cambiar modo de color"
                  tabIndex={0}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setIsDarkMode(!isDarkMode)}>
                
                  {/* Lámpara mejorada */}
                  <div className="relative group scale-50 md:scale-75">
                    {/* Cable mejorado */}
                    <div className="w-1 h-8 bg-gradient-to-b from-gray-400 to-gray-600 dark:from-gray-500 dark:to-gray-300 mx-auto shadow-sm"></div>

                    {/* Soporte de la lámpara */}
                    <div className="w-16 h-2 bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-500 rounded-full mx-auto shadow-md mb-0"></div>

                    {/* Indicador de estado mejorado */}
                    <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 text-s md:text-xs font-medium px-3 py-0 rounded-full bg-white/80 dark:bg-black/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 transition-all duration-300 shadow-sm">
                      <span className="flex items-center space-x-1">
                        <span
                          className={`w-2 h-2 rounded-full transition-colors duration-300 ${isDarkMode ? "bg-yellow-400 shadow-sm shadow-yellow-400/50" : "bg-gray-400"}`}
                        ></span>
                        <span className="text-gray-700 dark:text-gray-300">{isDarkMode ? "Oscuro" : "Claro"}</span>
                      </span>
                    </div>

                    {/* Lámpara principal mejorada */}
                    <div
                      
                      className="cursor-pointer relative z-10 w-20 h-10 bg-gradient-to-b from-gray-200 via-gray-300 to-gray-400 dark:from-gray-700 dark:via-gray-800 dark:to-gray-900 rounded-t-full mx-auto shadow-lg transition-all duration-500 hover:scale-105 group-hover:shadow-xl border border-gray-300 dark:border-gray-600"
                      title={isDarkMode ? "Cambiar a modo claro ☀️" : "Cambiar a modo oscuro 🌙"}
                    >
                      {/* Reflejo en la lámpara - CORREGIDO */}
                      <div className="absolute top-2 left-3 w-3 h-2 bg-white/40 rounded-full blur-sm"></div>

                      {/* Bombilla mejorada - CORREGIDA */}
                      <div
                        className={`absolute top-[75%] left-1/2 transform -translate-x-1/2 w-6 h-6 rounded-full z-20 transition-all duration-700 border ${
                          isDarkMode
                            ? "bg-gradient-to-br from-yellow-200 via-yellow-300 to-yellow-400 shadow-lg border-yellow-200"
                            : "bg-gradient-to-br from-gray-400 to-gray-500 border-gray-400"
                        }`}
                        style={{
                          clipPath: "inset(50% 0 0 0)",
                          boxShadow: isDarkMode ? "0 0 20px rgba(255, 255, 0, 0.4), 0 0 40px rgba(255, 255, 0, 0.2)" : "none",
                        }}
                      ></div>
                    </div>

                    {/* Luz proyectada mejorada - CORREGIDA */}
                    <div
                      className={`transition-all duration-1000 ease-in-out ${
                        !isDarkMode ? "opacity-0 scale-95" : "opacity-100 scale-100"
                      } absolute top-[3rem] left-1/2 transform -translate-x-1/2 w-24 h-32 pointer-events-none z-0`}
                      style={{
                        background: isDarkMode
                          ? "radial-gradient(ellipse at top, rgba(255, 255, 150, 0.6) 0%, rgba(255, 255, 100, 0.4) 30%, rgba(255, 255, 50, 0.2) 60%, transparent 100%)"
                          : "transparent",
                        clipPath: "polygon(40% 0%, 60% 0%, 85% 100%, 15% 100%)",
                        filter: "blur(12px)",
                      }}
                    />

                    {/* Partículas de luz flotantes - CORREGIDAS */}
                    {isDarkMode && (
                      <>
                        <div
                          className="absolute w-1 h-1 bg-yellow-300 rounded-full animate-pulse opacity-60"
                          style={{
                            top: "4.5rem",
                            left: "2.5rem",
                            animationDelay: "0s",
                            animationDuration: "2s",
                          }}
                        ></div>
                        <div
                          className="absolute w-0.5 h-0.5 bg-yellow-200 rounded-full animate-pulse opacity-40"
                          style={{
                            top: "5.5rem",
                            right: "2rem",
                            animationDelay: "0.7s",
                            animationDuration: "3s",
                          }}
                        ></div>
                        <div
                          className="absolute w-0.5 h-0.5 bg-yellow-400 rounded-full animate-pulse opacity-50"
                          style={{
                            top: "5rem",
                            left: "3.5rem",
                            animationDelay: "1.4s",
                            animationDuration: "2.5s",
                          }}
                        ></div>
                      </>
                    )}                    
                  </div>
                </div>
              </div>
            </div>
          </div>          
        </div>
        {/* Modal de edición para casos de prueba */}
        {editingTestCase && testPlan && (
        <div className="fixed inset-0 bg-white/80 dark:bg-black/80 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 text-black dark:bg-black/10 dark:text-white backdrop-blur border dark:border-gray-600 rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold">Editar Caso de Prueba {editingTestCase.index + 1}</h3>
              <button className="text-gray-500 hover:text-gray-700" onClick={() => setEditingTestCase(null)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            {editingTestCase.field === "title" && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Título</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-md bg-white/10 text-black dark:bg-black dark:text-white backdrop-blur border dark:border-gray-600"
                  value={editingTestCase.value as string}
                  onChange={(e) => setEditingTestCase({ ...editingTestCase, value: e.target.value })}
                />
              </div>
            )}

            {editingTestCase.field === "priority" && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Prioridad</label>
                <select
                  className="w-full p-2 border rounded-md bg-white/10 text-black dark:bg-black dark:text-white backdrop-blur border dark:border-gray-600"
                  value={editingTestCase.value as string}
                  onChange={(e) => setEditingTestCase({ ...editingTestCase, value: e.target.value })}
                >
                  <option value="Alta">Alta</option>
                  <option value="Media">Media</option>
                  <option value="Baja">Baja</option>
                </select>
              </div>
            )}

            {editingTestCase.field === "type" && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Tipo</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-md bg-white/10 text-black dark:bg-black dark:text-white backdrop-blur border dark:border-gray-600"
                  value={editingTestCase.value as string}
                  onChange={(e) => setEditingTestCase({ ...editingTestCase, value: e.target.value })}
                />
              </div>
            )}

            {editingTestCase.field === "automatable" && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Automatizable</label>
                <select
                  className="w-full p-2 border rounded-md bg-white/10 text-black dark:bg-black dark:text-white backdrop-blur border dark:border-gray-600"
                  value={String(editingTestCase.value)}
                  onChange={(e) => setEditingTestCase({ ...editingTestCase, value: e.target.value })}
                >
                  <option value="true">Sí</option>
                  <option value="false">No</option>
                </select>
              </div>
            )}

            {editingTestCase.field === "preconditions" && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Precondiciones (una por línea)</label>
                <textarea
                  className="w-full p-2 border rounded-md min-h-[150px] bg-white/10 text-black dark:bg-black dark:text-white backdrop-blur border dark:border-gray-600"
                  value={(editingTestCase.value as string[]).join("\n")}
                  onChange={(e) =>
                    setEditingTestCase({ ...editingTestCase, value: e.target.value.split("\n") })
                  }
                />
              </div>
            )}

            {editingTestCase.field === "steps" && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Pasos (uno por línea)</label>
                <textarea
                  className="w-full p-2 border rounded-md min-h-[150px] bg-white/10 text-black dark:bg-black dark:text-white backdrop-blur border dark:border-gray-600"
                  value={(editingTestCase.value as string[]).join("\n")}
                  onChange={(e) =>
                    setEditingTestCase({ ...editingTestCase, value: e.target.value.split("\n") })
                  }
                />
              </div>
            )}

            {editingTestCase.field === "expectedResult" && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Resultado Esperado</label>
                <textarea
                  className="w-full p-2 border rounded-md min-h-[100px] bg-white/10 text-black dark:bg-black dark:text-white backdrop-blur border dark:border-gray-600"
                  value={editingTestCase.value as string}
                  onChange={(e) => setEditingTestCase({ ...editingTestCase, value: e.target.value })}
                />
              </div>
            )}

            <div className="flex justify-end space-x-2">
              <button className="bg-gray-300 text-black px-4 py-2 rounded-md hover:bg-accent-custom_drk hover:dark:bg-six-custom" onClick={() => setEditingTestCase(null)}>
                Cancelar
              </button>
              <button
                className="bg-primary-custom text-white px-4 py-2 rounded-md hover:bg-accent-custom_drk hover:dark:bg-six-custom"
                onClick={() => {
                  handleEditTestCase(
                    editingTestCase.index,
                    editingTestCase.field as keyof TestCase,
                    editingTestCase.value as string | string[] | boolean,
                  )
                  setEditingTestCase(null)
                }}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de detalles del caso de prueba */}
      {activeTestCaseDetails !== null && testPlan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 dark:bg-black/70 p-4 overflow-y-auto">
            <div className="bg-white/10 text-black dark:bg-black/10 dark:text-white backdrop-blur border dark:border-gray-600 rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold">
                  TC-{activeTestCaseDetails + 1}: {testPlan.testCases[activeTestCaseDetails].title}
                </h3>
                <button
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => setActiveTestCaseDetails(null)}
                >
                  <i className="bi bi-x-lg"></i>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="font-semibold mb-2">Prioridad</h4>
                  <span
                    className={`px-2 py-1 rounded text-xs ${testPlan.testCases[activeTestCaseDetails].priority === "Alta"
                      ? "bg-red-100 text-red-800"
                      : testPlan.testCases[activeTestCaseDetails].priority === "Media"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-green-100 text-green-800"
                      }`}
                  >
                    {testPlan.testCases[activeTestCaseDetails].priority}
                  </span>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Tipo</h4>
                  <p>{testPlan.testCases[activeTestCaseDetails].type}</p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Automatizable</h4>
                  <p>{testPlan.testCases[activeTestCaseDetails].automatable ? "Sí" : "No"}</p>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-semibold mb-2">Precondiciones</h4>
                <ul className="list-disc pl-5">
                  {testPlan.testCases[activeTestCaseDetails].preconditions.map((precondition, i) => (
                    <li key={i}>{precondition}</li>
                  ))}
                </ul>
              </div>

              <div className="mb-4">
                <h4 className="font-semibold mb-2">Pasos</h4>
                <ol className="list-decimal pl-5">
                  {testPlan.testCases[activeTestCaseDetails].steps.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              </div>

              <div className="mb-4">
                <h4 className="font-semibold mb-2">Resultado Esperado</h4>
                <p>{testPlan.testCases[activeTestCaseDetails].expectedResult}</p>
              </div>

              <div className="flex justify-end mt-4">
                <button
                  className="bg-primary-custom dark:bg-accent-custom_drk text-white dark:text-black px-4 py-2 rounded-md hover:bg-accent-custom_drk hover:dark:bg-six-custom"
                  onClick={() => {
                    setEditingTestCase({
                      index: activeTestCaseDetails,
                      field: "title",
                      value: testPlan.testCases[activeTestCaseDetails].title,
                    })
                    setActiveTestCaseDetails(null)
                  }}
                >
                  <i className="bi bi-pencil mr-1"></i>
                  Editar Caso de Prueba
                </button>
              </div>
            </div>
          </div>
        )}

          {/* Mensaje de éxito */}
          {emailSent && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
              <div className="bg-green-100 text-green-900 rounded-xl shadow-xl p-6 max-w-md w-[90%] text-center">
                <div className="text-xl font-bold mb-2">📬 ¡Correo enviado!</div>
                <p className="text-green-800">
                  ✅ Tu plan fue enviado correctamente.
                  <br /> ¡Que la calidad te acompañe!
                </p>
                <button
                  onClick={() => setEmailSent(false)}
                  className="mt-4 bg-green-700 text-white py-2 px-6 rounded-md hover:bg-green-800 transition"
                >
                  Cerrar
                </button>
              </div>
            </div>
          )}

        {!testPlan ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 animate-slide-up">
            {/* Formulario de entrada */}
            <div className="bg-white/60 text-black dark:bg-black/60 dark:text-six-custom backdrop-blur border dark:border-black p-6 rounded-lg shadow-lg border border-gray-100">
              <h2 className="bg-white/10 text-black dark:bg-transparent dark:text-six-custom text-xl font-semibold mb-4">Información del Sistema</h2>

              {/* Tipo de aplicación */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Tipo de Aplicación</label>
                <select
                  className="w-full p-2 border rounded-md bg-white/30 text-black dark:bg-black dark:text-primary-custom_drk border dark:border-gray-600"
                  value={applicationType}
                  onChange={(e) => setApplicationType(e.target.value)}
                >
                  <option value="">Selecciona un tipo</option>
                  {applicationTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subtipo de aplicación */}
              {applicationType && (
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Subtipo</label>
                  <select
                    className="w-full p-2 border rounded-md bg-white/10 text-black dark:bg-black dark:text-primary-custom_drk border dark:border-gray-600"
                    value={applicationSubtype}
                    onChange={(e) => setApplicationSubtype(e.target.value)}
                  >
                    <option value="">Selecciona un subtipo</option>
                    {availableSubtypes.map((subtype) => (
                      <option key={subtype} value={subtype}>
                        {subtype}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Características */}
              {applicationSubtype && availableFeatures.length > 0 && (
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Características</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {availableFeatures.map((feature) => (
                      <div key={feature} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`feature-${feature}`}
                          checked={selectedFeatures.includes(feature)}
                          onChange={() => handleFeatureChange(feature)}
                          className="mr-2 bg-white/60 text-black dark:bg-black/60 dark:text-six-custom border dark:border-white"
                        />
                        <label htmlFor={`feature-${feature}`} className="text-sm">
                          {feature}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Descripción del sistema */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Descripción del Sistema (Obligatorio)</label>
                <textarea
                  className="w-full p-2 border rounded-md min-h-[150px] bg-white/10 text-black dark:bg-transparent dark:text-six-custom border dark:border-gray-600"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe el sistema o aplicación para el que necesitas un plan de pruebas..."
                />
              </div>

              {/* Tamaño del equipo */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Tamaño del Equipo</label>
                <input
                  type="number"
                  className="w-full p-2 border rounded-md bg-white/10 text-black dark:bg-transparent dark:text-primary-custom_drk border dark:border-gray-600"
                  value={teamSize}
                  onChange={(e) => setTeamSize(Number.parseInt(e.target.value) || 1)}
                  min="1"
                />
              </div>
            </div>

            {/* Opciones adicionales */}
            <div className="bg-white/60 text-black dark:bg-black/60 dark:text-six-custom backdrop-blur border dark:border-black p-6 rounded-lg shadow-lg border border-gray-100">
              <h2 className="text-xl font-semibold mb-4">Opciones Adicionales</h2>

              {/* Tipos de prueba */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Tipos de Prueba</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    "Funcional",
                    "Rendimiento",
                    "Seguridad",
                    "Usabilidad",
                    "Accesibilidad",
                    "Compatibilidad",
                    "Integración",
                    "Regresión",
                    "Smoke",
                    "Sanity",
                    "Exploratorio",
                    "A/B",
                    "Carga",
                    "Estrés",
                    "Volumen",
                    "Recuperación",
                  ].map((type) => (
                    <div key={type} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`type-${type}`}
                        checked={testTypes.includes(type)}
                        onChange={() => handleTestTypeChange(type)}
                        className="mr-2 bg-white/60 text-black dark:bg-black/60 dark:text-six-custom backdrop-blur border dark:border-gray-600"
                      />
                      <label htmlFor={`type-${type}`} className="text-sm">
                        {type}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Automatización */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Automatización</label>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="automation"
                    checked={automationAllowed}
                    onChange={() => setAutomationAllowed(!automationAllowed)}
                    className="mr-2 bg-white/10 text-black dark:bg-black/10 dark:text-white backdrop-blur border dark:border-gray-600"
                  />
                  <label htmlFor="automation" className="text-sm">
                    Permitir automatización de pruebas
                  </label>
                </div>
              </div>

              {/* Pruebas de rendimiento */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Pruebas de Rendimiento</label>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="performance"
                    checked={performanceTestingAllowed}
                    onChange={() => setPerformanceTestingAllowed(!performanceTestingAllowed)}
                    className="mr-2 bg-white/10 text-black dark:bg-black/10 dark:text-white backdrop-blur border dark:border-gray-600"
                  />
                  <label htmlFor="performance" className="text-sm">
                    Incluir pruebas de rendimiento
                  </label>
                </div>
              </div>

              {/* Botón para generar */}
              <div className="mt-8">
                <button
                  className={`w-full py-2 px-4 rounded-md transition-colors ${isGenerating || !description
                    ? "bg-gray-400 cursor-not-allowed text-black"
                    : "bg-primary-custom dark:bg-accent-custom text-white hover:bg-accent-custom dark:hover:bg-six-custom py-2 px-6 rounded-md transition-colors text-gray-800"
                    }`}
                  onClick={handleGenerateTestPlan}
                  disabled={isGenerating || !description}
                >
                  {isGenerating ? "Generando..." : "Generar Plan de Pruebas"}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white/60 text-black dark:bg-black/60 dark:text-white backdrop-blur rounded-lg shadow-md">
            {/* Pestañas */}
            <div className="border-b bg-white/60 text-black dark:bg-black/60 dark:text-six-custom backdrop-blur">
              <div className="flex overflow-x-auto p-1 sm:p-2 scrollbar-hide">
                {["objectives", "scope", "risks", "testCases", "time", "strategy", "environment"].map((tab) => (
                  <button
                    key={tab}
                    className={`px-2 sm:px-4 py-1 sm:py-2 text-sm sm:text-base font-medium rounded-lg transition-all whitespace-nowrap ${activeTab === tab
                      ? "border-b-4 border-primary-custom dark:border-accent-custom"
                      : "hover:text-accent-custom"
                      }`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab === "objectives" && "Objetivos"}
                    {tab === "scope" && "Alcance"}
                    {tab === "risks" && "Riesgos"}
                    {tab === "testCases" && "Casos de Prueba"}
                    {tab === "time" && "Estimación"}
                    {tab === "strategy" && "Estrategia"}
                    {tab === "environment" && "Entorno"}
                  </button>
                ))}
              </div>
            </div>

            {/* Contenido de las pestañas */}
            <div className="p-6">
              {/* Pestaña de Objetivos */}
              {activeTab === "objectives" && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Objetivos</h2>
                    <button
                      className="btn bg-accent-custom hover:bg-primary-custom_drk text-white p-2 rounded-full shadow-sm"
                      onClick={handleAddObjective}
                      aria-label="Añadir Objetivo"
                    >
                      <i className="bi bi-plus-lg text-lg"></i>
                    </button>
                  </div>
                  <ul className="space-y-2">
                    {testPlan.objectives.map((objective, index) => (
                      <li
                        key={index}
                        className="bg-white/60 text-black dark:bg-black/60 dark:text-six-custom backdrop-blur flex items-start bg-neutral-50 p-2 sm:p-3 rounded-lg border border-neutral-200 hover:shadow-custom transition-shadow"
                      >
                        <span
                          className="bi bi-bullseye text-[var(--thirdColor)]"
                          role="img"
                          aria-label="Icono de éxito"
                        />
                        &nbsp;
                        {editingObjective && editingObjective.index === index ? (
                          <div className="flex-1">
                            <textarea
                              className="w-full p-2 border rounded-md bg-white/10 text-black dark:bg-black/10 dark:text-white backdrop-blur border dark:border-gray-600"
                              value={editingObjective.value}
                              onChange={(e) => setEditingObjective({ index, value: e.target.value })}
                            />
                            <div className="flex mt-2 space-x-2">
                              <button
                                className="bg-primary-custom text-white px-3 py-1 rounded-md text-sm"
                                onClick={() => {
                                  handleEditObjective(index, editingObjective.value)
                                  setEditingObjective(null)
                                }}
                              >
                                Guardar
                              </button>
                              <button 
                                className="bg-gray-300 px-3 py-1 rounded-md text-sm text-black"
                                onClick={() => setEditingObjective(null)}
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex-1 flex justify-between items-start">
                            <span>{objective}</span>
                            <div className="flex space-x-2">
                              <button
                                className="p-1 text-accent-custom_drk hover:text-primary-custom_drk transition-colors"
                                onClick={() => setEditingObjective({ index, value: objective })}
                                aria-label="Editar"
                                title="Editar"
                              >
                                <i className="bi bi-pencil"></i>
                              </button>
                              <button
                                className="p-1 text-primary-custom_drk hover:text-accent-custom transition-colors"
                                onClick={() => handleDeleteObjective(index)}
                                aria-label="Eliminar"
                                title="Eliminar"
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </div>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {/* Pestaña de Alcance */}
              {activeTab === "scope" && (
                <div>
                  <h2 className="text-2xl font-bold mb-4">Alcance</h2>

                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-xl font-semibold">Áreas Incluidas</h3>
                      <button
                        className="btn bg-accent-custom hover:bg-primary-custom_drk text-white p-2 rounded-full shadow-sm"
                        onClick={handleAddIncludedScope}
                        aria-label="Añadir Área Incluida"
                      >
                        <i className="bi bi-plus-lg text-lg"></i>
                      </button>
                    </div>
                    <ul className="space-y-2">
                      {testPlan.scope.included.map((item, index) => (
                        <li
                          key={index}
                          className="bg-white/60 text-black dark:bg-black/60 dark:text-six-custom backdrop-blur flex items-start bg-neutral-50 p-2 sm:p-3 rounded-lg border border-neutral-200 hover:shadow-custom transition-shadow"
                        >
                          <span
                            className="bi bi-diagram-3 text-[var(--thirdColor)]"
                            role="img"
                            aria-label="Icono de éxito"
                          />
                          &nbsp;
                          {editingIncludedScope && editingIncludedScope.index === index ? (
                            <div className="flex-1">
                              <textarea
                                className="bg-white/10 text-black dark:bg-black/10 dark:text-white backdrop-blur border dark:border-gray-600 w-full p-2 border rounded-md"
                                value={editingIncludedScope.value}
                                onChange={(e) => setEditingIncludedScope({ index, value: e.target.value })}
                              />
                              <div className="flex mt-2 space-x-2">
                                <button
                                  className="bg-primary-custom text-white px-3 py-1 rounded-md text-sm"
                                  onClick={() => {
                                    handleEditIncludedScope(index, editingIncludedScope.value)
                                    setEditingIncludedScope(null)
                                  }}
                                >
                                  Guardar
                                </button>
                                <button
                                  className="bg-gray-300 px-3 py-1 rounded-md text-sm text-black"
                                  onClick={() => setEditingIncludedScope(null)}
                                >
                                  Cancelar
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex-1 flex justify-between items-start">
                              <span>{item}</span>
                              <div className="flex space-x-2">
                                <button
                                  className="p-1 text-accent-custom_drk hover:text-primary-custom_drk transition-colors"
                                  onClick={() => setEditingIncludedScope({ index, value: item })}
                                  aria-label="Editar"
                                  title="Editar"
                                >
                                  <i className="bi bi-pencil"></i>
                                </button>
                                <button
                                  className="p-1 text-primary-custom_drk hover:text-accent-custom transition-colors"
                                  onClick={() => handleDeleteIncludedScope(index)}
                                  aria-label="Eliminar"
                                  title="Eliminar"
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                              </div>
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-xl font-semibold">Áreas Excluidas</h3>
                      <button
                        className="btn bg-accent-custom hover:bg-primary-custom_drk text-white p-2 rounded-full shadow-sm"
                        onClick={handleAddExcludedScope}
                        aria-label="Añadir Área Excluida"
                      >
                        <i className="bi bi-plus-lg text-lg"></i>
                      </button>
                    </div>
                    <ul className="space-y-2">
                      {testPlan.scope.excluded.map((item, index) => (
                        <li
                          key={index}
                          className="bg-white/60 text-black dark:bg-black/60 dark:text-six-custom backdrop-blur flex items-start bg-neutral-50 p-2 sm:p-3 rounded-lg border border-neutral-200 hover:shadow-custom transition-shadow"
                        >
                          <span
                            className="bi bi-arrows-fullscreen text-[var(--thirdColor)]"
                            role="img"
                            aria-label="Icono de éxito"
                          />
                          &nbsp;

                          {editingExcludedScope && editingExcludedScope.index === index ? (
                            <div className="flex-1">
                              <textarea
                                className="w-full p-2 border rounded-md bg-white/10 text-black dark:bg-black/10 dark:text-white backdrop-blur border dark:border-gray-600"
                                value={editingExcludedScope.value}
                                onChange={(e) => setEditingExcludedScope({ index, value: e.target.value })}
                              />
                              <div className="flex mt-2 space-x-2">
                                <button
                                  className="bg-primary-custom text-white px-3 py-1 rounded-md text-sm"
                                  onClick={() => {
                                    handleEditExcludedScope(index, editingExcludedScope.value)
                                    setEditingExcludedScope(null)
                                  }}
                                >
                                  Guardar
                                </button>
                                <button
                                  className="bg-gray-300 px-3 py-1 rounded-md text-sm text-black backdrop-blur"
                                  onClick={() => setEditingExcludedScope(null)}
                                >
                                  Cancelar
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex-1 flex justify-between items-start">
                              <span>{item}</span>
                              <div className="flex space-x-2">
                                <button
                                  className="p-1 text-accent-custom_drk hover:text-primary-custom_drk transition-colors"
                                  onClick={() => setEditingExcludedScope({ index, value: item })}
                                  aria-label="Editar"
                                  title="Editar"
                                >
                                  <i className="bi bi-pencil"></i>
                                </button>
                                <button
                                  className="p-1 text-primary-custom_drk hover:text-accent-custom transition-colors"
                                  onClick={() => handleDeleteExcludedScope(index)}
                                  aria-label="Eliminar"
                                  title="Eliminar"
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                              </div>
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
              {/* Pestaña de Riesgos */}
              {activeTab === "risks" && (
                <div>
                  <SectionHeader title="Riesgos" onAdd={handleAddRisk} addLabel="Añadir Riesgo"/>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border p-2 bg-white/60 text-black dark:bg-black dark:text-six-custom backdrop-blur border dark:border-white text-center">#</th>
                          <th className="border p-2 bg-white/60 text-black dark:bg-black dark:text-six-custom backdrop-blur border dark:border-white text-center">Descripción</th>
                          <th className="border p-2 bg-white/60 text-black dark:bg-black dark:text-six-custom backdrop-blur border dark:border-white text-center">Impacto</th>
                          <th className="border p-2 bg-white/60 text-black dark:bg-black dark:text-six-custom backdrop-blur border dark:border-white text-center">Probabilidad</th>
                          <th className="border p-2 bg-white/60 text-black dark:bg-black dark:text-six-custom backdrop-blur border dark:border-white text-center">Mitigación</th>
                          <th className="border p-2 bg-white/60 text-black dark:bg-black dark:text-six-custom backdrop-blur border dark:border-white text-center">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {testPlan.risks.map((risk, index) => (
                          <tr key={index} className={index % 2 === 0 ? "bg-white/60 text-black dark:bg-black/10 dark:text-six-custom backdrop-blur" : "bg-gray-50 text-black dark:bg-black/10 dark:text-six-custom backdrop-blur"}>
                            <td className="border p-2 bg-white/60 text-black dark:bg-black/10 dark:text-six-custom backdrop-blur border dark:border-white">{index + 1}</td>
                            <td className="border p-2 bg-white/60 text-black dark:bg-black/10 dark:text-six-custom backdrop-blur border dark:border-white">
                              {editingRisk && editingRisk.index === index && editingRisk.field === "description" ? (
                                <div>
                                  <textarea
                                    className="w-full p-1 border rounded bg-white/60 text-black dark:bg-black/60 dark:text-white backdrop-blur border dark:border-gray-600"
                                    value={editingRisk.value}
                                    onChange={(e) => setEditingRisk({ ...editingRisk, value: e.target.value })}
                                  />
                                  <div className="flex mt-2 space-x-2">
                                    <button
                                      className="bg-primary-custom text-white px-2 py-1 rounded text-xs"
                                      onClick={() => {
                                        handleEditRisk(index, editingRisk.field as keyof Risk, editingRisk.value)
                                        setEditingRisk(null)
                                      }}
                                    >
                                      Guardar
                                    </button>
                                    <button
                                      className="bg-gray-300 px-3 py-1 rounded-md text-sm text-black"
                                      onClick={() => setEditingRisk(null)}
                                    >
                                      Cancelar
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex justify-between items-start">
                                  <span>{risk.description}</span>
                                  <button
                                    className="p-1 text-accent-custom_drk hover:text-primary-custom_drk transition-colors"
                                    onClick={() =>
                                      setEditingRisk({ index, field: "description", value: risk.description })
                                    }
                                    aria-label="Editar descripción"
                                  >
                                    <i className="bi bi-pencil" title="Editar"></i>
                                  </button>
                                </div>
                              )}
                            </td>
                            <td className="border p-2 bg-white/60 text-black dark:bg-black/60 dark:text-six-custom backdrop-blur border dark:border-white">
                              {editingRisk && editingRisk.index === index && editingRisk.field === "impact" ? (
                                <div>
                                  <select
                                    className="w-full p-1 border rounded bg-white/60 text-black dark:bg-black dark:text-white backdrop-blur border dark:border-gray-600"
                                    value={editingRisk.value}
                                    onChange={(e) => setEditingRisk({ ...editingRisk, value: e.target.value })}
                                  >
                                    <option value="Alto">Alto</option>
                                    <option value="Medio">Medio</option>
                                    <option value="Bajo">Bajo</option>
                                  </select>
                                  <div className="flex mt-2 space-x-2">
                                    <button
                                      className="bg-primary-custom text-white px-2 py-1 rounded text-xs"
                                      onClick={() => {
                                        handleEditRisk(index, editingRisk.field as keyof Risk, editingRisk.value)
                                        setEditingRisk(null)
                                      }}
                                    >
                                      Guardar
                                    </button>
                                    <button
                                      className="bg-gray-300 px-2 py-1 rounded text-xs text-black"
                                      onClick={() => setEditingRisk(null)}
                                    >
                                      Cancelar
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex justify-between items-center">
                                  <span
                                    className={`px-2 py-1 rounded text-xs ${risk.impact === "Alto"
                                      ? "bg-red-100 text-red-800"
                                      : risk.impact === "Medio"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-green-100 text-green-800"
                                      }`}
                                  >
                                    {risk.impact}
                                  </span>
                                  <button
                                    className="p-1 text-accent-custom_drk hover:text-primary-custom_drk transition-colors"
                                    onClick={() => setEditingRisk({ index, field: "impact", value: risk.impact })}
                                    aria-label="Editar impacto"
                                    title="Editar"
                                  >
                                    <i className="bi bi-pencil"></i>
                                  </button>
                                </div>
                              )}
                            </td>
                            <td className="border p-2 bg-white/60 text-black dark:bg-black/60 dark:text-six-custom backdrop-blur border dark:border-white">
                              {editingRisk && editingRisk.index === index && editingRisk.field === "probability" ? (
                                <div>
                                  <select
                                    className="w-full p-1 border rounded bg-white/60 text-black dark:bg-black dark:text-white backdrop-blur border dark:border-gray-600"
                                    value={editingRisk.value}
                                    onChange={(e) => setEditingRisk({ ...editingRisk, value: e.target.value })}
                                  >
                                    <option value="Alta">Alta</option>
                                    <option value="Media">Media</option>
                                    <option value="Baja">Baja</option>
                                  </select>
                                  <div className="flex mt-2 space-x-2">
                                    <button
                                      className="bg-primary-custom text-white px-2 py-1 rounded text-xs"
                                      onClick={() => {
                                        handleEditRisk(index, editingRisk.field as keyof Risk, editingRisk.value)
                                        setEditingRisk(null)
                                      }}
                                    >
                                      Guardar
                                    </button>
                                    <button
                                      className="bg-gray-300 px-2 py-1 rounded text-xs text-black"
                                      onClick={() => setEditingRisk(null)}
                                    >
                                      Cancelar
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex justify-between items-center">
                                  <span
                                    className={`px-2 py-1 rounded text-xs ${risk.probability === "Alta"
                                      ? "bg-red-100 text-red-800"
                                      : risk.probability === "Media"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-green-100 text-green-800"
                                      }`}
                                  >
                                    {risk.probability}
                                  </span>
                                  <button
                                    className="p-1 text-accent-custom_drk hover:text-primary-custom_drk transition-colors"
                                    onClick={() =>
                                      setEditingRisk({ index, field: "probability", value: risk.probability })
                                    }
                                    aria-label="Editar probabilidad"
                                    title="Editar"
                                  >
                                    <i className="bi bi-pencil"></i>
                                  </button>
                                </div>
                              )}
                            </td>
                            <td className="border p-2 bg-white/60 text-black dark:bg-black/60 dark:text-six-custom backdrop-blur border dark:border-white">
                              {editingRisk && editingRisk.index === index && editingRisk.field === "mitigation" ? (
                                <div>
                                  <textarea
                                    className="w-full p-1 border rounded bg-white/10 text-black dark:bg-black/10 dark:text-white backdrop-blur border dark:border-gray-600"
                                    value={editingRisk.value}
                                    onChange={(e) => setEditingRisk({ ...editingRisk, value: e.target.value })}
                                  />
                                  <div className="flex mt-2 space-x-2">
                                    <button
                                      className="bg-primary-custom text-white px-2 py-1 rounded text-xs"
                                      onClick={() => {
                                        handleEditRisk(index, editingRisk.field as keyof Risk, editingRisk.value)
                                        setEditingRisk(null)
                                      }}
                                    >
                                      Guardar
                                    </button>
                                    <button
                                      className="bg-gray-300 px-2 py-1 rounded text-xs text-black"
                                      onClick={() => setEditingRisk(null)}
                                    >
                                      Cancelar
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex justify-between items-start">
                                  <span>{risk.mitigation}</span>
                                  <button
                                    className="p-1 text-accent-custom_drk hover:text-primary-custom_drk transition-colors"
                                    onClick={() => setEditingRisk({ index, field: "mitigation", value: risk.mitigation })}
                                    aria-label="Editar mitigación"
                                    title="Editar"
                                  >
                                    <i className="bi bi-pencil"></i>
                                  </button>
                                </div>
                              )}
                            </td>
                            <td className="border p-2 bg-white/60 text-black dark:bg-black/60 dark:text-six-custom backdrop-blur border dark:border-white text-center">
                              <button
                                className="p-1 text-primary-custom_drk hover:text-accent-custom transition-colors"
                                onClick={() => handleDeleteRisk(index)}
                                aria-label="Eliminar"
                                title="Eliminar"
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              {/* Pestaña de Casos de Prueba */}
              {activeTab === "testCases" && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Casos de Prueba</h2>
                    <div className="flex space-x-2">
                      <ActionButton
                        type="add"
                        onClick={handleAddTestCase}
                        label="Añadir Caso de Prueba"
                        className="mr-2 btn bg-accent-custom hover:bg-primary-custom_drk text-white p-2 rounded-full shadow-sm"
                      />
                      <div className="flex">
                        <button
                          className={`px-3 py-1 rounded-l ${viewMode === "cards" ? "bg-primary-custom dark:bg-accent-custom text-white" : "bg-black-200"}`}
                          onClick={() => setViewMode("cards")}
                        >
                          <i className="bi bi-grid mr-1"></i>
                          <span className="hidden sm:inline">Tarjetas</span>
                        </button>
                        <button
                          className={`px-3 py-1 rounded-r ${viewMode === "table" ? "bg-primary-custom dark:bg-accent-custom text-white" : "bg-black-200"}`}
                          onClick={() => setViewMode("table")}
                        >
                          <i className="bi bi-table mr-1"></i>
                          <span className="hidden sm:inline">Tabla</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Vista de Tarjetas */}
                  {viewMode === "cards" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {testPlan.testCases.map((testCase, index) => (
                        <div
                          key={index}
                          className="border rounded-lg p-4 bg-white/10 text-black dark:bg-gray-800/40 dark:text-six-custom backdrop-blur dark:border-gray-600 shadow-md hover:shadow-lg transition-shadow"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold">
                              TC-{index + 1}: {testCase.title}
                            </h3>
                            <span
                              className={`px-2 py-1 rounded text-xs ${testCase.priority === "Alta"
                                ? "bg-red-100 text-red-800"
                                : testCase.priority === "Media"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-green-100 text-green-800"
                                }`}
                            >
                              {testCase.priority}
                            </span>
                          </div>

                          <div className="mb-2">
                            <p className="text-sm font-medium">Tipo: {testCase.type}</p>
                            <p className="text-sm">Automatizable: {testCase.automatable ? "Sí" : "No"}</p>
                          </div>

                          <div className="mb-2">
                            <p className="text-sm font-medium">Precondiciones:</p>
                            <ul className="list-disc pl-5 text-sm">
                              {testCase.preconditions.map((precondition, i) => (
                                <li key={i}>{precondition}</li>
                              ))}
                            </ul>
                          </div>

                          <div className="mb-2">
                            <p className="text-sm font-medium">Pasos:</p>
                            <ol className="list-decimal pl-5 text-sm">
                              {testCase.steps.map((step, i) => (
                                <li key={i}>{step}</li>
                              ))}
                            </ol>
                          </div>

                          <div className="mb-2">
                            <p className="text-sm font-medium">Resultado Esperado:</p>
                            <p className="text-sm">{testCase.expectedResult}</p>
                          </div>

                          <div className="mt-2 flex flex-wrap gap-2">
                            <button
                              className="text-primary-custom dark:text-accent-custom hover:bg-accent-custom hover:text-white dark:hover:text-white text-xs border border-primary-custom px-2 py-1 rounded dark:border-second_custome"
                              onClick={() => {
                                setEditingTestCase({
                                  index,
                                  field: "title",
                                  value: testCase.title,
                                })
                              }}
                            >
                              <i className="bi bi-pencil mr-1"></i>Título
                            </button>

                            <button
                              className="text-primary-custom dark:text-accent-custom hover:bg-accent-custom hover:text-white dark:hover:text-white text-xs border border-primary-custom px-2 py-1 rounded dark:border-second_custome"
                              onClick={() => {
                                setEditingTestCase({
                                  index,
                                  field: "type",
                                  value: testCase.type,
                                })
                              }}
                            >
                              <i className="bi bi-pencil mr-1"></i>Tipo
                            </button>
                            <button
                              className="text-primary-custom dark:text-accent-custom hover:bg-accent-custom hover:text-white dark:hover:text-white text-xs border border-primary-custom px-2 py-1 rounded dark:border-second_custome"
                              onClick={() => {
                                setEditingTestCase({
                                  index,
                                  field: "automatable",
                                  value: String(testCase.automatable),
                                })
                              }}
                            >
                              <i className="bi bi-pencil mr-1"></i>Automatizable
                            </button>

                            <button
                              className="text-primary-custom dark:text-accent-custom hover:bg-accent-custom hover:text-white dark:hover:text-white text-xs border border-primary-custom px-2 py-1 rounded dark:border-second_custome"
                              onClick={() => {
                                setEditingTestCase({
                                  index,
                                  field: "priority",
                                  value: testCase.priority,
                                })
                              }}
                            >
                              <i className="bi bi-pencil mr-1"></i>Prioridad
                            </button>
                            <button
                              className="text-primary-custom dark:text-accent-custom hover:bg-accent-custom hover:text-white dark:hover:text-white text-xs border border-primary-custom px-2 py-1 rounded dark:border-second_custome"
                              onClick={() => {
                                setEditingTestCase({
                                  index,
                                  field: "preconditions",
                                  value: testCase.preconditions,
                                })
                              }}
                            >
                              <i className="bi bi-pencil mr-1"></i>Precondiciones
                            </button>
                            <button
                              className="text-primary-custom dark:text-accent-custom hover:bg-accent-custom hover:text-white dark:hover:text-white text-xs border border-primary-custom px-2 py-1 rounded dark:border-second_custome"
                              onClick={() => {
                                setEditingTestCase({
                                  index,
                                  field: "steps",
                                  value: testCase.steps,
                                })
                              }}
                            >
                              <i className="bi bi-pencil mr-1"></i>Pasos
                            </button>
                            <button
                              className="text-primary-custom dark:text-accent-custom hover:bg-accent-custom hover:text-white dark:hover:text-white text-xs border border-primary-custom px-2 py-1 rounded dark:border-second_custome"
                              onClick={() => {
                                setEditingTestCase({
                                  index,
                                  field: "expectedResult",
                                  value: testCase.expectedResult,
                                })
                              }}
                            >
                              <i className="bi bi-pencil mr-1"></i>Resultado
                            </button>
                            <button
                              className="hover:text-white hover:bg-accent-custom text-xs px-2 py-1 rounded"
                              onClick={() => handleDeleteTestCase(index)}
                              title="Eliminar"
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Vista de Tabla */}
                  {viewMode === "table" && (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="border p-2 bg-white/60 text-black dark:bg-black dark:text-six-custom backdrop-blur border dark:border-white text-center">#</th>
                            <th className="border p-2 bg-white/60 text-black dark:bg-black dark:text-six-custom backdrop-blur border dark:border-white text-center">Título</th>
                            <th className="border p-2 bg-white/60 text-black dark:bg-black dark:text-six-custom backdrop-blur border dark:border-white text-center">Prioridad</th>
                            <th className="border p-2 bg-white/60 text-black dark:bg-black dark:text-six-custom backdrop-blur border dark:border-white text-center">Tipo</th>
                            <th className="border p-2 bg-white/60 text-black dark:bg-black dark:text-six-custom backdrop-blur border dark:border-white text-center">Automatizable</th>
                            <th className="border p-2 bg-white/60 text-black dark:bg-black dark:text-six-custom backdrop-blur border dark:border-white text-center">Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {testPlan.testCases.map((testCase, index) => (
                            <tr key={index} className={index % 2 === 0 ? "bg-white/60 text-black dark:bg-black/10 dark:text-six-custom backdrop-blur" : "bg-gray-50 text-black dark:bg-black/10 dark:text-six-custom backdrop-blur"}>
                              <td className="border p-2 bg-white/60 text-black dark:bg-black/10 dark:text-six-custom backdrop-blur border dark:border-white">TC-{index + 1}</td>
                              <td className="border p-2 bg-white/60 text-black dark:bg-black/10 dark:text-six-custom backdrop-blur border dark:border-white" title={testCase.title}>
                                {testCase.title}
                              </td>
                              <td className="border p-2 bg-white/60 text-black dark:bg-black/10 dark:text-six-custom backdrop-blur border dark:border-white">
                                <span
                                  className={`px-2 py-1 rounded text-xs ${testCase.priority === "Alta"
                                    ? "bg-red-100 text-red-800"
                                    : testCase.priority === "Media"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-green-100 text-green-800"
                                    }`}
                                >
                                  {testCase.priority}
                                </span>
                              </td>
                              <td className="border p-2 bg-white/60 text-black dark:bg-black/10 dark:text-six-custom backdrop-blur border dark:border-white">{testCase.type}</td>
                              <td className="border p-2 bg-white/60 text-black dark:bg-black/10 dark:text-six-custom backdrop-blur border dark:border-white">{testCase.automatable ? "Sí" : "No"}</td>
                              <td className="border p-2 bg-white/60 text-black dark:bg-black/10 dark:text-six-custom backdrop-blur border dark:border-white">
                                <div className="flex space-x-2">
                                  <button
                                    className="text-primary-custom dark:text-accent-custom hover:bg-accent-custom hover:text-white dark:hover:text-white text-xs px-2 py-1 rounded text-sm flex items-center"
                                    onClick={() => setActiveTestCaseDetails(index)}
                                  >
                                    <i className="bi bi-eye mr-1"></i>
                                  </button>
                                  <button
                                    className="text-primary-custom dark:text-accent-custom hover:bg-accent-custom hover:text-white dark:hover:text-white text-xs px-2 py-1 rounded text-sm flex items-center"
                                    onClick={() => {
                                      setEditingTestCase({
                                        index,
                                        field: "title",
                                        value: testCase.title,
                                      })
                                    }}
                                  >
                                    <i className="bi bi-pencil mr-1"></i>
                                  </button>
                                  <button
                                    className="text-primary-custom dark:text-accent-custom hover:bg-accent-custom hover:text-white dark:hover:text-white text-xs px-2 py-1 rounded text-sm flex items-center"
                                    onClick={() => handleDeleteTestCase(index)}
                                  >
                                    <i className="bi bi-trash mr-1"></i>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
              {/* Pestaña de Estimación de Tiempos */}
              {activeTab === "time" && (
                <div>
                  <SectionHeader
                    title="Estimación de Tiempos"
                    onAdd={handleAddTimeEstimationPhase}
                    addLabel="Añadir Fase"
                  />

                  <div className="overflow-x-auto mb-6">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border p-2 bg-white/60 text-black dark:bg-black dark:text-six-custom backdrop-blur border dark:border-white text-center">#</th>
                          <th className="border p-2 bg-white/60 text-black dark:bg-black dark:text-six-custom backdrop-blur border dark:border-white text-center">Fase</th>
                          <th className="border p-2 bg-white/60 text-black dark:bg-black dark:text-six-custom backdrop-blur border dark:border-white text-center">Duración (días)</th>
                          <th className="border p-2 bg-white/60 text-black dark:bg-black dark:text-six-custom backdrop-blur border dark:border-white text-center">Recursos</th>
                          <th className="border p-2 bg-white/60 text-black dark:bg-black dark:text-six-custom backdrop-blur border dark:border-white text-center">Justificación</th>
                          <th className="border p-2 bg-white/60 text-black dark:bg-black dark:text-six-custom backdrop-blur border dark:border-white text-center">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {testPlan.timeEstimation.phases.map((phase, index) => (
                          <tr key={index} className={index % 2 === 0 ? "bg-white/60 text-black dark:bg-black/10 dark:text-six-custom backdrop-blur" : "bg-gray-50 text-black dark:bg-black/10 dark:text-six-custom backdrop-blur"}>
                            <td className="border p-2 bg-white/60 text-black dark:bg-black/10 dark:text-six-custom backdrop-blur border dark:border-white">{index + 1}</td>
                            <td className="border p-2 bg-white/60 text-black dark:bg-black/10 dark:text-six-custom backdrop-blur border dark:border-white">
                              {editingTimeEstimation &&
                                editingTimeEstimation.index === index &&
                                editingTimeEstimation.field === "name" ? (
                                <div>
                                  <input
                                    type="text"
                                    className="w-full p-1 border rounded bg-white/10 text-black dark:bg-black dark:text-white backdrop-blur border dark:border-gray-600"
                                    value={editingTimeEstimation.value as string}
                                    onChange={(e) =>
                                      setEditingTimeEstimation({ ...editingTimeEstimation, value: e.target.value })
                                    }
                                  />
                                  <div className="flex mt-2 space-x-2">
                                    <button
                                      className="bg-primary-custom text-white px-2 py-1 rounded text-xs"
                                      onClick={() => {
                                        handleEditTimeEstimation(
                                          index,
                                          editingTimeEstimation.field,
                                          editingTimeEstimation.value,
                                        )
                                        setEditingTimeEstimation(null)
                                      }}
                                    >
                                      Guardar
                                    </button>
                                    <button
                                      className="bg-gray-300 text-black px-2 py-1 rounded text-xs"
                                      onClick={() => setEditingTimeEstimation(null)}
                                    >
                                      Cancelar
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex justify-between items-center">
                                  <span>{phase.name}</span>
                                  <button
                                    className="p-1 text-accent-custom_drk hover:text-primary-custom_drk transition-colors"
                                    onClick={() => setEditingTimeEstimation({ index, field: "name", value: phase.name })}
                                    aria-label="Editar nombre"
                                    title="Editar"
                                  >
                                    <i className="bi bi-pencil"></i>
                                  </button>
                                </div>
                              )}
                            </td>
                            <td className="border p-2 bg-white/60 text-black dark:bg-black/10 dark:text-six-custom backdrop-blur border dark:border-white">
                              {editingTimeEstimation &&
                                editingTimeEstimation.index === index &&
                                editingTimeEstimation.field === "duration" ? (
                                <div>
                                  <input
                                    type="number"
                                    className="w-full p-1 border rounded bg-white dark:bg-black"
                                    value={editingTimeEstimation.value as number}
                                    onChange={(e) =>
                                      setEditingTimeEstimation({
                                        ...editingTimeEstimation,
                                        value: Number(e.target.value),
                                      })
                                    }
                                    min="1"
                                  />
                                  <div className="flex mt-2 space-x-2">
                                    <button
                                      className="bg-primary-custom text-white px-2 py-1 rounded text-xs"
                                      onClick={() => {
                                        handleEditTimeEstimation(
                                          index,
                                          editingTimeEstimation.field,
                                          editingTimeEstimation.value,
                                        )
                                        setEditingTimeEstimation(null)
                                      }}
                                    >
                                      Guardar
                                    </button>
                                    <button
                                      className="bg-gray-300 px-2 py-1 rounded text-xs text-black"
                                      onClick={() => setEditingTimeEstimation(null)}
                                    >
                                      Cancelar
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex justify-between items-center">
                                  <span>{phase.duration}</span>
                                  <button
                                    className="p-1 text-accent-custom_drk hover:text-primary-custom_drk transition-colors"
                                    onClick={() =>
                                      setEditingTimeEstimation({ index, field: "duration", value: phase.duration })
                                    }
                                    aria-label="Editar duración"
                                  >
                                    <i className="bi bi-pencil"></i>
                                  </button>
                                </div>
                              )}
                            </td>
                            <td className="border p-2 bg-white/60 text-black dark:bg-black/10 dark:text-six-custom backdrop-blur border dark:border-white">
                              {editingTimeEstimation &&
                                editingTimeEstimation.index === index &&
                                editingTimeEstimation.field === "resources" ? (
                                <div>
                                  <input
                                    type="text"
                                    className="w-full p-1 border rounded bg-white/10 text-black dark:bg-black dark:text-white backdrop-blur border dark:border-white"
                                    value={editingTimeEstimation.value as string}
                                    onChange={(e) =>
                                      setEditingTimeEstimation({ ...editingTimeEstimation, value: e.target.value })
                                    }
                                  />
                                  <div className="flex mt-2 space-x-2">
                                    <button
                                      className="bg-primary-custom text-white px-2 py-1 rounded text-xs"
                                      onClick={() => {
                                        handleEditTimeEstimation(
                                          index,
                                          editingTimeEstimation.field,
                                          editingTimeEstimation.value,
                                        )
                                        setEditingTimeEstimation(null)
                                      }}
                                    >
                                      Guardar
                                    </button>
                                    <button
                                      className="bg-gray-300 px-2 py-1 rounded text-xs text-black"
                                      onClick={() => setEditingTimeEstimation(null)}
                                    >
                                      Cancelar
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex justify-between items-start">
                                  <span>{phase.resources}</span>
                                  <button
                                    className="p-1 text-accent-custom_drk hover:text-primary-custom_drk transition-colors"
                                    onClick={() =>
                                      setEditingTimeEstimation({ index, field: "resources", value: phase.resources })
                                    }
                                    aria-label="Editar recursos"
                                  >
                                    <i className="bi bi-pencil"></i>
                                  </button>
                                </div>
                              )}
                            </td>
                            <td className="border p-2 bg-white/60 text-black dark:bg-black dark:text-six-custom backdrop-blur border dark:border-white">
                              {editingTimeEstimation &&
                                editingTimeEstimation.index === index &&
                                editingTimeEstimation.field === "justification" ? (
                                <div>
                                  <textarea
                                    className="w-full p-1 border rounded bg-white/10 text-black dark:bg-black dark:text-white backdrop-blur border dark:border-gray-600"
                                    value={editingTimeEstimation.value as string}
                                    onChange={(e) =>
                                      setEditingTimeEstimation({ ...editingTimeEstimation, value: e.target.value })
                                    }
                                  />
                                  <div className="flex mt-2 space-x-2">
                                    <button
                                      className="bg-primary-custom text-white px-2 py-1 rounded text-xs"
                                      onClick={() => {
                                        handleEditTimeEstimation(
                                          index,
                                          editingTimeEstimation.field,
                                          editingTimeEstimation.value,
                                        )
                                        setEditingTimeEstimation(null)
                                      }}
                                    >
                                      Guardar
                                    </button>
                                    <button
                                      className="bg-gray-300 px-2 py-1 rounded text-xs text-black"
                                      onClick={() => setEditingTimeEstimation(null)}
                                    >
                                      Cancelar
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex justify-between items-start">
                                  <span>{phase.justification}</span>
                                  <button
                                    className="p-1 text-accent-custom_drk hover:text-primary-custom_drk transition-colors"
                                    onClick={() =>
                                      setEditingTimeEstimation({
                                        index,
                                        field: "justification",
                                        value: phase.justification,
                                      })
                                    }
                                    aria-label="Editar justificación"
                                  >
                                    <i className="bi bi-pencil"></i>
                                  </button>
                                </div>
                              )}
                            </td>
                            <td className="border p-2 bg-white/60 text-black dark:bg-black/60 dark:text-six-custom backdrop-blur border dark:border-white text-center">
                              {!(editingTimeEstimation && editingTimeEstimation.index === index) && (
                                <button
                                  className="p-1 hover:text-accent-custom transition-colors"
                                  onClick={() => handleDeleteTimeEstimationPhase(index)}
                                  aria-label="Eliminar"
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-gray-100 bg-white/10 text-black dark:bg-black dark:text-white backdrop-blur border dark:border-white">
                          <td colSpan={2} className="border p-2 text-right font-bold bg-white/10 text-black dark:bg-black/10 dark:text-white backdrop-blur border dark:border-white">
                            Tiempo total estimado:
                          </td>
                          <td colSpan={3} className="border p-2 bg-white/60 text-black dark:bg-black/10 dark:text-six-custom backdrop-blur border dark:border-white">
                            {testPlan.timeEstimation.totalDays} días
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  <div className="bg-white/10 text-black dark:bg-black dark:text-six-custom backdrop-blur">
                    <SectionHeader
                      title="Factores Considerados"
                      onAdd={handleAddTimeEstimationFactor}
                      addLabel="Añadir Factor"
                    />
                    <ul className="space-y-2">
                      
                      {testPlan.timeEstimation.factors.map((factor, index) => (
                        <ListItem
                        
                          key={index}
                          onEdit={() => setEditingTimeEstimationFactor({ index, value: factor })}
                          onDelete={() => handleDeleteTimeEstimationFactor(index)}
                          icon="bi-check-circle"
                          iconColor="text-accent-custom"
                        >
                          {editingTimeEstimationFactor && editingTimeEstimationFactor.index === index ? (
                            <div className="flex-1">
                              <textarea
                                className="w-full p-2 border rounded-md bg-white/10 text-black dark:bg-black dark:text-white backdrop-blur border dark:border-gray-600"
                                value={editingTimeEstimationFactor.value}
                                onChange={(e) => setEditingTimeEstimationFactor({ index, value: e.target.value })}
                              />
                              <div className="flex mt-2 space-x-2">
                                <button
                                  className="bg-primary-custom text-white px-3 py-1 rounded-md text-sm"
                                  onClick={() => {
                                    handleEditTimeEstimationFactor(index, editingTimeEstimationFactor.value)
                                    setEditingTimeEstimationFactor(null)
                                  }}
                                >
                                  Guardar
                                </button>
                                <button
                                  className="bg-gray-300 px-3 py-1 rounded-md text-sm text-black"
                                  onClick={() => setEditingTimeEstimationFactor(null)}
                                >
                                  Cancelar
                                </button>
                              </div>
                            </div>
                          ) : (
                            factor
                          )}
                        </ListItem>
                      ))}
                      
                    </ul>
                  </div>
                </div>
              )}
              {activeTab === "strategy" && (
                <div>
                  <h2 className="text-2xl font-bold mb-4">Estrategia de Prueba</h2>

                  <div className="mb-6">
                    <h3 className="text-xl font-semibold mb-2">Enfoque General</h3>
                    {editingStrategy && editingStrategy.field === "approach" ? (
                      <div>
                        <textarea
                          className="w-full p-2 border rounded-md bg-white/10 text-black dark:bg-black dark:text-white backdrop-blur border dark:border-gray-600"
                          value={editingStrategy.value}
                          onChange={(e) => setEditingStrategy({ field: "approach", value: e.target.value })}
                          rows={5}
                        />
                        <div className="flex mt-2 space-x-2">
                          <button
                            className="bg-primary-custom text-white px-3 py-1 rounded-md text-sm"
                            onClick={() => {
                              handleEditStrategy("approach", editingStrategy.value)
                              setEditingStrategy(null)
                            }}
                          >
                            Guardar
                          </button>
                          <button
                            className="bg-gray-300 px-3 py-1 rounded-md text-sm text-black"
                            onClick={() => setEditingStrategy(null)}
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-start">
                        <p className="text-gray-700 dark:text-primary-custom_drk">{testPlan.strategy.approach}</p>
                        <button
                          className="p-1 text-accent-custom_drk hover:text-primary-custom_drk transition-colors"
                          onClick={() => setEditingStrategy({ field: "approach", value: testPlan.strategy.approach })}
                          aria-label="Editar Enfoque"
                          title="Editar"
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="mb-6">
                    <SectionHeader
                      title="Técnicas de Prueba"
                      onAdd={handleAddStrategyTechnique}
                      addLabel="Añadir Técnica"
                    />
                    <div className="space-y-4">
                      {testPlan.strategy.techniques.map((technique, index) => (
                        <div key={index} className="border rounded-lg p-4 bg-white/10 text-black dark:bg-black dark:text-white backdrop-blur border dark:border-gray-600 shadow-sm">
                          {/* Nombre de la técnica */}
                          <div className="mb-3">
                            {editingStrategyTechnique &&
                              editingStrategyTechnique.index === index &&
                              editingStrategyTechnique.field === "name" ? (
                              <div>
                                <label className="block text-sm font-medium mb-1">Nombre de la técnica</label>
                                <input
                                  type="text"
                                  className="w-full p-2 border rounded-md bg-white/10 text-black dark:bg-black dark:text-white backdrop-blur border dark:border-gray-600"
                                  value={editingStrategyTechnique.value}
                                  onChange={(e) =>
                                    setEditingStrategyTechnique({ ...editingStrategyTechnique, value: e.target.value })
                                  }
                                />
                                <div className="flex mt-2 space-x-2">
                                  <button
                                    className="bg-primary-custom text-white px-3 py-1 rounded-md text-sm"
                                    onClick={() => {
                                      handleEditStrategyTechnique(
                                        index,
                                        editingStrategyTechnique.field,
                                        editingStrategyTechnique.value,
                                      )
                                    }}
                                  >
                                    Guardar
                                  </button>
                                  <button
                                    className="bg-gray-300 px-3 py-1 rounded-md text-sm text-black"
                                    onClick={() => setEditingStrategyTechnique(null)}
                                  >
                                    Cancelar
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex justify-between items-center dark:text-primary-custom_drk">
                                <h4 className="font-bold dark:text-primary-custom_drk">{technique.name}</h4>
                                <div className="flex space-x-2">
                                  <button
                                    className="p-1 text-accent-custom_drk hover:text-primary-custom_drk transition-colors"
                                    onClick={() =>
                                      setEditingStrategyTechnique({ index, field: "name", value: technique.name })
                                    }
                                    aria-label="Editar Nombre"
                                    title="Editar"
                                  >
                                    <i className="bi bi-pencil"></i>
                                  </button>
                                  <button
                                    className="p-1 hover:text-accent-custom transition-colors"
                                    onClick={() => handleDeleteStrategyTechnique(index)}
                                    aria-label="Eliminar Técnica"
                                    title="Eliminar"
                                  >
                                    <i className="bi bi-trash"></i>
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Descripción de la técnica */}
                          <div>
                            {editingStrategyTechnique &&
                              editingStrategyTechnique.index === index &&
                              editingStrategyTechnique.field === "description" ? (
                              <div>
                                <label className="block text-sm font-medium mb-1">Descripción</label>
                                <textarea
                                  className="w-full p-2 border rounded-md bg-white/10 text-black dark:bg-black dark:text-white backdrop-blur border dark:border-gray-600"
                                  value={editingStrategyTechnique.value}
                                  onChange={(e) =>
                                    setEditingStrategyTechnique({ ...editingStrategyTechnique, value: e.target.value })
                                  }
                                  rows={3}
                                />
                                <div className="flex mt-2 space-x-2">
                                  <button
                                    className="bg-primary-custom text-white px-3 py-1 rounded-md text-sm"
                                    onClick={() => {
                                      handleEditStrategyTechnique(
                                        index,
                                        editingStrategyTechnique.field,
                                        editingStrategyTechnique.value,
                                      )
                                      setEditingStrategyTechnique(null)
                                    }}
                                  >
                                    Guardar
                                  </button>
                                  <button
                                    className="bg-gray-300 px-3 py-1 rounded-md text-sm text-black"
                                    onClick={() => setEditingStrategyTechnique(null)}
                                  >
                                    Cancelar
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex justify-between items-start">
                                <p className="text-gray-700 dark:text-primary-custom_drk">{technique.description}</p>
                                <button
                                  className="p-1 text-accent-custom_drk hover:text-primary-custom_drk transition-colors"
                                  onClick={() =>
                                    setEditingStrategyTechnique({
                                      index,
                                      field: "description",
                                      value: technique.description,
                                    })
                                  }
                                  aria-label="Editar Descripción"
                                >
                                  <i className="bi bi-pencil"></i>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white/10 text-black dark:bg-black dark:text-six-custom backdrop-blur">
                    <div>
                      <SectionHeader
                        title="Criterios de Entrada"
                        onAdd={handleAddEntryCriteria}
                        addLabel="Añadir Criterio"
                      />
                      <ul className="space-y-2">
                        {testPlan.strategy.entryCriteria.map((criteria, index) => (
                          <ListItem
                            key={index}
                            onEdit={() => setEditingEntryCriteria({ index, value: criteria })}
                            onDelete={() => handleDeleteEntryCriteria(index)}
                            icon="bi-arrow-right-circle"
                            iconColor="text-accent-custom"
                          >
                            {editingEntryCriteria && editingEntryCriteria.index === index ? (
                              <div className="flex-1">
                                <textarea
                                  className="w-full p-2 border rounded-md bg-white/10 text-black dark:bg-black/10 dark:text-white backdrop-blur border dark:border-gray-600"
                                  value={editingEntryCriteria.value}
                                  onChange={(e) => setEditingEntryCriteria({ index, value: e.target.value })}
                                />
                                <div className="flex mt-2 space-x-2">
                                  <button
                                    className="bg-primary-custom text-white px-3 py-1 rounded-md text-sm"
                                    onClick={() => {
                                      handleEditEntryCriteria(index, editingEntryCriteria.value)
                                      setEditingEntryCriteria(null)
                                    }}
                                  >
                                    Guardar
                                  </button>
                                  <button
                                    className="bg-gray-300 px-3 py-1 rounded-md text-sm text-black"
                                    onClick={() => setEditingEntryCriteria(null)}
                                  >
                                    Cancelar
                                  </button>
                                </div>
                              </div>
                            ) : (
                              criteria
                            )}
                          </ListItem>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <SectionHeader
                        title="Criterios de Salida"
                        onAdd={handleAddExitCriteria}
                        addLabel="Añadir Criterio"
                      />
                      <ul className="space-y-2">
                        {testPlan.strategy.exitCriteria.map((criteria, index) => (
                          <ListItem
                            key={index}
                            onEdit={() => setEditingExitCriteria({ index, value: criteria })}
                            onDelete={() => handleDeleteExitCriteria(index)}
                            icon="bi-box-arrow-right"
                            iconColor="text-accent-custom"
                          >
                            {editingExitCriteria && editingExitCriteria.index === index ? (
                              <div className="flex-1">
                                <textarea
                                  className="w-full p-2 border rounded-md bg-white/10 text-black dark:bg-black/10 dark:text-white backdrop-blur border dark:border-gray-600"
                                  value={editingExitCriteria.value}
                                  onChange={(e) => setEditingExitCriteria({ index, value: e.target.value })}
                                />
                                <div className="flex mt-2 space-x-2">
                                  <button
                                    className="bg-primary-custom text-white px-3 py-1 rounded-md text-sm"
                                    onClick={() => {
                                      handleEditExitCriteria(index, editingExitCriteria.value)
                                      setEditingExitCriteria(null)
                                    }}
                                  >
                                    Guardar
                                  </button>
                                  <button
                                    className="bg-gray-300 px-3 py-1 rounded-md text-sm text-black"
                                    onClick={() => setEditingExitCriteria(null)}
                                  >
                                    Cancelar
                                  </button>
                                </div>
                              </div>
                            ) : (
                              criteria
                            )}
                          </ListItem>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
              {/* Pestaña de Entorno */}
              {activeTab === "environment" && (
                <div>
                  <h2 className="text-2xl font-bold mb-4 text-primary-custom dark:text-primary-custom_drk">Entorno y Datos de Prueba</h2>

                  <div className="mb-6">
                    <SectionHeader title="Entornos Requeridos" onAdd={handleAddEnvironment} addLabel="Añadir Entorno" />
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="border p-2 bg-white/60 text-black dark:bg-black dark:text-six-custom backdrop-blur backdrop-blur border dark:border-gray-600 text-center">Entorno</th>
                            <th className="border p-2 bg-white/60 text-black dark:bg-black dark:text-six-custom backdrop-blur backdrop-blur border dark:border-gray-600 text-center">Propósito</th>
                            <th className="border p-2 bg-white/60 text-black dark:bg-black dark:text-six-custom backdrop-blur backdrop-blur border dark:border-gray-600 text-center">Configuración</th>
                            <th className="border p-2 bg-white/60 text-black dark:bg-black dark:text-six-custom backdrop-blur backdrop-blur border dark:border-gray-600 text-center">Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {testPlan.environment.environments.map((env, index) => (
                            <tr key={index} className={index % 2 === 0 ? "bg-white/60 text-black dark:bg-black/10 dark:text-six-custom backdrop-blur" : "bg-gray-50 text-black dark:bg-black/10 dark:text-six-custom backdrop-blur"}>
                              <td className="border p-2 bg-white/60 text-black dark:bg-black/60 dark:text-six-custom backdrop-blur border dark:border-white">
                                {editingEnvironment &&
                                  editingEnvironment.index === index &&
                                  editingEnvironment.field === "name" ? (
                                  <div>
                                    <input
                                      type="text"
                                      className="w-full p-1 border rounded bg-white/10 text-black dark:bg-black/10 dark:text-white backdrop-blur border dark:border-gray-600"
                                      value={editingEnvironment.value}
                                      onChange={(e) =>
                                        setEditingEnvironment({ ...editingEnvironment, value: e.target.value })
                                      }
                                    />
                                    <div className="flex mt-2 space-x-2">
                                      <button
                                        className="bg-primary-custom text-white px-2 py-1 rounded text-xs"
                                        onClick={() => {
                                          handleEditEnvironment(index, editingEnvironment.field, editingEnvironment.value)
                                          setEditingEnvironment(null)
                                        }}
                                      >
                                        Guardar
                                      </button>
                                      <button
                                        className="bg-gray-300 px-2 py-1 rounded text-xs text-black"
                                        onClick={() => setEditingEnvironment(null)}
                                      >
                                        Cancelar
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex justify-between items-center">
                                    <span>{env.name}</span>
                                    <button
                                      className="p-1 text-accent-custom_drk hover:text-primary-custom_drk transition-colors"
                                      onClick={() => setEditingEnvironment({ index, field: "name", value: env.name })}
                                      aria-label="Editar nombre"
                                    >
                                      <i className="bi bi-pencil"></i>
                                    </button>
                                  </div>
                                )}
                              </td>
                              <td className="border p-2 bg-white/60 text-black dark:bg-black/60 dark:text-six-custom backdrop-blur border dark:border-white">
                                {editingEnvironment &&
                                  editingEnvironment.index === index &&
                                  editingEnvironment.field === "purpose" ? (
                                  <div>
                                    <textarea
                                      className="w-full p-1 border rounded bg-white/10 text-black dark:bg-black/10 dark:text-white backdrop-blur border dark:border-gray-600"
                                      value={editingEnvironment.value}
                                      onChange={(e) =>
                                        setEditingEnvironment({ ...editingEnvironment, value: e.target.value })
                                      }
                                    />
                                    <div className="flex mt-2 space-x-2">
                                      <button
                                        className="bg-primary-custom text-white px-2 py-1 rounded text-xs"
                                        onClick={() => {
                                          handleEditEnvironment(index, editingEnvironment.field, editingEnvironment.value)
                                          setEditingEnvironment(null)
                                        }}
                                      >
                                        Guardar
                                      </button>
                                      <button
                                        className="bg-gray-300 px-2 py-1 rounded text-xs text-black"
                                        onClick={() => setEditingEnvironment(null)}
                                      >
                                        Cancelar
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex justify-between items-start">
                                    <span>{env.purpose}</span>
                                    <button
                                      className="p-1 text-accent-custom_drk hover:text-primary-custom_drk transition-colors"
                                      onClick={() =>
                                        setEditingEnvironment({ index, field: "purpose", value: env.purpose })
                                      }
                                      aria-label="Editar propósito"
                                    >
                                      <i className="bi bi-pencil"></i>
                                    </button>
                                  </div>
                                )}
                              </td>
                              <td className="border p-2 bg-white/60 text-black dark:bg-black/60 dark:text-six-custom backdrop-blur border dark:border-white">
                                {editingEnvironment &&
                                  editingEnvironment.index === index &&
                                  editingEnvironment.field === "configuration" ? (
                                  <div>
                                    <textarea
                                      className="w-full p-1 border rounded bg-white/10 text-black dark:bg-black/10 dark:text-white backdrop-blur border dark:border-gray-600"
                                      value={editingEnvironment.value}
                                      onChange={(e) =>
                                        setEditingEnvironment({ ...editingEnvironment, value: e.target.value })
                                      }
                                    />
                                    <div className="flex mt-2 space-x-2">
                                      <button
                                        className="bg-primary-custom text-white px-2 py-1 rounded text-xs"
                                        onClick={() => {
                                          handleEditEnvironment(index, editingEnvironment.field, editingEnvironment.value)
                                          setEditingEnvironment(null)
                                        }}
                                      >
                                        Guardar
                                      </button>
                                      <button
                                        className="bg-gray-300 px-2 py-1 rounded text-xs text-black"
                                        onClick={() => setEditingEnvironment(null)}
                                      >
                                        Cancelar
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex justify-between items-start">
                                    <span>{env.configuration}</span>
                                    <button
                                      className="p-1 text-accent-custom_drk hover:text-primary-custom_drk transition-colors"
                                      onClick={() =>
                                        setEditingEnvironment({ index, field: "configuration", value: env.configuration })
                                      }
                                      aria-label="Editar configuración"
                                    >
                                      <i className="bi bi-pencil"></i>
                                    </button>
                                  </div>
                                )}
                              </td>
                              <td className="border p-2 bg-white/60 text-black dark:bg-black/60 dark:text-six-custom backdrop-blur border dark:border-white">
                                {!(editingEnvironment && editingEnvironment.index === index) && (
                                  <button
                                    className="p-1 hover:text-accent-custom transition-colors"
                                    onClick={() => handleDeleteEnvironment(index)}
                                    aria-label="Eliminar"
                                  >
                                    <i className="bi bi-trash"></i>
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="mb-6">
                    <SectionHeader title="Datos de Prueba" onAdd={handleAddTestData} addLabel="Añadir Dato" />
                    <ul className="space-y-2  text-black dark:text-six-custom">
                      {testPlan.environment.testData.map((data, index) => (
                        <ListItem
                          key={index}
                          onEdit={() => setEditingTestData({ index, value: data })}
                          onDelete={() => handleDeleteTestData(index)}
                          icon="bi-database"
                          iconColor="text-accent-custom"
                        >
                          {editingTestData && editingTestData.index === index ? (
                            <div className="flex-1">
                              <textarea
                                className="w-full p-2 border rounded-md bg-white/10 text-black dark:bg-black dark:text-white backdrop-blur border dark:border-gray-600"
                                value={editingTestData.value}
                                onChange={(e) => setEditingTestData({ index, value: e.target.value })}
                              />
                              <div className="flex mt-2 space-x-2">
                                <button
                                  className="bg-primary-custom text-white px-3 py-1 rounded-md text-sm"
                                  onClick={() => {
                                    handleEditTestData(index, editingTestData.value)
                                    setEditingTestData(null)
                                  }}
                                >
                                  Guardar
                                </button>
                                <button
                                  className="bg-gray-300 px-3 py-1 rounded-md text-sm text-black"
                                  onClick={() => setEditingTestData(null)}
                                >
                                  Cancelar
                                </button>
                              </div>
                            </div>
                          ) : (
                            data
                          )}
                        </ListItem>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <SectionHeader title="Herramientas" onAdd={handleAddTool} addLabel="Añadir Herramienta" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {testPlan.environment.tools.map((tool, index) => (
                        <div key={index} className="border rounded-lg p-4 bg-white/10 text-black dark:bg-black/10 dark:text-white backdrop-blur border dark:border-gray-600 shadow-sm">
                          {/* Nombre de la herramienta */}
                          <div className="mb-3">
                            {editingTool && editingTool.index === index && editingTool.field === "name" ? (
                              <div>
                                <label className="block text-sm font-medium mb-1">Nombre de la herramienta</label>
                                <input
                                  type="text"
                                  className="w-full p-2 border rounded-md bg-white/10 text-black dark:bg-black/10 dark:text-white backdrop-blur border dark:border-gray-600"
                                  value={editingTool.value}
                                  onChange={(e) => setEditingTool({ ...editingTool, value: e.target.value })}
                                />
                                <div className="flex mt-2 space-x-2">
                                  <button
                                    className="bg-primary-custom text-white px-3 py-1 rounded-md text-sm"
                                    onClick={() => {
                                      handleEditTool(index, editingTool.field, editingTool.value)
                                      setEditingTool(null)
                                    }}
                                  >
                                    Guardar
                                  </button>
                                  <button
                                    className="bg-gray-300 px-3 py-1 rounded-md text-sm text-black"
                                    onClick={() => setEditingTool(null)}
                                  >
                                    Cancelar
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex justify-between items-center">
                                <h4 className="font-bold">{tool.name}</h4>
                                <div className="flex space-x-2">
                                  <button
                                    className="p-1 text-accent-custom_drk hover:text-primary-custom_drk transition-colors"
                                    onClick={() => setEditingTool({ index, field: "name", value: tool.name })}
                                    aria-label="Editar Nombre"
                                  >
                                    <i className="bi bi-pencil"></i>
                                  </button>
                                  <button
                                    className="p-1 hover:text-accent-custom transition-colors"
                                    onClick={() => handleDeleteTool(index)}
                                    aria-label="Eliminar Herramienta"
                                  >
                                    <i className="bi bi-trash"></i>
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Propósito de la herramienta */}
                          <div>
                            {editingTool && editingTool.index === index && editingTool.field === "purpose" ? (
                              <div>
                                <label className="block text-sm font-medium mb-1">Propósito</label>
                                <textarea
                                  className="w-full p-2 border rounded-md bg-white/10 text-black dark:bg-black/10 dark:text-white backdrop-blur border dark:border-gray-600"
                                  value={editingTool.value}
                                  onChange={(e) => setEditingTool({ ...editingTool, value: e.target.value })}
                                  rows={3}
                                />
                                <div className="flex mt-2 space-x-2">
                                  <button
                                    className="bg-primary-custom text-white px-3 py-1 rounded-md text-sm"
                                    onClick={() => {
                                      handleEditTool(index, editingTool.field, editingTool.value)
                                      setEditingTool(null)
                                    }}
                                  >
                                    Guardar
                                  </button>
                                  <button
                                    className="bg-gray-300 px-3 py-1 rounded-md text-sm text-black"
                                    onClick={() => setEditingTool(null)}
                                  >
                                    Cancelar
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex justify-between items-start">
                                <p className="text-black dark:text-six-custom">{tool.purpose}</p>
                                <button
                                  className="p-1 text-accent-custom_drk hover:text-primary-custom_drk transition-colors"
                                  onClick={() => setEditingTool({ index, field: "purpose", value: tool.purpose })}
                                  aria-label="Editar Propósito"
                                >
                                  <i className="bi bi-pencil"></i>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {/* Botones de acción */}
              <div className="mt-8 border-t pt-6">
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  <button
                    className="bg-primary-custom dark:bg-accent-custom text-white hover:bg-accent-custom dark:hover:bg-six-custom py-2 px-6 rounded-md transition-colors text-gray-800 font-medium h-10"
                    onClick={() => setTestPlan(null)}
                  >
                    Volver
                  </button>

                  <div className="w-full md:max-w-md space-y-4">
                    <h3 className="text-lg font-semibold text-primary-custom dark:text-six-custom">Enviar Plan por Email</h3>
                    <div className="space-y-3">
                      <div className="flex flex-col">
                        <label htmlFor="email-to" className="text-sm font-medium mb-1">
                          Correo electrónico
                        </label>
                        <input
                          id="email-to"
                          type="email"
                          className="p-2 border rounded-md w-full text-black"
                          placeholder="Destinatario"
                          value={emailTo}
                          onChange={(e) => setEmailTo(e.target.value)}
                        />
                      </div>
                      <div className="flex flex-col">
                        <label htmlFor="email-subject" className="text-sm font-medium mb-1">
                          Asunto
                        </label>
                        <input
                          id="email-subject"
                          type="text"
                          className="p-2 border rounded-md w-full text-black"
                          placeholder="Asunto del correo"
                          value={emailSubject}
                          onChange={(e) => setEmailSubject(e.target.value)}
                        />
                      </div>
                    </div>
                    <button
                      className="bg-primary-custom dark:bg-accent-custom text-white hover:bg-accent-custom dark:hover:bg-six-custom py-2 px-4 rounded-md transition-colors w-full"
                      onClick={handleSendEmail}
                      disabled={isSending || !emailTo}
                    >
                      {isSending ? "Enviando..." : `Enviar por Email`}
                    </button>
                  </div>
                </div>

            
              </div>
            </div>
          </div>
        )}
        <footer className="footer-distributed text-foreground backdrop-blur">
          <div className="footer-left">
            <a href="https://paolozada.com" target="_blank" rel="noreferrer">
              <h3>
                Paola<span>Lozada</span>
              </h3>
            </a>

            <p className="footer-links">
              <a href="https://paolozada.com#about" target="_blank" className="link-1" rel="noreferrer">
                About me
              </a>

              <a href="https://paolozada.com/info/contact" target="_blank" rel="noreferrer">
                Contact
              </a>
            </p>
          </div>

          <div className="footer-center">
            <div>
              <i className="bi bi-geo-alt-fill"></i>
              <p> Cundinamarca, Colombia</p>
            </div>

            <div>
              <i className="bi bi-telephone-fill"></i>
              <p>+571 3118534588</p>
            </div>

            <div>
              <i className="bi bi-envelope-fill"></i>
              <p className="mail ">
                <a href="mailto:dev@paolozada.com">dev@paolozada.com</a>
              </p>
            </div>
          </div>

          <div className="footer-right">
            <p className="footer-company-about">
              <span>About</span>On this website, you will find a person passionate about challenges and always in search
              of new opportunities to learn and grow.
            </p>

            <div className="footer-icons">
              <a href="https://www.linkedin.com/in/paola-a-lozada-g/" target="_blank" rel="noreferrer">
                <i className="bi bi-linkedin"></i>
              </a>
              <a href="https://github.com/PaoLozada" target="_blank" rel="noreferrer">
                <i className="bi bi-github"></i>
              </a>
              <a href="https://twitter.com/PaolaALoG" target="_blank" rel="noreferrer">
                <i className="bi bi-twitter"></i>
              </a>
            </div>
          </div>
        </footer>
      </div>      
    </div>
    
  )
}
