// ======================================================
// qrReaderCamera.js — Lecture QR via caméra (module technique)
// v0.11.23 : Suppression highlightScanRegion natif (rétrécissement auto)
//            Cadre de visée géré en CSS pur dans scan.html
// ======================================================

let currentScanner = null;

/**
 * Normalise le résultat renvoyé par QrScanner en string.
 * Support iOS renforcé.
 */
function extractTextFromScanResult(result) {
  if (!result) { console.warn("⚠️ Résultat QR vide"); return ""; }
  if (typeof result === "string") return result;
  if (result.data && typeof result.data === "string") return result.data;
  if (result.data && typeof result.data === "object") {
    if (result.data instanceof Uint8Array || result.data.buffer) {
      try { return new TextDecoder().decode(result.data); }
      catch (e) { console.error("❌ Erreur décodage Buffer :", e); }
    }
    try { return JSON.stringify(result.data); }
    catch (e) { console.error("❌ Stringify échoué :", e); }
  }
  try { return JSON.stringify(result); }
  catch (e) { console.error("❌ Impossible d'extraire le texte :", e); return ""; }
}

/**
 * Tente de forcer 1080p + autofocus continu après démarrage.
 * Silencieux si non supporté.
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
      focusMode: "continuous"
    });
    const s = track.getSettings();
    console.log(`📷 Résolution : ${s.width}×${s.height}`, s.focusMode ? `| focus: ${s.focusMode}` : "");
  } catch (e) {
    console.warn("⚠️ applyConstraints non supporté :", e.message);
  }
}

/**
 * Démarre le scan caméra.
 *
 * Pourquoi highlightScanRegion et highlightCodeOutline sont DÉSACTIVÉS :
 *  QrScanner.js redimensionne dynamiquement son cadre de visée natif en
 *  fonction de ses tentatives de détection internes. Sur mobile, ce
 *  comportement produit un carré qui rétrécit progressivement jusqu'à
 *  empêcher toute détection. Le cadre de visée est remplacé par un
 *  élément CSS fixe dans scan.html (#qrViewfinder), purement visuel
 *  et stable quelle que soit l'activité du scanner.
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

  if (currentScanner) {
    console.log("🧹 Nettoyage scanner existant...");
    try {
      await currentScanner.stop();
      currentScanner.destroy();
    } catch (e) {
      console.warn("⚠️ Erreur cleanup :", e);
    } finally {
      currentScanner = null;
    }
  }

  console.log("🎥 Création nouveau scanner...");

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
      highlightScanRegion:      false,  // désactivé — cadre CSS fixe dans scan.html
      highlightCodeOutline:     false,  // désactivé — source du rétrécissement auto
      preferredCamera:          "environment",
      maxScansPerSecond:        15
    }
  );

  try {
    await currentScanner.start();
    console.log("✅ Scanner démarré");
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
  if (!currentScanner) { console.log("ℹ️ Aucun scanner à arrêter"); return; }
  console.log("🛑 Arrêt du scanner...");
  try { await currentScanner.stop(); } catch (e) { console.warn("⚠️ Erreur arrêt :", e); }
  try { currentScanner.destroy(); } catch (e) { console.warn("⚠️ Erreur destruction :", e); }
  finally { currentScanner = null; console.log("✅ Scanner arrêté et détruit"); }
}

/** Vérifie si un scanner est actif. */
export function isScannerActive() {
  return currentScanner !== null;
}
