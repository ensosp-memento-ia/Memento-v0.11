// ======================================================================
// urlEncoder.js – Encodage fiche vers URL cliquable
// ======================================================================

import { encodeFiche } from "./compression.js";

/**
 * Génère une URL cliquable pour ouvrir directement une fiche
 * @param {Object} fiche - La fiche à encoder
 * @param {string} baseUrl - URL de base de l'application
 * @returns {string} URL complète avec paramètres
 */
export function generateFicheUrl(fiche, baseUrl = window.location.origin) {
  // Encoder la fiche
  const encoded = encodeFiche(fiche);
  
  // Encoder en Base64 URL-safe (remplacement des caractères problématiques)
  const urlSafeData = encoded.wrapperString
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
  
  // Construire l'URL
  const url = `${baseUrl}/scan.html?fiche=${encodeURIComponent(urlSafeData)}`;
  
  console.log("🔗 URL générée :", url);
  console.log("📏 Longueur URL :", url.length);
  
  // Avertissement si URL trop longue
  if (url.length > 2000) {
    console.warn("⚠️ URL très longue (" + url.length + " caractères), peut poser problème dans certains navigateurs");
  }
  
  return url;
}

/**
 * Génère un lien court (optionnel - nécessite service externe)
 * Pour l'instant, retourne l'URL complète
 * @param {string} ficheUrl - URL de la fiche
 * @returns {Promise<string>} URL courte (ou URL originale si service indisponible)
 */
export async function generateShortUrl(ficheUrl) {
  // À implémenter avec un service comme bit.ly, tinyurl, etc.
  // Pour l'instant, on retourne simplement l'URL complète
  console.log("ℹ️ Service de raccourcissement d'URL non configuré");
  return ficheUrl;
}
