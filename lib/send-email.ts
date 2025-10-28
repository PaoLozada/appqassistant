"use server"

import nodemailer from "nodemailer"
import type { TestPlan } from "./types"
import { generateTestPlanHTML } from "./html-generator"
import { generateTestPlanExcel } from "./generateExcel"
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);


interface EmailParams {
  to: string
  from: string
  subject: string
  planName: string
  testPlan: TestPlan
  format?: "html" | "Excel"
}

export async function sendEmail(params: EmailParams): Promise<{ success: boolean; message: string }> {
  try {

    // Crear un mensaje personalizado para el cuerpo del correo
    const emailBody = `
    <div style="font-family: 'Segoe UI', Roboto, Arial, sans-serif; max-width: 650px; margin: 0 auto; color: #ffffff; background-color: #1a1a2e; padding: 40px; border-radius: 16px; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3); border: 1px solid rgba(255,255,255,0.1); text-align: center;">
      <a href="https://paolozada.com" target="_blank" style="display:inline-block; margin-bottom: 15px;">
        <img src="https://paolozada.com/info/wp-content/uploads/2025/10/cropped-pl_android-chrome-512x512-1.png" alt="Icono de la app" width="70" height="70" style="vertical-align: middle;">
      </a>
      <h1 style="font-size: 26px; font-weight: 700; margin: 10px 0; color: #ffffff;">🚀 ¡Tu Plan de Pruebas está listo!</h1>
      <p style="font-size: 16px; color: #d3d4e4; margin-bottom: 20px; line-height: 1.6;">
        Hemos generado tu plan personalizado <strong>${params.planName}</strong> con ayuda de <strong>QAssistant</strong> una herramienta de 
        <a href="https://paolozada.com" style="color: #43e97b; text-decoration: none;">paolozada.com</a> impulsada por inteligencia artificial. ✅
      </p>
      <a href="https://appqa.paolozada.com/" 
    style="background:#43e97b; color:#0f0f23; padding:12px 24px; border-radius:8px; text-decoration:none; font-weight:600; display:inline-block; box-shadow:0 0 15px rgba(67,233,123,0.4);">
    Crear otro plan de pruebas
    </a>

    </div>

    <!-- Separador visual -->
    <div style="height: 4px; background-color: #667eea; opacity: 0.8; margin: 40px auto; border-radius: 2px; width: 80%;"></div>

    <div style="font-family:'Segoe UI',Roboto,Arial,sans-serif; background-color:#f7f7f9; color:#222; padding:30px 10px; max-width:650px; margin:0 auto; border-radius:12px;">

      <h2 style="color: #667eea; font-size: 20px; font-weight: 600;">👋 ¡Hola!</h2>
      <p style="font-size: 15px; line-height: 1.7;">
        Gracias por confiar en <strong>QAssistant</strong>. Tu plan está adjunto, listo para revisar, compartir o integrar en tu flujo de trabajo. Espero que sea de gran utilidad para tu proyecto 
        y te ayude a encontrar todos esos pequeños detalles que hacen la diferencia en la calidad del software.
      </p>

      <p style="font-size: 15px; line-height: 1.7;">
        ¿Sabías que los planes de prueba bien estructurados pueden reducir hasta un <strong>30%</strong> el tiempo de corrección de errores?  
        ¡Esperamos ayudarte a detectar esos detalles clave que elevan la calidad del software! 🎯
      </p>

      
      <p style="font-size: 16px; margin-top: 30px;">
        ¡Feliz testing! 🚀
      </p><br>
      <a href="https://paolozada.com" style="color: #667eea; text-decoration: none;"><h2><strong>Paola</strong></h2></a>
      <!-- Frase final de valor -->
      <p style="font-size: 14px; font-style: italic; color: #666; margin-bottom: 30px;">
        Porque probar bien es avanzar con confianza.
      </p>

      
      <hr style="border:none; height:1px; background-color:#667eea; margin:25px 0;">

        <p style="font-size:14px; color:#667eea; text-align:center; line-height:1.6;">
          <em style="color:#20b2aa;">🤖 Que la calidad te acompañe,</em><br>
          
        </p>

      <p style="font-size: 10px; color: #555; text-align: center; margin-top: 40px;">
        Este correo fue enviado automáticamente. Por favor, no respondas a este mensaje.
      </p>
    </div>
    `

    // Crear el cuerpo del correo de confirmación para el remitente
    const confirmationEmailBody = `
      <div style="font-family:'Segoe UI', Roboto, Arial, sans-serif; max-width:650px; margin:0 auto; color:#ffffff; background-color:#1a1a2e; padding:40px; border-radius:16px; box-shadow:0 8px 24px rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.1); text-align:center;">
        <a href="https://paolozada.com" target="_blank" style="display:inline-block; margin-bottom:15px;">
          <img src="https://paolozada.com/info/wp-content/uploads/2025/10/cropped-pl_android-chrome-512x512-1.png" alt="Icono de la app" width="70" height="70" style="vertical-align: middle;">
        </a>
        <h1 style="font-size:26px; font-weight:700; margin:10px 0; color:#ffffff;">✅ Confirmación de Envío</h1>
        <p style="font-size:16px; color:#d3d4e4; margin-bottom:20px; line-height:1.6;">
          Se ha enviado correctamente el plan de pruebas <strong>${params.planName}</strong>  
          generado con <strong>QAssistant</strong>, la herramienta de 
          <a href="https://paolozada.com" style="color:#43e97b; text-decoration:none;">paolozada.com</a>.
        </p>
      </div>

      <!-- Separador visual -->
      <div style="height:4px; background-color:#667eea; opacity:0.8; margin:40px auto; border-radius:2px; width:80%;"></div>

      <!-- Contenido -->
      <div style="font-family:'Segoe UI',Roboto,Arial,sans-serif; background-color:#f7f7f9; color:#222; padding:30px 10px; max-width:650px; margin:0 auto; border-radius:12px;">
        <h2 style="color:#667eea; font-size:20px; font-weight:600;">📬 Detalles del envío</h2>

        <div style="background-color:#fff; padding:20px; border-radius:10px; margin:20px 0; border:1px solid #ddd;">
          <p style="font-size:15px; margin:6px 0;"><strong>📧 Destinatario:</strong> ${params.to}</p>
          <p style="font-size:15px; margin:6px 0;"><strong>🗂 Asunto:</strong> ${params.subject}</p>
          <p style="font-size:15px; margin:6px 0;"><strong>📋 Nombre del plan:</strong> ${params.planName}</p>
          <p style="font-size:15px; margin:6px 0;"><strong>💾 Formato:</strong> ${params.format}</p>
          <p style="font-size:15px; margin:6px 0;"><strong>⏰ Fecha y hora:</strong> ${new Date().toLocaleString()}</p>
        </div>

        <p style="font-size:15px; line-height:1.7;">
          Se ha adjuntado una copia del plan de pruebas enviado para tu referencia y archivo interno.  
          Si necesitas generar un nuevo plan, puedes hacerlo directamente desde la aplicación.
        </p>

        <div style="text-align:center; margin:40px 0;">
          <a href="https://appqa.paolozada.com/" 
            style="display:inline-block; background:#43e97b; color:#0f0f23; padding:12px 24px; border-radius:8px; text-decoration:none; font-weight:600; box-shadow:0 0 15px rgba(67,233,123,0.4);">
            🧠 Ir a QAssistant
          </a>
        </div>

        <hr style="border:none; height:1px; background-color:#667eea; margin:25px 0;">

        <p style="font-size:14px; color:#667eea; text-align:center; line-height:1.6;">
          <em style="color:#20b2aa;">🤖 Que la calidad te acompañe,</em><br>
          <a href="https://paolozada.com" style="color:#667eea; text-decoration:none;">
            <h2><strong>Paola</strong></h2>
          </a>
        </p>

        <p style="font-size:11px; color:#555; text-align:center; margin-top:40px;">
          Este es un correo automático de confirmación. Por favor, no respondas a este mensaje.
        </p>
      </div>
      `
    // Generar el HTML del plan de pruebas
    const htmlContent = generateTestPlanHTML(params.testPlan, params.planName)
    const excelBuffer = await generateTestPlanExcel(params.testPlan, params.planName);


    const attachments = [];
    const parmas_format = params.format

    if (parmas_format === "html") {
      const htmlContent = generateTestPlanHTML(params.testPlan, params.planName);
      attachments.push({
        filename: `${params.planName.replace(/\s+/g, "_")}_test_plan.html`,
        content: htmlContent,
        contentType: "text/html",
      });
    } else {
      try {
        const excelBuffer = await generateTestPlanExcel(params.testPlan, params.planName);
        attachments.push({
          filename: `${params.planName.replace(/\s+/g, "_")}_test_plan.xlsx`,
          content: Buffer.from(excelBuffer).toString("base64"),
          encoding: "base64",
          contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
      } catch (err) {
        console.error("⚠️ Error generando Excel:", err);
      }
    }


    // 🚀 Enviar el correo usando la API HTTPS de Resend
    const { data, error } = await resend.emails.send({
      from: params.from || "QAssistant <qassistant@send.paolozada.com>",
      to: params.to,
      subject: params.subject,
      html: emailBody,
      attachments,
    });

    if (error) {
      console.error("❌ Error al enviar el correo:", error);
      return { success: false, message: error.message };
    }


    // 2. Enviar correo de confirmación al remitente predeterminado
    const remitentePredeterminado = "qassistant@send.paolozada.com"

    const { data: confirmData, error: confirmError } = await resend.emails.send({
      from: `QAssistant <${remitentePredeterminado}>`,
      to: "dev@paolozada.com",
      subject: `Confirmación: Plan de Pruebas enviado a ${params.to}`,
      html: confirmationEmailBody,
      attachments,
    })


    if (confirmError) {
      console.error("Error enviando correo de confirmación:", confirmError)
    } else {
      console.log("Correo de confirmación enviado correctamente:", confirmData?.id)
    }




    console.log("✅ Correo enviado correctamente:", data);
    return { success: true, message: "Correo enviado correctamente" };
  } catch (error) {
    console.error("Error al enviar el correo:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Error desconocido al enviar el correo",
    }
  }
}
