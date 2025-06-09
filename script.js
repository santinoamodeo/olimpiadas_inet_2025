// script.js

// Función para redondear a N cifras significativas
function redondearCifrasSignificativas(num, cifras) {
  if (num === 0) return 0;
  const d = Math.ceil(Math.log10(Math.abs(num)));
  const factor = Math.pow(10, cifras - d);
  return Math.round(num * factor) / factor;
}

const form = document.getElementById("resistance-form");
const resultadoDiv = document.getElementById("resultado");
const historialUl = document.getElementById("historial");

let historial = JSON.parse(localStorage.getItem("historialResistencia")) || [];

function mostrarHistorial() {
  historialUl.innerHTML = "";
  
  if (historial.length === 0) {
    const li = document.createElement("li");
    li.className = "text-center text-gray-500 py-3 italic";
    li.textContent = "No hay cálculos en el historial";
    historialUl.appendChild(li);
    return;
  }
  
  historial.forEach((item, i) => {
    const li = document.createElement("li");
    li.className = "border border-gray-200 rounded-lg p-3 bg-gray-50 hover:bg-gray-100 transition cursor-pointer";
    li.innerHTML = `
      <div class="flex justify-between items-start">
        <div>
          <span class="text-xs text-gray-500">#${i+1}</span>
          <div class="text-sm font-medium text-gray-700">R = ${item.R} Ω</div>
        </div>
        <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">${item.cifras} cifras</span>
      </div>
      <div class="grid grid-cols-2 gap-2 mt-2 text-xs text-gray-600">
        <div><span class="font-medium">V:</span> ${item.V} (${item.sigV} cifras)</div>
        <div><span class="font-medium">I:</span> ${item.I} (${item.sigI} cifras)</div>
      </div>
    `;
    historialUl.appendChild(li);
  });
}

function guardarHistorial(v, sigV, i, sigI, r, cifras) {
  historial.unshift({ 
    V: v, 
    sigV, 
    I: i, 
    sigI, 
    R: r, 
    cifras,
    fecha: new Date().toLocaleString() 
  });
  
  if (historial.length > 10) historial.pop();
  localStorage.setItem("historialResistencia", JSON.stringify(historial));
  mostrarHistorial();
}

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const V = parseFloat(form.voltaje.value);
  const sigV = parseInt(form.sigV.value);
  const I = parseFloat(form.corriente.value);
  const sigI = parseInt(form.sigI.value);

  if (I === 0) {
    resultadoDiv.textContent = "Error: La corriente no puede ser cero";
    resultadoDiv.className = "text-center text-lg font-semibold text-red-600 min-h-[2rem] p-3 bg-red-50 rounded-lg border border-red-100";
    return;
  }

  // Tomamos la menor cantidad de cifras significativas
  const cifras = Math.min(sigV, sigI);
  const resistencia = V / I;
  const resistenciaRedondeada = redondearCifrasSignificativas(resistencia, cifras);

  resultadoDiv.innerHTML = `
    <div class="font-bold text-blue-800">Resistencia calculada:</div>
    <div class="text-2xl mt-1">${resistenciaRedondeada} <span class="text-lg">Ω</span></div>
    <div class="text-sm text-blue-600 mt-1">(con ${cifras} cifras significativas)</div>
  `;
  resultadoDiv.className = "text-center text-lg font-semibold text-blue-700 min-h-[2rem] p-3 bg-blue-50 rounded-lg border border-blue-100";

  guardarHistorial(V, sigV, I, sigI, resistenciaRedondeada, cifras);
});

// Limpiar historial
function limpiarHistorial() {
  if (confirm("¿Estás seguro de que deseas borrar todo el historial?")) {
    historial = [];
    localStorage.removeItem("historialResistencia");
    mostrarHistorial();
  }
}

window.limpiarHistorial = limpiarHistorial;

