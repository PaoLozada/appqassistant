import ExcelJS from "exceljs";
import type { TestPlan } from "./types";

// 🎨 Paleta de colores moderna (oscura, profesional)
const COLORS = {
    primary: "7F56D9", // violeta moderno
    accent: "667eea",
    background: "1E1E2F", // fondo oscuro
    rowAlt: "2B2B3D", // filas alternas
    border: "3E3E4E", // bordes sutiles
    textLight: "F3F4F6",
    textDim: "A1A1AA",
};

// 🔲 Bordes uniformes
const BORDER_STYLE: Partial<ExcelJS.Borders> = {
    top: { style: "thin", color: { argb: COLORS.border } },
    left: { style: "thin", color: { argb: COLORS.border } },
    bottom: { style: "thin", color: { argb: COLORS.border } },
    right: { style: "thin", color: { argb: COLORS.border } },
};

// 🌈 Encabezado degradado
function applyHeaderGradient(cell: ExcelJS.Cell) {
    cell.fill = {
        type: "gradient",
        gradient: "angle",
        degree: 0,
        stops: [
            { position: 0, color: { argb: COLORS.primary } },
            { position: 1, color: { argb: COLORS.accent } },
        ],
    };
    cell.font = { color: { argb: COLORS.textLight }, bold: true, size: 13 };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.border = BORDER_STYLE;
}

// 🌓 Filas alternas (tono oscuro)
function applyAlternateRows(sheet: ExcelJS.Worksheet) {
    sheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1 && rowNumber % 2 === 0) {
            row.eachCell((cell) => {
                cell.fill = {
                    type: "pattern",
                    pattern: "solid",
                    fgColor: { argb: COLORS.rowAlt },
                };
                const currentFont = cell.font || {};
                cell.font = {
                    ...currentFont,
                    color: { argb: "E0E0E0" },
                };
                // Bordes sutiles
                cell.border = {
                    top: { style: "thin", color: { argb: "2A2A3B" } },
                    left: { style: "thin", color: { argb: "2A2A3B" } },
                    bottom: { style: "thin", color: { argb: "2A2A3B" } },
                    right: { style: "thin", color: { argb: "2A2A3B" } },
                };

            });
        }
    });
}

// 📊 Ajustar altura según contenido
function autoAdjustRowHeights(sheet: ExcelJS.Worksheet) {
    sheet.eachRow((row) => {
        if (row.number === 1) return;
        let maxLines = 1;
        row.eachCell((cell) => {
            const value = cell.value ? cell.value.toString() : "";
            const lines = value.split("\n").length;
            const extra = Math.ceil(value.length / 70);
            const total = Math.max(lines, extra);
            if (total > maxLines) maxLines = total;
            cell.border = BORDER_STYLE;
            cell.alignment = { wrapText: true, vertical: "top" };
        });
        row.height = Math.min(300, 22 + maxLines * 20);
    });
}

