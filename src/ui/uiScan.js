// ========================================================================
// uiScan.js — Lecture + exploitation de fiche IA RCH
// Version finale : URL uniquement + Codes couleur + Transmission prompt
// ========================================================================

console.log("🚀 DÉBUT DU CHARGEMENT DE uiScan.js - Version finale");

import { decodeFiche } from "../core/compression.js";
import { getFicheFromUrl } from "../core/urlEncoder.js";
import { startCameraScan, stopCameraScan } from "../core/qrReaderCamera.js";
import { BETA_FORM_URL } from "./config.js";

console.log("✅ Imports réussis (decodeFiche, getFicheFromUrl, caméra, config)");

// ---------- Sections ----------
const sectionScan   = document.getElementById("sectionScan");
const sectionMeta   = document.getElementById("sectionMeta");
const sectionVars   = document.getElementById("sectionVars");
const sectionExtra  = document.getElementById("sectionExtra");
const sectionPrompt = document.getElementById("sectionPrompt");

// ---------- Éléments principaux ----------
const metaHeader    = document.getElementById("metaHeader");

// Caméra
const btnStartCam   = document.getElementById("btnStartCam");
const btnStopCam    = document.getElementById("btnStopCam");
const videoContainer= document.getElementById("videoContainer");
const videoEl       = document.getElementById("qrVideo");

// Stockage de la fiche courante
window.currentFiche = null;

// ------------------------------------------------------------------------
// ✅ FONCTION SIMPLIFIÉE : Extraction fiche depuis URL du QR
// ------------------------------------------------------------------------
function extractFicheFromQR(qrText) {
  console.log("🔍 Analyse du QR Code...");
  console.log("  - Contenu:", qrText.substring(0, 150) + "...");
  console.log("  - Longueur:", qrText.length, "caractères");

  if (!qrText.startsWith('http://') && !qrText.startsWith('https://')) {
    throw new Error("Le QR Code ne contient pas une URL valide. Format attendu : https://...");
  }

  console.log("🔗 URL détectée, extraction du paramètre 'fiche'...");

  try {
    const url = new URL(qrText);
    const ficheParam = url.searchParams.get('fiche');

    if (!ficheParam) {
      throw new Error("Paramètre 'fiche' introuvable dans l'URL");
    }

    console.log("✅ Paramètre 'fiche' extrait");
    console.log("  - Longueur:", ficheParam.length, "caractères");

    let normalizedData = ficheParam
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const paddingNeeded = (4 - (normalizedData.length % 4)) % 4;
    normalizedData += '='.repeat(paddingNeeded);

    console.log("🔄 Décodage Base64...");

    const fiche = decodeFiche(normalizedData);

    console.log("✅ Fiche décodée avec succès");

    return fiche;

  } catch (error) {
    console.error("❌ Erreur extraction fiche:", error);
    throw new Error("Impossible d'extraire la fiche de l'URL : " + error.message);
  }
}

