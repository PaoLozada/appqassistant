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
  const [teamSize, setTeamSize] = useState(1)
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
    field: keyof TestCase | "all"
    value: string | string[] | boolean | TestCase
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
    name: string
    description: string
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
  const [emailFormat, setEmailFormat] = useState<"html" | "Excel">("html")

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

      //console.log("Generando plan con input:", input)

      try {
        //console.log("Intentando generar plan con OpenAI desde la API interna...")
        const response = await fetch("/api/generate-ai-plan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        })

        if (!response.ok) {
          throw new Error("Error desde la API interna")
        }

        const data = await response.json()
        //console.log("Plan generado:", data)
        setTestPlan(data)
      } catch (error) {
        console.error("❌ Error al generar plan con IA:", error)
        console.log("⚠️ Usando generador predeterminado como fallback...")
        const fallbackPlan = generateTestPlan(input)
        fallbackPlan.source = "Generador predeterminado (fallback por error en OpenAI)"
        setTestPlan(fallbackPlan)
      }

      const sanitizeSubject = (text: string): string =>
        text
          .replace(/[\r\n]+/g, " ")
          .replace(/\s+/g, " ")
          .trim()
      const defaultSubject = sanitizeSubject(
        `Plan de Pruebas: ${description.substring(0, 50)}${description.length > 50 ? "..." : ""
        }`
      )

      setEmailSubject(defaultSubject)

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

  const handleEditTestCase = (
    index: number,
    field: keyof TestCase | "all",
    value: string | string[] | boolean | TestCase
  ) => {
    if (!testPlan) return

    const updatedTestCases = [...testPlan.testCases]

    let processedValue = value

    // Si es actualización completa del test case
    if (field === "all" && typeof value === "object" && !Array.isArray(value)) {
      updatedTestCases[index] = value as TestCase
    } else {
      // Convertir valor si es necesario (mantiene tu lógica original)
      if (field === "automatable" && typeof value === "string") {
        processedValue = value === "true"
      }

      updatedTestCases[index] = {
        ...updatedTestCases[index],
        [field]: processedValue,
      }
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

  const handleEditStrategyTechnique = (index: number, name: string, description: string) => {
    if (!testPlan) return
    const updatedTechniques = [...testPlan.strategy.techniques]
    updatedTechniques[index] = {
      ...updatedTechniques[index],
      name,
      description,
    }
    setTestPlan({
      ...testPlan,
      strategy: {
        ...testPlan.strategy,
        techniques: updatedTechniques,
      },
    })
    setEditingStrategyTechnique(null)
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

    const sanitizeSubject = (text: string): string =>
      text
        .replace(/[\r\n]+/g, " ")
        .replace(/\s+/g, " ")
        .trim()


    const rawSubject =
      emailSubject ||
      `Plan de Pruebas: ${description.substring(0, 50)}${description.length > 50 ? "..." : ""
      }`

    const subject = sanitizeSubject(rawSubject)

    try {
      const result = await sendEmail({
        to: emailTo,
        from: "qassistant@send.paolozada.com", // Remitente fijo
        subject,
        planName: emailSubject || `Plan de Pruebas`,
        testPlan: testPlan,
        format: emailFormat,
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

  // 💡 Función para validar formato de correo electrónico
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };



  // Función handleEditEnvironment
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

  // Función handleEditTestData
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

  // Función handleEditTool
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

    <div className="min-h-screen">
      <div className="animated-background">
        <div className="geometric-pattern"></div>
        <div className="particle particle-1"></div>
        <div className="particle particle-2"></div>
        <div className="particle particle-3"></div>
        <div className="particle particle-4"></div>
        <div className="particle particle-5"></div>
        <div className="particle particle-6"></div>
        <div className="particle particle-7"></div>
        <div className="particle particle-8"></div>
        <div className="particle particle-9"></div>
        <div className="particle particle-10"></div>
      </div>

      <div className="container mx-auto py-8 px-4 max-w-7xl relative z-10">
        {showLoadingGame && <LoadingGame onClose={() => setShowLoadingGame(false)} />}

        {/* Header futurista */}
        <div className="futuristic-header fade-in-up mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center"

              >
                <img src="img/logo_app_2.png" alt="" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">QAssistant</h1>
                <p className="text-base md:text-lg font-medium" style={{ color: "var(--text-secondary)" }}>
                  Generador Profesional de Planes de Prueba con IA
                </p>
              </div>
            </div>
          </div>
          {testPlan?.source && (
            <div
              className="mt-6 px-4 py-3 rounded-xl text-sm font-medium"
              style={{
                background: "rgba(102, 126, 234, 0.1)",
                border: "1px solid rgba(102, 126, 234, 0.3)",
                color: "var(--text-secondary)",
              }}
            >
              <i className="bi bi-info-circle mr-2"></i>
              <span className="font-semibold">Generado por:</span> {testPlan.source}
            </div>
          )}
        </div>
        {/* Modal de edición para casos de prueba */}
        {editingTestCase && testPlan && (
          <div className="cinematic-modal-overlay transition-all duration-300">
            <div className="cinematic-modal p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-3xl font-bold mb-2">
                  Editar Caso de Prueba {editingTestCase.index + 1}
                </h3>
                <button
                  className="btn-3d btn-3d-secondary"
                  onClick={() => setEditingTestCase(null)}
                >
                  <i className="bi bi-x-lg"></i>
                </button>
              </div>

              {editingTestCase.field === "all" &&
                typeof editingTestCase.value === "object" &&
                !Array.isArray(editingTestCase.value) ? (
                <>
                  {(() => {
                    const testCaseValue = editingTestCase.value as TestCase;
                    return (
                      <>
                        {/* Título */}
                        <div className="mb-4">
                          <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-secondary)" }}>Título</label>
                          <textarea
                            className="futuristic-input"
                            style={{ maxWidth: "100%" }}
                            value={testCaseValue.title}
                            onChange={(e) =>
                              setEditingTestCase({
                                ...editingTestCase,
                                value: { ...testCaseValue, title: e.target.value },
                              })
                            }
                          />
                        </div>
                        {/* Prioridad */}
                        <div className="mb-4">
                          <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-secondary)" }}>Prioridad</label>
                          <select
                            className="futuristic-input futuristic-select"
                            value={testCaseValue.priority}
                            onChange={(e) =>
                              setEditingTestCase({
                                ...editingTestCase,
                                value: { ...testCaseValue, priority: e.target.value },
                              })
                            }
                          >
                            <option
                              style={{ backgroundColor: "rgb(66, 63, 109)" }}
                              value="Alta">Alta</option>
                            <option
                              style={{ backgroundColor: "rgb(66, 63, 109)" }}
                              value="Media">Media</option>
                            <option
                              style={{ backgroundColor: "rgb(66, 63, 109)" }}
                              value="Baja">Baja</option>
                          </select>
                        </div>
                        {/* Tipo */}
                        <div className="mb-4">
                          <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-secondary)" }}>Tipo</label>
                          <input
                            type="text"
                            className="w-full p-2 border rounded-md futuristic-input"
                            value={testCaseValue.type}
                            onChange={(e) =>
                              setEditingTestCase({
                                ...editingTestCase,
                                value: { ...testCaseValue, type: e.target.value },
                              })
                            }
                          />
                        </div>

                        {/* Automatizable */}
                        <div className="mb-4">
                          <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-secondary)" }}>Automatizable</label>
                          <select
                            className="futuristic-input futuristic-select"
                            value={String(testCaseValue.automatable)}
                            onChange={(e) =>
                              setEditingTestCase({
                                ...editingTestCase,
                                value: {
                                  ...testCaseValue,
                                  automatable: e.target.value === "true",
                                },
                              })
                            }
                          >
                            <option
                              style={{ backgroundColor: "rgb(66, 63, 109)" }}
                              value="true">Sí</option>
                            <option
                              style={{ backgroundColor: "rgb(66, 63, 109)" }}
                              value="false">No</option>
                          </select>
                        </div>

                        {/* Precondiciones */}
                        <div className="mb-4">
                          <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-secondary)" }}>
                            Precondiciones (una por línea)
                          </label>
                          <textarea
                            className="w-full p-2 border rounded-md min-h-[150px] futuristic-input"
                            value={testCaseValue.preconditions.join("\n")}
                            onChange={(e) =>
                              setEditingTestCase({
                                ...editingTestCase,
                                value: {
                                  ...testCaseValue,
                                  preconditions: e.target.value.split("\n"),
                                },
                              })
                            }
                          />
                        </div>

                        {/* Pasos */}
                        <div className="mb-4">
                          <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-secondary)" }}>
                            Pasos (uno por línea)
                          </label>
                          <textarea
                            className="w-full p-2 border rounded-md min-h-[150px] futuristic-input"
                            value={testCaseValue.steps.join("\n")}
                            onChange={(e) =>
                              setEditingTestCase({
                                ...editingTestCase,
                                value: {
                                  ...testCaseValue,
                                  steps: e.target.value.split("\n"),
                                },
                              })
                            }
                          />
                        </div>

                        {/* Resultado Esperado */}
                        <div className="mb-4">
                          <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-secondary)" }}>
                            Resultado Esperado
                          </label>
                          <textarea
                            className="w-full p-2 border rounded-md min-h-[100px] futuristic-input"
                            value={testCaseValue.expectedResult}
                            onChange={(e) =>
                              setEditingTestCase({
                                ...editingTestCase,
                                value: {
                                  ...testCaseValue,
                                  expectedResult: e.target.value,
                                },
                              })
                            }
                          />
                        </div>
                      </>
                    );
                  })()}
                </>
              ) : (
                <>
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
                        className="w-full p-2 border rounded-md min-h-[150px]"
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
                        className="w-full p-2 border rounded-md min-h-[150px]"
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
                        className="w-full p-2 border rounded-md min-h-[100px]"
                        value={editingTestCase.value as string}
                        onChange={(e) => setEditingTestCase({ ...editingTestCase, value: e.target.value })}
                      />
                    </div>
                  )}
                </>
              )}

              <div className="flex justify-end space-x-2">

                <button
                  className="btn-3d btn-3d-primary"
                  style={{ fontSize: "0.75rem", padding: "0.5rem 1rem" }}
                  onClick={() => {
                    if (editingTestCase.field === "all") {
                      handleEditTestCase(editingTestCase.index, "all", editingTestCase.value);
                    } else {
                      handleEditTestCase(
                        editingTestCase.index,
                        editingTestCase.field,
                        editingTestCase.value
                      );
                    }
                    setEditingTestCase(null);
                  }}
                >
                  Guardar
                </button>
                <button
                  className="btn-3d btn-3d-secondary"
                  style={{ fontSize: "0.75rem", padding: "0.5rem 1rem" }}
                  onClick={() => setEditingTestCase(null)}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de detalles del caso de prueba */}
        {activeTestCaseDetails !== null && testPlan && (
          <div className="cinematic-modal-overlay">
            <div className="cinematic-modal p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="cinematic-modal-header flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold">
                  TC-{activeTestCaseDetails + 1}: {testPlan.testCases[activeTestCaseDetails].title}
                </h3>
                <button
                  className="btn-3d btn-3d-secondary"
                  onClick={() => setActiveTestCaseDetails(null)}
                >
                  <i className="bi bi-x-lg"></i>
                </button>
              </div>

              <div className="glass-card grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="font-semibold mb-2">Prioridad</h4>
                  <span
                    className={`futuristic-badge ${testPlan.testCases[activeTestCaseDetails].priority === "Alta"
                      ? "badge-danger"
                      : testPlan.testCases[activeTestCaseDetails].priority === "Media"
                        ? "badge-warning"
                        : "badge-success"
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

              <div className="glass-card mb-4">
                <h4 className="font-semibold mb-2">Precondiciones</h4>
                <ul className="list-disc pl-5">
                  {testPlan.testCases[activeTestCaseDetails].preconditions.map((precondition, i) => (
                    <li key={i}>{precondition}</li>
                  ))}
                </ul>
              </div>

              <div className="glass-card mb-4">
                <h4 className="font-semibold mb-2">Pasos</h4>
                <ol className="list-decimal pl-5">
                  {testPlan.testCases[activeTestCaseDetails].steps.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              </div>

              <div className="glass-card mb-4">
                <h4 className="font-semibold mb-2">Resultado Esperado</h4>
                <p>{testPlan.testCases[activeTestCaseDetails].expectedResult}</p>
              </div>

              <div className="flex justify-end mt-4">
                <button
                  className="btn-icon"
                  onClick={() => {
                    setEditingTestCase({
                      index: activeTestCaseDetails,
                      field: "all",
                      value: testPlan.testCases[activeTestCaseDetails],
                    })
                    setActiveTestCaseDetails(null)
                  }}
                >
                  <i className="bi bi-pencil"></i>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mensaje de éxito */}
        {emailSent && (
          <div className="cinematic-modal-overlay">
            <div className="futuristic-success" style={{ maxWidth: "400px" }}>
              <div className="text-6xl mb-4">✓</div>
              <h3 className="text-3xl font-bold mb-2">¡Correo Enviado!</h3>
              <p className="mb-6 text-lg">Tu plan fue enviado correctamente.</p>
              <button className="btn-3d btn-3d-secondary" onClick={() => setEmailSent(false)}>
                Cerrar
              </button>
            </div>
          </div>
        )}

        {!testPlan ? (
          <>
            <section className="hero-section">
              <div className="hero-content">
                <h1>Tu Asistente de QA Inteligente</h1>
                <p>
                  Crea tu plan de pruebas en minutos. QAssistant genera una estructura inicial personalizada para que empieces rápido.
                  Ajusta, amplía y envíalo a tu correo cuando esté listo.
                </p>
                <button
                  className="hero-button"
                  onClick={() =>
                    document
                      .querySelector("#qa-form-section")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                >
                  Comenzar sin registros
                  <span className="arrow">↓</span>
                </button>
              </div>
            </section>
            <section id="qa-form-section">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 fade-in-up">
                {/* Formulario de entrada */}
                <div className="glass-card">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="futuristic-list-icon">
                      <i className="bi bi-gear-fill"></i>
                    </div>
                    <h2 className="text-2xl font-bold text-white">Información del Sistema</h2>
                  </div>

                  <div className="space-y-4 desc-sistema">
                    <div>
                      <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-secondary)" }}>
                        Tipo de Aplicación
                      </label>
                      <select
                        className="futuristic-input futuristic-select"
                        value={applicationType}
                        onChange={(e) => setApplicationType(e.target.value)}
                      >
                        <option style={{ backgroundColor: "rgb(75, 81, 106)" }} value="">Selecciona un tipo</option>
                        {applicationTypes.map((type) => (
                          <option style={{ backgroundColor: "rgb(75, 81, 106)" }} key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>

                    {applicationType && (
                      <div>
                        <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-secondary)" }}>
                          Subtipo
                        </label>
                        <select
                          className="futuristic-input futuristic-select"
                          value={applicationSubtype}
                          onChange={(e) => setApplicationSubtype(e.target.value)}
                        >
                          <option style={{ backgroundColor: "rgb(75, 81, 106)" }} value="">Selecciona un subtipo</option>
                          {availableSubtypes.map((subtype) => (
                            <option style={{ backgroundColor: "rgb(75, 81, 106)" }} key={subtype} value={subtype}>
                              {subtype}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {applicationSubtype && availableFeatures.length > 0 && (
                      <div>
                        <label className="block text-sm font-semibold mb-3" style={{ color: "var(--text-secondary)" }}>
                          Características
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {availableFeatures.map((feature) => (
                            <label key={feature} className="futuristic-checkbox">
                              <input
                                type="checkbox"
                                checked={selectedFeatures.includes(feature)}
                                onChange={() => handleFeatureChange(feature)}
                              />
                              <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                                {feature}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-secondary)" }}>
                        Descripción del Sistema <span style={{ color: "#f857a6" }}>*</span>
                      </label>
                      <label className="block text-xs" style={{ color: "#e4cdd9ff", textAlign: "right", fontStyle: "italic" }}>
                        No ingreses credenciales, contraseñas ni datos sensibles.
                      </label>
                      <textarea
                        className="futuristic-input futuristic-textarea"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe el sistema o aplicación para el que necesitas un plan de pruebas."
                        maxLength={2000}
                      />
                      <p className="text-xs mt-1" style={{ color: "var(--text-secondary)", textAlign: "right", }}>
                        {description.length} / 2000 caracteres
                      </p>
                    </div>
                  </div>
                </div>

                {/* Opciones adicionales */}
                <div className="glass-card">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="futuristic-list-icon" style={{ background: "var(--secondary-gradient)" }}>
                      <i className="bi bi-sliders"></i>
                    </div>
                    <h2 className="text-2xl font-bold text-white">Opciones de Prueba</h2>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold mb-3" style={{ color: "var(--text-secondary)" }}>
                        Tipos de Prueba
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                          "Funcional",
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
                          <label key={type} className="futuristic-checkbox">
                            <input
                              type="checkbox"
                              checked={testTypes.includes(type)}
                              onChange={() => handleTestTypeChange(type)}
                            />
                            <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                              {type}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div
                      className="pt-4"
                      style={{ borderTop: "1px solid rgba(255, 255, 255, 0.1)", marginTop: "1.5rem" }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <label className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>
                          Automatización de Pruebas
                        </label>
                        <label className="futuristic-toggle">
                          <input
                            type="checkbox"
                            checked={automationAllowed}
                            onChange={() => setAutomationAllowed(!automationAllowed)}
                          />
                          <span className="toggle-slider"></span>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <label className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>
                          Pruebas de Rendimiento
                        </label>
                        <label className="futuristic-toggle">
                          <input
                            type="checkbox"
                            checked={performanceTestingAllowed}
                            onChange={() => setPerformanceTestingAllowed(!performanceTestingAllowed)}
                          />
                          <span className="toggle-slider"></span>
                        </label>
                      </div>
                    </div>

                    <button
                      className={`btn-3d btn-3d-primary w-full mt-6 ${isGenerating || !description ? "opacity-50 cursor-not-allowed" : "glow-on-hover"
                        }`}
                      onClick={handleGenerateTestPlan}
                      disabled={isGenerating || !description}
                    >
                      {isGenerating ? (
                        <>
                          <span className="futuristic-spinner"></span>
                          Generando Plan...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-magic"></i>
                          Generar Plan de Pruebas
                        </>

                      )}
                    </button>
                    {(!isGenerating && !description) && (
                      <p className="text-center mt-2 text-sm font-semibold" style={{ color: '#f857a6' }}>
                        ⚠️ La descripción del sistema es obligatoria para iniciar.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </section>
            {/* Sección de estadísticas */}
            <div className="stats-section fade-in-up" style={{ animationDelay: "0.2s" }}>
              <div className="stat-card">
                <span className="stat-number">🚀+</span>
                <span className="stat-label">Planes Generados</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">⬆%</span>
                <span className="stat-label">Satisfacción</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">24/7</span>
                <span className="stat-label">Disponibilidad</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">100%</span>
                <span className="stat-label">Coherencia</span>
              </div>
            </div>

            {/* Sección de características */}
            <div className="glass-card mt-6 fade-in-up" style={{ animationDelay: "0.3s" }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="futuristic-list-icon" style={{ background: "var(--accent-gradient)" }}>
                  <i className="bi bi-star-fill"></i>
                </div>
                <h2 className="text-2xl font-bold text-white">¿Por qué QAssistant?</h2>
              </div>

              <div className="features-grid">
                <div className="feature-card">
                  <div className="feature-icon">
                    <i className="bi bi-lightning-charge-fill"></i>
                  </div>
                  <h3 className="feature-title">Impulso de IA</h3>
                  <p className="feature-description">
                    Genera el borrador inicial de tu plan de pruebas en minutos. Un punto de partida sólido para tu estrategia de QA
                  </p>
                </div>

                <div className="feature-card">
                  <div className="feature-icon" style={{ background: "var(--success-gradient)" }}>
                    <i className="bi bi-shield-check"></i>
                  </div>
                  <h3 className="feature-title">Facilita tu análisis</h3>
                  <p className="feature-description">
                    Análisis de riesgos y mitigación asistido por IA, dándote el esqueleto completo de tu plan, listo para refinar
                  </p>
                </div>

                <div className="feature-card">
                  <div className="feature-icon" style={{ background: "var(--warning-gradient)" }}>
                    <i className="bi bi-graph-up-arrow"></i>
                  </div>
                  <h3 className="feature-title">Control de Recursos</h3>
                  <p className="feature-description">
                    Cálculos de tiempo y recursos basados en las mejores prácticas. Reduce la incertidumbre en tus presupuestos y cronogramas
                  </p>
                </div>

                <div className="feature-card">
                  <div className="feature-icon" style={{ background: "var(--accent-gradient)" }}>
                    <i className="bi bi-file-earmark-pdf"></i>
                  </div>
                  <h3 className="feature-title">Integración ágil</h3>
                  <p className="feature-description">
                    Exporta tu plan final a múltiples formatos (EXCEL, HTML) y continúa el trabajo con tu equipo, sin fricciones
                  </p>
                </div>

                <div className="feature-card">
                  <div className="feature-icon" style={{ background: "var(--danger-gradient)" }}>
                    <i className="bi bi-pencil-square"></i>
                  </div>
                  <h3 className="feature-title">Refinamiento instantáneo</h3>
                  <p className="feature-description">
                    Modifica y personaliza cualquier sección del plan con nuestra interfaz intuitiva. El control final siempre es tuyo
                  </p>
                </div>

                <div className="feature-card">
                  <div className="feature-icon" style={{ background: "var(--secondary-gradient)" }}>
                    <i className="bi bi-robot"></i>
                  </div>
                  <h3 className="feature-title">Aprendizaje continuo</h3>
                  <p className="feature-description">Modelo que mejora constantemente basado en el feedback y las mejores prácticas</p>
                </div>
              </div>
            </div>

            {/* Footer profesional */}
            <div className="professional-footer fade-in-up" style={{ animationDelay: "0.4s" }}>
              <div className="footer-content">
                <div className=" w-40 h-40 footer-logo">
                  <img src="img/logo_app_2.png" alt="" />
                </div>

                <span>QAssistant</span>
                <p className="footer-text">
                  Tu asistente inteligente para crear planes de prueba profesionales en minutos.
                  Combinamos inteligencia artificial y experiencia QA para ayudarte a optimizar tu trabajo con precisión y estilo.
                </p>
                <div className="footer-badges">
                  <div className="footer-badge">
                    <i className="bi bi-lightning-charge-fill"></i>
                    <span>Impulsado por IA</span>
                  </div>
                  <div className="footer-badge">
                    <i className="bi bi-people-fill"></i>
                    <span>Diseñado para testers</span>
                  </div>
                  <div className="footer-badge">
                    <i className="bi bi-gear-fill"></i>
                    <span>Automatización inteligente</span>
                  </div>
                  <div className="footer-badge">
                    <i className="bi bi-stars"></i>
                    <span>En constante mejora</span>
                  </div>
                </div>
              </div>
            </div>

          </>
        ) : (
          <div className="glass-card p-0 overflow-hidden fade-in-up">
            {/* Pestañas */}
            <div className="futuristic-tabs">
              {[
                { id: "objectives", label: "Objetivos", icon: "bi-bullseye" },
                { id: "scope", label: "Alcance", icon: "bi-diagram-3" },
                { id: "risks", label: "Riesgos", icon: "bi-exclamation-triangle" },
                { id: "testCases", label: "Casos de Prueba", icon: "bi-list-check" },
                { id: "time", label: "Estimación", icon: "bi-clock" },
                { id: "strategy", label: "Estrategia", icon: "bi-lightbulb" },
                { id: "environment", label: "Entorno", icon: "bi-hdd-stack" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  className={`futuristic-tab ${activeTab === tab.id ? "active" : ""}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <i className={`bi ${tab.icon} mr-2`}></i>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Contenido de las pestañas */}
            <div className="p-0 sm:p-6 lg:p-8">
              {/* Pestaña de Objetivos */}
              {activeTab === "objectives" && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-3xl font-bold flex items-center gap-3 text-white"><i className="bi bi-bullseye" style={{ color: "#667eea" }}></i>
                      Objetivos</h2>
                    <button className="btn-icon glow-on-hover btn-space" onClick={handleAddObjective} title="Añadir Objetivo">
                      <i className="bi bi-plus-lg"></i>
                    </button>
                  </div>
                  <div className="space-y-3">
                    {testPlan.objectives.map((objective, index) => (
                      <div key={index} className="futuristic-list-item">
                        <div className="futuristic-list-icon">
                          <i className="bi bi-check2"></i>
                        </div>
                        {editingObjective && editingObjective.index === index ? (
                          <div className="flex-1">
                            <textarea
                              className="futuristic-input futuristic-textarea"
                              value={editingObjective.value}
                              onChange={(e) => setEditingObjective({ index, value: e.target.value })}
                            />
                            <div className="flex gap-2 mt-3">
                              <button
                                className="btn-3d btn-3d-primary"
                                onClick={() => {
                                  handleEditObjective(index, editingObjective.value)
                                  setEditingObjective(null)
                                }}
                              >
                                <i className="bi bi-check2"></i>
                                Guardar
                              </button>
                              <button className="btn-3d btn-3d-secondary" onClick={() => setEditingObjective(null)}>
                                Cancelar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <span className="flex-1 font-medium" style={{ color: "var(--text-primary)" }}>
                              {objective}
                            </span>
                            <div className="flex gap-2">
                              <button
                                className="btn-icon"
                                onClick={() => setEditingObjective({ index, value: objective })}
                              >
                                <i className="bi bi-pencil"></i>
                              </button>
                              <button
                                className="btn-icon"
                                onClick={() => handleDeleteObjective(index)}
                                style={{ color: "#f857a6" }}
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Pestaña de Alcance */}
              {activeTab === "scope" && (
                <div>
                  <h2 className="text-3xl font-bold mb-6 flex items-center gap-3 text-white" style={{ marginTop: "30px" }}>
                    <i className="bi bi-diagram-3" style={{ color: "#667eea" }}></i>
                    Alcance
                  </h2>

                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-white">Áreas Incluidas</h3>
                      <button
                        className="btn-icon glow-on-hover"
                        onClick={handleAddIncludedScope}
                        title="Añadir Área Incluida"
                      >
                        <i className="bi bi-plus-lg"></i>
                      </button>
                    </div>
                    <div className="space-y-3">
                      {testPlan.scope.included.map((item, index) => (
                        <div key={index} className="futuristic-list-item">
                          <div className="futuristic-list-icon" style={{ background: "var(--success-gradient)" }}>
                            <i className="bi bi-check2"></i>
                          </div>
                          {editingIncludedScope && editingIncludedScope.index === index ? (
                            <div className="flex-1">
                              <textarea
                                className="futuristic-input futuristic-textarea"
                                value={editingIncludedScope.value}
                                onChange={(e) => setEditingIncludedScope({ index, value: e.target.value })}
                              />
                              <div className="flex gap-2 mt-3">
                                <button
                                  className="btn-3d btn-3d-primary"
                                  onClick={() => {
                                    handleEditIncludedScope(index, editingIncludedScope.value)
                                    setEditingIncludedScope(null)
                                  }}
                                >
                                  <i className="bi bi-check2"></i>
                                  Guardar
                                </button>
                                <button
                                  className="btn-3d btn-3d-secondary"
                                  onClick={() => setEditingIncludedScope(null)}
                                >
                                  Cancelar
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <span className="flex-1 font-medium" style={{ color: "var(--text-primary)" }}>
                                {item}
                              </span>
                              <div className="flex gap-2">
                                <button
                                  className="btn-icon"
                                  onClick={() => setEditingIncludedScope({ index, value: item })}
                                >
                                  <i className="bi bi-pencil"></i>
                                </button>
                                <button
                                  className="btn-icon"
                                  onClick={() => handleDeleteIncludedScope(index)}
                                  style={{ color: "#f857a6" }}
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-white">Áreas Excluidas</h3>
                      <button
                        className="btn-icon glow-on-hover"
                        onClick={handleAddExcludedScope}
                        title="Añadir Área Excluida"
                      >
                        <i className="bi bi-plus-lg"></i>
                      </button>
                    </div>
                    <div className="space-y-3">
                      {testPlan.scope.excluded.map((item, index) => (
                        <div key={index} className="futuristic-list-item">
                          <div className="futuristic-list-icon" style={{ background: "var(--danger-gradient)" }}>
                            <i className="bi bi-x-lg"></i>
                          </div>
                          {editingExcludedScope && editingExcludedScope.index === index ? (
                            <div className="flex-1">
                              <textarea
                                className="futuristic-input futuristic-textarea"
                                value={editingExcludedScope.value}
                                onChange={(e) => setEditingExcludedScope({ index, value: e.target.value })}
                              />
                              <div className="flex gap-2 mt-3">
                                <button
                                  className="btn-3d btn-3d-primary"
                                  onClick={() => {
                                    handleEditExcludedScope(index, editingExcludedScope.value)
                                    setEditingExcludedScope(null)
                                  }}
                                >
                                  <i className="bi bi-check2"></i>
                                  Guardar
                                </button>
                                <button
                                  className="btn-3d btn-3d-secondary"
                                  onClick={() => setEditingExcludedScope(null)}
                                >
                                  Cancelar
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <span className="flex-1 font-medium" style={{ color: "var(--text-primary)" }}>
                                {item}
                              </span>
                              <div className="flex gap-2">
                                <button
                                  className="btn-icon"
                                  onClick={() => setEditingExcludedScope({ index, value: item })}
                                >
                                  <i className="bi bi-pencil"></i>
                                </button>
                                <button
                                  className="btn-icon"
                                  onClick={() => handleDeleteExcludedScope(index)}
                                  style={{ color: "#f857a6" }}
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {/* Pestaña de Riesgos */}
              {activeTab === "risks" && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-3xl font-bold flex items-center gap-3 text-white">
                      <i className="bi bi-exclamation-triangle" style={{ color: "#fa709a" }}></i>
                      Riesgos
                    </h2>
                    <button className="btn-icon glow-on-hover btn-space" onClick={handleAddRisk} title="Añadir Riesgo">
                      <i className="bi bi-plus-lg"></i>
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="futuristic-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Descripción</th>
                          <th>Impacto</th>
                          <th>Probabilidad</th>
                          <th>Mitigación</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {testPlan.risks.map((risk, index) => (
                          <tr key={index}>
                            <td className="font-bold">{index + 1}</td>
                            <td className="width-item">
                              {editingRisk && editingRisk.index === index && editingRisk.field === "description" ? (
                                <div>
                                  <textarea
                                    className="futuristic-input"
                                    style={{ minHeight: "80px" }}
                                    value={editingRisk.value}
                                    onChange={(e) => setEditingRisk({ ...editingRisk, value: e.target.value })}
                                  />
                                  <div className="flex gap-2 mt-2">
                                    <button
                                      className="btn-3d btn-3d-primary"
                                      style={{ fontSize: "0.75rem", padding: "0.5rem 1rem" }}
                                      onClick={() => {
                                        handleEditRisk(index, editingRisk.field as keyof Risk, editingRisk.value)
                                        setEditingRisk(null)
                                      }}
                                    >
                                      Guardar
                                    </button>
                                    <button
                                      className="btn-3d btn-3d-secondary"
                                      style={{ fontSize: "0.75rem", padding: "0.5rem 1rem" }}
                                      onClick={() => setEditingRisk(null)}
                                    >
                                      Cancelar
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex flex-col gap-1">
                                  <span className="flex-1">{risk.description}</span>
                                  <button
                                    className="btn-icon"
                                    style={{ padding: "1rem, 0.25rem, 0.25rem, 0.25rem", width: "32px", height: "32px" }}
                                    onClick={() =>
                                      setEditingRisk({ index, field: "description", value: risk.description })
                                    }
                                  >
                                    <i className="bi bi-pencil"></i>
                                  </button>
                                </div>
                              )}
                            </td>
                            <td>
                              {editingRisk && editingRisk.index === index && editingRisk.field === "impact" ? (
                                <div>
                                  <select
                                    className="futuristic-input futuristic-select"
                                    value={editingRisk.value}
                                    onChange={(e) => setEditingRisk({ ...editingRisk, value: e.target.value })}
                                  >
                                    <option value="Alto" style={{ backgroundColor: "rgb(75, 81, 106)" }}>Alto</option>
                                    <option value="Medio" style={{ backgroundColor: "rgb(75, 81, 106)" }}>Medio</option>
                                    <option value="Bajo" style={{ backgroundColor: "rgb(75, 81, 106)" }}>Bajo</option>
                                  </select>
                                  <div className="flex gap-2 mt-2">
                                    <button
                                      className="btn-3d btn-3d-primary"
                                      style={{ fontSize: "0.75rem", padding: "0.5rem 1rem" }}
                                      onClick={() => {
                                        handleEditRisk(index, editingRisk.field as keyof Risk, editingRisk.value)
                                        setEditingRisk(null)
                                      }}
                                    >
                                      Guardar
                                    </button>
                                    <button
                                      className="btn-3d btn-3d-secondary"
                                      style={{ fontSize: "0.75rem", padding: "0.5rem 1rem" }}
                                      onClick={() => setEditingRisk(null)}
                                    >
                                      Cancelar
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex justify-between items-center gap-2">
                                  <span
                                    className={`futuristic-badge ${risk.impact === "Alto"
                                      ? "badge-danger"
                                      : risk.impact === "Medio"
                                        ? "badge-warning"
                                        : "badge-success"
                                      }`}
                                  >
                                    {risk.impact}
                                  </span>
                                  <button
                                    className="btn-icon"
                                    style={{ padding: "0.25rem", width: "32px", height: "32px" }}
                                    onClick={() => setEditingRisk({ index, field: "impact", value: risk.impact })}
                                  >
                                    <i className="bi bi-pencil"></i>
                                  </button>
                                </div>
                              )}
                            </td>
                            <td>
                              {editingRisk && editingRisk.index === index && editingRisk.field === "probability" ? (
                                <div>
                                  <select
                                    className="futuristic-input futuristic-select"
                                    value={editingRisk.value}
                                    onChange={(e) => setEditingRisk({ ...editingRisk, value: e.target.value })}
                                  >
                                    <option value="Alta" style={{ backgroundColor: "rgb(75, 81, 106)" }}>Alta</option>
                                    <option value="Media" style={{ backgroundColor: "rgb(75, 81, 106)" }}>Media</option>
                                    <option value="Baja" style={{ backgroundColor: "rgb(75, 81, 106)" }}>Baja</option>
                                  </select>
                                  <div className="flex gap-2 mt-2">
                                    <button
                                      className="btn-3d btn-3d-primary"
                                      style={{ fontSize: "0.75rem", padding: "0.5rem 1rem" }}
                                      onClick={() => {
                                        handleEditRisk(index, editingRisk.field as keyof Risk, editingRisk.value)
                                        setEditingRisk(null)
                                      }}
                                    >
                                      Guardar
                                    </button>
                                    <button
                                      className="btn-3d btn-3d-secondary"
                                      style={{ fontSize: "0.75rem", padding: "0.5rem 1rem" }}
                                      onClick={() => setEditingRisk(null)}
                                    >
                                      Cancelar
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex justify-between items-center gap-2">
                                  <span
                                    className={`futuristic-badge ${risk.probability === "Alta"
                                      ? "badge-danger"
                                      : risk.probability === "Media"
                                        ? "badge-warning"
                                        : "badge-success"
                                      }`}
                                  >
                                    {risk.probability}
                                  </span>
                                  <button
                                    className="btn-icon"
                                    style={{ padding: "0.25rem", width: "32px", height: "32px" }}
                                    onClick={() =>
                                      setEditingRisk({ index, field: "probability", value: risk.probability })
                                    }
                                  >
                                    <i className="bi bi-pencil"></i>
                                  </button>
                                </div>
                              )}
                            </td>
                            <td className="width-item">
                              {editingRisk && editingRisk.index === index && editingRisk.field === "mitigation" ? (
                                <div>
                                  <textarea
                                    className="futuristic-input"
                                    style={{ minHeight: "80px" }}
                                    value={editingRisk.value}
                                    onChange={(e) => setEditingRisk({ ...editingRisk, value: e.target.value })}
                                  />
                                  <div className="flex gap-2 mt-2">
                                    <button
                                      className="btn-3d btn-3d-primary"
                                      style={{ fontSize: "0.75rem", padding: "0.5rem 1rem" }}
                                      onClick={() => {
                                        handleEditRisk(index, editingRisk.field as keyof Risk, editingRisk.value)
                                        setEditingRisk(null)
                                      }}
                                    >
                                      Guardar
                                    </button>
                                    <button
                                      className="btn-3d btn-3d-secondary"
                                      style={{ fontSize: "0.75rem", padding: "0.5rem 1rem" }}
                                      onClick={() => setEditingRisk(null)}
                                    >
                                      Cancelar
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex flex-col gap-1">
                                  <span className="flex-1">{risk.mitigation}</span>
                                  <button
                                    className="btn-icon"
                                    style={{ padding: "0.25rem", width: "32px", height: "32px" }}
                                    onClick={() =>
                                      setEditingRisk({ index, field: "mitigation", value: risk.mitigation })
                                    }
                                  >
                                    <i className="bi bi-pencil"></i>
                                  </button>
                                </div>
                              )}
                            </td>
                            <td>
                              <button
                                className="btn-icon"
                                onClick={() => handleDeleteRisk(index)}
                                style={{ color: "#f857a6" }}
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

                  <h2 className="text-3xl font-bold flex items-center gap-3 text-white" style={{ marginTop: "30px" }}>
                    <i className="bi bi-list-check" style={{ color: "#667eea" }}></i>
                    Casos de Prueba
                  </h2>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex">
                      <button
                        className={`btn-3d btn-3d-secondary btn-space ${viewMode === "cards"
                          ? "btn-select"
                          : ""
                          }`}
                        onClick={() => setViewMode("cards")}
                      >
                        <i className="bi bi-grid mr-1"></i>
                        <span className="hidden sm:inline">Tarjetas</span>
                      </button>
                      <button
                        className={`btn-3d btn-3d-secondary btn-space ${viewMode === "table"
                          ? "btn-select"
                          : ""
                          }`}
                        onClick={() => setViewMode("table")}
                      >
                        <i className="bi bi-table mr-1"></i>
                        <span className="hidden sm:inline">Tabla</span>
                      </button>
                    </div>
                    <button
                      className="btn-icon glow-on-hover"
                      onClick={handleAddTestCase}
                      title="Añadir Caso de Prueba"
                    >
                      <i className="bi bi-plus-lg"></i>
                    </button>
                  </div>


                  {/* Vista de Tarjetas */}
                  {viewMode === "cards" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {testPlan.testCases.map((testCase, index) => (
                        <div
                          key={index}
                          className="border rounded-lg p-4 glass-card-inner p-4 rounded-xl"
                        >
                          <div className="flex justify-between items-center mb-3">
                            <h3 className="font-bold">
                              TC-{index + 1}: {testCase.title}
                            </h3>

                          </div>
                          <div className="mb-2">
                            <p className="text-sm font-semibold mb-1" style={{ color: "var(--text-secondary)" }}>
                              Prioridad:
                            </p>
                            <span
                              className={`futuristic-badge ${testCase.priority === "Alta"
                                ? "badge-danger"
                                : testCase.priority === "Media"
                                  ? "badge-warning"
                                  : "badge-success"
                                }`}
                            >
                              {testCase.priority}
                            </span>
                          </div>
                          <div className="mb-2">
                            <p className="text-sm font-medium">Tipo: {testCase.type}</p>

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
                          <div className="mt-4 flex items-center gap-2">
                            <p className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>
                              Automatizable:
                            </p>
                            {editingTestCase?.index === index && editingTestCase?.field === "automatable" ? (
                              <label className="futuristic-toggle">
                                <input
                                  type="checkbox"
                                  checked={editingTestCase?.value === true}
                                  onChange={(e) =>
                                    setEditingTestCase({
                                      index,
                                      field: "automatable",
                                      value: e.target.checked,
                                    })
                                  }
                                />
                                <span className="toggle-slider"></span>
                              </label>
                            ) : (
                              <i
                                className={`bi ${testCase.automatable ? "bi-check-lg text-green-500" : "bi-x-lg text-red-500"}`}
                              ></i>
                            )}
                          </div>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <button
                              className="btn-icon"
                              onClick={() =>
                                setEditingTestCase({
                                  index,
                                  field: "all",
                                  value: testCase,
                                })
                              }
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button
                              className="btn-icon"
                              onClick={() => handleDeleteTestCase(index)}
                              title="Eliminar"
                              style={{ color: "#f857a6" }}
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
                      <table className="futuristic-table">
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Título</th>
                            <th>Prioridad</th>
                            <th>Tipo</th>
                            <th>Automatizable</th>
                            <th>Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {testPlan.testCases.map((testCase, index) => (
                            <tr key={index}>
                              <td className="font-bold">{index + 1}</td>
                              <td title={testCase.title}>
                                {testCase.title}
                              </td>
                              <td>
                                <span
                                  className={`futuristic-badge ${testCase.priority === "Alta"
                                    ? "badge-danger"
                                    : testCase.priority === "Media"
                                      ? "badge-warning"
                                      : "badge-success"
                                    }`}
                                >
                                  {testCase.priority}
                                </span>
                              </td>
                              <td>{testCase.type}</td>
                              <td>{testCase.automatable ? "Sí" : "No"}</td>
                              <td>
                                <div className="flex space-x-2">
                                  <button
                                    className="btn-icon"
                                    onClick={() => setActiveTestCaseDetails(index)}
                                  >
                                    <i className="bi bi-eye"></i>
                                  </button>
                                  <button
                                    className="btn-icon"
                                    onClick={() =>
                                      setEditingTestCase({
                                        index,
                                        field: "all",
                                        value: testCase,
                                      })
                                    }
                                  >
                                    <i className="bi bi-pencil"></i>
                                  </button>
                                  <button
                                    className="btn-icon"
                                    onClick={() => handleDeleteTestCase(index)}
                                    title="Eliminar"
                                    style={{ color: "#f857a6" }}
                                  >
                                    <i className="bi bi-trash"></i>
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

                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-3xl font-bold flex items-center gap-3 text-white">
                      <i className="bi bi-clock" style={{ color: "#70fa9cff" }}></i>
                      Estimación
                    </h2>
                    <button className="btn-icon glow-on-hover" onClick={handleAddTimeEstimationPhase} title="Añadir Fase">
                      <i className="bi bi-plus-lg"></i>
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="futuristic-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Fase</th>
                          <th>Duración (días)</th>
                          {/*<th>Recursos</th>*/}
                          <th>Justificación</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {testPlan.timeEstimation.phases.map((phase, index) => (
                          <tr key={index}>
                            <td className="font-bold">{index + 1}</td>
                            <td>
                              {editingTimeEstimation &&
                                editingTimeEstimation.index === index &&
                                editingTimeEstimation.field === "name" ? (
                                <div>
                                  <textarea
                                    className="futuristic-input"
                                    style={{ minHeight: "80px" }}
                                    value={editingTimeEstimation.value as string}
                                    onChange={(e) =>
                                      setEditingTimeEstimation({ ...editingTimeEstimation, value: e.target.value })
                                    }
                                  />
                                  <div className="flex mt-2 space-x-2">
                                    <button
                                      className="btn-3d btn-3d-primary"
                                      style={{ fontSize: "0.75rem", padding: "0.5rem 1rem" }}
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
                                      className="btn-3d btn-3d-secondary"
                                      style={{ fontSize: "0.75rem", padding: "0.5rem 1rem" }}
                                      onClick={() => setEditingTimeEstimation(null)}
                                    >
                                      Cancelar
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex justify-between items-start gap-2">
                                  <span>{phase.name}</span>
                                  <button
                                    className="btn-icon"
                                    style={{ padding: "0.25rem", width: "32px", height: "32px" }}
                                    onClick={() => setEditingTimeEstimation({ index, field: "name", value: phase.name })}
                                    aria-label="Editar nombre"
                                    title="Editar"
                                  >
                                    <i className="bi bi-pencil"></i>
                                  </button>
                                </div>
                              )}
                            </td>
                            <td>
                              {editingTimeEstimation &&
                                editingTimeEstimation.index === index &&
                                editingTimeEstimation.field === "duration" ? (
                                <div>
                                  <input
                                    type="number"
                                    className="futuristic-input"
                                    value={editingTimeEstimation.value as number}
                                    onChange={(e) =>
                                      setEditingTimeEstimation({
                                        ...editingTimeEstimation,
                                        value: Number(e.target.value),
                                      })
                                    }
                                    min="1"
                                  />
                                  <div className="flex gap-2 mt-2">
                                    <button
                                      className="btn-3d btn-3d-primary"
                                      style={{ fontSize: "0.75rem", padding: "0.5rem 1rem" }}
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
                                      className="btn-3d btn-3d-secondary"
                                      style={{ fontSize: "0.75rem", padding: "0.5rem 1rem" }}
                                      onClick={() => setEditingTimeEstimation(null)}
                                    >
                                      Cancelar
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex justify-between items-start gap-2">
                                  <span className="flex-1">{phase.duration}</span>
                                  <button
                                    className="btn-icon"
                                    style={{ padding: "0.25rem", width: "32px", height: "32px" }}
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
                            {/*<td className="border p-2 bg-white/60 text-black dark:bg-black/10 dark:text-six-custom backdrop-blur border dark:border-white">
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
                            </td>*/}
                            <td>
                              {editingTimeEstimation &&
                                editingTimeEstimation.index === index &&
                                editingTimeEstimation.field === "justification" ? (
                                <div>
                                  <textarea
                                    className="futuristic-input"
                                    style={{ minHeight: "80px" }}
                                    value={editingTimeEstimation.value as string}
                                    onChange={(e) =>
                                      setEditingTimeEstimation({ ...editingTimeEstimation, value: e.target.value })
                                    }
                                  />
                                  <div className="flex gap-2 mt-2">
                                    <button
                                      className="btn-3d btn-3d-primary"
                                      style={{ fontSize: "0.75rem", padding: "0.5rem 1rem" }}
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
                                      className="btn-3d btn-3d-secondary"
                                      style={{ fontSize: "0.75rem", padding: "0.5rem 1rem" }}
                                      onClick={() => setEditingTimeEstimation(null)}
                                    >
                                      Cancelar
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex justify-between items-start gap-2">
                                  <span className="flex-1">{phase.justification}</span>
                                  <button
                                    className="btn-icon"
                                    style={{ padding: "0.25rem", width: "32px", height: "32px" }}
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
                            <td>
                              {!(editingTimeEstimation && editingTimeEstimation.index === index) && (
                                <button
                                  className="btn-icon"
                                  onClick={() => handleDeleteTimeEstimationPhase(index)}
                                  aria-label="Eliminar"
                                  style={{ color: "#f857a6" }}
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="glass-card">
                          <td colSpan={2} className="text-right font-bold"
                          >
                            Tiempo total estimado:
                          </td>
                          <td colSpan={3}>
                            {testPlan.timeEstimation.totalDays} días
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  <div className="flex items-center justify-between mb-6"
                    style={{ marginTop: "100px" }}>
                    <h2 className="text-3xl font-bold flex items-center gap-3 text-white">
                      <i className="bi bi-node-plus" style={{ color: "#70fa9cff" }}></i>
                      Factores Considerados
                    </h2>
                    <button className="btn-icon glow-on-hover" onClick={handleAddTimeEstimationFactor} title="Añadir Factor">
                      <i className="bi bi-plus-lg"></i>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {testPlan.timeEstimation.factors.map((factor, index) => (
                      <div key={index} className="futuristic-list-item">
                        <div className="futuristic-list-icon" style={{ background: "var(--success-gradient)" }}>
                          <i className="bi-check-circle"></i>
                        </div>
                        {editingTimeEstimationFactor && editingTimeEstimationFactor.index === index ? (
                          <div className="flex-1">
                            <textarea
                              className="futuristic-input futuristic-textarea"
                              value={editingTimeEstimationFactor.value}
                              onChange={(e) => setEditingTimeEstimationFactor({ index, value: e.target.value })}
                            />
                            <div className="flex gap-2 mt-3">
                              <button
                                className="btn-3d btn-3d-primary"
                                onClick={() => {
                                  handleEditTimeEstimationFactor(index, editingTimeEstimationFactor.value)
                                  setEditingTimeEstimationFactor(null)
                                }}
                              >
                                <i className="bi bi-check2"></i>
                                Guardar
                              </button>
                              <button className="btn-3d btn-3d-secondary" onClick={() => setEditingTimeEstimationFactor(null)}>
                                Cancelar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <span className="flex-1 font-medium" style={{ color: "var(--text-primary)" }}>
                              {factor}
                            </span>
                            <div className="flex gap-2">
                              <button
                                className="btn-icon"
                                onClick={() => setEditingTimeEstimationFactor({ index, value: factor })}
                              >
                                <i className="bi bi-pencil"></i>
                              </button>
                              <button
                                className="btn-icon"
                                onClick={() => handleDeleteTimeEstimationFactor(index)}
                                style={{ color: "#f857a6" }}
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>

                </div>
              )}

              {/* Pestaña de Estrategias*/}
              {activeTab === "strategy" && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-3xl font-bold flex items-center gap-3 text-white">
                      <i className="bi bi-lightbulb" style={{ color: "#667eea" }}></i>
                      Estrategia de Pruebas
                    </h2>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-xl font-semibold mb-2">Enfoque General</h3>
                    {editingStrategy && editingStrategy.field === "approach" ? (
                      <div>
                        <textarea
                          className="futuristic-input"
                          value={editingStrategy.value}
                          onChange={(e) => setEditingStrategy({ field: "approach", value: e.target.value })}
                          rows={5}
                        />
                        <div className="flex mt-2 space-x-2">
                          <button
                            className="btn-3d btn-3d-primary"
                            onClick={() => {
                              handleEditStrategy("approach", editingStrategy.value)
                              setEditingStrategy(null)
                            }}
                          >
                            <i className="bi bi-check2"></i>Guardar
                          </button>
                          <button
                            className="btn-3d btn-3d-secondary"
                            onClick={() => setEditingStrategy(null)}
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="glass-card">
                        <p style={{ color: "var(--text-primary)" }}>{testPlan.strategy.approach}</p>
                        <button
                          className="btn-icon mt-2"
                          onClick={() => setEditingStrategy({ field: "approach", value: testPlan.strategy.approach })}
                          aria-label="Editar Enfoque"
                          title="Editar"
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Técnicas */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xl font-bold text-white">Técnicas</h3>
                      <button
                        className="btn-icon glow-on-hover"
                        onClick={handleAddStrategyTechnique}
                        title="Añadir Técnica"
                      >
                        <i className="bi bi-plus-lg"></i>
                      </button>
                    </div>

                    <div className="space-y-3">
                      {testPlan.strategy.techniques.map((tech, index) => (
                        <div key={index} className="futuristic-list-item">
                          <div
                            className="futuristic-list-icon"
                            style={{ background: "var(--accent-gradient)" }}
                          >
                            <i className="bi bi-lightbulb"></i>
                          </div>

                          {editingStrategyTechnique && editingStrategyTechnique.index === index ? (
                            <div className="flex-1">
                              {/* Campo nombre */}
                              <input
                                type="text"
                                className="futuristic-input mb-2"
                                value={editingStrategyTechnique.name}
                                placeholder="Nombre de la técnica"
                                onChange={(e) =>
                                  setEditingStrategyTechnique({
                                    ...editingStrategyTechnique,
                                    name: e.target.value,
                                  })
                                }
                              />

                              {/* Campo descripción */}
                              <textarea
                                className="futuristic-input futuristic-textarea"
                                value={editingStrategyTechnique.description}
                                placeholder="Descripción de la técnica"
                                onChange={(e) =>
                                  setEditingStrategyTechnique({
                                    ...editingStrategyTechnique,
                                    description: e.target.value,
                                  })
                                }
                              />

                              <div className="flex gap-2 mt-3">
                                <button
                                  className="btn-3d btn-3d-primary"
                                  onClick={() => {
                                    handleEditStrategyTechnique(
                                      index,
                                      editingStrategyTechnique.name,
                                      editingStrategyTechnique.description
                                    )
                                    setEditingStrategyTechnique(null)
                                  }}
                                >
                                  <i className="bi bi-check2"></i> Guardar
                                </button>
                                <button
                                  className="btn-3d btn-3d-secondary"
                                  onClick={() => setEditingStrategyTechnique(null)}
                                >
                                  Cancelar
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="flex-1">
                                <h4 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                                  {tech.name}
                                </h4>
                                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                                  {tech.description}
                                </p>
                              </div>

                              <div className="flex gap-2">
                                <button
                                  className="btn-icon"
                                  onClick={() =>
                                    setEditingStrategyTechnique({
                                      index,
                                      name: tech.name,
                                      description: tech.description,
                                    })
                                  }
                                >
                                  <i className="bi bi-pencil"></i>
                                </button>
                                <button
                                  className="btn-icon"
                                  onClick={() => handleDeleteStrategyTechnique(index)}
                                  style={{ color: "#f857a6" }}
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="w-full">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Criterios de Entrada */}
                      <div className="space-y-2 py-10">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-xl font-bold text-white">Criterios de Entrada</h3>
                          <button
                            className="btn-icon glow-on-hover"
                            onClick={handleAddEntryCriteria}
                            title="Añadir Criterio de Entrada"
                          >
                            <i className="bi bi-plus-lg"></i>
                          </button>
                        </div>

                        <div className="space-y-3">
                          {testPlan.strategy.entryCriteria.map((criteria, index) => (
                            <div key={index} className="futuristic-list-item">
                              <div className="futuristic-list-icon" style={{ background: "var(--success-gradient)" }}>
                                <i className="bi bi-check2-circle"></i>
                              </div>

                              {editingEntryCriteria && editingEntryCriteria.index === index ? (
                                <div className="flex-1">
                                  <textarea
                                    className="futuristic-input futuristic-textarea"
                                    value={editingEntryCriteria.value}
                                    onChange={(e) => setEditingEntryCriteria({ index, value: e.target.value })}
                                  />
                                  <div className="flex gap-2 mt-3">
                                    <button
                                      className="btn-3d btn-3d-primary"
                                      onClick={() => {
                                        handleEditEntryCriteria(index, editingEntryCriteria.value)
                                        setEditingEntryCriteria(null)
                                      }}
                                    >
                                      <i className="bi bi-check2"></i> Guardar
                                    </button>
                                    <button className="btn-3d btn-3d-secondary" onClick={() => setEditingEntryCriteria(null)}>
                                      Cancelar
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <span className="flex-1 font-medium" style={{ color: "var(--text-primary)" }}>
                                    {criteria}
                                  </span>
                                  <div className="flex gap-2">
                                    <button className="btn-icon" onClick={() => setEditingEntryCriteria({ index, value: criteria })}>
                                      <i className="bi bi-pencil"></i>
                                    </button>
                                    <button className="btn-icon" onClick={() => handleDeleteEntryCriteria(index)} style={{ color: "#f857a6" }}>
                                      <i className="bi bi-trash"></i>
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/*Criterios de Salida */}
                      <div className="space-y-2 py-10">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-xl font-bold text-white">Criterios de Salida</h3>
                          <button
                            className="btn-icon glow-on-hover"
                            onClick={handleAddExitCriteria}
                            title="Añadir Criterio de Salida"
                          >
                            <i className="bi bi-plus-lg"></i>
                          </button>
                        </div>

                        <div className="space-y-3">
                          {testPlan.strategy.exitCriteria.map((criteria, index) => (
                            <div key={index} className="futuristic-list-item">
                              <div className="futuristic-list-icon" style={{ background: "var(--danger-gradient)" }}>
                                <i className="bi bi-flag-fill"></i>
                              </div>

                              {editingExitCriteria && editingExitCriteria.index === index ? (
                                <div className="flex-1">
                                  <textarea
                                    className="futuristic-input futuristic-textarea"
                                    value={editingExitCriteria.value}
                                    onChange={(e) => setEditingExitCriteria({ index, value: e.target.value })}
                                  />
                                  <div className="flex gap-2 mt-3">
                                    <button
                                      className="btn-3d btn-3d-primary"
                                      onClick={() => {
                                        handleEditExitCriteria(index, editingExitCriteria.value)
                                        setEditingExitCriteria(null)
                                      }}
                                    >
                                      <i className="bi bi-check2"></i> Guardar
                                    </button>
                                    <button className="btn-3d btn-3d-secondary" onClick={() => setEditingExitCriteria(null)}>
                                      Cancelar
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <span className="flex-1 font-medium" style={{ color: "var(--text-primary)" }}>
                                    {criteria}
                                  </span>
                                  <div className="flex gap-2">
                                    <button className="btn-icon" onClick={() => setEditingExitCriteria({ index, value: criteria })}>
                                      <i className="bi bi-pencil"></i>
                                    </button>
                                    <button className="btn-icon" onClick={() => handleDeleteExitCriteria(index)} style={{ color: "#f857a6" }}>
                                      <i className="bi bi-trash"></i>
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Pestaña de Entorno */}
              {activeTab === "environment" && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-3xl font-bold flex items-center gap-3 text-white">
                      <i className="bi bi-hdd-stack" style={{ color: "#667eea" }}></i>
                      Entorno y Datos de Prueba
                    </h2>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold mb-3 text-white">Entornos Requeridos</h3>
                      <button className="btn-icon glow-on-hover" onClick={handleAddEnvironment} title="Añadir Entorno">
                        <i className="bi bi-plus-lg"></i>
                      </button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="futuristic-table">
                        <thead>
                          <tr>
                            <th>Entorno</th>
                            <th>Propósito</th>
                            <th>Configuración</th>
                            <th>Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {testPlan.environment.environments.map((env, index) => (
                            <tr key={index}>
                              <td>
                                {editingEnvironment &&
                                  editingEnvironment.index === index &&
                                  editingEnvironment.field === "name" ? (
                                  <div>
                                    <textarea
                                      className="futuristic-input"
                                      style={{ minHeight: "80px" }}
                                      value={editingEnvironment.value}
                                      onChange={(e) =>
                                        setEditingEnvironment({ ...editingEnvironment, value: e.target.value })
                                      }
                                    />
                                    <div className="flex mt-2 space-x-2">
                                      <button
                                        className="btn-3d btn-3d-primary"
                                        style={{ fontSize: "0.75rem", padding: "0.5rem 1rem" }}
                                        onClick={() => {
                                          handleEditEnvironment(index, editingEnvironment.field, editingEnvironment.value)
                                          setEditingEnvironment(null)
                                        }}
                                      >
                                        Guardar
                                      </button>
                                      <button
                                        className="btn-3d btn-3d-secondary"
                                        style={{ fontSize: "0.75rem", padding: "0.5rem 1rem" }}
                                        onClick={() => setEditingEnvironment(null)}
                                      >
                                        Cancelar
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex justify-between items-start gap-2">
                                    <span className="flex-1">{env.name}</span>
                                    <button
                                      className="btn-icon"
                                      style={{ padding: "0.25rem", width: "32px", height: "32px" }}
                                      onClick={() => setEditingEnvironment({ index, field: "name", value: env.name })}
                                      aria-label="Editar nombre"
                                    >
                                      <i className="bi bi-pencil"></i>
                                    </button>
                                  </div>
                                )}
                              </td>
                              <td>
                                {editingEnvironment &&
                                  editingEnvironment.index === index &&
                                  editingEnvironment.field === "purpose" ? (
                                  <div>
                                    <textarea
                                      className="futuristic-input"
                                      style={{ minHeight: "80px" }}
                                      value={editingEnvironment.value}
                                      onChange={(e) =>
                                        setEditingEnvironment({ ...editingEnvironment, value: e.target.value })
                                      }
                                    />
                                    <div className="flex mt-2 space-x-2">
                                      <button
                                        className="btn-3d btn-3d-primary"
                                        style={{ fontSize: "0.75rem", padding: "0.5rem 1rem" }}
                                        onClick={() => {
                                          handleEditEnvironment(index, editingEnvironment.field, editingEnvironment.value)
                                          setEditingEnvironment(null)
                                        }}
                                      >
                                        Guardar
                                      </button>
                                      <button
                                        className="btn-3d btn-3d-secondary"
                                        style={{ fontSize: "0.75rem", padding: "0.5rem 1rem" }}
                                        onClick={() => setEditingEnvironment(null)}
                                      >
                                        Cancelar
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex justify-between items-start">
                                    <span className="flex-1">{env.purpose}</span>
                                    <button
                                      className="btn-icon"
                                      style={{ padding: "0.25rem", width: "32px", height: "32px" }}
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
                              <td>
                                {editingEnvironment &&
                                  editingEnvironment.index === index &&
                                  editingEnvironment.field === "configuration" ? (
                                  <div>
                                    <textarea
                                      className="futuristic-input"
                                      style={{ minHeight: "80px" }}
                                      value={editingEnvironment.value}
                                      onChange={(e) =>
                                        setEditingEnvironment({ ...editingEnvironment, value: e.target.value })
                                      }
                                    />
                                    <div className="flex mt-2 space-x-2">
                                      <button
                                        className="btn-3d btn-3d-primary"
                                        style={{ fontSize: "0.75rem", padding: "0.5rem 1rem" }}
                                        onClick={() => {
                                          handleEditEnvironment(index, editingEnvironment.field, editingEnvironment.value)
                                          setEditingEnvironment(null)
                                        }}
                                      >
                                        Guardar
                                      </button>
                                      <button
                                        className="btn-3d btn-3d-secondary"
                                        style={{ fontSize: "0.75rem", padding: "0.5rem 1rem" }}
                                        onClick={() => setEditingEnvironment(null)}
                                      >
                                        Cancelar
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex justify-between items-start">
                                    <span className="flex-1">{env.configuration}</span>
                                    <button
                                      className="btn-icon"
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
                              <td>
                                {!(editingEnvironment && editingEnvironment.index === index) && (
                                  <button
                                    className="btn-icon"
                                    onClick={() => handleDeleteEnvironment(index)}
                                    style={{ color: "#f857a6" }}
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
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xl font-bold text-white">Datos de Prueba</h3>
                      <button
                        className="btn-icon glow-on-hover"
                        onClick={handleAddTestData}
                        title="Añadir Dato"
                      >
                        <i className="bi bi-plus-lg"></i>
                      </button>
                    </div>
                    <div className="space-y-3">
                      {testPlan.environment.testData.map((data, index) => (
                        <div
                          key={index}
                          className="futuristic-list-item">
                          <div className="futuristic-list-icon"
                            style={{ background: "var(--warning-gradient)" }}>
                            <i className="bi bi-database"></i>
                          </div>

                          {editingTestData && editingTestData.index === index ? (
                            <div className="flex-1">
                              <textarea
                                className="futuristic-input futuristic-textarea"
                                value={editingTestData.value}
                                onChange={(e) => setEditingTestData({ index, value: e.target.value })}
                              />
                              <div className="flex mt-2 space-x-2">
                                <button
                                  className="btn-3d btn-3d-primary"
                                  onClick={() => {
                                    handleEditTestData(index, editingTestData.value)
                                    setEditingTestData(null)
                                  }}
                                >
                                  Guardar
                                </button>
                                <button
                                  className="btn-3d btn-3d-secondary"
                                  onClick={() => setEditingTestData(null)}
                                >
                                  Cancelar
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <span className="flex-1 font-medium" style={{ color: "var(--text-primary)" }}>
                                {data}
                              </span>
                              <div className="flex gap-2">
                                <button
                                  className="btn-icon"
                                  onClick={() => setEditingTestData({ index, value: data })}
                                >
                                  <i className="bi bi-pencil"></i>
                                </button>
                                <button
                                  className="btn-icon"
                                  onClick={() => handleDeleteTestData(index)}
                                  style={{ color: "#f857a6" }}
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                              </div>
                            </>

                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xl font-bold text-white">Herramientas</h3>
                      <button
                        className="btn-icon glow-on-hover"
                        onClick={handleAddTool}
                        title="Añadir Herramienta"
                      >
                        <i className="bi bi-plus-lg"></i>
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {testPlan.environment.tools.map((tool, index) => (
                        <div key={index} className="p-4 glass-card fade-in-up">
                          {/* Nombre de la herramienta */}
                          <div className="mb-3">
                            {editingTool && editingTool.index === index && editingTool.field === "name" ? (
                              <div>
                                <label className="block text-sm font-medium mb-1">Nombre de la herramienta</label>
                                <textarea
                                  className="futuristic-input futuristic-textarea"
                                  value={editingTool.value}
                                  onChange={(e) => setEditingTool({ ...editingTool, value: e.target.value })}
                                />
                                <div className="flex mt-2 space-x-2">
                                  <button
                                    className="btn-3d btn-3d-primary"
                                    onClick={() => {
                                      handleEditTool(index, editingTool.field, editingTool.value)
                                      setEditingTool(null)
                                    }}
                                  >
                                    Guardar
                                  </button>
                                  <button
                                    className="btn-3d btn-3d-secondary"
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
                                    className="btn-icon"
                                    onClick={() => setEditingTool({ index, field: "name", value: tool.name })}
                                    aria-label="Editar Nombre"
                                  >
                                    <i className="bi bi-pencil"></i>
                                  </button>
                                  <button
                                    className="btn-icon"
                                    onClick={() => handleDeleteTool(index)}
                                    style={{ color: "#f857a6" }}
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
                                  className="futuristic-input futuristic-textarea"
                                  value={editingTool.value}
                                  onChange={(e) => setEditingTool({ ...editingTool, value: e.target.value })}
                                  rows={3}
                                />
                                <div className="flex mt-2 space-x-2">
                                  <button
                                    className="btn-3d btn-3d-primary"
                                    onClick={() => {
                                      handleEditTool(index, editingTool.field, editingTool.value)
                                      setEditingTool(null)
                                    }}
                                  >
                                    Guardar
                                  </button>
                                  <button
                                    className="btn-3d btn-3d-secondary"
                                    onClick={() => setEditingTool(null)}
                                  >
                                    Cancelar
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex justify-between items-start">
                                <p style={{ color: "var(--text-secondary)" }}>{tool.purpose}</p>
                                <button
                                  className="btn-icon"
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
              <div className="mt-8 pt-6" style={{ borderTop: "1px solid rgba(255, 255, 255, 0.1)" }}>
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  <button className="btn-3d btn-3d-secondary h-10" onClick={() => setTestPlan(null)}>
                    <i className="bi bi-arrow-left"></i>
                    Volver
                  </button>

                  <div className="flex-1 max-w-md">
                    <h3 className="text-lg font-bold mb-4 text-white">Enviar Plan por Email</h3>

                    <div style={{ display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap", margin: "10px" }}>
                      <button
                        type="button"
                        onClick={() => setEmailFormat("html")}
                        style={{
                          background: emailFormat === "html" ? "#667eea" : "transparent",
                          color: emailFormat === "html" ? "#fff" : "#b8b9d0",
                          border: "1px solid #667eea",
                          borderRadius: "8px",
                          padding: "10px 18px",
                          cursor: "pointer",
                          transition: "0.2s",
                        }}
                      >
                        📄 HTML
                      </button>

                      <button
                        type="button"
                        onClick={() => setEmailFormat("Excel")}
                        style={{
                          background: emailFormat === "Excel" ? "#20b2aa" : "transparent",
                          color: emailFormat === "Excel" ? "#fff" : "#b8b9d0",
                          border: "1px solid #20b2aa",
                          borderRadius: "8px",
                          padding: "10px 18px",
                          cursor: "pointer",
                          transition: "0.2s",
                        }}
                      >
                        📊 Excel
                      </button>

                    </div>



                    <div className="space-y-3">
                      <input
                        type="email"
                        className={`futuristic-input ${emailTo && !isValidEmail(emailTo) ? "input-error" : ""}`}
                        placeholder="Correo electrónico"
                        value={emailTo}
                        onChange={(e) => setEmailTo(e.target.value)}
                      />

                      {/* 🔴 Mensaje de error elegante */}
                      {emailTo && !isValidEmail(emailTo) && (
                        <p
                          style={{
                            color: "#ff6b6b",
                            fontSize: "0.9rem",
                            marginTop: "4px",
                            transition: "0.3s ease",
                            animation: "fadeIn 0.4s ease",
                          }}
                        >
                          ⚠️ Por favor, ingresa un correo electrónico válido.
                        </p>
                      )}

                      <input
                        type="text"
                        className="futuristic-input"
                        placeholder="Asunto del correo"
                        value={emailSubject}
                        onChange={(e) => setEmailSubject(e.target.value)}
                      />

                      <button
                        className={`btn-3d btn-3d-primary w-full ${isSending || !isValidEmail(emailTo)
                          ? "opacity-50 cursor-not-allowed"
                          : "glow-on-hover"
                          }`}
                        onClick={handleSendEmail}
                        disabled={isSending || !isValidEmail(emailTo)}
                      >
                        {isSending ? (
                          <>
                            <span className="futuristic-spinner"></span>
                            Enviando...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-envelope-fill"></i>
                            Enviar por Email
                          </>
                        )}
                      </button>
                    </div>

                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        <footer className="footer-distributed text-foreground backdrop-blur">
          <div className="footer-left">
            <a href="https://paolozada.com" target="_blank" rel="noreferrer">
              <img
                src="/img/iconPL.png"
                alt="Icono de la app"
                className="w-40 h-auto md:w-44"
              />
            </a>

            <p className="footer-links">
              <a href="https://paolozada.com" target="_blank" className="link-1" rel="noreferrer">
                Sobre mi
              </a>

              <a href="https://paolozada.com/info/contact" target="_blank" rel="noreferrer">
                Contacto
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
              <p>+57 3118534588</p>
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
              <span>Acerca de</span>Este sitio web, es realizado por una persona apasionada por los desafíos y siempre
              en búsqueda de nuevas oportunidades para aprender y crecer.
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
        <div className="text-center p-3" style={{ backgroundColor: "rgba(0, 0, 0, 0.1)", fontSize: "11px" }}>
          Copyright © 2025 | Creado con 💜 por
          <a className="text-white" href="https://paolozada.com"> Paola Lozada</a>
          <a className="text-white" href="https://paolozada.com/info/privacy-policy/" target="_blank"> | Política de Privacidad ✍</a>
        </div>

      </div>
    </div>

  )
}
