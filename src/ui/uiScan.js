// ========================================================================
// uiScan.js — Lecture + exploitation de fiche IA RCH
// Version corrigée : Bouton compiler attaché après chargement fiche
// ========================================================================

// 🔍 LOG DE DÉBOGAGE IMMÉDIAT
console.log("🚀 DÉBUT DU CHARGEMENT DE uiScan.js - Version URL uniquement");

import { decodeFiche } from "../core/compression.js";
import { getFicheFromUrl } from "../core/urlEncoder.js";
import { startCameraScan, stopCameraScan } from "../core/qrReaderCamera.js";

console.log("✅ Imports réussis (decodeFiche, getFicheFromUrl, caméra)");

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

  // Vérifier que c'est bien une URL
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
    
    // Décoder Base64 URL-safe et restaurer padding
    let normalizedData = ficheParam
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    
    // Restaurer le padding Base64 manquant
    const paddingNeeded = (4 - (normalizedData.length % 4)) % 4;
    normalizedData += '='.repeat(paddingNeeded);
    
    console.log("🔄 Décodage Base64...");
    
    // Décoder la fiche
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

  // 1) Masquer la zone scan, afficher les autres
  if (sectionScan)   sectionScan.style.display   = "none";
  if (sectionMeta)   sectionMeta.style.display   = "block";
  if (sectionVars)   sectionVars.style.display   = "block";
  if (sectionExtra)  sectionExtra.style.display  = "block";
  if (sectionPrompt) sectionPrompt.style.display = "block";

  // 1.1) Afficher les boutons d'action (reset + beta test)
  const actionButtons = document.getElementById("actionButtons");
  if (actionButtons) actionButtons.style.display = "flex";

  // 2) Remplir les métadonnées
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

  // 3) Générer les champs de variables
  const scanVariables = document.getElementById("scanVariables");
  if (scanVariables) {
    scanVariables.innerHTML = "";
    
    (fiche.prompt?.variables || []).forEach(v => {
      const block = document.createElement("div");
      block.className = "var-field";

      const lab = document.createElement("label");
      lab.textContent = v.label || v.id;
      
      // Indicateur requis
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
        
        // Branchement GPS après insertion dans le DOM
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

  // Nettoyage de l'affichage prompt / boutons
  const promptResult = document.getElementById("promptResult");
  const aiButtons = document.getElementById("aiButtons");
  
  if (promptResult) promptResult.textContent = "";
  if (aiButtons) aiButtons.innerHTML = "";

  // ========================================================================
  // ✅ CORRECTION : Attacher le bouton compiler APRÈS création des éléments
  // ========================================================================
  initializeCompileButton(fiche);
}

// ------------------------------------------------------------------------
// ✅ NOUVELLE FONCTION : Initialisation bouton compiler
// ------------------------------------------------------------------------
function initializeCompileButton(fiche) {
  console.log("🔧 Initialisation bouton compiler...");
  
  const btnCompile = document.getElementById("btnBuildPrompt");
  const scanVariables = document.getElementById("scanVariables");
  const promptResult = document.getElementById("promptResult");
  const extraInput = document.getElementById("extra_input");
  const aiButtons = document.getElementById("aiButtons");
  
  console.log("  - Bouton:", btnCompile);
  console.log("  - scanVariables:", scanVariables);
  console.log("  - promptResult:", promptResult);
  
  if (!btnCompile) {
    console.error("❌ Bouton btnBuildPrompt introuvable");
    return;
  }
  
  if (!scanVariables || !promptResult) {
    console.error("❌ Éléments manquants pour compilation");
    return;
  }
  
  // Attacher l'événement
  btnCompile.onclick = () => {
    console.log("🎯 COMPILATION DÉCLENCHÉE !");
    
    if (!window.currentFiche) {
      alert("⚠️ Aucune fiche chargée");
      return;
    }

    console.log("🔄 Compilation du prompt...");

    const ficheData = window.currentFiche;
    let prompt = ficheData.prompt.base;
    const extra = extraInput?.value.trim() || "";

    // Remplacer les variables
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

      // Vérification requis
      if (v.required && !value) {
        alert(`⚠️ Le champ "${v.label || v.id}" est requis`);
        throw new Error("Champ requis manquant");
      }

      const placeholder = `{{${v.id}}}`;
      prompt = prompt.replace(new RegExp(placeholder, "g"), value);
    });

    // Ajouter infos supplémentaires
    if (extra) {
      prompt += `\n\nInformations complémentaires :\n${extra}`;
    }

    // Afficher
    promptResult.textContent = prompt;

    // Générer boutons IA
    generateAIButtons(ficheData, aiButtons);

    console.log("✅ Prompt compilé avec succès");
  };
  
  console.log("✅ Bouton compiler initialisé avec succès");
}

