// ======================================================
// qrReaderCamera.js — Lecture QR via caméra (module technique)
// v0.11.21 : Résolution forcée + zone centrale + scan 15fps
// ======================================================

let currentScanner = null;

/**
 * Normalise le résultat renvoyé par QrScanner en string.
 * Support iOS renforcé.
 */
function extractTextFromScanResult(result) {
  if (!result) {
    console.warn("⚠️ Résultat QR vide");
    return "";
  }

  if (typeof result === "string") {
    return result;
  }

  if (result.data && typeof result.data === "string") {
    return result.data;
  }

  if (result.data && typeof result.data === "object") {
    if (result.data instanceof Uint8Array || result.data.buffer) {
      try {
        return new TextDecoder().decode(result.data);
      } catch (e) {
        console.error("❌ Erreur décodage Buffer :", e);
      }
    }
    try {
      return JSON.stringify(result.data);
    } catch (e) {
      console.error("❌ Stringify échoué :", e);
    }
  }

  try {
    return JSON.stringify(result);
  } catch (e) {
    console.error("❌ Impossible d'extraire le texte :", e);
    return "";
  }
}

/**
 * Tente d'améliorer la résolution et l'autofocus après démarrage du scanner.
 * Silencieux si le navigateur ou le matériel ne supporte pas les contraintes.
 *
 * @param {HTMLVideoElement} videoElement
 */
async function applyHighResConstraints(videoElement) {
  try {
    const stream = videoElement.srcObject;
    if (!stream) return;

    const track = stream.getVideoTracks()[0];
    if (!track?.applyConstraints) return;

    await track.applyConstraints({
      width:     { ideal: 1920 },
      height:    { ideal: 1080 },
      focusMode: "continuous"   // autofocus continu — meilleur pour QR denses
    });

    const settings = track.getSettings();
    console.log(
      `📷 Résolution appliquée : ${settings.width}×${settings.height}`,
      settings.focusMode ? `| focus: ${settings.focusMode}` : ""
    );
  } catch (e) {
    // Non bloquant : certains navigateurs refusent ces contraintes
    console.warn("⚠️ applyConstraints non supporté ou refusé :", e.message);
  }
}

/**
 * Démarre le scan caméra.
 *
 * Optimisations v0.11.21 :
 *  - preferredCamera: "environment" dès l'instanciation (évite le switch)
 *  - maxScansPerSecond: 15 (vs défaut ~5)
 *  - calculateScanRegion: zone centrale 70% — réduit le bruit et
 *    concentre l'analyse là où l'utilisateur cadre le QR
 *  - applyHighResConstraints: tente 1080p + autofocus continu après start()
 *
 * @param {HTMLVideoElement} videoElement
 * @param {(rawText: string) => void} onText
 */
export async function startCameraScan(videoElement, onText) {
  if (!window.QrScanner) {
    throw new Error("❌ QrScanner n'est pas chargé (window.QrScanner absent).");
  }
  if (!videoElement) {
    throw new Error("❌ Élément <video> non fourni.");
  }

  // Cleanup systématique avant nouvelle instance
  if (currentScanner) {
    console.log("🧹 Nettoyage scanner existant...");
    try {
      await currentScanner.stop();
      currentScanner.destroy();
    } catch (e) {
      console.warn("⚠️ Erreur cleanup scanner :", e);
    } finally {
      currentScanner = null;
    }
  }

  console.log("🎥 Création nouveau scanner (haute performance)...");

  currentScanner = new window.QrScanner(
    videoElement,
    (scanResult) => {
      const text = extractTextFromScanResult(scanResult);
      if (text && text.length > 0) {
        onText(text);
      } else {
        console.warn("⚠️ Texte extrait vide, scan ignoré");
      }
    },
    {
      returnDetailedScanResult: true,
      highlightScanRegion:      true,
      highlightCodeOutline:     true,

      // ── Optimisation 1 : caméra arrière dès l'init ──────────────
      preferredCamera: "environment",

      // ── Optimisation 2 : fréquence d'analyse 15 fps ─────────────
      // Le défaut QrScanner est ~5/s. 15/s améliore la réactivité
      // sans surcharger le CPU mobile (limite navigateur ~25/s).
      maxScansPerSecond: 15,

      // ── Optimisation 3 : zone centrale 70% ──────────────────────
      // Analyse uniquement le carré central du flux vidéo.
      // Avantages : moins de bruit de fond, traitement plus rapide,
      // meilleure détection des QR codes denses.
      calculateScanRegion: (video) => {
        const size = Math.round(
          0.7 * Math.min(video.videoWidth, video.videoHeight)
        );
        const x = Math.round((video.videoWidth  - size) / 2);
        const y = Math.round((video.videoHeight - size) / 2);
        return { x, y, width: size, height: size };
      }
    }
  );

  // Démarrage
  try {
    await currentScanner.start();
    console.log("✅ Scanner démarré");

    // ── Optimisation 4 : résolution 1080p + autofocus continu ────
    await applyHighResConstraints(videoElement);

  } catch (e) {
    console.error("❌ Impossible de démarrer la caméra :", e);
    throw new Error("Impossible d'accéder à la caméra : " + e.message);
  }
}

/**
 * Arrête et détruit le scanner actuel.
 */
export async function stopCameraScan() {
  if (!currentScanner) {
    console.log("ℹ️ Aucun scanner à arrêter");
    return;
  }

  console.log("🛑 Arrêt du scanner...");

  try {
    await currentScanner.stop();
  } catch (e) {
    console.warn("⚠️ Erreur à l'arrêt :", e);
  }

  try {
    currentScanner.destroy();
  } catch (e) {
    console.warn("⚠️ Erreur destruction :", e);
  } finally {
    currentScanner = null;
    console.log("✅ Scanner arrêté et détruit");
  }
}

/**
 * Vérifie si un scanner est actif.
 */
export function isScannerActive() {
  return currentScanner !== null;
}
