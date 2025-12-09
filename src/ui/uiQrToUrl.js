// ======================================================================
// uiQrToUrl.js — Gestion de l'interface de conversion QR Code → URL
// ======================================================================

import { decodeFiche } from "../core/compression.js";
import { generateFicheUrl } from "../core/urlEncoder.js";

// -----------------------------------------------------------------------
// RÉFÉRENCES DOM
// -----------------------------------------------------------------------
const fileInput = document.getElementById("qrFileInput");
const previewContainer = document.getElementById("previewContainer");
const qrPreview = document.getElementById("qrPreview");
const resultSection = document.getElementById("resultSection");
const infoSection = document.getElementById("infoSection");
const generatedUrl = document.getElementById("generatedUrl");
const btnCopyUrl = document.getElementById("btnCopyUrl");
const btnTestUrl = document.getElementById("btnTestUrl");
const ficheInfo = document.getElementById("ficheInfo");

// Variable globale pour stocker la fiche actuelle
let currentFiche = null;

// -----------------------------------------------------------------------
// EVENT : UPLOAD DE FICHIER
// -----------------------------------------------------------------------
if (fileInput) {
  fileInput.addEventListener("change", async (event) => {
    const file = event.target.files[0];
    
    // Si aucun fichier sélectionné, on ne fait rien
    if (!file) {
      console.log("ℹ️ Aucun fichier sélectionné");
      return;
    }

    console.log("📁 Fichier sélectionné :", file.name);
    console.log("  - Type:", file.type);
    console.log("  - Taille:", (file.size / 1024).toFixed(2), "KB");

    // Réinitialiser l'interface
    resetInterface();

    // ---------------------------------------------------------------
    // 1. AFFICHER L'APERÇU DE L'IMAGE
    // ---------------------------------------------------------------
    const reader = new FileReader();
    reader.onload = (e) => {
      qrPreview.src = e.target.result;
      previewContainer.style.display = "block";
      console.log("✅ Aperçu de l'image affiché");
    };
    reader.readAsDataURL(file);

    // ---------------------------------------------------------------
    // 2. SCANNER LE QR CODE
    // ---------------------------------------------------------------
    try {
      console.log("🔍 Démarrage du scan du QR Code...");
      
      // Vérifier que QrScanner est disponible
      if (!window.QrScanner) {
        throw new Error("Librairie QrScanner non chargée. Rechargez la page.");
      }

      // Scanner l'image
      const result = await window.QrScanner.scanImage(file, {
        returnDetailedScanResult: true
      });

      console.log("📊 Résultat du scan:", result);

      // ---------------------------------------------------------------
      // 3. EXTRAIRE LE TEXTE DU QR CODE
      // ---------------------------------------------------------------
      let qrText = "";
      
      if (typeof result === "string") {
        qrText = result;
      } else if (result && result.data) {
        qrText = (typeof result.data === "string") ? result.data : JSON.stringify(result.data);
      }

      console.log("📄 Texte extrait du QR Code");
      console.log("  - Longueur:", qrText.length, "caractères");

      // Vérifier que le QR n'est pas vide
      if (!qrText || qrText.length === 0) {
        throw new Error("QR Code vide ou illisible");
      }

      // ---------------------------------------------------------------
      // 4. DÉCODER LA FICHE
      // ---------------------------------------------------------------
      console.log("🔓 Décodage de la fiche...");
      
      const fiche = decodeFiche(qrText);
      
      console.log("✅ Fiche décodée avec succès :");
      console.log("  - Catégorie:", fiche.meta?.categorie);
      console.log("  - Titre:", fiche.meta?.titre);
      console.log("  - Variables:", fiche.prompt?.variables?.length || 0);

      // Stocker la fiche
      currentFiche = fiche;

      // ---------------------------------------------------------------
      // 5. GÉNÉRER L'URL
      // ---------------------------------------------------------------
      generateAndDisplayUrl(fiche);

      // ---------------------------------------------------------------
      // 6. AFFICHER LES INFORMATIONS
      // ---------------------------------------------------------------
      displayFicheInfo(fiche);

    } catch (err) {
      console.error("❌ Erreur lors du traitement du QR Code :", err);
      
      // Afficher une alerte avec des détails
      showError(err);
      
      // Réinitialiser l'interface
      resultSection.style.display = "none";
      infoSection.style.display = "none";
    }
  });
}

