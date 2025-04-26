import type { TestPlan, TestPlanInput } from "./types"

// Función para generar un plan de pruebas predeterminado
export function generateTestPlan(input: TestPlanInput): TestPlan {
  // Generar objetivos basados en el tipo de aplicación
  const objectives = generateObjectives(input)

  // Generar alcance basado en el tipo de aplicación
  const scope = generateScope(input)

  // Generar riesgos basados en el tipo de aplicación (al menos 20)
  const risks = generateRisks(input)

  // Generar casos de prueba basados en el tipo de aplicación (al menos 20)
  const testCases = generateTestCases(input)

  // Generar estimación de tiempos
  const timeEstimation = generateTimeEstimation(input)

  // Generar estrategia de prueba
  const strategy = generateStrategy(input)

  // Generar entorno de prueba
  const environment = generateEnvironment(input)

  return {
    objectives,
    scope,
    risks,
    testCases,
    timeEstimation,
    strategy,
    environment,
    source: "Generador predeterminado",
    description: input.description,
  }
}

// Función para generar objetivos basados en el tipo de aplicación
function generateObjectives(input: TestPlanInput): string[] {
  const baseObjectives = [
    "Verificar que todas las funcionalidades principales cumplen con los requisitos especificados",
    "Identificar y reportar defectos críticos antes de la puesta en producción",
    "Validar la usabilidad y experiencia de usuario en diferentes dispositivos y navegadores",
    "Asegurar que el sistema cumple con los estándares de seguridad requeridos",
    "Verificar el rendimiento del sistema bajo condiciones normales y de estrés",
    "Comprobar la integración correcta con sistemas externos y APIs",
    "Validar que la documentación del usuario es clara, completa y precisa",
  ]

  // Añadir objetivos específicos según el tipo de aplicación
  if (input.applicationType === "Web") {
    baseObjectives.push("Verificar la compatibilidad con los principales navegadores y dispositivos")
    baseObjectives.push("Validar la accesibilidad según estándares WCAG 2.1")
  } else if (input.applicationType === "Móvil") {
    baseObjectives.push("Verificar el funcionamiento correcto en diferentes versiones del sistema operativo")
    baseObjectives.push("Validar el comportamiento de la aplicación con diferentes tamaños de pantalla")
  } else if (input.applicationType === "API") {
    baseObjectives.push("Verificar que todas las endpoints responden según la documentación")
    baseObjectives.push("Validar el manejo adecuado de errores y excepciones")
  } else if (input.applicationType === "Escritorio") {
    baseObjectives.push("Verificar la instalación y desinstalación correcta en diferentes sistemas operativos")
    baseObjectives.push("Validar la integración con el hardware del sistema")
  }

  return baseObjectives
}

// Función para generar alcance basado en el tipo de aplicación
function generateScope(input: TestPlanInput): { included: string[]; excluded: string[] } {
  const included = [
    "Pruebas funcionales de todas las características principales",
    "Pruebas de integración con sistemas externos",
    "Pruebas de usabilidad básicas",
    "Pruebas de seguridad básicas",
    "Pruebas de rendimiento bajo carga normal",
    "Pruebas de compatibilidad con navegadores/dispositivos principales",
    "Pruebas de regresión para funcionalidades existentes",
    "Validación de datos de entrada y salida",
  ]

  const excluded = [
    "Pruebas de penetración avanzadas",
    "Pruebas de rendimiento extremas",
    "Pruebas de compatibilidad con navegadores/dispositivos obsoletos",
    "Pruebas de localización para todos los idiomas",
    "Auditoría completa de código",
  ]

  // Añadir elementos específicos según el tipo de aplicación
  if (input.applicationType === "Web") {
    included.push("Pruebas de accesibilidad WCAG nivel A y AA")
    excluded.push("Pruebas de accesibilidad WCAG nivel AAA")
  } else if (input.applicationType === "Móvil") {
    included.push("Pruebas de consumo de batería")
    excluded.push("Pruebas en todos los modelos de dispositivos")
  }

  return { included, excluded }
}

