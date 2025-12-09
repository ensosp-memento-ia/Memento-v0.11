// ===============================================================
// uiCamera.js – Gestion de la caméra pour scan QR
// ===============================================================

import { startCameraScanner, stopCameraScanner } from "../core/qrReaderCamera.js";

let currentScanner = null;

export async function startCamera(videoElementId, onSuccess, onError) {
  try {
    currentScanner = await startCameraScanner(videoElementId, onSuccess, onError);
    console.log("✅ Caméra démarrée");
    return currentScanner;
  } catch (error) {
    console.error("❌ Erreur démarrage caméra :", error);
    if (onError) onError(error);
    return null;
  }
}

export function stopCamera() {
  if (currentScanner) {
    stopCameraScanner();
    currentScanner = null;
    console.log("⏹️ Caméra arrêtée");
  }
}

export function getCameraScanner() {
  return currentScanner;
}
