// ======================================================================
// urlEncoder.js — Génération d'URLs cliquables pour les fiches
// Version corrigée : détection automatique de l'environnement
// ======================================================================

import { encodeFiche } from "./compression.js";

/**
 * Génère une URL cliquable pour ouvrir directement une fiche dans scan.html
 * 
 * @param {Object} fiche - L'objet fiche contenant meta, ai, prompt
 * @param {string} baseUrl - URL de base (optionnelle, détectée automatiquement si omise)
 * @returns {string} URL complète avec paramètres encodés
 * 
 * @example
 * const url = generateFicheUrl(fiche);
 * // Résultat : https://example.com/scan.html?fiche=eyJ6IjoicDEiLC...
 */
export function generateFicheUrl(fiche, baseUrl = null) {
  
  // ---------------------------------------------------------------
  // 1. DÉTECTION AUTOMATIQUE DE L'URL DE BASE
  // ---------------------------------------------------------------
  if (!baseUrl) {
    const origin = window.location.origin;
    const pathname = window.location.pathname;
    
    console.log("🔍 Détection de l'environnement :");
    console.log("  - Origin:", origin);
    console.log("  - Pathname:", pathname);
    
    // Cas spécial : GitHub Pages avec sous-dossier
    // Ex : https://username.github.io/repo-name/page.html
    if (origin.includes("github.io")) {
      // Extraire le chemin jusqu'au dossier du repo
      const pathParts = pathname.split('/').filter(p => p);
      
      if (pathParts.length > 0) {
        // On garde le nom du repo (premier segment)
        const repoName = pathParts[0];
        baseUrl = `${origin}/${repoName}`;
        console.log("  ✅ GitHub Pages détecté :", baseUrl);
      } else {
        baseUrl = origin;
        console.log("  ✅ GitHub Pages (racine) :", baseUrl);
      }
    } 
    // Cas général : localhost ou domaine custom
    else {
      // On extrait le répertoire parent
      const directory = pathname.substring(0, pathname.lastIndexOf('/'));
      baseUrl = origin + directory;
      console.log("  ✅ Environnement local/custom détecté :", baseUrl);
    }
  } else {
    console.log("🌐 URL de base fournie manuellement :", baseUrl);
  }
  
  // ---------------------------------------------------------------
  // 2. ENCODAGE DE LA FICHE
  // ---------------------------------------------------------------
  let encoded;
  try {
    encoded = encodeFiche(fiche);
    console.log("📦 Fiche encodée avec succès");
    console.log("  - Taille JSON compacté :", encoded.stats.original,  "chars");
    console.log("  - Taille DEFLATE       :", encoded.stats.deflated,  "bytes");
    console.log("  - Taille Base64URL     :", encoded.stats.base64,    "chars");
    console.log("  - Taux de compression  :", encoded.stats.ratio,     "%");
  } catch (e) {
    console.error("❌ Erreur lors de l'encodage de la fiche :", e);
    throw new Error("Impossible d'encoder la fiche : " + e.message);
  }
  
  // ---------------------------------------------------------------
  // 3. CONSTRUCTION DE L'URL FINALE
  // ---------------------------------------------------------------
  // wrapperString est déjà en Base64URL (caractères URL-safe : A-Z a-z 0-9 - _)
  // → pas besoin d'encodeURIComponent, ce qui économise ~70–120 chars sur l'URL
  //   et réduit d'autant le payload du QR Code.
  const url = `${baseUrl}/scan.html?fiche=${encoded.wrapperString}`;
  
  console.log("🔗 URL générée :", url);
  console.log("📏 Longueur totale de l'URL :", url.length, "caractères");
  
  // ---------------------------------------------------------------
  // 4. AVERTISSEMENTS SI URL PROCHE DE LA LIMITE QR
  // ---------------------------------------------------------------
  // Limite réelle QR mode byte v40-L : 2953 chars (URL avec minuscules = mode byte forcé)
  // Seuil d'alerte opérationnel fixé à 2500 chars (marge de sécurité ~15%)
  if (url.length > 2953) {
    console.warn("⚠️ DÉPASSEMENT LIMITE QR : URL " + url.length + " chars > 2953 (QR v40-L byte)");
    console.warn("   Le QR Code ne pourra PAS être généré — utilisez l'URL cliquable.");
  } else if (url.length > 2500) {
    console.warn("⚠️ URL proche de la limite QR (" + url.length + "/2953 chars)");
    console.warn("   QR Code générable mais très dense — testez le scan sur mobile.");
  }
  
  return url;
}

