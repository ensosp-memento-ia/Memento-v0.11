// ======================================================================
// qrWriter.js – Génération de QR Code avec QRCode.js
// ======================================================================

/**
 * Génère un QR Code dans un conteneur DOM
 * @param {string} containerId - ID du conteneur DOM
 * @param {string} data - Données à encoder dans le QR
 * @param {number} size - Taille du QR en pixels (défaut: 256)
 */
export function generateQRCode(containerId, data, size = 256) {
  const container = document.getElementById(containerId);
  
  if (!container) {
    console.error(`❌ Conteneur #${containerId} introuvable`);
    return;
  }

  // Nettoyer le conteneur
  container.innerHTML = "";

  try {
    // Générer le QR Code avec QRCode.js
    new QRCode(container, {
      text: data,
      width: size,
      height: size,
      colorDark: "#000000",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.M
    });

    console.log("✅ QR Code généré avec succès");

    // Attendre que le QR soit rendu, puis supprimer l'image vide générée par défaut
    setTimeout(() => {
      const imgs = container.querySelectorAll('img');
      imgs.forEach(img => {
        if (img.width === 1 || img.height === 1 || !img.src || img.src.includes('data:image/gif')) {
          console.log("🧹 Suppression de l'image vide générée par QRCode.js");
          img.remove();
        }
      });

      // S'assurer que le canvas est visible
      const canvas = container.querySelector('canvas');
      if (canvas) {
        canvas.style.display = 'block';
        console.log("✅ Canvas QR visible");
      }
    }, 200);

  } catch (error) {
    console.error("❌ Erreur génération QR :", error);
    container.innerHTML = `<p style="color:red;">Erreur lors de la génération du QR Code.</p>`;
  }
}

/**
 * Télécharge le QR Code généré en PNG
 * @param {string} containerId - ID du conteneur contenant le QR
 * @param {string} filename - Nom du fichier (défaut: qrcode.png)
 */
export function downloadQRCode(containerId, filename = "qrcode.png") {
  const container = document.getElementById(containerId);
  
  if (!container) {
    console.error(`❌ Conteneur #${containerId} introuvable`);
    return;
  }

  const canvas = container.querySelector('canvas');
  
  if (!canvas) {
    console.error("❌ Canvas introuvable dans le conteneur");
    alert("⚠️ Impossible de télécharger le QR Code");
    return;
  }

  try {
    // Convertir le canvas en Blob
    canvas.toBlob((blob) => {
      if (!blob) {
        alert("⚠️ Erreur lors de la création du fichier");
        return;
      }

      // Créer un lien de téléchargement
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      
      // Libérer la mémoire
      URL.revokeObjectURL(url);
      
      console.log("✅ QR Code téléchargé :", filename);
    }, 'image/png');

  } catch (error) {
    console.error("❌ Erreur téléchargement QR :", error);
    alert("⚠️ Impossible de télécharger le QR Code");
  }
}
