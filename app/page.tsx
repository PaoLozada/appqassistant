"use client"

import { useState, useEffect } from "react"
import { generateTestPlan } from "@/lib/test-plan-generator"
import type { TestPlan, TestPlanInput } from "@/lib/types"
import { sendEmail } from "@/lib/send-email"
import type { Risk, TestCase } from "@/lib/types"
import { generateAITestPlan } from "@/lib/ai-test-plan-generator"

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

  // Primero, agreguemos un nuevo estado para el formato de envío
  const [emailFormat, setEmailFormat] = useState<"html" | "pdf">("html")

  // Estado para el caso de prueba activo en la vista de tabla
  //const [activeTestCaseDetails, setActiveTestCaseDetails, setActiveTestCaseDetails] = useState<number | null>(null)

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
      alert("Por favor, proporciona una descripción del sistema a probar.");
      return;
    }
  
    setIsGenerating(true);
  
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
      };
  
      console.log("Generando plan con input:", input);
  
      try {
        console.log("Intentando generar plan con OpenAI desde la API interna...");
        const response = await fetch("/api/generate-ai-plan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        });
  
        if (!response.ok) {
          throw new Error("Error desde la API interna");
        }
  
        const data = await response.json();
        console.log("Plan generado:", data);
        setTestPlan(data);
      } catch (error) {
        console.error("❌ Error al generar plan con IA:", error);
        console.log("⚠️ Usando generador predeterminado como fallback...");
        const fallbackPlan = generateTestPlan(input);
        fallbackPlan.source = "Generador predeterminado (fallback por error en OpenAI)";
        setTestPlan(fallbackPlan);
      }
  
      // Asunto predeterminado para el email
      setEmailSubject(`Plan de Pruebas: ${description.substring(0, 50)}${description.length > 50 ? "..." : ""}`);
    } catch (error) {
      console.error("⚠️ Error general en la generación:", error);
      alert("Ocurrió un error inesperado. Por favor, intenta de nuevo.");
    } finally {
      setIsGenerating(false);
    }
  };
  

  // Funciones para editar objetivos
  const handleEditObjective = (index: number, value: string) => {
    if (!testPlan) return
    const updatedObjectives = [...testPlan.objectives]
    updatedObjectives[index] = value
    setTestPlan({
      ...testPlan,
      objectives: updatedObjectives,
    })
  }

  // Funciones para editar alcance
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

  // Funciones para editar riesgos
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

  // Funciones para editar casos de prueba
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

  // Funciones para editar estimación de tiempos
  const handleEditTimeEstimation = (index: number, field: string, value: string | number) => {
    if (!testPlan) return
    const updatedPhases = [...testPlan.timeEstimation.phases]
    updatedPhases[index] = {
      ...updatedPhases[index],
      [field]: field === "duration" ? Number(value) : value,
    }
    setTestPlan({
      ...testPlan,
      timeEstimation: {
        ...testPlan.timeEstimation,
        phases: updatedPhases,
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

  // Funciones para editar entorno
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
  }

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
  }

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
  }


  const handleSendEmail = async () => {
    if (!testPlan || !emailTo) return

    setIsSending(true)

    try {
      const result = await sendEmail({
        to: emailTo,
        from: "letmehelpyou@paolozada.com", // Remitente fijo
        subject:
          emailSubject || `Plan de Pruebas: ${description.substring(0, 50)}${description.length > 50 ? "..." : ""}`,
        planName: emailSubject || `Plan de Pruebas`,
        testPlan: testPlan,
        format: emailFormat, // Añadimos el formato seleccionado
      })

      if (result.success) {
        setEmailSent(true)
        //setTimeout(() => setEmailSent(false), 3000)
        setEmailTo("");
        setEmailSubject("");
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

  // Renderizar la interfaz de usuario
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="bg-white text-[rgb(119,64,106)] p-6 rounded-lg shadow-xl mb-8 border border-gray-100">
        <div className="logo_tittle">
          <div className="logo_pl">
            <img src="/img/iconPL.png" alt="Icono de la app" width="100" height="100" />
          </div>
          <div className="tittle_app">
            <h1 className="text-3xl font-bold text-center relative pb-3 mb-2">
              QAssistant
              <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-[rgb(119,64,106)]"></span>
            </h1>
            <p className="text-center mt-2">Genera planes de prueba profesionales para tus proyectos</p>
            {testPlan?.source && (
              <p className="text-center mt-3 text-sm bg-gray-50 p-2 rounded border-l-4 border-[rgb(119,64,106)]">
                <span className="font-medium">Generado: </span> {testPlan.source}
              </p>
            )}
          </div>
        </div>
      </div>

      {!testPlan ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Formulario de entrada */}
          <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-100">
            <h2 className="text-xl font-semibold mb-4 text-primary-custom">Información del Sistema</h2>

            {/* Tipo de aplicación */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Tipo de Aplicación</label>
              <select
                className="w-full p-2 border rounded-md"
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
                  className="w-full p-2 border rounded-md"
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
                        className="mr-2"
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
              <label className="block text-sm font-medium mb-1">Descripción del Sistema</label>
              <textarea
                className="w-full p-2 border rounded-md min-h-[150px]"
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
                className="w-full p-2 border rounded-md"
                value={teamSize}
                onChange={(e) => setTeamSize(Number.parseInt(e.target.value) || 1)}
                min="1"
              />
            </div>
          </div>

          {/* Opciones adicionales */}
          <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-100">
            <h2 className="text-xl font-semibold mb-4 text-primary-custom">Opciones Adicionales</h2>

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
                      className="mr-2"
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
                  className="mr-2"
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
                  className="mr-2"
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
                  ? "bg-gray-400 cursor-not-allowed text-gray-200"
                  : "bg-primary-custom text-white hover:bg-opacity-90"
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
        <div className="bg-white rounded-lg shadow-md">
          {/* Pestañas */}
          <div className="border-b">
            <div className="flex overflow-x-auto">
              {["objectives", "scope", "risks", "testCases", "time", "strategy", "environment"].map((tab) => (
                <button
                  key={tab}
                  className={`px-4 py-2 font-medium ${activeTab === tab
                    ? "border-b-2 border-primary-custom text-primary-custom"
                    : "text-gray-500 hover:text-primary-custom"
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
                <h2 className="text-2xl font-bold mb-4 text-primary-custom">Objetivos</h2>
                <ul className="space-y-2">
                  {testPlan.objectives.map((objective, index) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-2">•</span>
                      {editingObjective && editingObjective.index === index ? (
                        <div className="flex-1">
                          <textarea
                            className="w-full p-2 border rounded-md"
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
                              className="bg-gray-300 px-3 py-1 rounded-md text-sm"
                              onClick={() => setEditingObjective(null)}
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex-1 flex justify-between items-start">
                          <span>{objective}</span>
                          <button
                            className="ml-2 text-primary-custom hover:text-opacity-80"
                            onClick={() => setEditingObjective({ index, value: objective })}
                          >
                            Editar
                          </button>
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
                <h2 className="text-2xl font-bold mb-4 text-primary-custom">Alcance</h2>

                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-2">Áreas Incluidas</h3>
                  <ul className="space-y-2">
                    {testPlan.scope.included.map((item, index) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-2">•</span>
                        {editingIncludedScope && editingIncludedScope.index === index ? (
                          <div className="flex-1">
                            <textarea
                              className="w-full p-2 border rounded-md"
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
                                className="bg-gray-300 px-3 py-1 rounded-md text-sm"
                                onClick={() => setEditingIncludedScope(null)}
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex-1 flex justify-between items-start">
                            <span>{item}</span>
                            <button
                              className="ml-2 text-primary-custom hover:text-opacity-80"
                              onClick={() => setEditingIncludedScope({ index, value: item })}
                            >
                              Editar
                            </button>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-2">Áreas Excluidas</h3>
                  <ul className="space-y-2">
                    {testPlan.scope.excluded.map((item, index) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-2">•</span>
                        {editingExcludedScope && editingExcludedScope.index === index ? (
                          <div className="flex-1">
                            <textarea
                              className="w-full p-2 border rounded-md"
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
                                className="bg-gray-300 px-3 py-1 rounded-md text-sm"
                                onClick={() => setEditingExcludedScope(null)}
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex-1 flex justify-between items-start">
                            <span>{item}</span>
                            <button
                              className="ml-2 text-primary-custom hover:text-opacity-80"
                              onClick={() => setEditingExcludedScope({ index, value: item })}
                            >
                              Editar
                            </button>
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
                <h2 className="text-2xl font-bold mb-4 text-primary-custom">Riesgos</h2>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border p-2 text-left">#</th>
                        <th className="border p-2 text-left">Descripción</th>
                        <th className="border p-2 text-left">Impacto</th>
                        <th className="border p-2 text-left">Probabilidad</th>
                        <th className="border p-2 text-left">Mitigación</th>
                        <th className="border p-2 text-left">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {testPlan.risks.map((risk, index) => (
                        <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                          <td className="border p-2">{index + 1}</td>
                          <td className="border p-2">
                            {editingRisk && editingRisk.index === index && editingRisk.field === "description" ? (
                              <textarea
                                className="w-full p-1 border rounded"
                                value={editingRisk.value}
                                onChange={(e) => setEditingRisk({ ...editingRisk, value: e.target.value })}
                              />
                            ) : (
                              risk.description
                            )}
                          </td>
                          <td className="border p-2">
                            {editingRisk && editingRisk.index === index && editingRisk.field === "impact" ? (
                              <select
                                className="w-full p-1 border rounded"
                                value={editingRisk.value}
                                onChange={(e) => setEditingRisk({ ...editingRisk, value: e.target.value })}
                              >
                                <option value="Alto">Alto</option>
                                <option value="Medio">Medio</option>
                                <option value="Bajo">Bajo</option>
                              </select>
                            ) : (
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
                            )}
                          </td>
                          <td className="border p-2">
                            {editingRisk && editingRisk.index === index && editingRisk.field === "probability" ? (
                              <select
                                className="w-full p-1 border rounded"
                                value={editingRisk.value}
                                onChange={(e) => setEditingRisk({ ...editingRisk, value: e.target.value })}
                              >
                                <option value="Alta">Alta</option>
                                <option value="Media">Media</option>
                                <option value="Baja">Baja</option>
                              </select>
                            ) : (
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
                            )}
                          </td>
                          <td className="border p-2">
                            {editingRisk && editingRisk.index === index && editingRisk.field === "mitigation" ? (
                              <textarea
                                className="w-full p-1 border rounded"
                                value={editingRisk.value}
                                onChange={(e) => setEditingRisk({ ...editingRisk, value: e.target.value })}
                              />
                            ) : (
                              risk.mitigation
                            )}
                          </td>
                          <td className="border p-2">
                            {editingRisk && editingRisk.index === index ? (
                              <div className="flex space-x-1">
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
                                  className="bg-gray-300 px-2 py-1 rounded text-xs"
                                  onClick={() => setEditingRisk(null)}
                                >
                                  Cancelar
                                </button>
                              </div>
                            ) : (
                              <div className="flex flex-col space-y-1">
                                <button
                                  className="text-primary-custom hover:text-opacity-80 text-xs"
                                  onClick={() =>
                                    setEditingRisk({ index, field: "description", value: risk.description })
                                  }
                                >
                                  Editar Desc.
                                </button>
                                <button
                                  className="text-primary-custom hover:text-opacity-80 text-xs"
                                  onClick={() => setEditingRisk({ index, field: "impact", value: risk.impact })}
                                >
                                  Editar Imp.
                                </button>
                                <button
                                  className="text-primary-custom hover:text-opacity-80 text-xs"
                                  onClick={() =>
                                    setEditingRisk({ index, field: "probability", value: risk.probability })
                                  }
                                >
                                  Editar Prob.
                                </button>
                                <button
                                  className="text-primary-custom hover:text-opacity-80 text-xs"
                                  onClick={() => setEditingRisk({ index, field: "mitigation", value: risk.mitigation })}
                                >
                                  Editar Mit.
                                </button>
                              </div>
                            )}
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
                <h2 className="text-2xl font-bold mb-4 text-primary-custom">Casos de Prueba</h2>

                {/* Botones para cambiar la vista */}
                <div className="flex justify-end mb-4">
                  <button
                    className={`px-3 py-1 rounded-l ${viewMode === "cards" ? "bg-primary-custom text-white" : "bg-gray-200"}`}
                    onClick={() => setViewMode("cards")}
                  >
                    Tarjetas
                  </button>
                  <button
                    className={`px-3 py-1 rounded-r ${viewMode === "table" ? "bg-primary-custom text-white" : "bg-gray-200"}`}
                    onClick={() => setViewMode("table")}
                  >
                    Tabla
                  </button>
                </div>

                {/* Vista de Tarjetas */}
                {viewMode === "cards" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {testPlan.testCases.map((testCase, index) => (
                      <div
                        key={index}
                        className="border rounded-lg p-4 bg-white shadow-md hover:shadow-lg transition-shadow"
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
                                : testCase.priority === "Baja"
                                  ? "bg-green-100 text-green-800"
                                  : ""
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
                            className="text-primary-custom hover:text-opacity-80 text-xs border border-primary-custom px-2 py-1 rounded"
                            onClick={() => {
                              setEditingTestCase({
                                index,
                                field: "title",
                                value: testCase.title,
                              })
                            }}
                          >
                            Editar Título
                          </button>
                          <button
                            className="text-primary-custom hover:text-opacity-80 text-xs border border-primary-custom px-2 py-1 rounded"
                            onClick={() => {
                              setEditingTestCase({
                                index,
                                field: "priority",
                                value: testCase.priority,
                              })
                            }}
                          >
                            Editar Prioridad
                          </button>
                          <button
                            className="text-primary-custom hover:text-opacity-80 text-xs border border-primary-custom px-2 py-1 rounded"
                            onClick={() => {
                              setEditingTestCase({
                                index,
                                field: "preconditions",
                                value: testCase.preconditions,
                              })
                            }}
                          >
                            Editar Precondiciones
                          </button>
                          <button
                            className="text-primary-custom hover:text-opacity-80 text-xs border border-primary-custom px-2 py-1 rounded"
                            onClick={() => {
                              setEditingTestCase({
                                index,
                                field: "steps",
                                value: testCase.steps,
                              })
                            }}
                          >
                            Editar Pasos
                          </button>
                          <button
                            className="text-primary-custom hover:text-opacity-80 text-xs border border-primary-custom px-2 py-1 rounded"
                            onClick={() => {
                              setEditingTestCase({
                                index,
                                field: "expectedResult",
                                value: testCase.expectedResult,
                              })
                            }}
                          >
                            Editar Resultado
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
                          <th className="border p-2 text-left">#</th>
                          <th className="border p-2 text-left">Título</th>
                          <th className="border p-2 text-left">Prioridad</th>
                          <th className="border p-2 text-left">Tipo</th>
                          <th className="border p-2 text-left">Automatizable</th>
                          <th className="border p-2 text-left">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {testPlan.testCases.map((testCase, index) => (
                          <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                            <td className="border p-2">TC-{index + 1}</td>
                            <td className="border p-2 max-w-xs truncate" title={testCase.title}>
                              {testCase.title}
                            </td>
                            <td className="border p-2">
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
                            <td className="border p-2">{testCase.type}</td>
                            <td className="border p-2">{testCase.automatable ? "Sí" : "No"}</td>
                            <td className="border p-2">
                              <div className="flex space-x-2">
                                <button
                                  className="text-primary-custom hover:text-opacity-80 text-sm flex items-center"
                                  onClick={() => setActiveTestCaseDetails(index)}
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 mr-1"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                    />
                                  </svg>
                                  Ver detalles
                                </button>
                                <button
                                  className="text-primary-custom hover:text-opacity-80 text-sm flex items-center"
                                  onClick={() => {
                                    setEditingTestCase({
                                      index,
                                      field: "title",
                                      value: testCase.title,
                                    })
                                  }}
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 mr-1"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                    />
                                  </svg>
                                  Editar
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Modal de detalles del caso de prueba */}
                {activeTestCaseDetails !== null && testPlan && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-bold">
                          TC-{activeTestCaseDetails + 1}: {testPlan.testCases[activeTestCaseDetails].title}
                        </h3>
                        <button
                          className="text-gray-500 hover:text-gray-700"
                          onClick={() => setActiveTestCaseDetails(null)}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
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
                          className="bg-primary-custom text-white px-4 py-2 rounded-md"
                          onClick={() => {
                            setEditingTestCase({
                              index: activeTestCaseDetails,
                              field: "title",
                              value: testPlan.testCases[activeTestCaseDetails].title,
                            })
                            setActiveTestCaseDetails(null)
                          }}
                        >
                          Editar Caso de Prueba
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Modal de edición para casos de prueba */}
                {editingTestCase && testPlan && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-bold">Editar Caso de Prueba {editingTestCase.index + 1}</h3>
                        <button className="text-gray-500 hover:text-gray-700" onClick={() => setEditingTestCase(null)}>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>

                      {editingTestCase.field === "title" && (
                        <div className="mb-4">
                          <label className="block text-sm font-medium mb-1">Título</label>
                          <input
                            type="text"
                            className="w-full p-2 border rounded-md"
                            value={editingTestCase.value as string}
                            onChange={(e) => setEditingTestCase({ ...editingTestCase, value: e.target.value })}
                          />
                        </div>
                      )}

                      {editingTestCase.field === "priority" && (
                        <div className="mb-4">
                          <label className="block text-sm font-medium mb-1">Prioridad</label>
                          <select
                            className="w-full p-2 border rounded-md"
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
                            className="w-full p-2 border rounded-md"
                            value={editingTestCase.value as string}
                            onChange={(e) => setEditingTestCase({ ...editingTestCase, value: e.target.value })}
                          />
                        </div>
                      )}

                      {editingTestCase.field === "automatable" && (
                        <div className="mb-4">
                          <label className="block text-sm font-medium mb-1">Automatizable</label>
                          <select
                            className="w-full p-2 border rounded-md"
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

                      <div className="flex justify-end space-x-2">
                        <button className="bg-gray-300 px-4 py-2 rounded-md" onClick={() => setEditingTestCase(null)}>
                          Cancelar
                        </button>
                        <button
                          className="bg-primary-custom text-white px-4 py-2 rounded-md"
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
              </div>
            )}
            {/* Pestaña de Estimación de Tiempos */}
            {activeTab === "time" && (
              <div>
                <h2 className="text-2xl font-bold mb-4 text-primary-custom">Estimación de Tiempos</h2>

                <div className="overflow-x-auto mb-6">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border p-2 text-left">#</th>
                        <th className="border p-2 text-left">Fase</th>
                        <th className="border p-2 text-left">Duración (días)</th>
                        <th className="border p-2 text-left">Recursos</th>
                        <th className="border p-2 text-left">Justificación</th>
                        <th className="border p-2 text-left">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {testPlan.timeEstimation.phases.map((phase, index) => (
                        <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                          <td className="border p-2">{index + 1}</td>
                          <td className="border p-2">
                            {editingTimeEstimation &&
                              editingTimeEstimation.index === index &&
                              editingTimeEstimation.field === "name" ? (
                              <input
                                type="text"
                                className="w-full p-1 border rounded"
                                value={editingTimeEstimation.value as string}
                                onChange={(e) =>
                                  setEditingTimeEstimation({ ...editingTimeEstimation, value: e.target.value })
                                }
                              />
                            ) : (
                              phase.name
                            )}
                          </td>
                          <td className="border p-2">
                            {editingTimeEstimation &&
                              editingTimeEstimation.index === index &&
                              editingTimeEstimation.field === "duration" ? (
                              <input
                                type="number"
                                className="w-full p-1 border rounded"
                                value={editingTimeEstimation.value as number}
                                onChange={(e) =>
                                  setEditingTimeEstimation({ ...editingTimeEstimation, value: Number(e.target.value) })
                                }
                                min="1"
                              />
                            ) : (
                              phase.duration
                            )}
                          </td>
                          <td className="border p-2">
                            {editingTimeEstimation &&
                              editingTimeEstimation.index === index &&
                              editingTimeEstimation.field === "resources" ? (
                              <input
                                type="text"
                                className="w-full p-1 border rounded"
                                value={editingTimeEstimation.value as string}
                                onChange={(e) =>
                                  setEditingTimeEstimation({ ...editingTimeEstimation, value: e.target.value })
                                }
                              />
                            ) : (
                              phase.resources
                            )}
                          </td>
                          <td className="border p-2">
                            {editingTimeEstimation &&
                              editingTimeEstimation.index === index &&
                              editingTimeEstimation.field === "justification" ? (
                              <textarea
                                className="w-full p-1 border rounded"
                                value={editingTimeEstimation.value as string}
                                onChange={(e) =>
                                  setEditingTimeEstimation({ ...editingTimeEstimation, value: e.target.value })
                                }
                              />
                            ) : (
                              phase.justification
                            )}
                          </td>
                          <td className="border p-2">
                            {editingTimeEstimation && editingTimeEstimation.index === index ? (
                              <div className="flex space-x-1">
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
                                  className="bg-gray-300 px-2 py-1 rounded text-xs"
                                  onClick={() => setEditingTimeEstimation(null)}
                                >
                                  Cancelar
                                </button>
                              </div>
                            ) : (
                              <div className="flex flex-col space-y-1">
                                <button
                                  className="text-primary-custom hover:text-opacity-80 text-xs"
                                  onClick={() => setEditingTimeEstimation({ index, field: "name", value: phase.name })}
                                >
                                  Editar Nombre
                                </button>
                                <button
                                  className="text-primary-custom hover:text-opacity-80 text-xs"
                                  onClick={() =>
                                    setEditingTimeEstimation({ index, field: "duration", value: phase.duration })
                                  }
                                >
                                  Editar Duración
                                </button>
                                <button
                                  className="text-primary-custom hover:text-opacity-80 text-xs"
                                  onClick={() =>
                                    setEditingTimeEstimation({ index, field: "resources", value: phase.resources })
                                  }
                                >
                                  Editar Recursos
                                </button>
                                <button
                                  className="text-primary-custom hover:text-opacity-80 text-xs"
                                  onClick={() =>
                                    setEditingTimeEstimation({
                                      index,
                                      field: "justification",
                                      value: phase.justification,
                                    })
                                  }
                                >
                                  Editar Just.
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-gray-100">
                        <td colSpan={2} className="border p-2 text-right font-bold">
                          Tiempo total estimado:
                        </td>
                        <td colSpan={3} className="border p-2">
                          {testPlan.timeEstimation.totalDays} días
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-2">Factores Considerados</h3>
                  <ul className="space-y-2">
                    {testPlan.timeEstimation.factors.map((factor, index) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-2">•</span>
                        {editingTimeEstimationFactor && editingTimeEstimationFactor.index === index ? (
                          <div className="flex-1">
                            <textarea
                              className="w-full p-2 border rounded-md"
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
                                className="bg-gray-300 px-3 py-1 rounded-md text-sm"
                                onClick={() => setEditingTimeEstimationFactor(null)}
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex-1 flex justify-between items-start">
                            <span>{factor}</span>
                            <button
                              className="ml-2 text-primary-custom hover:text-opacity-80"
                              onClick={() => setEditingTimeEstimationFactor({ index, value: factor })}
                            >
                              Editar
                            </button>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            {activeTab === "strategy" && (
              <div>
                <h2 className="text-2xl font-bold mb-4 text-primary-custom">Estrategia de Prueba</h2>

                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-2">Enfoque General</h3>
                  {editingStrategy && editingStrategy.field === "approach" ? (
                    <div>
                      <textarea
                        className="w-full p-2 border rounded-md"
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
                          className="bg-gray-300 px-3 py-1 rounded-md text-sm"
                          onClick={() => setEditingStrategy(null)}
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-start">
                      <p className="text-gray-700">{testPlan.strategy.approach}</p>
                      <button
                        className="ml-2 text-primary-custom hover:text-opacity-80"
                        onClick={() => setEditingStrategy({ field: "approach", value: testPlan.strategy.approach })}
                      >
                        Editar
                      </button>
                    </div>
                  )}
                </div>

                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-2">Técnicas de Prueba</h3>
                  <div className="space-y-4">
                    {testPlan.strategy.techniques.map((technique, index) => (
                      <div key={index} className="border rounded-lg p-4 bg-white shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold">
                            {editingStrategyTechnique &&
                              editingStrategyTechnique.index === index &&
                              editingStrategyTechnique.field === "name" ? (
                              <input
                                type="text"
                                className="w-full p-1 border rounded"
                                value={editingStrategyTechnique.value}
                                onChange={(e) =>
                                  setEditingStrategyTechnique({ ...editingStrategyTechnique, value: e.target.value })
                                }
                              />
                            ) : (
                              technique.name
                            )}
                          </h4>
                          {!(
                            editingStrategyTechnique &&
                            editingStrategyTechnique.index === index &&
                            editingStrategyTechnique.field === "name"
                          ) && (
                              <button
                                className="text-primary-custom hover:text-opacity-80 text-xs"
                                onClick={() =>
                                  setEditingStrategyTechnique({ index, field: "name", value: technique.name })
                                }
                              >
                                Editar Nombre
                              </button>
                            )}
                        </div>
                        <div>
                          {editingStrategyTechnique &&
                            editingStrategyTechnique.index === index &&
                            editingStrategyTechnique.field === "description" ? (
                            <div>
                              <textarea
                                className="w-full p-1 border rounded"
                                value={editingStrategyTechnique.value}
                                onChange={(e) =>
                                  setEditingStrategyTechnique({ ...editingStrategyTechnique, value: e.target.value })
                                }
                                rows={3}
                              />
                              <div className="flex mt-2 space-x-2">
                                <button
                                  className="bg-primary-custom text-white px-2 py-1 rounded text-xs"
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
                                  className="bg-gray-300 px-2 py-1 rounded text-xs"
                                  onClick={() => setEditingStrategyTechnique(null)}
                                >
                                  Cancelar
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex justify-between items-start">
                              <p className="text-gray-700">{technique.description}</p>
                              <button
                                className="ml-2 text-primary-custom hover:text-opacity-80 text-xs"
                                onClick={() =>
                                  setEditingStrategyTechnique({
                                    index,
                                    field: "description",
                                    value: technique.description,
                                  })
                                }
                              >
                                Editar Desc.
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Criterios de Entrada</h3>
                    <ul className="space-y-2">
                      {testPlan.strategy.entryCriteria.map((criteria, index) => (
                        <li key={index} className="flex items-start">
                          <span className="mr-2">•</span>
                          {editingEntryCriteria && editingEntryCriteria.index === index ? (
                            <div className="flex-1">
                              <textarea
                                className="w-full p-2 border rounded-md"
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
                                  className="bg-gray-300 px-3 py-1 rounded-md text-sm"
                                  onClick={() => setEditingEntryCriteria(null)}
                                >
                                  Cancelar
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex-1 flex justify-between items-start">
                              <span>{criteria}</span>
                              <button
                                className="ml-2 text-primary-custom hover:text-opacity-80"
                                onClick={() => setEditingEntryCriteria({ index, value: criteria })}
                              >
                                Editar
                              </button>
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-2">Criterios de Salida</h3>
                    <ul className="space-y-2">
                      {testPlan.strategy.exitCriteria.map((criteria, index) => (
                        <li key={index} className="flex items-start">
                          <span className="mr-2">•</span>
                          {editingExitCriteria && editingExitCriteria.index === index ? (
                            <div className="flex-1">
                              <textarea
                                className="w-full p-2 border rounded-md"
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
                                  className="bg-gray-300 px-3 py-1 rounded-md text-sm"
                                  onClick={() => setEditingExitCriteria(null)}
                                >
                                  Cancelar
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex-1 flex justify-between items-start">
                              <span>{criteria}</span>
                              <button
                                className="ml-2 text-primary-custom hover:text-opacity-80"
                                onClick={() => setEditingExitCriteria({ index, value: criteria })}
                              >
                                Editar
                              </button>
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
            {/* Pestaña de Entorno */}
            {activeTab === "environment" && (
              <div>
                <h2 className="text-2xl font-bold mb-4 text-primary-custom">Entorno y Datos de Prueba</h2>

                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-2">Entornos Requeridos</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border p-2 text-left">Entorno</th>
                          <th className="border p-2 text-left">Propósito</th>
                          <th className="border p-2 text-left">Configuración</th>
                          <th className="border p-2 text-left">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {testPlan.environment.environments.map((env, index) => (
                          <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                            <td className="border p-2">
                              {editingEnvironment &&
                                editingEnvironment.index === index &&
                                editingEnvironment.field === "name" ? (
                                <input
                                  type="text"
                                  className="w-full p-1 border rounded"
                                  value={editingEnvironment.value}
                                  onChange={(e) =>
                                    setEditingEnvironment({ ...editingEnvironment, value: e.target.value })
                                  }
                                />
                              ) : (
                                env.name
                              )}
                            </td>
                            <td className="border p-2">
                              {editingEnvironment &&
                                editingEnvironment.index === index &&
                                editingEnvironment.field === "purpose" ? (
                                <textarea
                                  className="w-full p-1 border rounded"
                                  value={editingEnvironment.value}
                                  onChange={(e) =>
                                    setEditingEnvironment({ ...editingEnvironment, value: e.target.value })
                                  }
                                />
                              ) : (
                                env.purpose
                              )}
                            </td>
                            <td className="border p-2">
                              {editingEnvironment &&
                                editingEnvironment.index === index &&
                                editingEnvironment.field === "configuration" ? (
                                <textarea
                                  className="w-full p-1 border rounded"
                                  value={editingEnvironment.value}
                                  onChange={(e) =>
                                    setEditingEnvironment({ ...editingEnvironment, value: e.target.value })
                                  }
                                />
                              ) : (
                                env.configuration
                              )}
                            </td>
                            <td className="border p-2">
                              {editingEnvironment && editingEnvironment.index === index ? (
                                <div className="flex space-x-1">
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
                                    className="bg-gray-300 px-2 py-1 rounded text-xs"
                                    onClick={() => setEditingEnvironment(null)}
                                  >
                                    Cancelar
                                  </button>
                                </div>
                              ) : (
                                <div className="flex flex-col space-y-1">
                                  <button
                                    className="text-primary-custom hover:text-opacity-80 text-xs"
                                    onClick={() => setEditingEnvironment({ index, field: "name", value: env.name })}
                                  >
                                    Editar Nombre
                                  </button>
                                  <button
                                    className="text-primary-custom hover:text-opacity-80 text-xs"
                                    onClick={() =>
                                      setEditingEnvironment({ index, field: "purpose", value: env.purpose })
                                    }
                                  >
                                    Editar Propósito
                                  </button>
                                  <button
                                    className="text-primary-custom hover:text-opacity-80 text-xs"
                                    onClick={() =>
                                      setEditingEnvironment({ index, field: "configuration", value: env.configuration })
                                    }
                                  >
                                    Editar Config.
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-2">Datos de Prueba</h3>
                  <ul className="space-y-2">
                    {testPlan.environment.testData.map((data, index) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-2">•</span>
                        {editingTestData && editingTestData.index === index ? (
                          <div className="flex-1">
                            <textarea
                              className="w-full p-2 border rounded-md"
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
                                className="bg-gray-300 px-3 py-1 rounded-md text-sm"
                                onClick={() => setEditingTestData(null)}
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex-1 flex justify-between items-start">
                            <span>{data}</span>
                            <button
                              className="ml-2 text-primary-custom hover:text-opacity-80"
                              onClick={() => setEditingTestData({ index, value: data })}
                            >
                              Editar
                            </button>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-2">Herramientas</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {testPlan.environment.tools.map((tool, index) => (
                      <div key={index} className="border rounded-lg p-4 bg-white shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold">
                            {editingTool && editingTool.index === index && editingTool.field === "name" ? (
                              <input
                                type="text"
                                className="w-full p-1 border rounded"
                                value={editingTool.value}
                                onChange={(e) => setEditingTool({ ...editingTool, value: e.target.value })}
                              />
                            ) : (
                              tool.name
                            )}
                          </h4>
                          {!(editingTool && editingTool.index === index && editingTool.field === "name") && (
                            <button
                              className="text-primary-custom hover:text-opacity-80 text-xs"
                              onClick={() => setEditingTool({ index, field: "name", value: tool.name })}
                            >
                              Editar
                            </button>
                          )}
                        </div>
                        <div>
                          {editingTool && editingTool.index === index && editingTool.field === "purpose" ? (
                            <div>
                              <textarea
                                className="w-full p-1 border rounded"
                                value={editingTool.value}
                                onChange={(e) => setEditingTool({ ...editingTool, value: e.target.value })}
                                rows={3}
                              />
                              <div className="flex mt-2 space-x-2">
                                <button
                                  className="bg-primary-custom text-white px-2 py-1 rounded text-xs"
                                  onClick={() => {
                                    handleEditTool(index, editingTool.field, editingTool.value)
                                    setEditingTool(null)
                                  }}
                                >
                                  Guardar
                                </button>
                                <button
                                  className="bg-gray-300 px-2 py-1 rounded text-xs"
                                  onClick={() => setEditingTool(null)}
                                >
                                  Cancelar
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex justify-between items-start">
                              <p className="text-gray-700">{tool.purpose}</p>
                              {!(editingTool && editingTool.index === index) && (
                                <button
                                  className="ml-2 text-primary-custom hover:text-opacity-80 text-xs"
                                  onClick={() => setEditingTool({ index, field: "purpose", value: tool.purpose })}
                                >
                                  Editar
                                </button>
                              )}
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
                  className="bg-gray-300 hover:bg-gray-400 py-2 px-6 rounded-md transition-colors text-gray-800 font-medium h-10"
                  onClick={() => setTestPlan(null)}
                >
                  Volver
                </button>

                <div className="w-full md:max-w-md space-y-4">
                  <div className="space-y-3">
                    <div className="flex flex-col">
                      <label htmlFor="email-to" className="text-sm font-medium mb-1">
                        Correo electrónico
                      </label>
                      <input
                        id="email-to"
                        type="email"
                        className="p-2 border rounded-md w-full"
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
                        className="p-2 border rounded-md w-full"
                        placeholder="Asunto del correo"
                        value={emailSubject}
                        onChange={(e) => setEmailSubject(e.target.value)}
                      />
                    </div>

                  </div>
                  <button
                    className="bg-[rgb(119,64,106)] text-white py-2 px-4 rounded-md hover:bg-opacity-90 transition-colors w-full"
                    onClick={handleSendEmail}
                    disabled={isSending || !emailTo}
                  >
                    {isSending ? "Enviando..." : `Enviar por Email`}
                  </button>
                </div>
              </div>

              {/* Mensaje de éxito */}
              {emailSent && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                <div className="bg-green-100 text-green-900 rounded-xl shadow-xl p-6 max-w-md w-[90%] text-center">
                  <div className="text-xl font-bold mb-2">📬 ¡Correo enviado!</div>
                  <p className="text-green-800">✅ Tu plan fue enviado correctamente.<br /> ¡Que la calidad te acompañe!</p>
                  <button 
                    onClick={() => setEmailSent(false)}
                    className="mt-4 bg-green-700 text-white py-2 px-6 rounded-md hover:bg-green-800 transition">
                    Cerrar
                  </button>
                </div>
              </div>
            )}

            </div>
          </div>
        </div>
      )}
    </div>
  )
}