// ------------------------------------------------------------------------
// Génération boutons IA avec codes couleur selon indices
// ------------------------------------------------------------------------
function generateAIButtons(fiche, aiButtonsContainer) {
  if (!aiButtonsContainer) return;

  aiButtonsContainer.innerHTML = "";

  // Récupérer le prompt compilé
  const promptResult = document.getElementById("promptResult");
  const promptText = promptResult?.textContent || "";
  
  // Encoder le prompt pour l'URL
  const encodedPrompt = encodeURIComponent(promptText);

  const aiPlatforms = [
    { 
      name: "ChatGPT", 
      baseUrl: "https://chat.openai.com/",
      urlParam: "?q=",
      index: fiche.ai?.chatgpt !== undefined ? fiche.ai.chatgpt : 3 
    },
    { 
      name: "Perplexity", 
      baseUrl: "https://www.perplexity.ai/",
      urlParam: "search?q=",
      index: fiche.ai?.perplexity !== undefined ? fiche.ai.perplexity : 3 
    },
    { 
      name: "Mistral AI", 
      baseUrl: "https://chat.mistral.ai/",
      urlParam: "chat?q=",
      index: fiche.ai?.mistral !== undefined ? fiche.ai.mistral : 3 
    }
  ];

  aiPlatforms.forEach(platform => {
    // Construire l'URL complète avec le prompt
    const fullUrl = platform.baseUrl + platform.urlParam + encodedPrompt;
    
    // Déterminer couleur et état selon l'indice
    let bgColor, textColor, disabled, label, cursorStyle;
    
    // Convertir en string pour gérer à la fois "NC" et les nombres
    const indexStr = String(platform.index);
    
    switch(indexStr) {
      case "3":
        bgColor = "#1dbf65";  // Vert - Recommandée
        textColor = "#fff";
        disabled = false;
        label = "3 - Recommandée";
        cursorStyle = "pointer";
        break;
        
      case "2":
        bgColor = "#ff9f1c";  // Orange - Acceptable
        textColor = "#fff";
        disabled = false;
        label = "2 - Acceptable";
        cursorStyle = "pointer";
        break;
        
      case "1":
        bgColor = "#999";     // Gris - Non recommandée
        textColor = "#ccc";
        disabled = true;
        label = "1 - Non recommandée";
        cursorStyle = "not-allowed";
        break;
        
      case "NC":
        bgColor = "#001F8F";  // Bleu ENSOSP - Non classé
        textColor = "#fff";
        disabled = false;
        label = "NC - Non classé";
        cursorStyle = "pointer";
        break;
        
      default:
        // Fallback si valeur inattendue
        bgColor = "#666";
        textColor = "#fff";
        disabled = false;
        label = `Indice: ${platform.index}`;
        cursorStyle = "pointer";
    }
    
    // Créer le bouton
    if (disabled) {
      // Bouton désactivé (indice 1)
      const btn = document.createElement("div");
      btn.className = "btn";
      btn.style.background = bgColor;
      btn.style.color = textColor;
      btn.style.cursor = cursorStyle;
      btn.style.opacity = "0.6";
      btn.style.display = "inline-block";
      btn.style.padding = "12px 20px";
      btn.style.borderRadius = "8px";
      btn.style.marginRight = "10px";
      btn.style.marginBottom = "10px";
      btn.style.fontWeight = "600";
      btn.innerHTML = `
        🤖 ${platform.name} 
        <span style="background:rgba(255,255,255,0.3);padding:2px 8px;border-radius:12px;margin-left:8px;font-size:12px;">
          ${label}
        </span>
      `;
      
      // Tooltip au survol
      btn.title = `Cette IA n'est pas recommandée pour cette fiche (indice: 1)`;
      
      aiButtonsContainer.appendChild(btn);
      
    } else {
      // Bouton actif (indices 2, 3, NC)
      const btn = document.createElement("a");
      btn.href = fullUrl;  // ✅ URL avec le prompt
      btn.target = "_blank";
      btn.className = "btn";
      btn.style.background = bgColor;
      btn.style.color = textColor;
      btn.style.cursor = cursorStyle;
      btn.style.textDecoration = "none";
      btn.style.display = "inline-block";
      btn.style.padding = "12px 20px";
      btn.style.borderRadius = "8px";
      btn.style.marginRight = "10px";
      btn.style.marginBottom = "10px";
      btn.style.fontWeight = "600";
      btn.innerHTML = `
        🤖 Ouvrir ${platform.name} 
        <span style="background:rgba(255,255,255,0.3);padding:2px 8px;border-radius:12px;margin-left:8px;font-size:12px;">
          ${label}
        </span>
      `;
      
      aiButtonsContainer.appendChild(btn);
    }
  });
  
  console.log("✅ Boutons IA générés avec codes couleur et prompt transmis");
}

