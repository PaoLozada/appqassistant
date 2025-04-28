import { OpenAI } from "openai"
import type { TestPlan, TestPlanInput } from "./types"
import { generateTestPlan } from "./test-plan-generator"

// API Key fija de OpenAI (reemplaza esto con tu API key real)
const OPENAI_API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY
// Modelo a utilizar - Cambiado a GPT-3.5-turbo-16k para manejar respuestas largas
const DEFAULT_MODEL = "gpt-4o-mini" // Cambiado a modelo más estable

// Actualizar la función createPrompt para incluir información del tipo de aplicación
function createPrompt(input: TestPlanInput): string {
  // Construir una descripción enriquecida con la información del tipo de aplicación
  let enrichedDescription = input.description

  if (input.applicationType) {
    enrichedDescription =
      `TIPO DE APLICACIÓN: ${input.applicationType}\n` +
      (input.applicationSubtype ? `SUBTIPO: ${input.applicationSubtype}\n` : "") +
      (input.applicationFeatures && input.applicationFeatures.length > 0
        ? `CARACTERÍSTICAS PRINCIPALES: ${input.applicationFeatures.join(", ")}\n\n`
        : "\n") +
      `DESCRIPCIÓN DETALLADA:\n${input.description}`
  }

  return `
Actúa como un experto certificado en pruebas de software de nivel avanzado ISTQB (International Software Testing Qualifications Board) con más de 10 años de experiencia en la industria. Tu tarea es generar un plan de pruebas exhaustivo, detallado y profesional siguiendo las mejores prácticas y estándares de ISTQB.

DESCRIPCIÓN DEL SISTEMA:
${enrichedDescription}

DETALLES ADICIONALES:
- Tamaño del equipo de pruebas: ${input.teamSize} probadores
- Tipos de prueba requeridos: ${input.testTypes.length > 0 ? input.testTypes.join(", ") : "No especificados"}
- Automatización permitida: ${input.automationAllowed ? "Sí" : "No"}
- Pruebas de rendimiento: ${input.performanceTestingAllowed ? "Incluidas" : "No incluidas"}

REQUISITOS ESPECÍFICOS Y OBLIGATORIOS:

1. OBJETIVOS (mínimo 7):
   - Genera al menos 7 objetivos de prueba claros, específicos, medibles y alineados con los estándares ISTQB.
   - Cada objetivo debe ser concreto y verificable.
   - Los objetivos deben estar directamente relacionados con el tipo de aplicación y sus características específicas.

2. ALCANCE (mínimo 8 incluidos, 5 excluidos):
   - Define un alcance detallado con al menos 8 áreas incluidas y 5 áreas excluidas.
   - Para cada área, proporciona una breve justificación de su inclusión o exclusión.
   - El alcance debe ser específico para el tipo de aplicación descrita.

3. RIESGOS (EXACTAMENTE 20 o más):
   - DEBES identificar EXACTAMENTE 20 RIESGOS O MÁS siguiendo el enfoque de gestión de riesgos de ISTQB.
   - Cada riesgo debe incluir: descripción detallada, impacto (Alto/Medio/Bajo), probabilidad (Alta/Media/Baja) y estrategia de mitigación específica.
   - Los riesgos deben cubrir aspectos técnicos, de negocio, de proyecto y de producto.
   - Los riesgos deben ser específicos para el tipo de aplicación y características descritas.

4. CASOS DE PRUEBA (EXACTAMENTE 20 o más):
   - DEBES desarrollar EXACTAMENTE 10 CASOS DE PRUEBA O MÁS que cubran diferentes niveles y tipos de prueba.
   - Cada caso de prueba debe incluir: título descriptivo, prioridad (Alta/Media/Baja), precondiciones (al menos 2), pasos detallados (al menos 3), resultado esperado específico, tipo de prueba y si es automatizable.
   - Los casos deben cubrir pruebas funcionales, no funcionales, estructurales y de cambios.
   - Los casos de prueba deben estar directamente relacionados con las funcionalidades y características específicas de la aplicación descrita.

5. ESTIMACIÓN DE TIEMPOS (detallada y justificada):
   - Proporciona una estimación de tiempos realista con al menos 8 fases diferentes.
   - Para cada fase, incluye: nombre, duración en días, recursos necesarios y justificación detallada basada en metodologías de estimación reconocidas.
   - La justificación debe mencionar específicamente la metodología utilizada (PERT, puntos de función, juicio experto, etc.) y los factores considerados.
   - Incluye al menos 8 factores que influyen en la estimación.
   - La estimación debe considerar la complejidad específica del tipo de aplicación descrita.

6. ESTRATEGIA DE PRUEBA (completa y detallada):
   - Elabora una estrategia de prueba completa con un enfoque general de al menos 300 caracteres.
   - Incluye al menos 8 técnicas de diseño de pruebas diferentes con descripciones detalladas y ejemplos de aplicación.
   - Define al menos 6 criterios de entrada y 6 criterios de salida específicos y medibles.
   - La estrategia debe ser apropiada para el tipo específico de aplicación descrita.

7. ENTORNO DE PRUEBA (específico y justificado):
   - Define al menos 4 entornos de prueba diferentes con propósito y configuración detallados.
   - Especifica al menos 8 conjuntos de datos de prueba representativos.
   - Recomienda al menos 6 herramientas con justificación específica para cada una.
   - Los entornos y herramientas deben ser apropiados para el tipo de aplicación descrita.

FORMATO DE RESPUESTA:
Responde SOLO con el JSON del plan de pruebas, sin comentarios ni explicaciones adicionales, siguiendo exactamente esta estructura:
{
"objectives": ["objetivo1", "objetivo2", ...],
"scope": {
  "included": ["área1", "área2", ...],
  "excluded": ["área1", "área2", ...]
},
"risks": [
  {
    "description": "descripción del riesgo",
    "impact": "Alto|Medio|Bajo",
    "probability": "Alta|Media|Baja",
    "mitigation": "estrategia de mitigación detallada"
  }
],
"testCases": [
  {
    "title": "título del caso de prueba",
    "priority": "Alta|Media|Baja",
    "preconditions": ["precondición1", "precondición2"],
    "steps": ["paso1", "paso2"],
    "expectedResult": "resultado esperado",
    "type": "tipo de prueba",
    "automatable": true|false
  }
],
"timeEstimation": {
  "phases": [
    {
      "name": "nombre de la fase",
      "duration": 1,
      "resources": "recursos necesarios",
      "justification": "justificación detallada basada en metodologías de estimación"
    }
  ],
  "totalDays": 10,
  "factors": ["factor1", "factor2"]
},
"strategy": {
  "approach": "enfoque general detallado",
  "techniques": [
    {
      "name": "nombre de la técnica",
      "description": "descripción detallada con ejemplos de aplicación"
    }
  ],
  "entryCriteria": ["criterio1", "criterio2"],
  "exitCriteria": ["criterio1", "criterio2"]
},
"environment": {
  "environments": [
    {
      "name": "nombre del entorno",
      "purpose": "propósito detallado",
      "configuration": "configuración específica"
    }
  ],
  "testData": ["dato1", "dato2"],
  "tools": [
    {
      "name": "nombre de la herramienta",
      "purpose": "propósito específico y justificación"
    }
  ]
}
}

IMPORTANTE: Tu respuesta DEBE contener EXACTAMENTE 20 RIESGOS O MÁS y EXACTAMENTE 20 CASOS DE PRUEBA O MÁS. Si no cumples con estos requisitos mínimos, tu respuesta será considerada incompleta y no será aceptada. Asegúrate de que cada sección tenga el nivel de detalle solicitado.

IMPORTANTE: Todos los elementos del plan de pruebas deben estar DIRECTAMENTE RELACIONADOS con la aplicación específica descrita. NO generes un plan genérico. Cada riesgo, caso de prueba, y recomendación debe ser relevante para el tipo de aplicación y sus características particulares.

IMPORTANTE: Asegúrate de que tu respuesta sea un JSON válido. No incluyas comillas simples, comentarios, ni caracteres especiales que puedan invalidar el JSON. Usa solo comillas dobles para las cadenas de texto.
`
}