// Función para generar riesgos basados en el tipo de aplicación (al menos 20)
function generateRisks(
  input: TestPlanInput,
): { description: string; impact: string; probability: string; mitigation: string }[] {
  const baseRisks = [
    {
      description: "Requisitos incompletos o ambiguos",
      impact: "Alto",
      probability: "Media",
      mitigation: "Realizar sesiones de refinamiento de requisitos con stakeholders y documentar todas las decisiones",
    },
    {
      description: "Falta de disponibilidad de entornos de prueba",
      impact: "Alto",
      probability: "Media",
      mitigation: "Planificar y reservar entornos con anticipación, considerar el uso de entornos virtualizados",
    },
    {
      description: "Cambios frecuentes en los requisitos",
      impact: "Alto",
      probability: "Alta",
      mitigation: "Implementar un proceso formal de gestión de cambios y evaluar el impacto en las pruebas",
    },
    {
      description: "Defectos críticos encontrados tarde en el ciclo",
      impact: "Alto",
      probability: "Media",
      mitigation: "Implementar pruebas tempranas y continuas, con énfasis en pruebas de humo y regresión automatizadas",
    },
    {
      description: "Falta de datos de prueba representativos",
      impact: "Medio",
      probability: "Alta",
      mitigation: "Crear una estrategia de datos de prueba y generar datos sintéticos cuando sea necesario",
    },
    {
      description: "Dependencias externas no disponibles para pruebas",
      impact: "Alto",
      probability: "Media",
      mitigation: "Utilizar mocks y stubs para simular dependencias externas durante las pruebas",
    },
    {
      description: "Tiempo insuficiente para pruebas completas",
      impact: "Alto",
      probability: "Alta",
      mitigation: "Priorizar pruebas basadas en riesgos y negociar plazos realistas con los stakeholders",
    },
    {
      description: "Falta de experiencia del equipo en tecnologías específicas",
      impact: "Medio",
      probability: "Media",
      mitigation:
        "Proporcionar capacitación al equipo y considerar la contratación de especialistas para áreas críticas",
    },
    {
      description: "Problemas de rendimiento bajo carga",
      impact: "Alto",
      probability: "Media",
      mitigation: "Realizar pruebas de carga temprano en el ciclo y monitorear continuamente el rendimiento",
    },
    {
      description: "Vulnerabilidades de seguridad",
      impact: "Alto",
      probability: "Media",
      mitigation: "Implementar revisiones de código de seguridad y pruebas de penetración regulares",
    },
    {
      description: "Incompatibilidad con navegadores o dispositivos específicos",
      impact: "Medio",
      probability: "Alta",
      mitigation: "Definir una matriz de compatibilidad clara y probar en los navegadores/dispositivos más utilizados",
    },
    {
      description: "Problemas de integración con sistemas externos",
      impact: "Alto",
      probability: "Alta",
      mitigation:
        "Realizar pruebas de integración tempranas y establecer acuerdos de nivel de servicio con proveedores externos",
    },
    {
      description: "Documentación técnica insuficiente",
      impact: "Medio",
      probability: "Alta",
      mitigation: "Establecer estándares de documentación y revisiones periódicas",
    },
    {
      description: "Errores en la migración de datos",
      impact: "Alto",
      probability: "Media",
      mitigation: "Crear planes de prueba específicos para migración y realizar pruebas con datos reales",
    },
    {
      description: "Problemas de usabilidad que afectan la experiencia del usuario",
      impact: "Medio",
      probability: "Alta",
      mitigation:
        "Realizar pruebas de usabilidad con usuarios reales y aplicar principios de diseño centrado en el usuario",
    },
    {
      description: "Falta de automatización de pruebas",
      impact: "Medio",
      probability: "Media",
      mitigation: "Desarrollar una estrategia de automatización progresiva, priorizando casos de prueba críticos",
    },
    {
      description: "Problemas de accesibilidad para usuarios con discapacidades",
      impact: "Medio",
      probability: "Alta",
      mitigation: "Implementar pruebas de accesibilidad y seguir pautas WCAG",
    },
    {
      description: "Falta de trazabilidad entre requisitos y pruebas",
      impact: "Medio",
      probability: "Media",
      mitigation: "Utilizar herramientas de gestión de pruebas que permitan vincular requisitos con casos de prueba",
    },
    {
      description: "Comunicación deficiente entre equipos de desarrollo y pruebas",
      impact: "Alto",
      probability: "Media",
      mitigation: "Establecer reuniones regulares y canales de comunicación efectivos entre equipos",
    },
    {
      description: "Gestión inadecuada de defectos",
      impact: "Medio",
      probability: "Media",
      mitigation: "Implementar un proceso claro de gestión de defectos con criterios de priorización",
    },
  ]

  // Añadir riesgos específicos según el tipo de aplicación
  if (input.applicationType === "Web") {
    baseRisks.push({
      description: "Problemas de rendimiento en navegadores específicos",
      impact: "Medio",
      probability: "Alta",
      mitigation: "Realizar pruebas de rendimiento en diferentes navegadores y optimizar el código para compatibilidad",
    })
    baseRisks.push({
      description: "Problemas de SEO que afectan la visibilidad en buscadores",
      impact: "Alto",
      probability: "Media",
      mitigation:
        "Implementar pruebas específicas de SEO y seguir las mejores prácticas de optimización para motores de búsqueda",
    })
  } else if (input.applicationType === "Móvil") {
    baseRisks.push({
      description: "Consumo excesivo de batería",
      impact: "Alto",
      probability: "Media",
      mitigation: "Realizar pruebas específicas de consumo de batería y optimizar el uso de recursos",
    })
    baseRisks.push({
      description: "Problemas con permisos del sistema",
      impact: "Alto",
      probability: "Media",
      mitigation: "Probar diferentes escenarios de permisos y manejar adecuadamente los casos de denegación",
    })
  } else if (input.applicationType === "API") {
    baseRisks.push({
      description: "Documentación de API desactualizada",
      impact: "Alto",
      probability: "Alta",
      mitigation: "Implementar documentación automática de API y validar su precisión regularmente",
    })
    baseRisks.push({
      description: "Problemas de rate limiting y throttling",
      impact: "Alto",
      probability: "Media",
      mitigation: "Implementar pruebas específicas para validar políticas de rate limiting y comportamiento bajo carga",
    })
  } else if (input.applicationType === "Escritorio") {
    baseRisks.push({
      description: "Problemas de instalación en diferentes configuraciones de sistema",
      impact: "Alto",
      probability: "Alta",
      mitigation: "Probar la instalación en diferentes configuraciones de hardware y software",
    })
    baseRisks.push({
      description: "Conflictos con otro software instalado",
      impact: "Medio",
      probability: "Media",
      mitigation: "Identificar software común que podría causar conflictos y realizar pruebas de compatibilidad",
    })
  }

  return baseRisks
}

