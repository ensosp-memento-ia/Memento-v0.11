// ======================================================================
// uiScan.js – Interface de lecture et exploitation de fiche IA RCH
// ======================================================================

import { decodeFiche } from "../core/compression.js";
import { buildFullPrompt } from "../core/variables.js";
import { readQRFromFile } from "../core/qrReaderFile.js";
import { startCameraScanner, stopCameraScanner } from "../core/qrReaderCamera.js";

let currentFiche = null;
let scanner = null;

// Éléments DOM
const fileInput = document.getElementById("qrFileInput");
const btnStartCam = document.getElementById("btnStartCam");
const btnStopCam = document.getElementById("btnStopCam");
const videoEl = document.getElementById("qrVideo");
const videoContainer = document.getElementById("videoContainer");

const sectionScan = document.getElementById("sectionScan");
const sectionMeta = document.getElementById("sectionMeta");
const sectionVars = document.getElementById("sectionVars");
const sectionExtra = document.getElementById("sectionExtra");
const sectionPrompt = document.getElementById("sectionPrompt");

const metaHeader = document.getElementById("metaHeader");
const scanVariables = document.getElementById("scanVariables");
const extraInput = document.getElementById("extra_input");
const promptResult = document.getElementById("promptResult");
const aiButtons = document.getElementById("aiButtons");

const btnResetScan = document.getElementById("btnResetScan");
const btnCopyPrompt = document.getElementById("btnCopyPrompt");

// ========== CLEANUP SCANNER ==========

async function cleanupScanner() {
  if (scanner) {
    console.log("🧹 Nettoyage scanner...");
    try {
      stopCameraScanner();
    } catch (e) {
      console.warn("⚠️ Erreur cleanup scanner :", e);
    }
    scanner = null;
  }
}

// ========== RESET ==========

function resetScan() {
  cleanupScanner();

  currentFiche = null;
  
  // Réinitialiser l'input fichier
  if (fileInput) fileInput.value = "";

  // Cacher sections
  if (sectionMeta) sectionMeta.style.display = "none";
  if (sectionVars) sectionVars.style.display = "none";
  if (sectionExtra) sectionExtra.style.display = "none";
  if (sectionPrompt) sectionPrompt.style.display = "none";
  
  // Réafficher section scan
  if (sectionScan) sectionScan.style.display = "block";
  
  // Cacher bouton reset
  if (btnResetScan) btnResetScan.style.display = "none";
  
  // Cacher vidéo
  if (videoContainer) videoContainer.style.display = "none";
  if (btnStopCam) btnStopCam.style.display = "none";
  if (btnStartCam) btnStartCam.style.display = "inline-block";
  
  console.log("🔄 Interface réinitialisée");
}

if (btnResetScan) {
  btnResetScan.onclick = resetScan;
}

// ========== AFFICHAGE FICHE ==========

