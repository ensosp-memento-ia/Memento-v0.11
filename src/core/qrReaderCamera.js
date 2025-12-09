// ======================================================================
// qrReaderCamera.js – Lecture de QR Code en temps réel avec caméra
// ======================================================================

import { decodeFiche } from "./compression.js";

let scanner = null;

/**
 * Démarre la lecture QR avec la caméra
 * @param {string} videoElementId - ID de l'élément <video>
 * @param {Function} onSuccess - Callback appelé avec la fiche décodée
 * @param {Function} onError - Callback appelé en cas d'erreur
 * @returns {Object} Instance du scanner
 */
export async function startCameraScanner(videoElementId, onSuccess, onError) {
  const videoEl = document.getElementById(videoElementId);

  if (!videoEl) {
    console.error(`❌ Élément vidéo #${videoElementId} introuvable`);
    if (onError) onError(new Error("Élément vidéo introuvable"));
    return null;
  }

  if (!window.QrScanner) {
    console.error("❌ QrScanner non chargé");
    if (onError) onError(new Error("QrScanner non disponible"));
    return null;
  }

  try {
    // Créer le scanner
    scanner = new window.QrScanner(
      videoEl,
      (result) => {
        console.log("✅ QR détecté :", result.data);

        try {
          // Décoder la fiche
          const fiche = decodeFiche(result.data);

          // Arrêter le scanner
          stopCameraScanner();

          // Appeler le callback de succès
          if (onSuccess) {
            onSuccess(fiche);
          }

        } catch (error) {
          console.error("❌ Erreur décodage fiche :", error);
          if (onError) onError(error);
        }
      },
      {
        returnDetailedScanResult: true,
        highlightScanRegion: true,
        highlightCodeOutline: true,
      }
    );

    await scanner.start();
    console.log("📷 Scanner caméra démarré");

    return scanner;

  } catch (error) {
    console.error("❌ Erreur démarrage caméra :", error);
    if (onError) onError(error);
    return null;
  }
}

/**
 * Arrête le scanner caméra
 */
export function stopCameraScanner() {
  if (scanner) {
    console.log("⏹️ Arrêt du scanner caméra");
    scanner.stop();
    scanner.destroy();
    scanner = null;
  }
}

/**
 * Récupère l'instance actuelle du scanner
 * @returns {Object|null} Instance du scanner ou null
 */
export function getCameraScanner() {
  return scanner;
}
