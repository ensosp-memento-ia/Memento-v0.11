// ======================================================================
// compression.js – Compression/décompression avec pako (DEFLATE)
// v0.11.21 : Base64URL + compactage JSON + stats corrigées
// ======================================================================

import { toCompact, fromCompact } from "./jsonSchema.js";

// ----------------------------------------------------------------------
// Helpers Base64URL
// ----------------------------------------------------------------------

/**
 * Convertit un Base64 standard (btoa) en Base64URL :
 *   +  →  -
 *   /  →  _
 *   =  supprimé (padding non requis côté décodeur)
 *
 * Avantage QR Code : élimine les ~70–120 chars d'overhead
 * introduits par encodeURIComponent(base64Standard).
 * Aucun impact sur la limite de 2953 bytes (mode byte QR v40-L)
 * car les minuscules de l'URL forcent de toute façon le mode byte,
 * mais le payload du paramètre ?fiche= est réduit d'autant.
 *
 * @param {string} b64 - chaîne Base64 standard (issue de btoa)
 * @returns {string} Base64URL sans padding
 */
function toBase64URL(b64) {
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

/**
 * Restaure un Base64URL en Base64 standard exploitable par atob().
 * Compatible avec les anciens QR (Base64 standard) : si la chaîne
 * ne contient ni - ni _, le re-padding seul suffit.
 *
 * @param {string} b64url - chaîne Base64URL (ou Base64 standard)
 * @returns {string} Base64 standard avec padding correct
 */
function fromBase64URL(b64url) {
  let b64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
  const pad = (4 - (b64.length % 4)) % 4;
  b64 += "=".repeat(pad);
  return b64;
}

// ----------------------------------------------------------------------
// Encodage
// ----------------------------------------------------------------------

/**
 * Encode une fiche en Base64URL compressé.
 *
 * Pipeline :
 *   fiche (objet) → toCompact() → JSON.stringify → DEFLATE (pako lvl 9)
 *   → btoa → Base64URL (sans encodeURIComponent)
 *
 * Compatibilité ascendante décodage : assurée via fromCompact() +
 * fromBase64URL() dans decodeFiche().
 *
 * @param {Object} fiche - Objet fiche à encoder
 * @returns {{ wrapperString: string, stats: object }}
 */
export function encodeFiche(fiche) {
  // ── Sol.2 : compactage des clés JSON ───────────────────────────
  const compacted = toCompact(fiche);
  const jsonString = JSON.stringify(compacted);
  const jsonSize = jsonString.length;

  // ── Compression DEFLATE ────────────────────────────────────────
  const compressed = pako.deflate(jsonString, { level: 9 });
  const deflatedSize = compressed.length;

  // ── Base64 standard puis Base64URL ─────────────────────────────
  const base64Std = btoa(String.fromCharCode(...compressed));
  // ── Sol.1 : Base64URL (supprime l'overhead encodeURIComponent) ─
  const base64url = toBase64URL(base64Std);

  console.log(
    `📦 Compression : JSON compacté ${jsonSize} chars` +
    ` → DEFLATE ${deflatedSize} bytes` +
    ` → Base64URL ${base64url.length} chars` +
    ` (${Math.round((1 - base64url.length / jsonSize) * 100)}% de réduction)`
  );

  return {
    wrapperString: base64url,
    stats: {
      original:  jsonSize,
      deflated:  deflatedSize,
      base64:    base64url.length,
      ratio:     Math.round((1 - base64url.length / jsonSize) * 100)
    }
  };
}

// ----------------------------------------------------------------------
// Décodage — compatible anciens QR (Base64 standard) ET nouveaux (Base64URL)
// ----------------------------------------------------------------------

/**
 * Décode une chaîne Base64URL (ou Base64 standard) compressée en objet fiche.
 *
 * Rétrocompatibilité :
 *  - Anciens QR  : Base64 standard, clés JSON longues  → fromBase64URL no-op + fromCompact fallback
 *  - Nouveaux QR : Base64URL, clés JSON compactées     → fromBase64URL + fromCompact normal
 *
 * @param {string} base64String - Chaîne Base64URL ou Base64 standard
 * @returns {Object} Objet fiche décodé (clés longues restaurées)
 */
export function decodeFiche(base64String) {
  try {
    console.log("🔓 Décodage fiche...");
    console.log("  - Longueur données:", base64String.length, "caractères");

    // ── Sol.1 : normalisation Base64URL → Base64 standard ────────
    const b64Std = fromBase64URL(base64String);

    // ── Décoder Base64 → bytes ────────────────────────────────────
    const binaryString = atob(b64Std);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // ── Décompression DEFLATE ─────────────────────────────────────
    const decompressed = pako.inflate(bytes, { to: "string" });

    // ── Parse JSON ────────────────────────────────────────────────
    const compactedFiche = JSON.parse(decompressed);

    // ── Sol.2 : restauration des clés longues ─────────────────────
    // fromCompact() a un fallback key||key → compatible anciens QR
    const fiche = fromCompact(compactedFiche);

    console.log("✅ Fiche décodée avec succès");
    console.log("  - Titre:", fiche.meta?.titre || "Sans titre");
    console.log("  - Catégorie:", fiche.meta?.categorie || "Non spécifiée");

    return fiche;

  } catch (error) {
    console.error("❌ Erreur décodage fiche :", error);
    console.error("❌ Données reçues (100 premiers chars) :", base64String.substring(0, 100));
    throw new Error(
      "Impossible de décoder la fiche. Le QR Code est peut-être invalide ou corrompu."
    );
  }
}