// Exportar PDF mejorado
// Exportar PDF mejorado - Versión profesional centrada
async function exportarPDF() {
  if (historial.length === 0) {
    alert("No hay datos en el historial para exportar");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  
  // Configuración inicial
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const maxWidth = pageWidth - margin * 2;
  
  // Logo y título (centrado perfectamente)
  doc.setFontSize(20);
  doc.setTextColor(29, 78, 216); // Azul
  doc.setFont("helvetica", "bold");
  doc.text("INFORME DE CÁLCULOS DE RESISTENCIA", pageWidth / 2, 25, { align: "center" });
  
  // Subtítulo
  doc.setFontSize(12);
  doc.setTextColor(100, 116, 139); // Gris
  doc.setFont("helvetica", "normal");
  doc.text("Ley de Ohm - Análisis con Cifras Significativas", pageWidth / 2, 32, { align: "center" });
  
  // Línea decorativa centrada
  doc.setDrawColor(59, 130, 246);
  doc.setLineWidth(0.5);
  doc.line(margin, 37, pageWidth - margin, 37);
  
  // Información del informe (en dos columnas centradas)
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  
  const infoY = 45;
  const col1X = margin + 15;
  const col2X = pageWidth / 2 + 15;
  
  doc.setFont("helvetica", "bold");
  doc.text("Fecha de generación:", col1X, infoY);
  doc.text("Total de cálculos:", col2X, infoY);
  
  doc.setFont("helvetica", "normal");
  doc.text(new Date().toLocaleString(), col1X, infoY + 5);
  doc.text(historial.length.toString(), col2X, infoY + 5);
  
  // Tabla de datos perfectamente centrada
  const headers = [
    { 
      content: "#", 
      styles: { halign: 'center', fillColor: [29, 78, 216], textColor: 255, fontStyle: 'bold' } 
    },
    { 
      content: "Voltaje (V)", 
      styles: { halign: 'center', fillColor: [29, 78, 216], textColor: 255, fontStyle: 'bold' } 
    },
    { 
      content: "Corriente (A)", 
      styles: { halign: 'center', fillColor: [29, 78, 216], textColor: 255, fontStyle: 'bold' } 
    },
    { 
      content: "Resistencia (Ω)", 
      styles: { halign: 'center', fillColor: [29, 78, 216], textColor: 255, fontStyle: 'bold' } 
    },
    { 
      content: "Cifras Sig.", 
      styles: { halign: 'center', fillColor: [29, 78, 216], textColor: 255, fontStyle: 'bold' } 
    }
  ];
  
  const data = historial.map((item, index) => [
    { 
      content: (index + 1).toString(), 
      styles: { halign: 'center' } 
    },
    { 
      content: `${item.V} (${item.sigV} cifras)`, 
      styles: { halign: 'center' } 
    },
    { 
      content: `${item.I} (${item.sigI} cifras)`, 
      styles: { halign: 'center' } 
    },
    { 
      content: item.R.toString(), 
      styles: { halign: 'center', fontStyle: 'bold' } 
    },
    { 
      content: item.cifras.toString(), 
      styles: { halign: 'center' } 
    }
  ]);
  
  doc.autoTable({
    startY: 60,
    head: [headers],
    body: data,
    theme: "grid",
    headStyles: {
      fillColor: [29, 78, 216],
      textColor: 255,
      fontStyle: "bold",
      halign: 'center'
    },
    bodyStyles: {
      halign: 'center'
    },
    alternateRowStyles: {
      fillColor: [241, 245, 249]
    },
    styles: {
      cellPadding: 4,
      fontSize: 10,
      valign: 'middle'
    },
    columnStyles: {
      0: { cellWidth: 15 },
      1: { cellWidth: 40 },
      2: { cellWidth: 40 },
      3: { cellWidth: 40 },
      4: { cellWidth: 25 }
    },
    margin: { 
      left: margin,
      right: margin
    }
  });
  
  // Pie de página centrado
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Página ${i} de ${pageCount}`, pageWidth / 2, 285, { align: "center" });
    
    // Firma o información adicional
    doc.setFontSize(8);
    doc.text("Documento generado automáticamente - Calculadora de Resistencia", pageWidth / 2, 290, { align: "center" });

  }
  
  // Guardar con nombre profesional
  const today = new Date();
  const fileName = `Resistencia_${today.getFullYear()}${(today.getMonth()+1).toString().padStart(2, '0')}${today.getDate().toString().padStart(2, '0')}.pdf`;
  doc.save(fileName);
}

window.exportarPDF = exportarPDF;

// Inicializar
mostrarHistorial();