// ------------------------------------------------------------------------
// Quand une fiche est décodée (depuis fichier ou caméra)
// ------------------------------------------------------------------------
function onFicheDecoded(fiche) {
  console.log("✅ Fiche décodée :", fiche);

  window.currentFiche = fiche;

  if (sectionScan)   sectionScan.style.display   = "none";
  if (sectionMeta)   sectionMeta.style.display   = "block";
  if (sectionVars)   sectionVars.style.display   = "block";
  if (sectionExtra)  sectionExtra.style.display  = "block";
  if (sectionPrompt) sectionPrompt.style.display = "block";

  const actionButtons = document.getElementById("actionButtons");
  if (actionButtons) actionButtons.style.display = "flex";

  if (metaHeader) {
    metaHeader.style.display = "block";
    metaHeader.innerHTML = `
      <h3>${fiche.meta?.titre || "Titre inconnu"}</h3>
      <div class="meta-line"><b>Catégorie :</b> ${fiche.meta?.categorie || "-"}</div>
      <div class="meta-line"><b>Objectif :</b> ${fiche.meta?.objectif || "-"}</div>
      <div class="meta-line"><b>Concepteur :</b> ${fiche.meta?.concepteur || "-"}</div>
      <div class="meta-line"><b>Version :</b> ${fiche.meta?.version || "1.0"}</div>
      <div class="meta-line"><b>Mis à jour le :</b> ${fiche.meta?.date || "-"}</div>
    `;
  }

  const scanVariables = document.getElementById("scanVariables");
  if (scanVariables) {
    scanVariables.innerHTML = "";

    (fiche.prompt?.variables || []).forEach(v => {
      const block = document.createElement("div");
      block.className = "var-field";

      const lab = document.createElement("label");
      lab.textContent = v.label || v.id;

      if (v.required) {
        const req = document.createElement("span");
        req.textContent = " *";
        req.style.color = "#ff4d4d";
        lab.appendChild(req);
      }

      block.appendChild(lab);

      let field;

      if (v.type === "text") {
        field = document.createElement("input");
        field.type = "text";
        if (v.required) field.required = true;
      }
      else if (v.type === "number") {
        field = document.createElement("input");
        field.type = "number";
        if (v.required) field.required = true;
      }
      else if (v.type === "choice") {
        field = document.createElement("select");
        if (v.required) field.required = true;

        if (!v.required) {
          const emptyOpt = document.createElement("option");
          emptyOpt.value = "";
          emptyOpt.textContent = "-- Sélectionner --";
          field.appendChild(emptyOpt);
        }

        (v.options || []).forEach(opt => {
          const o = document.createElement("option");
          o.value = opt;
          o.textContent = opt;
          field.appendChild(o);
        });
      }
      else if (v.type === "geoloc") {
        field = document.createElement("div");
        field.innerHTML = `
          <button class="btn-reset" id="${v.id}_gps" type="button">📍 Acquérir position</button>
          <input id="${v.id}_lat" placeholder="Latitude" type="number" step="0.000001" ${v.required ? 'required' : ''}>
          <input id="${v.id}_lon" placeholder="Longitude" type="number" step="0.000001" ${v.required ? 'required' : ''}>
        `;

        setTimeout(() => {
          const btn = document.getElementById(`${v.id}_gps`);
          if (!btn) return;

          btn.onclick = () => {
            btn.disabled = true;
            btn.textContent = "⏳ Localisation...";

            navigator.geolocation.getCurrentPosition(
              pos => {
                const lat = document.getElementById(`${v.id}_lat`);
                const lon = document.getElementById(`${v.id}_lon`);
                if (lat) lat.value = pos.coords.latitude.toFixed(6);
                if (lon) lon.value = pos.coords.longitude.toFixed(6);
                btn.disabled = false;
                btn.textContent = "✅ Position acquise";
                setTimeout(() => { btn.textContent = "📍 Acquérir position"; }, 2000);
              },
              err => {
                console.error("❌ Erreur GPS :", err);
                btn.disabled = false;
                btn.textContent = "❌ Erreur GPS";
                alert("Erreur de géolocalisation : " + err.message);
                setTimeout(() => { btn.textContent = "📍 Acquérir position"; }, 2000);
              },
              { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
          };
        }, 0);
      }
      else {
        field = document.createElement("input");
        field.type = "text";
      }

      field.dataset.id = v.id;
      block.appendChild(field);
      scanVariables.appendChild(block);
    });
  }

  const promptResult = document.getElementById("promptResult");
  const aiButtons = document.getElementById("aiButtons");

  if (promptResult) promptResult.textContent = "";
  if (aiButtons) aiButtons.innerHTML = "";

  initializeCompileButton(fiche);
}

// ------------------------------------------------------------------------
// ✅ Initialisation bouton compiler
// ------------------------------------------------------------------------
function initializeCompileButton(fiche) {
  console.log("🔧 Initialisation bouton compiler...");

  const btnCompile    = document.getElementById("btnBuildPrompt");
  const scanVariables = document.getElementById("scanVariables");
  const promptResult  = document.getElementById("promptResult");
  const extraInput    = document.getElementById("extra_input");
  const aiButtons     = document.getElementById("aiButtons");

  if (!btnCompile) {
    console.error("❌ Bouton btnBuildPrompt introuvable");
    return;
  }

  if (!scanVariables || !promptResult) {
    console.error("❌ Éléments manquants pour compilation");
    return;
  }

  btnCompile.onclick = () => {
    console.log("🎯 COMPILATION DÉCLENCHÉE !");

    if (!window.currentFiche) {
      alert("⚠️ Aucune fiche chargée");
      return;
    }

    const ficheData = window.currentFiche;
    let prompt = ficheData.prompt.base;
    const extra = extraInput?.value.trim() || "";

    (ficheData.prompt?.variables || []).forEach(v => {
      const field = scanVariables.querySelector(`[data-id="${v.id}"]`);
      let value = "";

      if (v.type === "geoloc") {
        const lat = document.getElementById(`${v.id}_lat`)?.value || "";
        const lon = document.getElementById(`${v.id}_lon`)?.value || "";
        value = lat && lon ? `${lat}, ${lon}` : "";
      } else {
        value = field?.value || "";
      }

      if (v.required && !value) {
        alert(`⚠️ Le champ "${v.label || v.id}" est requis`);
        throw new Error("Champ requis manquant");
      }

      const placeholder = `{{${v.id}}}`;
      prompt = prompt.replace(new RegExp(placeholder, "g"), value);
    });

    if (extra) {
      prompt += `\n\nInformations complémentaires :\n${extra}`;
    }

    promptResult.textContent = prompt;
    buildAIButtons(ficheData, prompt, aiButtons);

    console.log("✅ Prompt compilé avec succès");
  };

  console.log("✅ Bouton compiler initialisé avec succès");
}

// ------------------------------------------------------------------------
// ✅ Boutons IA avec codes couleur + transmission prompt
// ------------------------------------------------------------------------
function buildAIButtons(fiche, prompt, aiButtonsContainer) {
  if (!aiButtonsContainer) return;

  aiButtonsContainer.innerHTML = "";
  aiButtonsContainer.style.display = "flex";
  aiButtonsContainer.style.flexWrap = "nowrap";
  aiButtonsContainer.style.gap = "8px";

  if (!prompt.trim()) return;

  const levels = {
    chatgpt:    (fiche.ai?.chatgpt    !== undefined) ? fiche.ai.chatgpt    : 3,
    perplexity: (fiche.ai?.perplexity !== undefined) ? fiche.ai.perplexity : 3,
    mistral:    (fiche.ai?.mistral    !== undefined) ? fiche.ai.mistral    : 3,
    claude:     (fiche.ai?.claude     !== undefined) ? fiche.ai.claude     : "NC",
  };

  const styleForLevel = (lvl) => {
    switch (String(lvl)) {
      case "3":  return "background:#1dbf65;color:white;";
      case "2":  return "background:#ff9f1c;color:white;";
      case "1":  return "background:#999;color:#ccc;";
      case "NC": return "background:#001F8F;color:white;";
      default:   return "background:#cccccc;color:#777;";
    }
  };

  const getLabelForLevel = (lvl) => {
    switch (String(lvl)) {
      case "3":  return "3 - Recommandée";
      case "2":  return "2 - Acceptable";
      case "1":  return "1 - Non recommandée";
      case "NC": return "NC - Non classé";
      default:   return `Indice: ${lvl}`;
    }
  };

  const mkBtn = (label, lvl, baseUrl) => {
    const btn = document.createElement("button");
    const lvlLabel = getLabelForLevel(lvl);

    btn.innerHTML = `
      <span style="display:flex;flex-direction:column;align-items:center;gap:4px;">
        <span>🤖 ${label}</span>
        <span style="background:rgba(255,255,255,0.3);padding:2px 8px;border-radius:12px;font-size:11px;white-space:nowrap;">${lvlLabel}</span>
      </span>
    `;

    btn.style = styleForLevel(lvl)
      + "padding:10px 8px;border:none;border-radius:8px;font-weight:600;cursor:pointer;flex:1;min-width:0;";

    if (String(lvl) === "1") {
      btn.disabled = true;
      btn.style.cursor = "not-allowed";
      btn.style.opacity = "0.6";
      btn.title = "Cette IA n'est pas recommandée pour cette fiche (indice: 1)";
    } else {
      btn.onclick = () => {
        const fullUrl = baseUrl + encodeURIComponent(prompt);
        console.log(`🚀 Ouverture de ${label} avec prompt`);
        window.open(fullUrl, "_blank");
      };
    }

    aiButtonsContainer.appendChild(btn);
  };

  mkBtn("ChatGPT",    levels.chatgpt,    "https://chat.openai.com/?q=");
  mkBtn("Perplexity", levels.perplexity, "https://www.perplexity.ai/search?q=");
  mkBtn("Mistral",    levels.mistral,    "https://chat.mistral.ai/chat?q=");
  mkBtn("Claude",     levels.claude,     "https://claude.ai/new?q=");

  console.log("✅ Boutons IA générés");
}

// ------------------------------------------------------------------------
// Lecture via CAMÉRA
// ------------------------------------------------------------------------
if (btnStartCam && btnStopCam && videoEl) {

  btnStartCam.onclick = async () => {
    console.log("🎥 Démarrage caméra...");

    videoContainer.style.display = "block";
    btnStartCam.disabled = true;
    btnStopCam.disabled = false;

    try {
      await startCameraScan(videoEl, (qrText) => {
        console.log("📷 QR détecté par caméra");

        try {
          const fiche = extractFicheFromQR(qrText);

          stopCameraScan().then(() => {
            videoContainer.style.display = "none";
            btnStartCam.disabled = false;
            btnStopCam.disabled = true;
            onFicheDecoded(fiche);
          });

        } catch (e) {
          console.error("❌ Erreur décodage QR:", e);
          alert("⚠️ " + e.message + "\n\nContinuez à scanner...");
        }
      });

      console.log("✅ Caméra démarrée avec succès");

    } catch (err) {
      console.error("❌ Erreur caméra :", err);
      alert("❌ Impossible d'accéder à la caméra : " + err.message);
      await stopCameraScan();
      videoContainer.style.display = "none";
      btnStartCam.disabled = false;
      btnStopCam.disabled = true;
    }
  };

  btnStopCam.onclick = async () => {
    console.log("⏹️ Arrêt caméra manuel");
    await stopCameraScan();
    videoContainer.style.display = "none";
    btnStartCam.disabled = false;
    btnStopCam.disabled = true;
  };
}

// ------------------------------------------------------------------------
// Bouton copier prompt
// ------------------------------------------------------------------------
const btnCopyPrompt = document.getElementById("btnCopy");
if (btnCopyPrompt) {
  btnCopyPrompt.onclick = async () => {
    const promptResult = document.getElementById("promptResult");
    const text = promptResult?.textContent;

    if (!text) {
      alert("⚠️ Aucun prompt à copier");
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      btnCopyPrompt.textContent = "✅ Copié !";
      setTimeout(() => { btnCopyPrompt.textContent = "📋 Copier le prompt"; }, 2000);
    } catch (e) {
      alert("❌ Erreur copie : " + e.message);
    }
  };
}

// ========================================================================
// CHARGEMENT AUTOMATIQUE DEPUIS URL
// ========================================================================

function checkAndLoadFromUrl() {
  console.log("🔍 Vérification paramètre URL...");

  const ficheData = getFicheFromUrl();

  if (!ficheData) {
    console.log("ℹ️ Aucun paramètre 'fiche' dans l'URL - mode scan normal");
    return;
  }

  console.log("🌐 Paramètre 'fiche' détecté - chargement automatique...");

  try {
    const fiche = decodeFiche(ficheData);
    console.log("✅ Fiche chargée depuis l'URL");

    showUrlLoadMessage(fiche.meta?.titre || "Fiche chargée");
    onFicheDecoded(fiche);

  } catch (err) {
    console.error("❌ Erreur chargement URL :", err);
    alert("❌ Impossible de charger la fiche depuis l'URL\n\n" + err.message);
  }
}

function showUrlLoadMessage(titre) {
  const messageBox = document.createElement("div");
  messageBox.style.cssText = `
    background: #e7f3ff;
    border-left: 4px solid #001F8F;
    padding: 12px 15px;
    margin: 0 0 20px 0;
    border-radius: 8px;
  `;
  messageBox.innerHTML = `
    <strong style="color:#001F8F;">🔗 Fiche chargée depuis un lien</strong>
    <p style="margin:5px 0 0 0;font-size:14px;">
      "${titre}" a été chargée automatiquement.
    </p>
  `;

  const main = document.querySelector("main");
  if (main && main.firstChild) {
    main.insertBefore(messageBox, main.firstChild);
  }
}

window.addEventListener('load', () => {
  console.log("📄 Page chargée - vérification URL...");
  checkAndLoadFromUrl();
});

// ========================================================================
// BOUTON RESET
// ========================================================================

function resetScanPage() {
  const modal = document.getElementById("confirmResetModal");
  if (modal) modal.style.display = "flex";
}

function executeReset() {
  const modal = document.getElementById("confirmResetModal");
  if (modal) modal.style.display = "none";

  stopCameraScan();

  if (sectionScan)   sectionScan.style.display   = "block";
  if (sectionMeta)   sectionMeta.style.display   = "none";
  if (sectionVars)   sectionVars.style.display   = "none";
  if (sectionExtra)  sectionExtra.style.display  = "none";
  if (sectionPrompt) sectionPrompt.style.display = "none";

  const actionButtons = document.getElementById("actionButtons");
  if (actionButtons) actionButtons.style.display = "none";

  const scanVariables = document.getElementById("scanVariables");
  const extraInput    = document.getElementById("extra_input");
  const promptResult  = document.getElementById("promptResult");
  const aiButtons     = document.getElementById("aiButtons");

  if (scanVariables) scanVariables.innerHTML  = "";
  if (extraInput)    extraInput.value         = "";
  if (promptResult)  promptResult.textContent = "";
  if (aiButtons)     aiButtons.innerHTML      = "";
  if (metaHeader)    metaHeader.innerHTML     = "";

  if (window.location.search.includes('fiche=')) {
    const newUrl = window.location.origin + window.location.pathname;
    window.history.replaceState({}, document.title, newUrl);
  }

  window.currentFiche = null;
  console.log("✅ Réinitialisation terminée");
}

function cancelReset() {
  const modal = document.getElementById("confirmResetModal");
  if (modal) modal.style.display = "none";
}

const btnResetScan = document.getElementById("btnResetScan");
if (btnResetScan) btnResetScan.addEventListener("click", resetScanPage);

const btnConfirmReset = document.getElementById("btnConfirmReset");
if (btnConfirmReset) btnConfirmReset.addEventListener("click", executeReset);

const btnCancelReset = document.getElementById("btnCancelReset");
if (btnCancelReset) btnCancelReset.addEventListener("click", cancelReset);

const confirmResetModal = document.getElementById("confirmResetModal");
if (confirmResetModal) {
  confirmResetModal.addEventListener("click", (e) => {
    if (e.target === confirmResetModal) cancelReset();
  });
}

// ========================================================================
// BOUTON BETA TEST — source unique : config.js
// ========================================================================
const btnBetaTest = document.getElementById("btnBetaTest");
if (btnBetaTest) {
  btnBetaTest.addEventListener("click", () => {
    window.open(BETA_FORM_URL, "_blank");
  });
}

console.log("✅ Module uiScan.js chargé - Version finale complète");
