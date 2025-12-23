// ========================================================================
// uiScan.js — Lecture + exploitation de fiche IA RCH
// Version corrigée : cleanup scanner + validation améliorée + chargement URL
// ========================================================================

// 🔍 LOG DE DÉBOGAGE IMMÉDIAT
console.log("🚀 DÉBUT DU CHARGEMENT DE uiScan.js");

import { decodeFiche } from "../core/compression.js";
import { getFicheFromUrl } from "../core/urlEncoder.js";

console.log("✅ Imports réussis (decodeFiche, getFicheFromUrl)");

// ---------- Sections ----------
const sectionScan   = document.getElementById("sectionScan");
const sectionMeta   = document.getElementById("sectionMeta");
const sectionVars   = document.getElementById("sectionVars");
const sectionExtra  = document.getElementById("sectionExtra");
const sectionPrompt = document.getElementById("sectionPrompt");

// ---------- Éléments principaux ----------
const metaHeader    = document.getElementById("metaHeader");
const scanVariables = document.getElementById("scanVariables");
const extraInput    = document.getElementById("extra_input");
const promptResult  = document.getElementById("promptResult");
const aiButtons     = document.getElementById("aiButtons");

// Caméra / fichier
const btnStartCam   = document.getElementById("btnStartCam");
const btnStopCam    = document.getElementById("btnStopCam");
const videoContainer= document.getElementById("videoContainer");
const videoEl       = document.getElementById("qrVideo");
const fileInput     = document.getElementById("qrFileInput");

// Stockage de la fiche courante + scanner
window.currentFiche = null;
let scanner = null;

