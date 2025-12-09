// ======================================================================
// qrReaderFile.js – Lecture de QR Code depuis un fichier image
// ======================================================================

import { decodeFiche } from "./compression.js";

/**
 * Lit un QR Code depuis un fichier image
 * @param {File} file - Fichier image à analyser
 * @param {Function} onSuccess - Callback appelé avec la fiche décodée
 * @param {Function} onError - Callback appelé en cas d'erreur
 */
export async function readQRFromFile(file, onSuccess, onError) {
  if (!file) {
    if (onError) onError(new Error("Aucun fichier fourni"));
    return;
  }

  try {
    // Vérifier que QrScanner est chargé
    if (!window.QrScanner) {
      throw new Error("QrScanner non chargé");
    }

    console.log("📷 Lecture du fichier QR...");

    // Scanner le fichier avec QrScanner
    const result = await window.QrScanner.scanImage(file, {
      returnDetailedScanResult: true
    });

    console.log("✅ QR décodé :", result.data);

    // Décoder la fiche
    const fiche = decodeFiche(result.data);

    // Appeler le callback de succès
    if (onSuccess) {
      onSuccess(fiche);
    }

  } catch (error) {
    console.error("❌ Erreur lecture QR fichier :", error);
    
    if (onError) {
      onError(error);
    } else {
      alert("⚠️ Impossible de lire ce QR Code. Vérifiez que l'image est nette et complète.");
    }
  }
}
