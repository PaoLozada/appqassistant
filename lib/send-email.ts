"use server"

import nodemailer from "nodemailer"
import type { TestPlan } from "./types"
import { generateTestPlanHTML } from "./html-generator"


interface EmailParams {
  to: string
  from: string
  subject: string
  planName: string
  testPlan: TestPlan
  format?: "html" | "pdf"
}

export async function sendEmail(params: EmailParams): Promise<{ success: boolean; message: string }> {
  try {
    // Configurar el transporte de correo con las variables de entorno
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST as string || "",
      port: 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER as string || "",
        pass: process.env.SMTP_PASSWORD as string || "",
      },
    })

    // Generar el HTML del plan de pruebas
    const htmlContent = generateTestPlanHTML(params.testPlan, params.planName)

    // Crear un mensaje personalizado para el cuerpo del correo
    const emailBody = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; color: #333;">
  <!-- Encabezado -->
  <div style="background-color: rgb(119, 64, 106); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
    <a href="https://paolozada.com" target="_blank">
      <img src="https://paolozada.com/info/wp-content/uploads/2025/04/iconPL-1.png" alt="Icono de la app" width="60" height="60" style="vertical-align: middle; margin-right: 10px;">
    </a>
    <h1 style="display: inline-block; margin: 0; vertical-align: middle;">¡Tu Plan de Pruebas está listo!</h1>
  </div>

  <!-- Cuerpo -->
  <div style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
    <p style="font-size: 16px;">¡Hola!</p>

    <p style="font-size: 16px;">
      Gracias por confiar en <strong>QAssistant</strong>, una herramienta de 
      <a href="https://paolozada.com" style="color: rgb(119, 64, 106); text-decoration: underline;">paolozada.com</a> 
      impulsada por inteligencia artificial. ✅
    </p>

    <p style="font-size: 16px;">
      📄 Se ha generado tu plan personalizado: <strong>${params.planName}</strong>. Espero que sea de gran utilidad para tu proyecto 
      y te ayude a encontrar todos esos pequeños detalles que hacen la diferencia en la calidad del software.
    </p>

    <p style="font-size: 16px;">
      Lo encontrarás adjunto en formato HTML, listo para revisar, compartir o integrar en tu flujo de trabajo.
    </p>

    <p style="font-size: 16px;">
      ¿Sabías que los planes de prueba bien estructurados pueden reducir hasta un 30% el tiempo de corrección de errores?
      ¡Espero ayudarte a detectar esos detalles clave que marcan la diferencia en la calidad del software! 🎉
    </p><br><br>

    <p style="font-size: 16px; margin-top: 30px;">
      ¡Feliz testing! 🚀
    </p>

    <!-- Frase final de valor -->
    <p style="font-size: 14px; font-style: italic; color: #666; margin-bottom: 30px;">
      Porque probar bien es avanzar con confianza.
    </p><br>

    <!-- Despedida -->
    <p style="margin-top: 20px; font-size: 16px;">
      <em style="color: #20b2aa;"  >⚔️🤖🔦Que la calidad te acompañe,</em><br>
      <strong>Paola</strong><br>
      <a href="https://paolozada.com" style="color: #77406A;">paolozada.com</a>
    </p>





    <!-- Botón opcional -->
    <!--
    <a href="[ENLACE-AL-PLAN]" style="display:inline-block;padding:12px 24px;background-color:#77406A;color:white;border-radius:6px;text-decoration:none;margin-top:20px;">
      Ver plan de pruebas
    </a>
    -->

    <!-- Pie de página -->
    <p style="font-size: 10px; color: #999; text-align: center; margin-top: 40px;">
      Este correo fue enviado automáticamente. Por favor, no respondas a este mensaje.
    </p>
  </div>
</div>

  `


    const attachments = [
      {
        filename: `${params.planName.replace(/\s+/g, "_")}_test_plan.html`,
        content: htmlContent,
        contentType: "text/html",
      },
    ]

    // Enviar el correo con el adjunto correspondiente
    const info = await transporter.sendMail({
      from: params.from,
      to: params.to,
      subject: params.subject,
      html: emailBody,
      attachments: attachments,
    })

    console.log("Correo enviado:", info.messageId)
    return { success: true, message: "Correo enviado correctamente" }
  } catch (error) {
    console.error("Error al enviar el correo:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Error desconocido al enviar el correo",
    }
  }
}