// ------------------------------------------------------------------------
// Lecture via CAMÉRA - Utilise le module qrReaderCamera.js
// ------------------------------------------------------------------------
if (btnStartCam && btnStopCam && videoEl) {
  
  btnStartCam.onclick = async () => {
    console.log("🎥 Démarrage caméra via qrReaderCamera.js...");

    videoContainer.style.display = "block";
    btnStartCam.disabled = true;
    btnStopCam.disabled = false;

    try {
      // ✅ Utiliser le module robuste qrReaderCamera
      await startCameraScan(videoEl, (qrText) => {
        console.log("📷 QR détecté par caméra");
        console.log("  - Texte extrait:", qrText.substring(0, 100) + "...");
        
        try {
          // ✅ Extraire la fiche depuis l'URL
          const fiche = extractFicheFromQR(qrText);
          
          // Arrêter la caméra après scan réussi
          stopCameraScan().then(() => {
            videoContainer.style.display = "none";
            btnStartCam.disabled = false;
            btnStopCam.disabled = true;
            onFicheDecoded(fiche);
          });
          
        } catch (e) {
          console.error("❌ Erreur décodage QR:", e);
          alert("⚠️ " + e.message + "\n\nContinuez à scanner...");
          // Ne pas arrêter la caméra, continuer le scan
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

// Initialisation
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
  
  // Arrêter la caméra si active
  stopCameraScan();
  
  if (sectionScan) sectionScan.style.display = "block";
  if (sectionMeta) sectionMeta.style.display = "none";
  if (sectionVars) sectionVars.style.display = "none";
  if (sectionExtra) sectionExtra.style.display = "none";
  if (sectionPrompt) sectionPrompt.style.display = "none";
  
  const actionButtons = document.getElementById("actionButtons");
  if (actionButtons) actionButtons.style.display = "none";
  
  const scanVariables = document.getElementById("scanVariables");
  const extraInput = document.getElementById("extra_input");
  const promptResult = document.getElementById("promptResult");
  const aiButtons = document.getElementById("aiButtons");
  
  if (scanVariables) scanVariables.innerHTML = "";
  if (extraInput) extraInput.value = "";
  if (promptResult) promptResult.textContent = "";
  if (aiButtons) aiButtons.innerHTML = "";
  if (metaHeader) metaHeader.innerHTML = "";
  
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

// Bouton Beta Test
const btnBetaTest = document.getElementById("btnBetaTest");
if (btnBetaTest) {
  btnBetaTest.addEventListener("click", () => {
    const url = "https://forms.office.com/Pages/ResponsePage.aspx?id=8fedXl6ZuESKAGhF_Bb8M5J2aSnQSghAnRmJ9DwIhUxUOFA1Q0lOT0FCSUU4TDU3WklSTTVGRzlMMy4u";
    window.open(url, "_blank");
  });
}

console.log("✅ Module uiScan.js chargé - Version URL uniquement");