// -----------------------------------------------------------------------
// FONCTION : GÉNÉRER ET AFFICHER L'URL
// -----------------------------------------------------------------------
function generateAndDisplayUrl(fiche) {
  try {
    console.log("🔗 Génération de l'URL...");
    
    // Générer l'URL
    const url = generateFicheUrl(fiche);
    
    // Afficher l'URL dans le champ
    generatedUrl.value = url;
    
    // Afficher la section résultat
    resultSection.style.display = "block";

    console.log("✅ URL générée et affichée");
    console.log("  - Longueur:", url.length, "caractères");

    // Avertissement si URL très longue
    if (url.length > 2000) {
      addUrlLengthWarning(url.length);
    }

  } catch (e) {
    console.error("❌ Erreur lors de la génération de l'URL :", e);
    alert("❌ Impossible de générer l'URL : " + e.message);
  }
}

// -----------------------------------------------------------------------
// FONCTION : AFFICHER LES INFORMATIONS DE LA FICHE
// -----------------------------------------------------------------------
function displayFicheInfo(fiche) {
  const meta = fiche.meta || {};
  const ai = fiche.ai || {};
  const promptVars = fiche.prompt?.variables || [];
  
  // Construire le HTML des informations
  ficheInfo.innerHTML = `
    <div style="display:grid;grid-template-columns:auto 1fr;gap:10px 15px;">
      <strong style="color:#001F8F;">Catégorie :</strong>
      <span>${escapeHtml(meta.categorie || "-")}</span>
      
      <strong style="color:#001F8F;">Titre :</strong>
      <span>${escapeHtml(meta.titre || "-")}</span>
      
      <strong style="color:#001F8F;">Objectif :</strong>
      <span>${escapeHtml(meta.objectif || "-")}</span>
      
      <strong style="color:#001F8F;">Concepteur :</strong>
      <span>${escapeHtml(meta.concepteur || "-")}</span>
      
      <strong style="color:#001F8F;">Version :</strong>
      <span>${escapeHtml(meta.version || "-")}</span>
      
      <strong style="color:#001F8F;">Date :</strong>
      <span>${escapeHtml(meta.date || "-")}</span>
      
      <strong style="color:#001F8F;">Variables :</strong>
      <span>${promptVars.length} variable(s)</span>
      
      <strong style="color:#001F8F;">IA recommandées :</strong>
      <span>
        ChatGPT: ${ai.chatgpt || 3}/3 | 
        Perplexity: ${ai.perplexity || 3}/3 | 
        Mistral: ${ai.mistral || 3}/3
      </span>
    </div>
  `;

  // Afficher la section info
  infoSection.style.display = "block";
  
  console.log("✅ Informations de la fiche affichées");
}

// -----------------------------------------------------------------------
// FONCTION : AJOUTER UN AVERTISSEMENT POUR URL LONGUE
// -----------------------------------------------------------------------
function addUrlLengthWarning(length) {
  // Vérifier si l'avertissement existe déjà
  if (document.getElementById("urlWarning")) return;
  
  const warning = document.createElement("div");
  warning.id = "urlWarning";
  warning.style.cssText = `
    background:#fff3cd;
    padding:10px;
    border-radius:6px;
    margin-top:10px;
    font-size:13px;
    color:#856404;
    border:1px solid #ffeeba;
  `;
  warning.innerHTML = `
    <strong>⚠️ Attention :</strong> Cette URL est très longue (${length} caractères). 
    Certains navigateurs ou applications pourraient avoir des difficultés à l'ouvrir.
  `;
  
  resultSection.querySelector("div").appendChild(warning);
}

