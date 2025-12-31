// ======================================================================
// compression.js – Compression/décompression avec pako (DEFLATE)
// Version simplifiée : Support uniquement du nouveau format
// ======================================================================

/**
 * Encode une fiche en Base64 compressé
 * @param {Object} fiche - Objet fiche à encoder
 * @returns {Object} { wrapperString, stats }
 */
export function encodeFiche(fiche) {
  const jsonString = JSON.stringify(fiche);
  const originalSize = jsonString.length;

  // Compression DEFLATE avec pako
  const compressed = pako.deflate(jsonString, { level: 9 });

  // Conversion en Base64
  const base64 = btoa(String.fromCharCode(...compressed));
  const compressedSize = base64.length;

  console.log(`📦 Compression : ${originalSize} → ${compressedSize} caractères (${Math.round((1 - compressedSize / originalSize) * 100)}% de réduction)`);

  return {
    wrapperString: base64,
    stats: {
      original: originalSize,
      base64: compressedSize,
      ratio: Math.round((1 - compressedSize / originalSize) * 100)
    }
  };
}

/**
 * Décode une chaîne Base64 compressée en objet fiche
 * @param {string} base64String - Chaîne Base64 à décoder
 * @returns {Object} Objet fiche décodé
 */
export function decodeFiche(base64String) {
  try {
    console.log("🔓 Décodage fiche...");
    console.log("  - Longueur données:", base64String.length, "caractères");

    // Décoder Base64
    const binaryString = atob(base64String);
    const bytes = new Uint8Array(binaryString.length);
    
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Décompression avec pako
    const decompressed = pako.inflate(bytes, { to: 'string' });

    // Parse JSON
    const fiche = JSON.parse(decompressed);

    console.log("✅ Fiche décodée avec succès");
    console.log("  - Titre:", fiche.meta?.titre || "Sans titre");
    console.log("  - Catégorie:", fiche.meta?.categorie || "Non spécifiée");

    return fiche;

  } catch (error) {
    console.error("❌ Erreur décodage fiche :", error);
    console.error("❌ Données reçues (100 premiers caractères) :", base64String.substring(0, 100));
    throw new Error("Impossible de décoder la fiche. Le QR Code est peut-être invalide ou corrompu.");
  }
}
