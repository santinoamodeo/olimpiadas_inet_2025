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
  historial.forEach((item, i) => {
    const li = document.createElement("li");
    li.className = "border border-gray-300 rounded-md p-2 bg-gray-50";
    li.textContent = `V=${item.V} (${item.sigV} cifras), I=${item.I} (${item.sigI} cifras) → R=${item.R} Ω (${item.cifras} cifras)`;
    historialUl.appendChild(li);
  });
}

function guardarHistorial(v, sigV, i, sigI, r, cifras) {
  historial.unshift({ V: v, sigV, I: i, sigI, R: r, cifras });
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
    resultadoDiv.textContent = "La corriente no puede ser cero.";
    return;
  }

  // Tomamos la menor cantidad de cifras significativas
  const cifras = Math.min(sigV, sigI);

  const resistencia = V / I;
  const resistenciaRedondeada = redondearCifrasSignificativas(resistencia, cifras);

  resultadoDiv.textContent = `Resistencia: ${resistenciaRedondeada} Ω (con ${cifras} cifras significativas)`;

  guardarHistorial(V, sigV, I, sigI, resistenciaRedondeada, cifras);
});

// Exportar PDF
async function exportarPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("Historial de Mediciones de Resistencia", 14, 20);

  doc.setFontSize(12);
  let y = 30;
  historial.forEach((item, i) => {
    const texto = `${i + 1}. V=${item.V} (${item.sigV} cifras), I=${item.I} (${item.sigI} cifras) → R=${item.R} Ω (${item.cifras} cifras)`;
    doc.text(texto, 14, y);
    y += 10;
    if (y > 280) {
      doc.addPage();
      y = 20;
    }
  });

  doc.save("historial_resistencia.pdf");
}

window.exportarPDF = exportarPDF;

mostrarHistorial();
