const historial = [];

function contarCifrasSignificativas(numeroStr) {
  // Quitar espacios y signo negativo
  let num = numeroStr.trim();
  if (num[0] === '-') num = num.slice(1);

  // Si es notación científica, convertir a decimal completo
  if (num.toLowerCase().includes('e')) {
    const n = Number(num);
    num = n.toString();
  }

  // Quitar punto decimal para contar cifras
  const partes = num.split('.');
  if (partes.length === 1) {
    // Sin decimal
    // Cifras significativas = dígitos excepto ceros a la izquierda
    const sinCerosIzq = partes[0].replace(/^0+/, '');
    return sinCerosIzq.length || 1; // Al menos 1 cifra si es cero
  } else {
    // Con decimal
    // Contar todos los dígitos excepto ceros a la izquierda (antes del punto)
    const sinCerosIzq = partes[0].replace(/^0+/, '');
    // Contar todos los dígitos en la parte entera y decimal (los ceros a la derecha después del punto son significativos)
    return sinCerosIzq.length + partes[1].length;
  }
}

function redondearCifrasSignificativas(num, cifras) {
  if (num === 0) return 0;
  const d = Math.ceil(Math.log10(Math.abs(num)));
  const factor = Math.pow(10, cifras - d);
  return Math.round(num * factor) / factor;
}

function calcularResistencia() {
  const voltajeInput = document.getElementById("voltaje");
  const corrienteInput = document.getElementById("corriente");

  const voltajeStr = voltajeInput.value;
  const corrienteStr = corrienteInput.value;

  if (!voltajeStr || !corrienteStr) {
    alert("Por favor, ingrese ambos valores.");
    return;
  }

  const sigV = contarCifrasSignificativas(voltajeStr);
  const sigI = contarCifrasSignificativas(corrienteStr);

  const voltaje = Number(voltajeStr);
  const corriente = Number(corrienteStr);

  if (isNaN(voltaje) || isNaN(corriente) || corriente === 0) {
    alert("Ingrese valores numéricos válidos y la corriente no puede ser cero.");
    return;
  }

  const resistenciaRaw = voltaje / corriente;
  const cifras = Math.min(sigV, sigI);
  const resistencia = redondearCifrasSignificativas(resistenciaRaw, cifras);

  document.getElementById("resultado").innerText = `${resistencia} Ω (con ${cifras} cifras significativas)`;

  // Guardar en historial
  historial.push({
    V: voltajeStr,
    sigV,
    I: corrienteStr,
    sigI,
    R: resistencia,
    cifras,
  });

  // Mostrar historial
  mostrarHistorial();
}

function mostrarHistorial() {
  const historialDiv = document.getElementById("historial");
  historialDiv.innerHTML = "";

  historial.forEach((item, i) => {
    const div = document.createElement("div");
    div.classList.add("mb-2", "p-2", "border", "rounded", "bg-gray-100", "text-sm");
    div.textContent = `${i + 1}. V=${item.V} (${item.sigV} cifras), I=${item.I} (${item.sigI} cifras) → R=${item.R} Ω (${item.cifras} cifras)`;
    historialDiv.appendChild(div);
  });
}

// Mejor exportarPDF con estilo y formato
async function exportarPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({
    unit: "pt",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 40;
  let y = 60;

  // Función para encabezado fijo en cada página
  function encabezado() {
    doc.setFontSize(16);
    doc.setTextColor("#2c3e50");
    doc.setFont("helvetica", "bold");
    doc.text("Historial de Mediciones de Resistencia", pageWidth / 2, 40, { align: "center" });
    doc.setDrawColor("#2980b9");
    doc.setLineWidth(1.5);
    doc.line(margin, 50, pageWidth - margin, 50);
  }

  // Función para pie de página con número de página y fecha
  function piePagina(pageNum) {
    const fecha = new Date().toLocaleString();
    doc.setFontSize(10);
    doc.setTextColor("#7f8c8d");
    doc.setFont("helvetica", "normal");
    doc.text(`Página ${pageNum}`, pageWidth - margin, doc.internal.pageSize.getHeight() - 30, { align: "right" });
    doc.text(`Generado: ${fecha}`, margin, doc.internal.pageSize.getHeight() - 30);
  }

  // Agregar encabezado a la primera página
  encabezado();

  doc.setFontSize(12);
  doc.setTextColor("#34495e");
  doc.setFont("helvetica", "normal");

  historial.forEach((item, i) => {
    const texto = `${i + 1}. V=${item.V} (${item.sigV} cifras), I=${item.I} (${item.sigI} cifras) → R=${item.R} Ω (${item.cifras} cifras)`;

    if (y > doc.internal.pageSize.getHeight() - 60) {
      piePagina(doc.getCurrentPageInfo().pageNumber);
      doc.addPage();
      y = 60;
      encabezado();
      doc.setFontSize(12);
      doc.setTextColor("#34495e");
      doc.setFont("helvetica", "normal");
    }

    doc.text(texto, margin, y);
    y += 20;

    // Línea separadora
    doc.setDrawColor("#bdc3c7");
    doc.setLineWidth(0.5);
    doc.line(margin, y - 8, pageWidth - margin, y - 8);
  });

  piePagina(doc.getCurrentPageInfo().pageNumber);

  doc.save("historial_resistencia.pdf");
}

window.calcularResistencia = calcularResistencia;
window.exportarPDF = exportarPDF;