// Función para generar casos de prueba basados en el tipo de aplicación (al menos 20)
function generateTestCases(input: TestPlanInput): {
  title: string
  priority: string
  preconditions: string[]
  steps: string[]
  expectedResult: string
  type: string
  automatable: boolean
}[] {
  const baseTestCases = [
    {
      title: "Verificar inicio de sesión con credenciales válidas",
      priority: "Alta",
      preconditions: ["Usuario registrado en el sistema", "Sistema accesible"],
      steps: [
        "Acceder a la página de inicio de sesión",
        "Ingresar nombre de usuario válido",
        "Ingresar contraseña válida",
        "Hacer clic en el botón 'Iniciar sesión'",
      ],
      expectedResult: "El usuario accede correctamente al sistema y es redirigido a la página principal",
      type: "Funcional",
      automatable: true,
    },
    {
      title: "Verificar inicio de sesión con credenciales inválidas",
      priority: "Alta",
      preconditions: ["Sistema accesible"],
      steps: [
        "Acceder a la página de inicio de sesión",
        "Ingresar nombre de usuario inválido",
        "Ingresar contraseña inválida",
        "Hacer clic en el botón 'Iniciar sesión'",
      ],
      expectedResult: "El sistema muestra un mensaje de error indicando que las credenciales son incorrectas",
      type: "Funcional",
      automatable: true,
    },
    {
      title: "Verificar recuperación de contraseña",
      priority: "Media",
      preconditions: ["Usuario registrado en el sistema", "Sistema accesible"],
      steps: [
        "Acceder a la página de inicio de sesión",
        "Hacer clic en 'Olvidé mi contraseña'",
        "Ingresar correo electrónico asociado a la cuenta",
        "Hacer clic en 'Enviar'",
      ],
      expectedResult: "El sistema envía un correo con instrucciones para restablecer la contraseña",
      type: "Funcional",
      automatable: true,
    },
    {
      title: "Verificar registro de nuevo usuario",
      priority: "Alta",
      preconditions: ["Sistema accesible", "Correo electrónico no registrado previamente"],
      steps: [
        "Acceder a la página de registro",
        "Completar todos los campos obligatorios",
        "Aceptar términos y condiciones",
        "Hacer clic en 'Registrarse'",
      ],
      expectedResult: "El sistema crea la cuenta y envía un correo de verificación",
      type: "Funcional",
      automatable: true,
    },
    {
      title: "Verificar validación de campos obligatorios en formulario de registro",
      priority: "Media",
      preconditions: ["Sistema accesible"],
      steps: ["Acceder a la página de registro", "Dejar campos obligatorios en blanco", "Hacer clic en 'Registrarse'"],
      expectedResult: "El sistema muestra mensajes de error para cada campo obligatorio no completado",
      type: "Funcional",
      automatable: true,
    },
    {
      title: "Verificar cierre de sesión",
      priority: "Media",
      preconditions: ["Usuario con sesión iniciada", "Sistema accesible"],
      steps: ["Navegar a cualquier página del sistema", "Hacer clic en la opción 'Cerrar sesión'"],
      expectedResult: "El sistema cierra la sesión y redirige al usuario a la página de inicio",
      type: "Funcional",
      automatable: true,
    },
    {
      title: "Verificar persistencia de sesión después de cerrar el navegador",
      priority: "Baja",
      preconditions: ["Usuario con sesión iniciada", "Opción 'Recordarme' seleccionada"],
      steps: ["Cerrar el navegador", "Reabrir el navegador", "Acceder a la URL del sistema"],
      expectedResult: "El sistema mantiene la sesión del usuario activa",
      type: "Funcional",
      automatable: true,
    },
    {
      title: "Verificar tiempo de carga de la página principal",
      priority: "Media",
      preconditions: ["Sistema accesible", "Conexión a internet estable"],
      steps: ["Acceder a la URL principal del sistema", "Medir el tiempo de carga completa de la página"],
      expectedResult: "La página carga completamente en menos de 3 segundos",
      type: "Rendimiento",
      automatable: true,
    },
    {
      title: "Verificar compatibilidad con diferentes navegadores",
      priority: "Alta",
      preconditions: ["Sistema desplegado", "Acceso a diferentes navegadores"],
      steps: [
        "Acceder al sistema desde Chrome",
        "Acceder al sistema desde Firefox",
        "Acceder al sistema desde Safari",
        "Acceder al sistema desde Edge",
      ],
      expectedResult: "El sistema se visualiza y funciona correctamente en todos los navegadores probados",
      type: "Compatibilidad",
      automatable: true,
    },
    {
      title: "Verificar responsividad en dispositivos móviles",
      priority: "Alta",
      preconditions: ["Sistema desplegado", "Acceso a dispositivos móviles o emuladores"],
      steps: [
        "Acceder al sistema desde un smartphone",
        "Acceder al sistema desde una tablet",
        "Navegar por las principales secciones",
      ],
      expectedResult: "La interfaz se adapta correctamente a diferentes tamaños de pantalla",
      type: "Usabilidad",
      automatable: false,
    },
    {
      title: "Verificar protección contra inyección SQL",
      priority: "Alta",
      preconditions: ["Sistema accesible", "Acceso a formularios con entrada de datos"],
      steps: [
        "Identificar campos de entrada de texto",
        "Ingresar cadenas con caracteres especiales de SQL como ' OR 1=1 --",
        "Enviar el formulario",
      ],
      expectedResult: "El sistema sanitiza la entrada y no muestra vulnerabilidades",
      type: "Seguridad",
      automatable: true,
    },
    {
      title: "Verificar manejo de sesiones concurrentes",
      priority: "Media",
      preconditions: ["Usuario con cuenta activa", "Acceso a múltiples navegadores o dispositivos"],
      steps: ["Iniciar sesión en el dispositivo A", "Iniciar sesión con las mismas credenciales en el dispositivo B"],
      expectedResult:
        "El sistema maneja correctamente las sesiones según la política definida (permitir ambas o cerrar la primera)",
      type: "Seguridad",
      automatable: true,
    },
    {
      title: "Verificar funcionalidad de búsqueda",
      priority: "Media",
      preconditions: ["Usuario con sesión iniciada", "Datos existentes en el sistema"],
      steps: ["Acceder a la función de búsqueda", "Ingresar términos de búsqueda válidos", "Ejecutar la búsqueda"],
      expectedResult: "El sistema muestra resultados relevantes para los términos buscados",
      type: "Funcional",
      automatable: true,
    },
    {
      title: "Verificar paginación de resultados",
      priority: "Baja",
      preconditions: ["Usuario con sesión iniciada", "Suficientes datos para generar múltiples páginas"],
      steps: [
        "Realizar una búsqueda que genere múltiples páginas de resultados",
        "Navegar a la segunda página",
        "Navegar a la última página",
      ],
      expectedResult: "El sistema muestra correctamente los resultados paginados",
      type: "Funcional",
      automatable: true,
    },
    {
      title: "Verificar filtrado de resultados",
      priority: "Media",
      preconditions: ["Usuario con sesión iniciada", "Datos con diferentes atributos para filtrar"],
      steps: ["Acceder a una lista de elementos", "Aplicar un filtro específico", "Verificar los resultados"],
      expectedResult: "El sistema muestra solo los elementos que cumplen con el criterio de filtrado",
      type: "Funcional",
      automatable: true,
    },
    {
      title: "Verificar exportación de datos",
      priority: "Baja",
      preconditions: ["Usuario con sesión iniciada", "Datos disponibles para exportar"],
      steps: [
        "Acceder a una vista con datos",
        "Seleccionar la opción de exportar",
        "Elegir formato (CSV, PDF, etc.)",
        "Confirmar exportación",
      ],
      expectedResult: "El sistema genera un archivo en el formato seleccionado con los datos correctos",
      type: "Funcional",
      automatable: true,
    },
    {
      title: "Verificar importación de datos",
      priority: "Media",
      preconditions: ["Usuario con sesión iniciada", "Archivo válido para importar"],
      steps: ["Acceder a la función de importación", "Seleccionar archivo a importar", "Confirmar importación"],
      expectedResult: "El sistema procesa el archivo y carga los datos correctamente",
      type: "Funcional",
      automatable: true,
    },
    {
      title: "Verificar notificaciones al usuario",
      priority: "Baja",
      preconditions: ["Usuario con sesión iniciada", "Configuración que genere notificaciones"],
      steps: ["Realizar una acción que deba generar notificación", "Verificar la aparición de la notificación"],
      expectedResult: "El sistema muestra la notificación con el mensaje correcto",
      type: "Funcional",
      automatable: true,
    },
    {
      title: "Verificar accesibilidad para lectores de pantalla",
      priority: "Media",
      preconditions: ["Sistema desplegado", "Acceso a herramientas de evaluación de accesibilidad"],
      steps: [
        "Navegar por el sistema utilizando solo teclado",
        "Verificar etiquetas ARIA y atributos alt",
        "Probar con un lector de pantalla",
      ],
      expectedResult: "El sistema es navegable y comprensible mediante lectores de pantalla",
      type: "Accesibilidad",
      automatable: false,
    },
    {
      title: "Verificar contraste de colores",
      priority: "Baja",
      preconditions: ["Sistema desplegado", "Acceso a herramientas de evaluación de contraste"],
      steps: ["Identificar combinaciones de colores texto/fondo", "Verificar ratio de contraste según WCAG"],
      expectedResult: "Todas las combinaciones de colores cumplen con el nivel AA de WCAG",
      type: "Accesibilidad",
      automatable: true,
    },
  ]

  // Añadir casos de prueba específicos según el tipo de aplicación
  if (input.applicationType === "Web") {
    baseTestCases.push({
      title: "Verificar comportamiento con JavaScript deshabilitado",
      priority: "Baja",
      preconditions: ["Sistema desplegado", "Navegador con opción para deshabilitar JavaScript"],
      steps: [
        "Deshabilitar JavaScript en el navegador",
        "Acceder al sistema",
        "Intentar utilizar funcionalidades principales",
      ],
      expectedResult:
        "El sistema muestra mensajes adecuados o alternativas para funcionalidades que requieren JavaScript",
      type: "Funcional",
      automatable: false,
    })
  } else if (input.applicationType === "Móvil") {
    baseTestCases.push({
      title: "Verificar comportamiento con conectividad intermitente",
      priority: "Alta",
      preconditions: ["Aplicación instalada", "Dispositivo con control de conectividad"],
      steps: ["Iniciar la aplicación con conexión", "Desactivar la conexión durante el uso", "Reactivar la conexión"],
      expectedResult:
        "La aplicación maneja adecuadamente los cambios de conectividad y sincroniza datos cuando la conexión se restablece",
      type: "Funcional",
      automatable: true,
    })
  }

  return baseTestCases
}