// 🚀 Generar Excel completo
export async function generateTestPlanExcel(
    testPlan: TestPlan,
    planName: string
): Promise<Buffer> {
    const wb = new ExcelJS.Workbook();
    wb.creator = "QAssistant";
    wb.created = new Date();

    // 🟣 HOJA: Resumen
    const resumen = wb.addWorksheet("📘 Resumen", {
        properties: { tabColor: { argb: COLORS.accent } },
    });

    resumen.getColumn(1).width = 25;
    resumen.getColumn(2).width = 80;
    resumen.mergeCells("A1:B1");
    resumen.mergeCells("A3:B3");

    const titleCell = resumen.getCell("A1");
    titleCell.value = `PLAN DE PRUEBAS`;
    titleCell.font = { bold: true, size: 20, color: { argb: COLORS.primary } };
    resumen.addRow([]);
    const subtitleCell = resumen.getCell("A3");
    subtitleCell.value = planName;
    subtitleCell.font = { size: 14, color: { argb: COLORS.accent }, italic: true };

    resumen.addRow([]);
    resumen.addRow(["📅 Fecha de generación", new Date().toLocaleDateString()]);
    resumen.addRow(["✨ Generado por", "QAssistant (IA + Expertise QA - 👩‍💻 Paola Lozada)"]);
    resumen.addRow(["💬 Descripción", testPlan.description || ""]);
    resumen.addRow(["🌐 Fuente", testPlan.source || "No especificada"]);
    resumen.addRow(["🎯 Objetivos", "✔ " + testPlan.objectives.join("\n✔ ")]);
    resumen.addRow(["📋 Áreas incluidas", "📌 " + testPlan.scope.included.join("\n📌 ")]);
    resumen.addRow(["🚫 Áreas excluidas", "❌ " + testPlan.scope.excluded.join("\n❌ ")]);
    resumen.addRow([]);

    applyAlternateRows(resumen);
    autoAdjustRowHeights(resumen);

    // ⚠️ 2️⃣ Riesgos
    const riesgos = wb.addWorksheet("⚠️ Riesgos", {
        properties: { tabColor: { argb: COLORS.accent } },
    });
    riesgos.columns = [
        { header: "#", key: "idx", width: 6 },
        { header: "Riesgo", key: "description", width: 60 },
        { header: "Impacto", key: "impact", width: 14 },
        { header: "Probabilidad", key: "probability", width: 14 },
        { header: "Mitigación", key: "mitigation", width: 60 },
    ];
    riesgos.getRow(1).eachCell(applyHeaderGradient);
    riesgos.views = [{ state: "frozen", ySplit: 1 }];
    testPlan.risks.forEach((r, i) => riesgos.addRow({ idx: i + 1, ...r }));
    applyAlternateRows(riesgos);
    autoAdjustRowHeights(riesgos);

    // 🧪 3️⃣ Casos de prueba
    const casos = wb.addWorksheet("🧪 Casos de Prueba", {
        properties: { tabColor: { argb: COLORS.accent } },
    });
    casos.columns = [
        { header: "TC #", key: "tc", width: 8 },
        { header: "Título", key: "title", width: 40 },
        { header: "Prioridad", key: "priority", width: 12 },
        { header: "Tipo", key: "type", width: 18 },
        { header: "Automatizable", key: "automatable", width: 17 },
        { header: "Precondiciones", key: "preconditions", width: 40 },
        { header: "Pasos", key: "steps", width: 80 },
        { header: "Resultado esperado", key: "expected", width: 60 },
    ];
    casos.getRow(1).eachCell(applyHeaderGradient);
    casos.views = [{ state: "frozen", ySplit: 1 }];
    testPlan.testCases.forEach((tc, i) =>
        casos.addRow({
            tc: `TC-${i + 1}`,
            title: tc.title,
            priority: tc.priority,
            type: tc.type,
            automatable: tc.automatable ? "Sí" : "No",
            preconditions: "✔ " + tc.preconditions.join("\n✔ "),
            steps: "➡ " + tc.steps.join("\n➡ "),
            expected: tc.expectedResult,
        })
    );
    applyAlternateRows(casos);
    autoAdjustRowHeights(casos);

    // ⏱️ 4️⃣ Estimación
    const estimacion = wb.addWorksheet("⏱️ Estimación", {
        properties: { tabColor: { argb: COLORS.accent } },
    });
    estimacion.columns = [
        { header: "Fase", key: "name", width: 30 },
        { header: "Duración (días)", key: "duration", width: 18 },
        { header: "Justificación", key: "justification", width: 60 },
    ];
    estimacion.getRow(1).eachCell(applyHeaderGradient);
    estimacion.views = [{ state: "frozen", ySplit: 1 }];
    testPlan.timeEstimation.phases.forEach((p) => estimacion.addRow(p));
    estimacion.addRow([]);
    const totalRow = estimacion.addRow(["Tiempo total estimado", testPlan.timeEstimation.totalDays]);
    totalRow.eachCell((c) => (c.font = { bold: true, color: { argb: COLORS.primary }, size: 13 }));
    estimacion.addRow([]);
    const row_fac = estimacion.addRow(["","Factores considerados", "✔ " + testPlan.timeEstimation.factors.join("\n✔ ")]);
    const cell_fac = row_fac.getCell(2);
    cell_fac.font = { bold: true, size: 14, color: { argb: "667eea" } };
    applyAlternateRows(estimacion);
    autoAdjustRowHeights(estimacion);

    // ⚙️ 5️⃣ Estrategia
    const estrategia = wb.addWorksheet("⚙️ Estrategia", {
        properties: { tabColor: { argb: COLORS.accent } },
    });
    estrategia.columns = [
        { header: "Sección", key: "section", width: 30 },
        { header: "Detalle", key: "detail", width: 100 },
    ];
    estrategia.getRow(1).eachCell(applyHeaderGradient);
    estrategia.views = [{ state: "frozen", ySplit: 1 }];
    estrategia.addRow(["Enfoque general", testPlan.strategy.approach]);
    estrategia.addRow([
        "Técnicas",
        "🧩 " + testPlan.strategy.techniques.map((t) => `${t.name}: ${t.description}`).join("\n🧩 "),
    ]);
    estrategia.addRow(["Criterios de entrada", "🔺 " + testPlan.strategy.entryCriteria.join("\n🔺 ")]);
    estrategia.addRow(["Criterios de salida", "🔻 " + testPlan.strategy.exitCriteria.join("\n🔻 ")]);
    applyAlternateRows(estrategia);
    autoAdjustRowHeights(estrategia);

    // 💻 6️⃣ Entorno & Herramientas
    const entorno = wb.addWorksheet("💻 Entorno & Herramientas", {
        properties: { tabColor: { argb: COLORS.accent } },
    });
    entorno.columns = [
        { header: "Tipo", key: "type", width: 18 },
        { header: "Nombre", key: "name", width: 30 },
        { header: "Propósito / Config", key: "purpose", width: 60 },
    ];
    entorno.getRow(1).eachCell(applyHeaderGradient);
    entorno.views = [{ state: "frozen", ySplit: 1 }];
    testPlan.environment.environments.forEach((e) =>
        entorno.addRow({ type: "Entorno", name: e.name, purpose: `${e.purpose} — ${e.configuration}` })
    );
    testPlan.environment.tools.forEach((t) =>
        entorno.addRow({ type: "Herramienta", name: t.name, purpose: t.purpose })
    );
    entorno.addRow([]);
    const row_entorno = entorno.addRow(["", "Datos de prueba", "✔ " + testPlan.environment.testData.join("\n✔ ")]);
    const cell_entorno = row_entorno.getCell(2);
    cell_entorno.font = { bold: true, size: 14, color: { argb: "667eea" } };
    applyAlternateRows(entorno);
    autoAdjustRowHeights(entorno);

    // 🧩 Ajuste final general
    wb.eachSheet((sheet) => {
        if (sheet.name !== "Resumen") return;
        sheet.getRow(1).height = 22;
        sheet.getRow(1).font = { bold: true, size: 13, color: { argb: COLORS.textLight } };
    });

    const buffer = await wb.xlsx.writeBuffer();
    return Buffer.from(buffer);
}