// -----------------------------------------------------------------------
// FONCTION : AFFICHER UNE ERREUR UTILISATEUR
// -----------------------------------------------------------------------
function showError(err) {
  let errorMessage = "❌ Erreur lors de la lecture du QR Code\n\n";
  errorMessage += "Détails : " + err.message + "\n\n";
  errorMessage += "Vérifiez que :\n";
  errorMessage += "• L'image est bien un QR Code\n";
  errorMessage += "• Le QR a été généré par cette application\n";
  errorMessage += "• L'image n'est pas floue ou endommagée\n";
  
  alert(errorMessage);
}

// -----------------------------------------------------------------------
// FONCTION : RÉINITIALISER L'INTERFACE
// -----------------------------------------------------------------------
function resetInterface() {
  resultSection.style.display = "none";
  infoSection.style.display = "none";
  
  // Supprimer l'avertissement d'URL longue s'il existe
  const warning = document.getElementById("urlWarning");
  if (warning) warning.remove();
  
  currentFiche = null;
}

// -----------------------------------------------------------------------
// FONCTION : ÉCHAPPER LE HTML (sécurité XSS)
// -----------------------------------------------------------------------
function escapeHtml(text) {
  if (!text) return "-";
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// -----------------------------------------------------------------------
// EVENT : COPIER L'URL
// -----------------------------------------------------------------------
if (btnCopyUrl) {
  btnCopyUrl.addEventListener("click", async () => {
    const url = generatedUrl.value;
    
    if (!url) {
      alert("⚠️ Aucune URL à copier");
      return;
    }

    try {
      // Tenter de copier dans le presse-papier
      await navigator.clipboard.writeText(url);
      
      console.log("✅ URL copiée dans le presse-papier");
      
      // Feedback visuel animé
      const originalText = btnCopyUrl.textContent;
      const originalBg = btnCopyUrl.style.background;
      
      btnCopyUrl.textContent = "✅ Lien copié !";
      btnCopyUrl.style.background = "#1dbf65";
      btnCopyUrl.style.transition = "all 0.3s ease";
      
      setTimeout(() => {
        btnCopyUrl.textContent = originalText;
        btnCopyUrl.style.background = originalBg;
      }, 2000);

    } catch (e) {
      console.error("❌ Erreur lors de la copie :", e);
      
      // Fallback : sélectionner le texte manuellement
      generatedUrl.select();
      generatedUrl.setSelectionRange(0, 99999); // Pour mobile
      
      try {
        document.execCommand('copy');
        alert("✅ URL copiée ! (méthode alternative)");
      } catch (err) {
        alert("❌ Impossible de copier automatiquement. Veuillez copier manuellement.");
      }
    }
  });
}

// -----------------------------------------------------------------------
// EVENT : TESTER L'URL
// -----------------------------------------------------------------------
if (btnTestUrl) {
  btnTestUrl.addEventListener("click", () => {
    const url = generatedUrl.value;
    
    if (!url) {
      alert("⚠️ Aucune URL à tester");
      return;
    }

    console.log("🔬 Ouverture de l'URL pour test :", url);
    
    // Ouvrir l'URL dans un nouvel onglet
    const newWindow = window.open(url, "_blank");
    
    if (!newWindow) {
      alert("⚠️ Le popup a été bloqué par votre navigateur. Veuillez autoriser les popups pour ce site.");
    } else {
      console.log("✅ URL ouverte dans un nouvel onglet");
    }
  });
}

// -----------------------------------------------------------------------
// INITIALISATION
// -----------------------------------------------------------------------
console.log("🔧 Module uiQrToUrl.js chargé avec succès");
console.log("📋 Interface prête pour la conversion QR → URL");