// Función para generar estimación de tiempos
function generateTimeEstimation(input: TestPlanInput): {
  phases: { name: string; duration: number; resources: string; justification: string }[]
  totalDays: number
  factors: string[]
} {
  // Calcular duración base según el tamaño del equipo
  const teamSizeFactor = Math.max(1, input.teamSize)
  const baseDuration = 30 / teamSizeFactor

  const phases = [
    {
      name: "Planificación de pruebas",
      duration: Math.ceil(baseDuration * 0.1),
      resources: `${Math.min(2, input.teamSize)} probadores senior`,
      justification:
        "Tiempo necesario para analizar requisitos, identificar riesgos y diseñar la estrategia de pruebas",
    },
    {
      name: "Diseño de casos de prueba",
      duration: Math.ceil(baseDuration * 0.2),
      resources: `${Math.ceil(input.teamSize * 0.7)} probadores`,
      justification: "Tiempo para crear casos de prueba detallados basados en requisitos y riesgos identificados",
    },
    {
      name: "Preparación del entorno",
      duration: Math.ceil(baseDuration * 0.1),
      resources: `${Math.min(2, input.teamSize)} probadores con conocimientos técnicos`,
      justification: "Configuración de entornos, herramientas y datos de prueba necesarios",
    },
    {
      name: "Ejecución de pruebas funcionales",
      duration: Math.ceil(baseDuration * 0.3),
      resources: `${input.teamSize} probadores`,
      justification: "Ejecución de casos de prueba funcionales y registro de resultados",
    },
    {
      name: "Ejecución de pruebas no funcionales",
      duration: Math.ceil(baseDuration * 0.15),
      resources: `${Math.ceil(input.teamSize * 0.5)} probadores especializados`,
      justification: "Ejecución de pruebas de rendimiento, seguridad, usabilidad y accesibilidad",
    },
    {
      name: "Pruebas de regresión",
      duration: Math.ceil(baseDuration * 0.1),
      resources: `${Math.ceil(input.teamSize * 0.5)} probadores`,
      justification: "Verificación de que las correcciones no han introducido nuevos defectos",
    },
    {
      name: "Gestión de defectos",
      duration: Math.ceil(baseDuration * 0.05),
      resources: `${Math.min(2, input.teamSize)} probadores senior`,
      justification: "Seguimiento y verificación de correcciones de defectos reportados",
    },
    {
      name: "Documentación y reportes finales",
      duration: Math.ceil(baseDuration * 0.05),
      resources: `${Math.min(2, input.teamSize)} probadores senior`,
      justification: "Preparación de informes finales y documentación de resultados",
    },
  ]

  // Calcular el total de días
  const totalDays = phases.reduce((sum, phase) => sum + phase.duration, 0)

  const factors = [
    "Complejidad del sistema",
    "Tamaño del equipo de pruebas",
    "Experiencia del equipo en el dominio",
    "Disponibilidad de entornos de prueba",
    "Calidad de la documentación de requisitos",
    "Estabilidad de los requisitos",
    "Nivel de automatización de pruebas",
    "Dependencias externas",
  ]

  return {
    phases,
    totalDays,
    factors,
  }
}

