// ======================================================
// qrWriter.js – Générateur de QR Codes pour fiches compressées
// Version corrigée : Support URL directe + QR responsive
// ======================================================

import { encodeFiche } from "./compression.js";

// Tailles adaptées mobile/desktop
const MIN_QR_SIZE_MOBILE = 300;
const MIN_QR_SIZE_DESKTOP = 600;

// Détection mobile
function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    || window.innerWidth < 768;
}

// ✅ CORRECTION : Taille dynamique adaptée au device
function computeQrSize(payloadLength) {
  const isMobile = isMobileDevice();
  
  // Base selon device
  let size = isMobile ? MIN_QR_SIZE_MOBILE : MIN_QR_SIZE_DESKTOP;

  // Ajustement selon complexité (desktop uniquement)
  if (!isMobile) {
    if (payloadLength > 3500) size = 700;
    if (payloadLength > 4500) size = 800;
  } else {
    // Mobile : on reste sur 300px même si QR complexe
    // (la lib QRCode.js gère la densité automatiquement)
    size = MIN_QR_SIZE_MOBILE;
  }

  console.log(`📐 QR Size: ${size}px (${isMobile ? 'mobile' : 'desktop'}, payload: ${payloadLength})`);

  return size;
}

// ------------------------------------------------------
// ✅ MODIFICATION PRINCIPALE : Génération QR avec URL ou Fiche
// ------------------------------------------------------
export function generateQrForFiche(dataOrUrl, containerId) {
  const container = document.getElementById(containerId);
  if (!container) {
    throw new Error("❌ Container QR introuvable : " + containerId);
  }

  let qrData;
  let ficheForDownload = null;

  // ✅ DÉTECTION : URL (string) ou Fiche (object)
  if (typeof dataOrUrl === 'string') {
    // C'est une URL directe
    qrData = dataOrUrl;
    console.log("📱 Génération QR avec URL directe");
    console.log("  - URL:", qrData.substring(0, 100) + "...");
    console.log("  - Longueur:", qrData.length, "caractères");
    
  } else if (typeof dataOrUrl === 'object' && dataOrUrl !== null) {
    // C'est une fiche, il faut l'encoder
    console.log("📱 Génération QR avec fiche (encodage nécessaire)");
    
    const enc = encodeFiche(dataOrUrl);
    qrData = enc.wrapperString;
    ficheForDownload = dataOrUrl;
    
    console.log("📊 Stats encodage :", enc.stats);
    console.log("  - Données compressées:", qrData.length, "caractères");
    
  } else {
    throw new Error("❌ Type de données invalide pour generateQrForFiche");
  }

  // Nettoyage précédent
  container.innerHTML = "";

  // Taille adaptée
  const qrSize = computeQrSize(qrData.length);

  // Conteneur responsive
  const qrWrapper = document.createElement("div");
  qrWrapper.style.maxWidth = "100%";
  qrWrapper.style.display = "flex";
  qrWrapper.style.justifyContent = "center";
  qrWrapper.style.marginTop = "20px";

  const qrInner = document.createElement("div");
  qrInner.id = "qrCodeCanvas";
  qrInner.style.width = qrSize + "px";
  qrInner.style.height = qrSize + "px";
  qrInner.style.maxWidth = "100%";
  qrInner.style.maxHeight = "100%";

  qrWrapper.appendChild(qrInner);
  container.appendChild(qrWrapper);

  // Création du QR Code haute définition
  try {
    new QRCode(qrInner, {
      text: qrData,
      width: qrSize,
      height: qrSize,
      correctLevel: QRCode.CorrectLevel.M,  // M = meilleur équilibre
      colorDark: "#000000",
      colorLight: "#ffffff"
    });

    console.log("✅ QR Code généré avec succès");

  } catch (e) {
    console.error("❌ Erreur génération QR :", e);
    throw new Error("Impossible de générer le QR Code : " + e.message);
  }

  // Ajout bouton téléchargement (seulement si c'est une fiche avec meta)
  if (ficheForDownload) {
    addDownloadButton(container, ficheForDownload);
  } else {
    // Pour une URL, bouton simple
    addDownloadButtonSimple(container);
  }

  return {
    qrSize,
    isMobile: isMobileDevice()
  };
}

// ------------------------------------------------------
// Bouton de téléchargement du QR (pour fiche)
// ------------------------------------------------------
function addDownloadButton(container, fiche) {
  const btn = document.createElement("button");
  btn.textContent = "💾 Télécharger le QR Code";
  btn.className = "btn-add-var";
  btn.style.marginTop = "15px";

  btn.onclick = () => {
    try {
      // Récupération du canvas généré par QRCode.js
      const canvas = container.querySelector("canvas");
      if (!canvas) {
        alert("❌ QR Code non trouvé");
        return;
      }

      // Conversion en image
      canvas.toBlob((blob) => {
        if (!blob) {
          alert("❌ Erreur conversion image");
          return;
        }

        // Téléchargement
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `qr_${fiche.meta?.titre || 'fiche'}_${Date.now()}.png`;
        a.click();
        URL.revokeObjectURL(url);

        console.log("✅ QR Code téléchargé");
      });

    } catch (e) {
      console.error("❌ Erreur téléchargement :", e);
      alert("Erreur lors du téléchargement : " + e.message);
    }
  };

  container.appendChild(btn);
}

// ------------------------------------------------------
// Bouton de téléchargement simple (pour URL)
// ------------------------------------------------------
function addDownloadButtonSimple(container) {
  const btn = document.createElement("button");
  btn.textContent = "💾 Télécharger le QR Code";
  btn.className = "btn-add-var";
  btn.style.marginTop = "15px";

  btn.onclick = () => {
    try {
      // Récupération du canvas généré par QRCode.js
      const canvas = container.querySelector("canvas");
      if (!canvas) {
        alert("❌ QR Code non trouvé");
        return;
      }

      // Conversion en image
      canvas.toBlob((blob) => {
        if (!blob) {
          alert("❌ Erreur conversion image");
          return;
        }

        // Téléchargement
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `qr_fiche_${Date.now()}.png`;
        a.click();
        URL.revokeObjectURL(url);

        console.log("✅ QR Code téléchargé");
      });

    } catch (e) {
      console.error("❌ Erreur téléchargement :", e);
      alert("Erreur lors du téléchargement : " + e.message);
    }
  };

  container.appendChild(btn);
}