// ------------------------------------------------------------------------
// ✅ CORRECTION : Cleanup systématique du scanner
// ------------------------------------------------------------------------
async function cleanupScanner() {
  if (!scanner) return;

  console.log("🧹 Nettoyage scanner...");
  
  try {
    await scanner.stop();
  } catch (e) {
    console.warn("⚠️ Erreur arrêt scanner :", e);
  }

  try {
    scanner.destroy();
  } catch (e) {
    console.warn("⚠️ Erreur destruction scanner :", e);
  } finally {
    scanner = null;
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

  // 1.1) ✅ NOUVEAU : Afficher les boutons d'action (reset + beta test)
  const actionButtons = document.getElementById("actionButtons");
  if (actionButtons) actionButtons.style.display = "flex";

  // 2) Remplir les métadonnées
  if (metaHeader) {
    metaHeader.style.display = "block"; // ✅ CORRECTION : Afficher le bloc
    metaHeader.innerHTML = `
      <h3>${fiche.meta?.titre || "Titre inconnu"}</h3>
      <div class="meta-line"><b>Catégorie :</b> ${fiche.meta?.categorie || "-"}</div>
      <div class="meta-line"><b>Titre :</b> ${fiche.meta?.titre || "-"}</div>
      <div class="meta-line"><b>Objectif :</b> ${fiche.meta?.objectif || "-"}</div>
      <div class="meta-line"><b>Concepteur :</b> ${fiche.meta?.concepteur || "-"}</div>
      <div class="meta-line"><b>Version :</b> ${fiche.meta?.version || "1.0"}</div>
      <div class="meta-line"><b>Mis à jour le :</b> ${fiche.meta?.date || "-"}</div>
    `;
  }

  // 3) Générer les champs de variables
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
  if (promptResult) promptResult.textContent = "";
  if (aiButtons) aiButtons.innerHTML = "";
}

// ------------------------------------------------------------------------
// Lecture via FICHIER
// ------------------------------------------------------------------------
if (fileInput) {
  fileInput.addEventListener("change", async (ev) => {
    const file = ev.target.files[0];
    if (!file) return;

    console.log("📁 Lecture fichier QR...");

    try {
      const result = await window.QrScanner.scanImage(file);
      const text = (typeof result === "string") ? result : result.data;
      
      console.log("📄 Texte brut QR :", text);
      
      const fiche = decodeFiche(text);
      onFicheDecoded(fiche);
      
    } catch (err) {
      console.error("❌ Erreur lecture fichier :", err);
      alert("❌ Erreur lecture QR : " + err.message);
    }
  });
}

// ------------------------------------------------------------------------
// Lecture via CAMÉRA
// ------------------------------------------------------------------------
if (btnStartCam && btnStopCam && videoEl) {
  
  btnStartCam.onclick = async () => {
    console.log("🎥 Démarrage caméra...");

    // ✅ CORRECTION : Cleanup avant de créer nouveau scanner
    await cleanupScanner();

    videoContainer.style.display = "block";
    btnStartCam.disabled = true;
    btnStopCam.disabled = false;

    try {
      scanner = new window.QrScanner(
        videoEl, 
        result => {
          const text = result.data || result;
          console.log("📷 QR scanné :", text);
          
          try {
            const fiche = decodeFiche(text);
            
            // On stoppe dès qu'un QR valide est lu
            cleanupScanner().then(() => {
              videoContainer.style.display = "none";
              btnStartCam.disabled = false;
              btnStopCam.disabled = true;
              onFicheDecoded(fiche);
            });
            
          } catch (e) {
            console.warn("⚠️ QR non compatible :", e.message);
            // On continue le scan
          }
        },
        {
          returnDetailedScanResult: true,
          highlightScanRegion: true,
          highlightCodeOutline: true
        }
      );

      await scanner.start({ facingMode: "environment" });
      console.log("✅ Caméra démarrée");
      
    } catch (err) {
      console.error("❌ Erreur caméra :", err);
      alert("❌ Impossible d'accéder à la caméra : " + err.message);
      await cleanupScanner();
      videoContainer.style.display = "none";
      btnStartCam.disabled = false;
      btnStopCam.disabled = true;
    }
  };

  btnStopCam.onclick = async () => {
    console.log("🛑 Arrêt caméra manuel");
    await cleanupScanner();
    videoContainer.style.display = "none";
    btnStartCam.disabled = false;
    btnStopCam.disabled = true;
  };
}

// ------------------------------------------------------------------------
// Compiler le PROMPT final
// ------------------------------------------------------------------------
const btnBuildPrompt = document.getElementById("btnBuildPrompt");
const btnCopyPrompt  = document.getElementById("btnCopy");

if (btnBuildPrompt) {
  btnBuildPrompt.onclick = () => {
    const fiche = window.currentFiche;
    if (!fiche) {
      alert("❌ Aucune fiche chargée.");
      return;
    }

    // Vérification champs requis
    let missingFields = [];
    (fiche.prompt?.variables || []).forEach(v => {
      if (!v.required) return;
      
      if (v.type === "geoloc") {
        const lat = document.getElementById(`${v.id}_lat`);
        const lon = document.getElementById(`${v.id}_lon`);
        if (!lat?.value || !lon?.value) {
          missingFields.push(v.label || v.id);
        }
      } else {
        const el = document.querySelector(`[data-id="${v.id}"]`);
        if (!el?.value) {
          missingFields.push(v.label || v.id);
        }
      }
    });

    if (missingFields.length > 0) {
      alert("⚠️ Champs requis manquants :\n- " + missingFields.join("\n- "));
      return;
    }

    // Génération prompt
    let prompt = fiche.prompt?.base || "";

    (fiche.prompt?.variables || []).forEach(v => {
      let replacement = "";

      if (v.type === "geoloc") {
        const lat = document.getElementById(`${v.id}_lat`)?.value || "";
        const lon = document.getElementById(`${v.id}_lon`)?.value || "";
        replacement = `${lat},${lon}`;
      } else {
        const el = document.querySelector(`[data-id="${v.id}"]`);
        replacement = el?.value || "";
      }

      prompt = prompt.replaceAll(`{{${v.id}}}`, replacement);
    });

    const extra = extraInput?.value.trim() || "";
    if (extra) {
      prompt += `\n\nInformations complémentaires :\n${extra}`;
    }

    if (promptResult) promptResult.textContent = prompt;
    buildAIButtons(fiche, prompt);
  };
}

// Copier le prompt
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

// ------------------------------------------------------------------------
// Boutons d'envoi vers les IA
// ------------------------------------------------------------------------
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
      case 3: return "background:#1dbf65;color:white;";
      case 2: return "background:#ff9f1c;color:white;";
      default: return "background:#cccccc;color:#777;";
    }
  };

  const mkBtn = (label, lvl, baseUrl) => {
    const btn = document.createElement("button");
    btn.textContent = label;
    btn.style = styleForLevel(lvl)
      + "padding:10px 16px;margin-right:10px;border:none;border-radius:10px;font-weight:600;cursor:pointer;";

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

  mkBtn("ChatGPT",   levels.chatgpt,   "https://chat.openai.com/?q=");
  mkBtn("Perplexity",levels.perplexity,"https://www.perplexity.ai/search?q=");
  mkBtn("Mistral",   levels.mistral,   "https://chat.mistral.ai/chat?q=");
}