// Función para generar estrategia de prueba
function generateStrategy(input: TestPlanInput): {
  approach: string
  techniques: { name: string; description: string }[]
  entryCriteria: string[]
  exitCriteria: string[]
} {
  const approach = `La estrategia de pruebas se basa en un enfoque de pruebas basado en riesgos, priorizando las áreas con mayor impacto potencial en el negocio y los usuarios. Se implementará un enfoque de pruebas tempranas, integrando actividades de prueba desde las fases iniciales del desarrollo. Se utilizará una combinación de pruebas manuales para aspectos que requieren juicio humano (como usabilidad) y automatización para pruebas repetitivas y de regresión. Las pruebas se organizarán en niveles (unitarias, integración, sistema, aceptación) y tipos (funcionales, no funcionales), con énfasis en la cobertura completa de requisitos críticos.`

  const techniques = [
    {
      name: "Partición de equivalencia",
      description:
        "División de datos de entrada en clases equivalentes para reducir el número de casos de prueba manteniendo la cobertura",
    },
    {
      name: "Análisis de valores límite",
      description:
        "Pruebas con valores en los límites de las clases de equivalencia, donde suelen ocurrir más defectos",
    },
    {
      name: "Tablas de decisión",
      description: "Representación de combinaciones de condiciones y acciones para probar lógica compleja",
    },
    {
      name: "Pruebas de transición de estado",
      description: "Verificación de cambios de estado del sistema en respuesta a eventos específicos",
    },
    {
      name: "Pruebas exploratorias",
      description: "Diseño y ejecución simultánea de pruebas basadas en la experiencia del probador",
    },
    {
      name: "Pruebas basadas en casos de uso",
      description: "Derivación de casos de prueba a partir de escenarios de uso definidos",
    },
    {
      name: "Pruebas de caja negra",
      description: "Enfoque funcional sin conocimiento de la estructura interna del sistema",
    },
    {
      name: "Pruebas de caja blanca",
      description: "Pruebas basadas en la estructura interna y el código del sistema",
    },
  ]

  const entryCriteria = [
    "Requisitos aprobados y documentados",
    "Plan de pruebas revisado y aprobado",
    "Entorno de pruebas configurado y operativo",
    "Datos de prueba preparados y cargados",
    "Casos de prueba diseñados y revisados",
    "Herramientas de prueba instaladas y configuradas",
  ]

  const exitCriteria = [
    "100% de casos de prueba críticos ejecutados",
    "0 defectos críticos o bloqueantes abiertos",
    "Al menos 90% de casos de prueba totales ejecutados",
    "Cobertura de código superior al 80% (si aplica)",
    "Todos los requisitos funcionales verificados",
    "Informes de prueba completados y aprobados",
  ]

  return {
    approach,
    techniques,
    entryCriteria,
    exitCriteria,
  }
}