function displayFiche(fiche) {
  currentFiche = fiche;
  window.currentFiche = fiche;

  console.log("📄 Affichage de la fiche :", fiche);

  // Cacher section scan
  if (sectionScan) sectionScan.style.display = "none";

  // Afficher métadonnées (VERSION CONDENSÉE)
  if (metaHeader && sectionMeta) {
    metaHeader.innerHTML = `
      <p><strong>Titre :</strong> ${fiche.title}</p>
      <p><strong>Catégorie :</strong> ${fiche.category}</p>
    `;
    sectionMeta.style.display = "block";
  }

  // Afficher variables
  if (scanVariables && sectionVars && fiche.variables && fiche.variables.length > 0) {
    scanVariables.innerHTML = "";

    fiche.variables.forEach((v) => {
      const div = document.createElement("div");
      div.className = "form-group";
      div.innerHTML = `
        <label>${v.label}${v.required ? " *" : ""}</label>
        ${
          v.type === "textarea"
            ? `<textarea id="var_${v.id}" rows="3" placeholder="${v.placeholder || ""}" ${v.required ? "required" : ""}></textarea>`
            : `<input type="${v.type || "text"}" id="var_${v.id}" placeholder="${v.placeholder || ""}" ${v.required ? "required" : ""}>`
        }
      `;
      scanVariables.appendChild(div);
    });

    sectionVars.style.display = "block";

    // Écouter changements pour regénérer le prompt
    fiche.variables.forEach((v) => {
      const input = document.getElementById(`var_${v.id}`);
      if (input) {
        input.addEventListener("input", () => updatePrompt());
      }
    });
  }

  // Afficher section informations complémentaires
  if (sectionExtra) {
    sectionExtra.style.display = "block";
    if (extraInput) {
      extraInput.addEventListener("input", () => updatePrompt());
    }
  }

  // Générer prompt initial
  updatePrompt();

  // Afficher bouton reset
  if (btnResetScan) {
    btnResetScan.style.display = "inline-block";
  }

  // Scroller vers le haut
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ========== MISE À JOUR PROMPT ==========

function updatePrompt() {
  if (!currentFiche) return;

  const fiche = currentFiche;

  // Récupérer valeurs des variables
  fiche.variables.forEach((v) => {
    const input = document.getElementById(`var_${v.id}`);
    if (input) {
      v.value = input.value.trim();
    }
  });

  // Récupérer infos complémentaires
  const extra = extraInput ? extraInput.value.trim() : "";

  // Construire le prompt
  const prompt = buildFullPrompt(fiche.prompt, fiche.variables, extra);

  // Afficher
  if (promptResult) {
    promptResult.textContent = prompt;
  }

  if (sectionPrompt) {
    sectionPrompt.style.display = "block";
  }

  // Générer boutons IA
  buildAIButtons(fiche, prompt);
}

// ========== BOUTONS IA ==========

function buildAIButtons(fiche, prompt) {
  if (!aiButtons) return;

  aiButtons.innerHTML = "";
  aiButtons.style.display = "flex";

  if (!prompt.trim()) return;

  const levels = fiche.ai || {
    chatgpt: 3,
    perplexity: 3,
    mistral: 3,
  };

  const styleForLevel = (lvl) => {
    switch (Number(lvl)) {
      case 3:
        return "background:#1dbf65;color:white;";
      case 2:
        return "background:#ff9f1c;color:white;";
      default:
        return "background:#cccccc;color:#777;";
    }
  };

  const mkBtn = (label, lvl, baseUrl) => {
    const btn = document.createElement("button");
    btn.textContent = label;
    btn.style =
      styleForLevel(lvl) +
      "padding:10px 16px;margin-right:10px;border:none;border-radius:10px;font-weight:600;cursor:pointer;";

    if (Number(lvl) === 1) {
      btn.disabled = true;
      btn.style.cursor = "not-allowed";
      btn.title = "Non recommandée pour cette fiche";
    } else {
      btn.onclick = () => {
        const encoded = encodeURIComponent(prompt);
        window.open(baseUrl + encoded, "_blank");
      };
    }

    aiButtons.appendChild(btn);
  };

  mkBtn("ChatGPT", levels.chatgpt, "https://chat.openai.com/?q=");
  mkBtn("Perplexity", levels.perplexity, "https://www.perplexity.ai/search?q=");
  mkBtn("Mistral", levels.mistral, "https://chat.mistral.ai/chat?q=");
}

// ========== COPIER PROMPT ==========

if (btnCopyPrompt) {
  btnCopyPrompt.onclick = async () => {
    const txt = promptResult?.textContent.trim();
    if (!txt) {
      alert("⚠️ Aucun prompt à copier");
      return;
    }

    try {
      await navigator.clipboard.writeText(txt);
      alert("✅ Prompt copié dans le presse-papiers.");
    } catch (err) {
      console.error("❌ Erreur copie :", err);
      alert("❌ Impossible de copier le prompt.");
    }
  };
}

// ========== IMPORT FICHIER ==========

if (fileInput) {
  fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    readQRFromFile(
      file,
      (fiche) => {
        cleanupScanner();
        displayFiche(fiche);
      },
      (error) => {
        console.error("❌ Erreur lecture fichier :", error);
        alert("⚠️ Impossible de lire ce QR Code. Vérifiez que l'image est nette et complète.");
      }
    );
  });
}

// ========== CAMÉRA ==========

if (btnStartCam) {
  btnStartCam.addEventListener("click", async () => {
    if (videoContainer) videoContainer.style.display = "block";
    if (btnStartCam) btnStartCam.style.display = "none";
    if (btnStopCam) btnStopCam.style.display = "inline-block";

    scanner = await startCameraScanner(
      "qrVideo",
      (fiche) => {
        displayFiche(fiche);
        if (videoContainer) videoContainer.style.display = "none";
        if (btnStopCam) btnStopCam.style.display = "none";
        if (btnStartCam) btnStartCam.style.display = "inline-block";
      },
      (error) => {
        console.error("❌ Erreur caméra :", error);
        alert("⚠️ Impossible d'accéder à la caméra : " + error.message);
        if (videoContainer) videoContainer.style.display = "none";
        if (btnStopCam) btnStopCam.style.display = "none";
        if (btnStartCam) btnStartCam.style.display = "inline-block";
      }
    );
  });
}

if (btnStopCam) {
  btnStopCam.addEventListener("click", () => {
    cleanupScanner();
    if (videoContainer) videoContainer.style.display = "none";
    if (btnStopCam) btnStopCam.style.display = "none";
    if (btnStartCam) btnStartCam.style.display = "inline-block";
  });
}

// ========== CHARGEMENT AUTOMATIQUE DEPUIS URL ==========

window.addEventListener("DOMContentLoaded", () => {
  // Vérifier si une fiche a été pré-chargée depuis l'URL
  if (window.autoLoadFiche) {
    console.log("🔗 Chargement automatique de la fiche depuis URL");
    displayFiche(window.autoLoadFiche);
  }
});

// ========== CLEANUP AU DÉCHARGEMENT ==========

window.addEventListener("beforeunload", () => {
  cleanupScanner();
});
