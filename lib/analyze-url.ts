import { OpenAI } from "openai"

// API Key fija de OpenAI (reemplaza esto con tu API key real)
const OPENAI_API_KEY = process.env.OPEN_API_KEY as string;
// Modelo a utilizar - Cambiado a GPT-4 para obtener respuestas de mayor calidad
const DEFAULT_MODEL = "gpt-4" // Alternativas: "gpt-4o", "gpt-4-turbo"

export async function analyzeUrlWithAI(url: string): Promise<string> {
  try {
    // Inicializar el cliente de OpenAI con la API key fija y permitir uso en navegador
    const openai = new OpenAI({
      apiKey: OPENAI_API_KEY
    })

    console.log("Analizando URL con IA:", url)

    // Actualizar el prompt para el análisis de URL para que sea más detallado y orientado a QA
    const prompt = `
Actúa como un experto certificado en pruebas de software de nivel avanzado ISTQB con especialización en análisis de requisitos y planificación de pruebas.

Analiza la siguiente URL: ${url}

Proporciona una descripción EXTREMADAMENTE DETALLADA y profesional del sitio web o aplicación para crear un plan de pruebas exhaustivo siguiendo los estándares ISTQB. Tu análisis debe incluir:

1. Tipo de aplicación o sitio web (e-commerce, blog, aplicación empresarial, etc.)
2. Arquitectura probable y tecnologías utilizadas (frontend, backend, bases de datos, integraciones)
3. Funcionalidades principales identificadas (al menos 10 funcionalidades específicas)
4. Flujos de usuario críticos que deberían probarse con prioridad (al menos 5 flujos detallados)
5. Posibles puntos de integración con sistemas externos (al menos 3)
6. Áreas de riesgo potencial desde la perspectiva de calidad del software (al menos 8 áreas)
7. Consideraciones de seguridad, rendimiento y usabilidad específicas para este tipo de aplicación
8. Tipos de pruebas recomendados según el contexto de la aplicación (al menos 6 tipos)
9. Consideraciones sobre dispositivos, navegadores y entornos para pruebas (al menos 5 consideraciones)
10. Posibles desafíos de prueba específicos para esta aplicación (al menos 5 desafíos)
11. Recomendaciones para estrategias de automatización si fueran aplicables
12. Métricas de calidad relevantes que deberían monitorearse

Formato tu respuesta como un texto continuo detallado y profesional que pueda ser utilizado como descripción para generar un plan de pruebas completo. Incluye suficiente detalle técnico y contextual para que un equipo de QA pueda entender completamente el alcance y complejidad del sistema a probar.

Tu respuesta debe tener al menos 1000 palabras para asegurar un nivel adecuado de detalle.
`

    // Actualizar la configuración de la llamada a la API
    const response = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        {
          role: "system",
          content:
            "Eres un experto en pruebas de software certificado ISTQB de nivel avanzado con especialización en análisis de requisitos y planificación de pruebas. Siempre proporcionas análisis extremadamente detallados y exhaustivos.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.5, // Reducido para respuestas más consistentes y enfocadas
      max_tokens: 2000, // Aumentado para permitir respuestas más detalladas
    })

    // Obtener la respuesta
    const aiResponse = response.choices[0].message.content

    if (!aiResponse) {
      throw new Error("No se recibió respuesta de la IA")
    }

    return aiResponse
  } catch (error) {
    console.error("Error al analizar la URL con IA:", error)
    return ""
  }
}

