import type { TestPlan, Risk, TestCase } from "./types"

export function generateTestPlanHTML(testPlan: TestPlan, planName: string): string {
  return `
  <!DOCTYPE html>
  <html lang="es">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Plan de Pruebas: ${planName}</title>
    <style>
      :root {
    --primary-color: #667eea;   /* azul violeta profesional */
    --accent-color: #764ba2;    /* lila oscuro */
    --background-color: #1a1a2e; /* fondo oscuro elegante */
    --card-color: #23233a;       /* fondo de secciones */
    --border-color: #2f2f48;     /* bordes suaves */
    --text-color: #e6e6e6;       /* texto principal */
    --text-muted: #a5a5c3;       /* texto secundario */
    --highlight: #18837dff;        /* acento verde-agua */
    --danger: #ff4d6d;           /* rojo moderno */
    --warning: #fee140;
  }
      
      body {
        font-family: Arial, sans-serif;
        line-height: 1.6;
        color: var(--text-color);
        background-color: var(--background-color);
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
      }
      h1, h2, h3, h4 {
        color: var(--primary-color);
        margin-top: 1.5em;
      }
      h1 {
        text-align: center;
        border-bottom: 2px solid var(--primary-color);
        padding-bottom: 10px;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin: 20px 0;
      }
      td, th {
        border: 1px solid var(--border-color);
        padding: 8px 12px;
        text-align: left;
      }
      th {
        background-color: var(--text-muted);
        color: var(--background-color);
        border: 1px solid var(--background-color);
        font-weight: bold;
      }
      tr:nth-child(even) {
        background-color: var(--background-color);
      }
      .section {
        margin-bottom: 30px;
        border: 1px solid var(--border-color);
        border-radius: 8px;
        padding: 20px;
        background-color: var(--card-color);
      }
      .priority-high {
        background-color: var(--danger);
        color: var(--text-color);
        padding: 3px 8px;
        border-radius: 12px;
        font-size: 0.85em;
      }
      .priority-medium {
        background-color: var(--warning);
        color: var(--background-color);
        padding: 3px 8px;
        border-radius: 12px;
        font-size: 0.85em;
      }
      .priority-low {
        background-color: var(--highlight);
        color: var(--text-color);
        padding: 3px 8px;
        border-radius: 12px;
        font-size: 0.85em;
      }
      .test-case {
        border: 1px solid var(--border-color);
        border-radius: 8px;
        padding: 15px;
        margin-bottom: 15px;
      }
      .test-case-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
      }
      .test-case-title {
        font-weight: bold;
        font-size: 1.1em;
      }
      ul, ol {
        margin-top: 5px;
      }
      
      /* Estilos para pestañas */
      .tabs {
        display: flex;
        flex-wrap: wrap;
        margin: 20px 0;
      }
      .tab-button {
        padding: 10px 20px;
        background-color: var(--background-color);
        border: 1px solid var(--primary-color);
        border-bottom: none;
        cursor: pointer;
        border-radius: 8px 8px 0 0;
        margin-right: 5px;
        color: var(--text-color);
      }
      .tab-button.active {
        background-color: var(--primary-color);
        border-color: var(--border-color);
        font-weight: bold;
        color: var(--text-color);
      }
      .tab-content {
        display: none;
        padding: 20px;
        border: 1px solid var(--card-color);
        border-radius: 0 8px 8px 8px;
      }
      .tab-content.active {
        display: block;
      }
      
      /* Estilos para vistas de casos de prueba */
      .view-buttons {
        display: flex;
        justify-content: flex-end;
        margin-bottom: 15px;
      }
      .view-button {
        padding: 5px 10px;
        background-color: var(--background-color);
        border: 1px solid var(--card-color);
        cursor: pointer;
        margin-left: 5px;
        border-radius: 4px;
        color: var(--text-color);
      }
      .view-button.active {
        background-color: var(--primary-color);
        color: var(--text-color);
        border-color: var(--border-color);
      }
      .test-cases-table {
        display: none;
        width: 100%;
      }
      .test-cases-cards {
        display: none;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 15px;
      }
      .test-cases-table.active {
        display: table;
      }
      .test-cases-cards.active {
        display: grid;
      }
      
      /* Estilos para modal de detalles */
      .modal {
        display: none;
        position: fixed;
        z-index: 1000;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-color: var(--background-color);
      }
      .modal-content {
        background-color: var(--card-color);
        margin: 10% auto;
        padding: 20px;
        border-radius: 8px;
        width: 80%;
        max-width: 800px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }
      .close-modal {
        color: var(--text-muted);
        float: right;
        font-size: 28px;
        font-weight: bold;
        cursor: pointer;
      }
      .close-modal:hover {
        color: var(--highligth-color);
      }
      .modal-header {
        margin-bottom: 15px;
        padding-bottom: 10px;
        border-bottom: 1px solid var(--border-color);
      }
      .modal-body {
        margin-bottom: 15px;
      }
      
      /* Botón de detalles */
      .details-button {
        background-color: var(--primary-color);
        color: var(--text-color);
        border: none;
        padding: 5px 10px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.9em;
      }
      .details-button:hover {
        background-color: var(--highlight);
      }
    </style>
  </head>
  <body>

  <div style="display:flex;">
      <div style="width: 30%; align-items: end; display:flex;">
        <a href="https://paolozada.com" target="_blank">
          <img src="https://paolozada.com/info/wp-content/uploads/2025/10/logo_app_2.png" alt="Icono de la app" style="width: 30%; height: auto;"/>
        </a>
      </div>
      <div style="width: 70%; display:flex; align-items: center;  padding-left: 20px;">
        <h1>Plan de Pruebas: ${planName}</h1>
      </div>     
    </div>
    
    <div class="tabs">
      <button class="tab-button active" onclick="openTab(event, 'tab-overview')">Resumen</button>
      <button class="tab-button" onclick="openTab(event, 'tab-risks')">Riesgos</button>
      <button class="tab-button" onclick="openTab(event, 'tab-test-cases')">Casos de Prueba</button>
      <button class="tab-button" onclick="openTab(event, 'tab-time')">Estimación</button>
      <button class="tab-button" onclick="openTab(event, 'tab-strategy')">Estrategia</button>
      <button class="tab-button" onclick="openTab(event, 'tab-environment')">Entorno</button>
    </div>
    
    <!-- Pestaña de Resumen -->
    <div id="tab-overview" class="tab-content active">
      <div class="section">
        <h2>Objetivos</h2>
        <ul>
          ${testPlan.objectives.map((obj) => `<li>${obj}</li>`).join("")}
        </ul>
      </div>
      
      <div class="section">
        <h2>Alcance</h2>
        <h3>Áreas Incluidas</h3>
        <ul>
          ${testPlan.scope.included.map((item) => `<li>${item}</li>`).join("")}
        </ul>
        
        <h3>Áreas Excluidas</h3>
        <ul>
          ${testPlan.scope.excluded.map((item) => `<li>${item}</li>`).join("")}
        </ul>
      </div>
    </div>
    
    <!-- Pestaña de Riesgos -->
    <div id="tab-risks" class="tab-content">
      <div class="section">
        <h2>Identificación de Riesgos</h2>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Riesgo</th>
              <th>Impacto</th>
              <th>Probabilidad</th>
              <th>Mitigación</th>
            </tr>
          </thead>
          <tbody>
            ${testPlan.risks
      .map(
        (risk, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${risk.description}</td>
                <td>
                  <span class="${getRiskImpactClass(risk)}">${risk.impact}</span>
                </td>
                <td>
                  <span class="${getRiskProbabilityClass(risk)}">${risk.probability}</span>
                </td>
                <td>${risk.mitigation}</td>
              </tr>
            `,
      )
      .join("")}
          </tbody>
        </table>
      </div>
    </div>
    
    <!-- Pestaña de Casos de Prueba -->
    <div id="tab-test-cases" class="tab-content">
      <div class="section">
        <h2>Casos de Prueba</h2>
        
        <div class="view-buttons">
          <button class="view-button active" onclick="changeView('cards')">Tarjetas</button>
          <button class="view-button" onclick="changeView('table')">Tabla</button>
        </div>
        
        <!-- Vista de Tabla -->
        <table class="test-cases-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Título</th>
              <th>Prioridad</th>
              <th>Tipo</th>
              <th>Automatizable</th>
              <th>Detalles</th>
            </tr>
          </thead>
          <tbody>
            ${testPlan.testCases
      .map(
        (testCase, index) => `
              <tr>
                <td>TC-${index + 1}</td>
                <td>${testCase.title}</td>
                <td><span class="${getTestCasePriorityClass(testCase)}">${testCase.priority}</span></td>
                <td>${testCase.type}</td>
                <td>${testCase.automatable ? "Sí" : "No"}</td>
                <td>
                  <button onclick="openModal('modal-tc-${index}')" class="details-button">Ver detalles</button>
                </td>
              </tr>
            `,
      )
      .join("")}
          </tbody>
        </table>
        
        <!-- Vista de Tarjetas -->
        <div class="test-cases-cards active">
          ${testPlan.testCases
      .map(
        (testCase, index) => `
            <div class="test-case">
              <div class="test-case-header">
                <div class="test-case-title">TC-${index + 1}: ${testCase.title}</div>
                <span class="${getTestCasePriorityClass(testCase)}">${testCase.priority}</span>
              </div>
              
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                <div>
                  <h4 style="margin-top: 0;">Precondiciones</h4>
                  <ul>
                    ${testCase.preconditions.map((precondition) => `<li>${precondition}</li>`).join("")}
                  </ul>
                </div>
                <div>
                  <h4 style="margin-top: 0;">Tipo de Prueba</h4>
                  <p>${testCase.type}</p>
                  
                  <h4>Automatizable</h4>
                  <p>${testCase.automatable ? "Sí" : "No"}</p>
                </div>
              </div>
              
              <div>
                <h4>Pasos</h4>
                <ol>
                  ${testCase.steps.map((step) => `<li>${step}</li>`).join("")}
                </ol>
              </div>
              
              <div>
                <h4>Resultado Esperado</h4>
                <p>${testCase.expectedResult}</p>
              </div>
            </div>
          `,
      )
      .join("")}
        </div>
        
        <!-- Modales para detalles de casos de prueba -->
        ${testPlan.testCases
      .map(
        (testCase, index) => `
          <div id="modal-tc-${index}" class="modal">
            <div class="modal-content">
              <span class="close-modal" onclick="closeModal('modal-tc-${index}')">&times;</span>
              <div class="modal-header">
                <h3>TC-${index + 1}: ${testCase.title}</h3>
                <p>Tipo: ${testCase.type} | Prioridad: ${testCase.priority} | ${testCase.automatable ? "Automatizable" : "No automatizable"}</p>
              </div>
              <div class="modal-body">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                  <div>
                    <h4>Precondiciones:</h4>
                    <ul>
                      ${testCase.preconditions.map((precondition) => `<li>${precondition}</li>`).join("")}
                    </ul>
                  </div>
                  <div>
                    <h4>Resultado Esperado:</h4>
                    <p>${testCase.expectedResult}</p>
                  </div>
                </div>
                <div>
                  <h4>Pasos:</h4>
                  <ol>
                    ${testCase.steps.map((step) => `<li>${step}</li>`).join("")}
                  </ol>
                </div>
              </div>
            </div>
          </div>
        `,
      )
      .join("")}
      </div>
    </div>
    
    <!-- Pestaña de Estimación de Tiempos -->
    <div id="tab-time" class="tab-content">
      <div class="section">
        <h2>Estimación de Tiempos</h2>
        <table>
          <thead>
            <tr>
              <th>Fase</th>
              <th>Duración (días)</th>
              <th>Justificación</th>
            </tr>
          </thead>
          <tbody>
            ${testPlan.timeEstimation.phases
      .map(
        (phase, index) => `
              <tr>
                <td>${phase.name}</td>
                <td>${phase.duration}</td>
                <td>${phase.justification}</td>
              </tr>
            `,
      )
      .join("")}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="4" style="text-align: right;">
                <strong>Tiempo total estimado: ${testPlan.timeEstimation.totalDays} días</strong>
              </td>
            </tr>
          </tfoot>
        </table>
        
        <h3>Factores Considerados</h3>
        <ul>
          ${testPlan.timeEstimation.factors.map((factor) => `<li>${factor}</li>`).join("")}
        </ul>
      </div>
    </div>
    
    <!-- Pestaña de Estrategia -->
    <div id="tab-strategy" class="tab-content">
      <div class="section">
        <h2>Estrategia de Prueba</h2>
        <h3>Enfoque General</h3>
        <p>${testPlan.strategy.approach}</p>
        
        <h3>Técnicas de Prueba</h3>
        <ul>
          ${testPlan.strategy.techniques
      .map(
        (technique) => `
            <li><strong>${technique.name}:</strong> ${technique.description}</li>
          `,
      )
      .join("")}
        </ul>
        
        <h3>Criterios de Entrada</h3>
        <ul>
          ${testPlan.strategy.entryCriteria.map((criteria) => `<li>${criteria}</li>`).join("")}
        </ul>
        
        <h3>Criterios de Salida</h3>
        <ul>
          ${testPlan.strategy.exitCriteria.map((criteria) => `<li>${criteria}</li>`).join("")}
        </ul>
      </div>
    </div>
    
    <!-- Pestaña de Entorno -->
    <div id="tab-environment" class="tab-content">
      <div class="section">
        <h2>Entorno y Datos de Prueba</h2>
        <h3>Entornos Requeridos</h3>
        <table>
          <thead>
            <tr>
              <th>Entorno</th>
              <th>Propósito</th>
              <th>Configuración</th>
            </tr>
          </thead>
          <tbody>
            ${testPlan.environment.environments
      .map(
        (env, index) => `
              <tr>
                <td>${env.name}</td>
                <td>${env.purpose}</td>
                <td>${env.configuration}</td>
              </tr>
            `,
      )
      .join("")}
          </tbody>
        </table>
        
        <h3>Datos de Prueba</h3>
        <ul>
          ${testPlan.environment.testData.map((data) => `<li>${data}</li>`).join("")}
        </ul>
        
        <h3>Herramientas</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 15px;">
          ${testPlan.environment.tools
      .map(
        (tool) => `
            <div style="background-color: #1a1a2e; padding: 15px; border-radius: 8px; border-bottom: 2px solid var(--border-color);">
              <h4 style="margin-top: 0;">${tool.name}</h4>
              <p>${tool.purpose}</p>
            </div>
          `,
      )
      .join("")}
        </div>
      </div>
    </div>
    
    <div style="text-align: center; margin-top: 40px; color: #64748b; font-size: 0.9em;">
      <p>© 2025 · Una creación de <a href="https://paolozada.com" target="_blank">paolozada.com</a> · Con inteligencia artificial como asistente.</p>
      <p>Fecha de generación: ${new Date().toLocaleDateString()}</p>
    </div>
    
    <script>
      // Función para cambiar entre pestañas
      function openTab(evt, tabName) {
        var i, tabcontent, tabbuttons;
        
        // Ocultar todos los contenidos de pestañas
        tabcontent = document.getElementsByClassName("tab-content");
        for (i = 0; i < tabcontent.length; i++) {
          tabcontent[i].className = tabcontent[i].className.replace(" active", "");
        }
        
        // Desactivar todos los botones de pestañas
        tabbuttons = document.getElementsByClassName("tab-button");
        for (i = 0; i < tabbuttons.length; i++) {
          tabbuttons[i].className = tabbuttons[i].className.replace(" active", "");
        }
        
        // Mostrar la pestaña actual y activar el botón
        document.getElementById(tabName).className += " active";
        evt.currentTarget.className += " active";
      }
      
      // Función para cambiar entre vistas de casos de prueba
      function changeView(viewType) {
        var tableView = document.querySelector('.test-cases-table');
        var cardsView = document.querySelector('.test-cases-cards');
        var tableButton = document.querySelector('.view-button:nth-child(2)');
        var cardsButton = document.querySelector('.view-button:nth-child(1)');
        
        if (viewType === 'table') {
          tableView.classList.add('active');
          cardsView.classList.remove('active');
          tableButton.classList.add('active');
          cardsButton.classList.remove('active');
        } else {
          cardsView.classList.add('active');
          tableView.classList.remove('active');
          cardsButton.classList.add('active');
          tableButton.classList.remove('active');
        }
      }
      
      // Funciones para manejar modales
      function openModal(modalId) {
        document.getElementById(modalId).style.display = "block";
      }
      
      function closeModal(modalId) {
        document.getElementById(modalId).style.display = "none";
      }
      
      // Cerrar modal al hacer clic fuera de él
      window.onclick = function(event) {
        if (event.target.classList.contains('modal')) {
          event.target.style.display = "none";
        }
      }
    </script>
  </body>
  </html>
`
}

// Funciones auxiliares para las clases CSS
function getRiskImpactClass(risk: Risk): string {
  if (risk.impact === "Alto") return "priority-high"
  if (risk.impact === "Medio") return "priority-medium"
  return "priority-low"
}

function getRiskProbabilityClass(risk: Risk): string {
  if (risk.probability === "Alta") return "priority-high"
  if (risk.probability === "Media") return "priority-medium"
  return "priority-low"
}

function getTestCasePriorityClass(testCase: TestCase): string {
  if (testCase.priority === "Alta") return "priority-high"
  if (testCase.priority === "Media") return "priority-medium"
  return "priority-low"
}