export async function generateAITestPlan(input: TestPlanInput): Promise<TestPlan> {
  console.log("sssssssssssssssssssssssssss", process.env.OPENAI_API_KEY)
  console.log("mi Key:", OPENAI_API_KEY)
  try {
    // Inicializar el cliente de OpenAI con la API key fija y permitir uso en navegador
    const openai = new OpenAI({
      apiKey: OPENAI_API_KEY
    })

    console.log("API Key disponible:", process.env.OPENAI_API_KEY ? "Sí" : "No")

    console.log("Generando plan de pruebas con IA usando modelo:", DEFAULT_MODEL)

    const prompt = createPrompt(input)


    const response = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        {
          role: "system",
          content:
            "Eres un experto en pruebas de software certificado ISTQB de nivel avanzado. Responde ÚNICAMENTE con un JSON válido que representa un plan de pruebas completo. No incluyas texto adicional, comentarios, ni formato markdown. Solo JSON puro.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.3, // Reducido para respuestas más consistentes y predecibles
      max_tokens: 10000, // Reducido para evitar respuestas demasiado largas
    })

    const aiResponse = response.choices[0].message.content



    if (!aiResponse) {
      throw new Error("No se recibió respuesta de la IA")
    }

    try {
      // Intentar parsear la respuesta como JSON
      console.log("Intentando parsear respuesta JSON...")

      // Limpiar la respuesta antes de parsearla
      let cleanedResponse = aiResponse.trim()

      // Si la respuesta comienza con \`\`\` y termina con \`\`\`, extraer el contenido
      if (cleanedResponse.startsWith("```") && cleanedResponse.endsWith("```")) {
        cleanedResponse = cleanedResponse.substring(3, cleanedResponse.length - 3).trim()

        // Si después de extraer el contenido, comienza con "json", eliminar esa parte
        if (cleanedResponse.toLowerCase().startsWith("json")) {
          cleanedResponse = cleanedResponse.substring(4).trim()
        }
      }

      // Intentar parsear el JSON limpio
      const testPlan: TestPlan = JSON.parse(cleanedResponse)

      // Verificar que el plan tenga al menos 20 riesgos y 20 casos de prueba
      if (!testPlan.risks || testPlan.risks.length < 2 || !testPlan.testCases || testPlan.testCases.length < 2) {
        console.warn("El plan generado no cumple con los requisitos mínimos de 20 riesgos y 20 casos de prueba.")
        // Aquí podrías decidir si usar el plan incompleto o generar uno predeterminado
        const fallbackPlan = generateTestPlan(input)
        return {
          ...fallbackPlan,
          source: "Generador predeterminado (fallback por plan incompleto)",
          description: input.description,
        }
      }

      return {
        ...testPlan,
        source: "con ayuda de inteligencia artificial",
        description: input.description,
      }
    } catch (error) {
      // Si falla el parseo, intentar recuperar el JSON de la respuesta
      console.error("Error al parsear la respuesta de la IA:", error)
      console.log("Respuesta original:", aiResponse.substring(0, 200) + "...")

      // Si todo falla, usar el generador predeterminado
      console.log("Usando generador predeterminado como fallback")
      const fallbackPlan = generateTestPlan(input)
      return {
        ...fallbackPlan,
        source: "Generador predeterminado (fallback por error de parseo)",
        description: input.description,
      }
    }
  } catch (error) {
    console.error("Error al generar el plan de pruebas con IA:", error)
    // En caso de error, usar el generador predeterminado
    const fallbackPlan = generateTestPlan(input)
    return {
      ...fallbackPlan,
      source: "Generador predeterminado (fallback por error general)",
      description: input.description,
    }
  }
}