/**
 * Extrait les paramètres de la fiche depuis l'URL actuelle
 * Utilisé par scan.html pour charger une fiche depuis un lien
 * 
 * @returns {string|null} Le paramètre fiche encodé, ou null si absent
 * 
 * @example
 * const ficheData = getFicheFromUrl();
 * if (ficheData) {
 *   const fiche = decodeFiche(ficheData);
 * }
 */
export function getFicheFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  const ficheParam = urlParams.get('fiche');
  
  if (ficheParam) {
    console.log("📥 Paramètre 'fiche' détecté dans l'URL");
    console.log("  - Longueur:", ficheParam.length, "caractères");
    return ficheParam;
  }
  
  console.log("ℹ️ Aucun paramètre 'fiche' dans l'URL");
  return null;
}

/**
 * Génère un lien court via un service externe (optionnel - non implémenté)
 * 
 * NOTES : Pour implémenter cette fonctionnalité, il faudrait :
 * - Créer un compte sur un service de raccourcissement (bit.ly, tinyurl, etc.)
 * - Obtenir une clé API
 * - Implémenter l'appel API ci-dessous
 * 
 * Pour l'instant, cette fonction retourne simplement l'URL complète.
 * 
 * @param {string} ficheUrl - L'URL complète à raccourcir
 * @returns {Promise<string>} L'URL raccourcie (ou l'URL originale si échec)
 */
export async function generateShortUrl(ficheUrl) {
  console.log("ℹ️ Fonction de raccourcissement d'URL non implémentée");
  console.log("   Retour de l'URL complète");
  
  // ⚠️ FUTURE IMPLÉMENTATION
  // Exemple avec bit.ly :
  /*
  try {
    const response = await fetch('https://api-ssl.bitly.com/v4/shorten', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer VOTRE_TOKEN_BITLY',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        long_url: ficheUrl,
        domain: "bit.ly"
      })
    });
    
    if (!response.ok) {
      throw new Error('Erreur API bit.ly');
    }
    
    const data = await response.json();
    console.log("✅ URL raccourcie :", data.link);
    return data.link;
    
  } catch (e) {
    console.error("❌ Erreur raccourcissement :", e);
    console.log("   Retour de l'URL complète");
    return ficheUrl;
  }
  */
  
  return ficheUrl;
}

/**
 * Valide qu'une URL est bien formée
 * 
 * @param {string} url - L'URL à valider
 * @returns {boolean} true si l'URL est valide
 */
export function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Copie une URL dans le presse-papier
 * 
 * @param {string} url - L'URL à copier
 * @returns {Promise<boolean>} true si la copie a réussi
 */
export async function copyUrlToClipboard(url) {
  try {
    await navigator.clipboard.writeText(url);
    console.log("✅ URL copiée dans le presse-papier");
    return true;
  } catch (e) {
    console.error("❌ Erreur lors de la copie :", e);
    
    // Fallback pour les navigateurs plus anciens
    try {
      const textarea = document.createElement('textarea');
      textarea.value = url;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      
      if (success) {
        console.log("✅ URL copiée (méthode fallback)");
        return true;
      }
    } catch (fallbackError) {
      console.error("❌ Erreur fallback :", fallbackError);
    }
    
    return false;
  }
}
