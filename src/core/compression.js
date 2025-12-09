// ======================================================================
// compression.js – Compression/décompression avec pako (DEFLATE)
// Version corrigée : Support de l'ancien format {"z":"p1","d":"..."}
// ======================================================================

/**
 * Encode une fiche en Base64 compressé
 * @param {Object} fiche - Objet fiche à encoder
 * @returns {Object} { wrapperString, originalSize, compressedSize }
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
    originalSize,
    compressedSize
  };
}

/**
 * Décode une chaîne Base64 compressée en objet fiche
 * Supporte à la fois l'ancien format ({"z":"p1","d":"..."}) et le nouveau (base64 direct)
 * @param {string} base64String - Chaîne Base64 à décoder
 * @returns {Object} Objet fiche décodé
 */
export function decodeFiche(base64String) {
  try {
    let dataToDecompress = base64String;

    // ✅ CORRECTION : Détection de l'ancien format wrapper {"z":"p1","d":"..."}
    if (base64String.trim().startsWith('{')) {
      console.log("🔄 Ancien format détecté, extraction des données...");
      try {
        const wrapper = JSON.parse(base64String);
        if (wrapper.z === "p1" && wrapper.d) {
          dataToDecompress = wrapper.d;
          console.log("✅ Données extraites du wrapper ancien format");
        }
      } catch (e) {
        console.warn("⚠️ Erreur parsing wrapper, tentative décodage direct");
      }
    }

    // Décoder Base64
    const binaryString = atob(dataToDecompress);
    const bytes = new Uint8Array(binaryString.length);
    
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Décompression avec pako
    const decompressed = pako.inflate(bytes, { to: 'string' });

    // Parse JSON
    const fiche = JSON.parse(decompressed);

    console.log("✅ Fiche décodée avec succès :", fiche);

    return fiche;

  } catch (error) {
    console.error("❌ Erreur décodage fiche :", error);
    console.error("❌ Données reçues :", base64String.substring(0, 100) + "...");
    throw new Error("Impossible de décoder la fiche. Le QR Code est peut-être corrompu.");
  }
}