// ------------------------------------------------------------------------
// Cleanup au déchargement de la page
// ------------------------------------------------------------------------
window.addEventListener("beforeunload", () => {
  cleanupScanner();
});

// ========================================================================
// ✅ NOUVELLE FONCTIONNALITÉ : CHARGEMENT AUTOMATIQUE DEPUIS URL
// ========================================================================

/**
 * Vérifie si un paramètre 'fiche' est présent dans l'URL
 * Si oui, charge automatiquement la fiche sans scan
 */
function checkAndLoadFromUrl() {
  console.log("🔍 Vérification paramètre URL...");
  
  // Extraire le paramètre fiche de l'URL
  const ficheData = getFicheFromUrl();
  
  if (!ficheData) {
    console.log("ℹ️ Aucun paramètre 'fiche' dans l'URL - mode scan normal");
    return;
  }
  
  console.log("🌐 Paramètre 'fiche' détecté - chargement automatique...");
  console.log("  - Longueur des données:", ficheData.length, "caractères");
  
  try {
    // Décoder la fiche depuis l'URL
    const fiche = decodeFiche(ficheData);
    
    console.log("✅ Fiche chargée depuis l'URL avec succès");
    console.log("  - Catégorie:", fiche.meta?.categorie);
    console.log("  - Titre:", fiche.meta?.titre);
    
    // Afficher un message à l'utilisateur
    showUrlLoadMessage(fiche.meta?.titre || "Fiche chargée");
    
    // Charger la fiche dans l'interface
    onFicheDecoded(fiche);
    
  } catch (err) {
    console.error("❌ Erreur lors du chargement depuis l'URL :", err);
    
    // Afficher une erreur claire à l'utilisateur
    alert(
      "❌ Impossible de charger la fiche depuis l'URL\n\n" +
      "Détails : " + err.message + "\n\n" +
      "Le lien est peut-être invalide ou corrompu.\n" +
      "Vous pouvez scanner un QR Code manuellement."
    );
  }
}

/**
 * Affiche un message indiquant que la fiche a été chargée depuis un lien
 */
function showUrlLoadMessage(titre) {
  // Créer un message informatif en haut de la page
  const messageBox = document.createElement("div");
  messageBox.style.cssText = `
    background: #e7f3ff;
    border-left: 4px solid #001F8F;
    padding: 12px 15px;
    margin: 0 0 20px 0;
    border-radius: 8px;
    animation: slideDown 0.3s ease;
  `;
  messageBox.innerHTML = `
    <strong style="color:#001F8F;">🔗 Fiche chargée depuis un lien</strong>
    <p style="margin:5px 0 0 0;font-size:14px;">
      "${titre}" a été chargée automatiquement. 
      Complétez les variables ci-dessous puis compilez le prompt.
    </p>
  `;
  
  // Insérer le message avant la première section
  const main = document.querySelector("main");
  if (main && main.firstChild) {
    main.insertBefore(messageBox, main.firstChild);
  }
  
  console.log("📢 Message d'information affiché");
}

// ========================================================================
// 🚀 INITIALISATION AU CHARGEMENT DE LA PAGE
// ========================================================================

console.log("🔧 Module uiScan.js chargé - Support chargement URL activé");

// Attendre que le DOM et tous les modules soient complètement chargés
window.addEventListener('load', () => {
  console.log("📄 Page complètement chargée - vérification URL...");
  checkAndLoadFromUrl();
});

// ========================================================================
// ✅ NOUVELLE FONCTIONNALITÉ : BOUTON DE RÉINITIALISATION
// ========================================================================

/**
 * Fonction de réinitialisation complète de la page scan
 * Affiche une popup de confirmation avant de réinitialiser
 */
function resetScanPage() {
  console.log("🔄 Demande de réinitialisation de la page scan");
  
  // Afficher la popup de confirmation
  const modal = document.getElementById("confirmResetModal");
  if (modal) {
    modal.style.display = "flex";
  }
}

/**
 * Exécute la réinitialisation après confirmation
 */
