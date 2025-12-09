// ===============================================================
// uiReset.js – Réinitialisation complète de l'interface de création
// ===============================================================

import { resetMetaUI } from "./uiMeta.js";
import { initVariablesUI } from "./uiVariables.js";
import { resetPromptUI } from "./uiPrompt.js";

export function resetCreateUI() {
  console.log("🔄 Réinitialisation complète de l'interface");

  // 1. Métadonnées
  resetMetaUI();

  // 2. Variables
  initVariablesUI();

  // 3. Prompt
  resetPromptUI();

  // 4. QR Container
  const qrContainer = document.getElementById("qrContainer");
  if (qrContainer) {
    qrContainer.innerHTML = "";
  }

  // 5. Zone de résultat
  const resultZone = document.getElementById("resultZone");
  if (resultZone) {
    resultZone.style.display = "none";
  }

  // 6. JSON Output
  const jsonOutput = document.getElementById("jsonOutput");
  if (jsonOutput) {
    jsonOutput.textContent = "";
  }

  // 7. URL Output
  const urlOutput = document.getElementById("urlOutput");
  if (urlOutput) {
    urlOutput.value = "";
  }

  // 8. Bouton download QR
  const btnDownloadQR = document.getElementById("btnDownloadQR");
  if (btnDownloadQR) {
    btnDownloadQR.style.display = "none";
  }

  // 9. Bouton reset
  const btnResetCreate = document.getElementById("btnResetCreate");
  if (btnResetCreate) {
    btnResetCreate.style.display = "none";
  }

  // 10. IA recommandées (reset à valeurs par défaut)
  resetConfidenceIndexes();

  console.log("✅ Interface réinitialisée");
}

export function resetConfidenceIndexes() {
  const aiFields = ["ai_chatgpt", "ai_perplexity", "ai_mistral"];
  
  aiFields.forEach(id => {
    const select = document.getElementById(id);
    if (select) {
      select.value = "3"; // Valeur par défaut : Recommandée
    }
  });
}
