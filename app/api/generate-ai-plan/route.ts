import { generateAITestPlan } from "@/lib/ai-test-plan-generator";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const input = await req.json();

    // Lógica principal: generación del plan con OpenAI
    const result = await generateAITestPlan(input);

    // Devolvemos el resultado como JSON
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("❌ Error al generar plan de pruebas:", error);

    // Siempre devolver un JSON con error
    return new Response(JSON.stringify({
      error: "Error al generar el plan de pruebas con IA",
      details: error?.message || "Sin detalles adicionales"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
