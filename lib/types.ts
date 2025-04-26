// Definición de tipos para la aplicación de generación de planes de prueba

// Tipo para la entrada del generador de planes de prueba
export interface TestPlanInput {
  description: string
  teamSize: number
  testTypes: string[]
  automationAllowed: boolean
  performanceTestingAllowed: boolean
  // Nuevos campos para el tipo de aplicación
  applicationType?: string
  applicationSubtype?: string
  applicationFeatures?: string[]
}

// Tipo para un plan de pruebas completo
export interface TestPlan {
  objectives: string[]
  scope: {
    included: string[]
    excluded: string[]
  }
  risks: Risk[]
  testCases: TestCase[]
  timeEstimation: {
    phases: {
      name: string
      duration: number
      resources: string
      justification: string
    }[]
    totalDays: number
    factors: string[]
  }
  strategy: {
    approach: string
    techniques: {
      name: string
      description: string
    }[]
    entryCriteria: string[]
    exitCriteria: string[]
  }
  environment: {
    environments: {
      name: string
      purpose: string
      configuration: string
    }[]
    testData: string[]
    tools: {
      name: string
      purpose: string
    }[]
  }
  source?: string
  description?: string
}

// Tipo para la respuesta del análisis de URL
export interface UrlAnalysisResult {
  title: string
  description: string
  features: string[]
  technologies: string[]
  recommendations: string[]
}

export interface Risk {
  description: string
  impact: string
  probability: string
  mitigation: string
}

export interface TestCase {
  title: string
  priority: string
  preconditions: string[]
  steps: string[]
  expectedResult: string
  type: string
  automatable: boolean
}

export interface EmailParams {
  to: string
  from: string
  subject: string
  planName: string
  testPlan: TestPlan
  format?: "html" | "pdf" // Formato opcional, por defecto html
}

