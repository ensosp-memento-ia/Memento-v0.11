// ======================================================
// qrReaderCamera.js — Lecture QR via caméra
// v0.11.24 : jsQR (pas de worker, pas de CORS)
//            Compatible iOS Safari + Android Chrome
// ======================================================
//
// Pourquoi jsQR et non QrScanner.js :
//  QrScanner.js délègue le décodage à un Web Worker.
//  Sur iOS Safari, les Workers cross-origin (CDN) sont bloqués
//  par WebKit sans erreur visible → caméra ouverte mais jamais
//  de détection. jsQR décode directement dans le thread principal
//  via canvas.getImageData() — aucun worker, aucun CORS.
// ======================================================

let rafId       = null;   // requestAnimationFrame handle
let stream      = null;   // MediaStream actif
let canvasEl    = null;   // canvas de travail (hors DOM)
let ctx         = null;

// ------------------------------------------------------------------
// Tenter d'appliquer 1080p + autofocus après démarrage
// ------------------------------------------------------------------
async function applyHighResConstraints(videoTrack) {
  if (!videoTrack?.applyConstraints) return;
  try {
    await videoTrack.applyConstraints({
      width:     { ideal: 1920 },
      height:    { ideal: 1080 },
      focusMode: "continuous"
    });
    const s = videoTrack.getSettings();
    console.log(`📷 ${s.width}×${s.height}` + (s.focusMode ? ` | focus:${s.focusMode}` : ""));
  } catch (e) {
    console.warn("⚠️ applyConstraints ignoré :", e.message);
  }
}

// ------------------------------------------------------------------
// Boucle de décodage jsQR
// ------------------------------------------------------------------
function scanLoop(videoEl, onText) {
  if (!canvasEl || !ctx) return;

  // Attendre que la vidéo soit prête
  if (videoEl.readyState < videoEl.HAVE_ENOUGH_DATA) {
    rafId = requestAnimationFrame(() => scanLoop(videoEl, onText));
    return;
  }

  const w = videoEl.videoWidth;
  const h = videoEl.videoHeight;

  if (w === 0 || h === 0) {
    rafId = requestAnimationFrame(() => scanLoop(videoEl, onText));
    return;
  }

  // Ajuster canvas si besoin
  if (canvasEl.width !== w || canvasEl.height !== h) {
    canvasEl.width  = w;
    canvasEl.height = h;
  }

  ctx.drawImage(videoEl, 0, 0, w, h);
  const imageData = ctx.getImageData(0, 0, w, h);

  const result = window.jsQR(imageData.data, imageData.width, imageData.height, {
    inversionAttempts: "dontInvert"
  });

  if (result && result.data) {
    console.log("✅ jsQR — QR détecté :", result.data.substring(0, 80) + "...");
    onText(result.data);
    // Ne pas relancer la boucle : uiScan appellera stopCameraScan()
    return;
  }

  rafId = requestAnimationFrame(() => scanLoop(videoEl, onText));
}

// ------------------------------------------------------------------
// API publique
// ------------------------------------------------------------------

/**
 * Démarre le scan caméra avec jsQR.
 *
 * @param {HTMLVideoElement} videoEl
 * @param {(rawText: string) => void} onText  — appelé une seule fois à la détection
 */
export async function startCameraScan(videoEl, onText) {
  if (!window.jsQR) {
    throw new Error("❌ jsQR n'est pas chargé (window.jsQR absent).");
  }
  if (!videoEl) {
    throw new Error("❌ Élément <video> non fourni.");
  }

  // Cleanup si scan précédent encore actif
  await stopCameraScan();

  console.log("🎥 Démarrage caméra (jsQR)...");

  // Contraintes getUserMedia — caméra arrière, résolution idéale 1080p
  const constraints = {
    video: {
      facingMode:  { ideal: "environment" },
      width:       { ideal: 1920 },
      height:      { ideal: 1080 }
    },
    audio: false
  };

  try {
    stream = await navigator.mediaDevices.getUserMedia(constraints);
  } catch (e) {
    // Fallback : contraintes minimales (iOS plus strict)
    console.warn("⚠️ getUserMedia contraint échoué, fallback minimal :", e.message);
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false
      });
    } catch (e2) {
      throw new Error("Impossible d'accéder à la caméra : " + e2.message);
    }
  }

  videoEl.srcObject = stream;
  videoEl.setAttribute("playsinline", "true");  // obligatoire iOS Safari
  videoEl.setAttribute("autoplay",    "true");
  videoEl.muted = true;

  await videoEl.play().catch(e => {
    console.warn("⚠️ videoEl.play() échoué :", e.message);
  });

  // Tenter d'améliorer résolution + autofocus
  const track = stream.getVideoTracks()[0];
  await applyHighResConstraints(track);

  // Préparer canvas hors DOM
  canvasEl = document.createElement("canvas");
  ctx      = canvasEl.getContext("2d", { willReadFrequently: true });

  console.log("✅ Caméra démarrée — boucle jsQR lancée");
  rafId = requestAnimationFrame(() => scanLoop(videoEl, onText));
}

/**
 * Arrête la caméra et la boucle de décodage.
 */
export async function stopCameraScan() {
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }

  if (stream) {
    stream.getTracks().forEach(t => t.stop());
    stream = null;
  }

  canvasEl = null;
  ctx      = null;

  console.log("✅ Caméra arrêtée");
}

/** Vérifie si un scan est en cours. */
export function isScannerActive() {
  return stream !== null;
}