// Función para generar entorno de prueba
function generateEnvironment(input: TestPlanInput): {
  environments: { name: string; purpose: string; configuration: string }[]
  testData: string[]
  tools: { name: string; purpose: string }[]
} {
  const environments = [
    {
      name: "Entorno de desarrollo",
      purpose: "Pruebas unitarias y de integración tempranas",
      configuration: "Configuración local con bases de datos de desarrollo",
    },
    {
      name: "Entorno de pruebas (QA)",
      purpose: "Pruebas funcionales y no funcionales completas",
      configuration: "Configuración similar a producción con datos de prueba controlados",
    },
    {
      name: "Entorno de preproducción",
      purpose: "Pruebas de integración final y aceptación de usuario",
      configuration: "Réplica exacta del entorno de producción",
    },
    {
      name: "Entorno de pruebas de rendimiento",
      purpose: "Pruebas de carga, estrés y rendimiento",
      configuration: "Configuración escalada para simular condiciones de producción",
    },
  ]

  const testData = [
    "Datos válidos para casos positivos",
    "Datos inválidos para casos negativos",
    "Datos límite para análisis de valores límite",
    "Datos masivos para pruebas de rendimiento",
    "Datos sensibles para pruebas de seguridad",
    "Datos de migración para pruebas de compatibilidad",
    "Datos históricos para pruebas de reportes",
    "Datos internacionales para pruebas de localización",
  ]

  const tools = [
    {
      name: "Selenium",
      purpose: "Automatización de pruebas de interfaz web",
    },
    {
      name: "JMeter",
      purpose: "Pruebas de rendimiento y carga",
    },
    {
      name: "Postman",
      purpose: "Pruebas de API REST",
    },
    {
      name: "JIRA",
      purpose: "Gestión de defectos y seguimiento de pruebas",
    },
    {
      name: "Jenkins",
      purpose: "Integración continua y ejecución automatizada de pruebas",
    },
    {
      name: "SonarQube",
      purpose: "Análisis estático de código y calidad",
    },
  ]

  // Añadir herramientas específicas según el tipo de aplicación
  if (input.applicationType === "Web") {
    tools.push({
      name: "Lighthouse",
      purpose: "Análisis de rendimiento y accesibilidad web",
    })
  } else if (input.applicationType === "Móvil") {
    tools.push({
      name: "Appium",
      purpose: "Automatización de pruebas para aplicaciones móviles",
    })
  }

  return {
    environments,
    testData,
    tools,
  }
}

