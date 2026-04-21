// ======================================================
// qrReaderCamera.js — Lecture QR via caméra (module technique)
// v0.11.22 : Suppression calculateScanRegion (carré trop petit + zones mortes)
//            Résolution 1080p + autofocus continu + 15fps conservés
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
 * Silencieux si non supporté par le navigateur ou le matériel.
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
      focusMode: "continuous"
    });

    const s = track.getSettings();
    console.log(
      `📷 Résolution : ${s.width}×${s.height}`,
      s.focusMode ? `| focus: ${s.focusMode}` : ""
    );
  } catch (e) {
    console.warn("⚠️ applyConstraints non supporté :", e.message);
  }
}

/**
 * Démarre le scan caméra.
 *
 * Pourquoi calculateScanRegion est ABSENT ici :
 *  - Cette option calcule la zone d'analyse en pixels natifs du capteur
 *    (ex. 1920×1080), mais le cadre de visée (highlightScanRegion) est
 *    rendu en coordonnées CSS sur le <video> affiché.
 *  - Sur mobile, l'écart entre résolution native et taille CSS affichée
 *    (ex. 400px wide) fait paraître le carré minuscule à l'écran.
 *  - De plus, un QR code zoomé déborde la zone centrale et n'est plus détecté.
 *  - Sans cette option, QrScanner analyse tout le flux vidéo et le cadre
 *    de visée affiché par highlightScanRegion couvre toute la zone utile.
 *
 * Optimisations conservées :
 *  - preferredCamera: "environment"  → caméra arrière dès l'init
 *  - maxScansPerSecond: 15           → 3× plus réactif que le défaut
 *  - applyHighResConstraints()       → 1080p + autofocus continu
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
      highlightScanRegion:      true,   // cadre de visée pleine zone vidéo
      highlightCodeOutline:     true,   // contour vert au moment de la détection
      preferredCamera:          "environment",
      maxScansPerSecond:        15
      // calculateScanRegion : volontairement absent
      // → analyse tout le flux, cadre de visée correct sur mobile,
      //   détection même sur QR code zoomé ou excentré
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
  if (!currentScanner) {
    console.log("ℹ️ Aucun scanner à arrêter");
    return;
  }

  console.log("🛑 Arrêt du scanner...");

  try { await currentScanner.stop(); }
  catch (e) { console.warn("⚠️ Erreur à l'arrêt :", e); }

  try { currentScanner.destroy(); }
  catch (e) { console.warn("⚠️ Erreur destruction :", e); }
  finally {
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
