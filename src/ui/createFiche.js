// ======================================================================
// createFiche.js – Interface de création de fiches IA RCH
// ======================================================================

import { validateFiche } from "../core/jsonSchema.js";
import { encodeFiche } from "../core/compression.js";
import { generateQRCode, downloadQRCode } from "../core/qrWriter.js";
import { generateFicheUrl } from "../core/urlEncoder.js";

// Import des sous-modules UI
import { initVariablesUI, getVariablesFromUI } from "./uiVariables.js";
import { getMetaFromUI, resetMetaUI } from "./uiMeta.js";
import { getPromptFromUI, resetPromptUI, initPromptUI } from "./uiPrompt.js";
import { resetCreateUI } from "./uiReset.js";

// État global
let variables = [];

// Éléments DOM
const btnAddVariable = document.getElementById("btnAddVariable");
const variablesList = document.getElementById("variablesList");
const btnGenerate = document.getElementById("btnGenerate");
const resultZone = document.getElementById("resultZone");
const jsonOutput = document.getElementById("jsonOutput");
const btnCopyJson = document.getElementById("btnCopyJson");
const btnDownloadQR = document.getElementById("btnDownloadQR");
const btnCopyUrl = document.getElementById("btnCopyUrl");
const urlOutput = document.getElementById("urlOutput");
const btnResetCreate = document.getElementById("btnResetCreate");

// ========== GESTION DES VARIABLES ==========

function renderVariables() {
  variablesList.innerHTML = "";

  if (variables.length === 0) {
    variablesList.innerHTML = '<p style="color:#999;font-style:italic;">Aucune variable ajoutée.</p>';
    return;
  }

  variables.forEach((v, index) => {
    const div = document.createElement("div");
    div.className = "variable-item";
    div.innerHTML = `
      <label>Identifiant de la variable *</label>
      <input type="text" class="var-id" value="${v.id}" placeholder="Ex: produit" data-index="${index}">
      
      <label>Libellé affiché *</label>
      <input type="text" class="var-label" value="${v.label}" placeholder="Ex: Nom du produit chimique" data-index="${index}">
      
      <label>Type</label>
      <select class="var-type" data-index="${index}">
        <option value="text" ${v.type === "text" ? "selected" : ""}>Texte</option>
        <option value="number" ${v.type === "number" ? "selected" : ""}>Nombre</option>
        <option value="textarea" ${v.type === "textarea" ? "selected" : ""}>Texte long</option>
      </select>
      
      <label>Placeholder</label>
      <input type="text" class="var-placeholder" value="${v.placeholder}" placeholder="Texte d'aide" data-index="${index}">
      
      <button class="btn-remove" data-index="${index}">🗑️ Supprimer</button>
    `;
    variablesList.appendChild(div);
  });

  // Événements de modification
  document.querySelectorAll(".var-id").forEach((input) => {
    input.addEventListener("input", (e) => {
      const index = parseInt(e.target.dataset.index);
      variables[index].id = e.target.value;
    });
  });

  document.querySelectorAll(".var-label").forEach((input) => {
    input.addEventListener("input", (e) => {
      const index = parseInt(e.target.dataset.index);
      variables[index].label = e.target.value;
    });
  });

  document.querySelectorAll(".var-type").forEach((select) => {
    select.addEventListener("change", (e) => {
      const index = parseInt(e.target.dataset.index);
      variables[index].type = e.target.value;
    });
  });

  document.querySelectorAll(".var-placeholder").forEach((input) => {
    input.addEventListener("input", (e) => {
      const index = parseInt(e.target.dataset.index);
      variables[index].placeholder = e.target.value;
    });
  });

  document.querySelectorAll(".btn-remove").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const index = parseInt(e.target.dataset.index);
      variables.splice(index, 1);
      renderVariables();
    });
  });
}

btnAddVariable.addEventListener("click", () => {
  variables.push(createEmptyVariable());
  renderVariables();
});

// ========== GÉNÉRATION ==========

btnGenerate.addEventListener("click", () => {
  try {
    // Récupérer les données via les modules UI
    const meta = getMetaFromUI();
    const prompt = getPromptFromUI();
    const variables = getVariablesFromUI();

    const fiche = {
      ...meta,
      prompt: prompt,
      variables: variables,
      ai: {
        chatgpt: parseInt(document.getElementById("ai_chatgpt")?.value || "3"),
        perplexity: parseInt(document.getElementById("ai_perplexity")?.value || "3"),
        mistral: parseInt(document.getElementById("ai_mistral")?.value || "3"),
      },
    };

    // Valider
    validateFiche(fiche);

    // Afficher le JSON
    jsonOutput.textContent = JSON.stringify(fiche, null, 2);

    // Encoder et compresser
    const encoded = encodeFiche(fiche);

    // Générer QR Code
    generateQRCode("qrContainer", encoded.wrapperString, 300);

    // Générer URL
    const baseUrl = window.location.origin + window.location.pathname.replace('create.html', '');
    const ficheUrl = generateFicheUrl(fiche, baseUrl);
    urlOutput.value = ficheUrl;

    // Afficher résultats
    resultZone.style.display = "block";
    btnDownloadQR.style.display = "inline-block";
    btnResetCreate.style.display = "inline-block";

    // Scroller vers les résultats
    resultZone.scrollIntoView({ behavior: "smooth" });

  } catch (error) {
    console.error("❌ Erreur génération :", error);
    alert("⚠️ Erreur : " + error.message);
  }
});

// ========== COPIER JSON ==========

btnCopyJson.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(jsonOutput.textContent);
    btnCopyJson.textContent = "✅ JSON copié !";
    btnCopyJson.style.background = "#28a745";

    setTimeout(() => {
      btnCopyJson.textContent = "📋 Copier le JSON";
      btnCopyJson.style.background = "";
    }, 2000);
  } catch (err) {
    console.error("❌ Erreur copie :", err);
    alert("❌ Impossible de copier. Veuillez copier manuellement.");
  }
});

// ========== TÉLÉCHARGER QR ==========

btnDownloadQR.addEventListener("click", () => {
  const title = document.getElementById("meta_title").value.trim() || "fiche";
  const filename = `QR_${title.replace(/\s+/g, "_")}.png`;
  downloadQRCode("qrContainer", filename);
});

// ========== COPIER URL ==========

btnCopyUrl.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(urlOutput.value);
    btnCopyUrl.textContent = "✅ Lien copié !";
    btnCopyUrl.style.background = "#28a745";

    setTimeout(() => {
      btnCopyUrl.textContent = "🔗 Copier le lien";
      btnCopyUrl.style.background = "";
    }, 2000);
  } catch (err) {
    console.error("❌ Erreur copie :", err);
    alert("❌ Impossible de copier. Veuillez copier manuellement.");
  }
});

// ========== RESET ==========

btnResetCreate.addEventListener("click", () => {
  if (confirm("⚠️ Êtes-vous sûr de vouloir tout réinitialiser ?")) {
    location.reload();
  }
});

// ========== INITIALISATION ==========

renderVariables();

// Initialiser la date du jour
document.getElementById("meta_date").valueAsDate = new Date();