function executeReset() {
  console.log("♻️ Exécution de la réinitialisation...");
  
  // 1. Masquer la popup
  const modal = document.getElementById("confirmResetModal");
  if (modal) modal.style.display = "none";
  
  // 2. Arrêter la caméra si active
  cleanupScanner();
  
  // 3. Réafficher la section scan
  if (sectionScan) sectionScan.style.display = "block";
  
  // 4. Masquer toutes les autres sections
  if (sectionMeta)   sectionMeta.style.display   = "none";
  if (sectionVars)   sectionVars.style.display   = "none";
  if (sectionExtra)  sectionExtra.style.display  = "none";
  if (sectionPrompt) sectionPrompt.style.display = "none";
  
  // 5. Masquer les boutons d'action (reset + beta test)
  const actionButtons = document.getElementById("actionButtons");
  if (actionButtons) actionButtons.style.display = "none";
  
  // 6. Réinitialiser les champs
  if (scanVariables) scanVariables.innerHTML = "";
  if (extraInput) extraInput.value = "";
  if (promptResult) promptResult.textContent = "";
  if (aiButtons) aiButtons.innerHTML = "";
  if (metaHeader) metaHeader.innerHTML = "";
  
  // 7. Réinitialiser l'input fichier
  const fileInput = document.getElementById("qrFileInput");
  if (fileInput) fileInput.value = "";
  
  // 8. Supprimer le message "Fiche chargée depuis un lien" si présent
  const urlLoadMessage = document.querySelector('div[style*="e7f3ff"]');
  if (urlLoadMessage && urlLoadMessage.textContent.includes("Fiche chargée depuis un lien")) {
    urlLoadMessage.remove();
  }
  
  // 9. Nettoyer l'URL de la barre d'adresse (enlever le paramètre ?fiche=)
  if (window.location.search.includes('fiche=')) {
    const newUrl = window.location.origin + window.location.pathname;
    window.history.replaceState({}, document.title, newUrl);
    console.log("🔗 URL nettoyée : paramètre 'fiche' supprimé");
  }
  
  // 10. Réinitialiser la variable globale
  window.currentFiche = null;
  
  console.log("✅ Réinitialisation terminée - Page prête pour un nouveau scan");
}

/**
 * Annule la réinitialisation (ferme la popup)
 */
function cancelReset() {
  console.log("❌ Réinitialisation annulée");
  const modal = document.getElementById("confirmResetModal");
  if (modal) modal.style.display = "none";
}

// ========================================================================
// GESTION DES ÉVÉNEMENTS DU BOUTON RESET ET DE LA POPUP
// ========================================================================

// Bouton "Scanner une nouvelle fiche"
const btnResetScan = document.getElementById("btnResetScan");
if (btnResetScan) {
  btnResetScan.addEventListener("click", resetScanPage);
  console.log("✅ Bouton reset initialisé");
}

// Bouton "OK" dans la popup
const btnConfirmReset = document.getElementById("btnConfirmReset");
if (btnConfirmReset) {
  btnConfirmReset.addEventListener("click", executeReset);
}

// Bouton "Annuler" dans la popup
const btnCancelReset = document.getElementById("btnCancelReset");
if (btnCancelReset) {
  btnCancelReset.addEventListener("click", cancelReset);
}

// Fermer la popup si on clique sur le fond
const confirmResetModal = document.getElementById("confirmResetModal");
if (confirmResetModal) {
  confirmResetModal.addEventListener("click", (e) => {
    // Si on clique sur l'overlay (pas sur le contenu), fermer
    if (e.target === confirmResetModal) {
      cancelReset();
    }
  });
}

console.log("🔄 Fonctionnalité de réinitialisation activée");

// ========================================================================
// ✅ BOUTON BETA TEST - Ouverture du formulaire Google Forms
// ========================================================================

const btnBetaTest = document.getElementById("btnBetaTest");
if (btnBetaTest) {
  btnBetaTest.addEventListener("click", () => {
    console.log("🧪 Ouverture du formulaire Beta Test");
    const betaFormUrl = "https://forms.office.com/Pages/ResponsePage.aspx?id=8fedXl6ZuESKAGhF_Bb8M5J2aSnQSghAnRmJ9DwIhUxUOFA1Q0lOT0FCSUU4TDU3WklSTTVGRzlMMy4u";
    window.open(betaFormUrl, "_blank");
  });
  console.log("✅ Bouton Beta Test initialisé");
}
