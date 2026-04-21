// ======================================================================
// loadFicheFromUrl.js – Chargement et pré-remplissage depuis URL
// ======================================================================

import { decodeFiche } from "../core/compression.js";
import { setMetaToUI } from "./uiMeta.js";
import { setPromptToUI } from "./uiPrompt.js";
import { setVariablesToUI } from "./uiVariables.js";

/**
 * Affiche une popup pour demander l'URL à l'utilisateur
 * Décode la fiche et pré-remplit tous les champs
 */
export function loadFicheFromUrl() {
    console.log("🔗 Demande de chargement depuis URL...");
    
    // Demander l'URL à l'utilisateur
    const url = prompt(
        "📥 Charger une fiche existante\n\n" +
        "Collez l'URL complète de la fiche :\n" +
        "(Format : https://...scan.html?fiche=...)"
    );
    
    if (!url) {
        console.log("❌ Chargement annulé");
        return;
    }
    
    console.log("🔍 URL fournie :", url.substring(0, 100) + "...");
    
    try {
        // Extraire le paramètre fiche de l'URL
        const urlObj = new URL(url);
        const ficheParam = urlObj.searchParams.get('fiche');
        
        if (!ficheParam) {
            throw new Error("Paramètre 'fiche' introuvable dans l'URL");
        }
        
        console.log("✅ Paramètre 'fiche' extrait");
        
        // Décoder la fiche (decodeFiche gère Base64URL et Base64 standard)
        const fiche = decodeFiche(ficheParam);
        
        console.log("✅ Fiche décodée :", fiche);
        
        // Pré-remplir les champs
        loadFicheToUI(fiche);
        
        // Message de succès
        alert(
            "✅ Fiche chargée avec succès !\n\n" +
            `Titre : ${fiche.meta?.titre || "Sans titre"}\n` +
            `Vous pouvez maintenant modifier les champs et générer une nouvelle version.`
        );
        
        // Scroll vers le haut
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
    } catch (error) {
        console.error("❌ Erreur chargement fiche :", error);
        alert(
            "❌ Impossible de charger la fiche\n\n" +
            "Erreur : " + error.message + "\n\n" +
            "Vérifiez que l'URL est complète et valide."
        );
    }
}

/**
 * Charge une fiche décodée dans l'interface
 * @param {Object} fiche - Fiche à charger
 */
function loadFicheToUI(fiche) {
    console.log("📝 Pré-remplissage de l'interface...");
    
    // 1. Métadonnées
    if (fiche.meta) {
        setMetaToUI(fiche.meta);
        console.log("  ✅ Métadonnées chargées");
    }
    
    // 2. Indices IA
    if (fiche.ai) {
        setAIIndicesToUI(fiche.ai);
        console.log("  ✅ Indices IA chargés");
    }
    
    // 3. Variables
    if (fiche.prompt?.variables) {
        setVariablesToUI(fiche.prompt.variables);
        console.log("  ✅ Variables chargées");
    }
    
    // 4. Prompt
    if (fiche.prompt?.base) {
        setPromptToUI(fiche.prompt.base);
        console.log("  ✅ Prompt chargé");
    }
    
    console.log("✅ Interface complètement pré-remplie");
}

/**
 * Charge les indices IA dans les sélecteurs
 * @param {Object} ai - Indices IA
 */
function setAIIndicesToUI(ai) {
    const chatgpt = document.getElementById("aiChatGPT");
    const perplexity = document.getElementById("aiPerplexity");
    const mistral = document.getElementById("aiMistral");
    const claude = document.getElementById("aiClaude");
    
    if (chatgpt && ai.chatgpt !== undefined) {
        chatgpt.value = String(ai.chatgpt);
    }
    
    if (perplexity && ai.perplexity !== undefined) {
        perplexity.value = String(ai.perplexity);
    }
    
    if (mistral && ai.mistral !== undefined) {
        mistral.value = String(ai.mistral);
    }

    // Compatibilité ascendante : fiches sans champ claude → NC par défaut
    if (claude) {
        claude.value = ai.claude !== undefined ? String(ai.claude) : "NC";
    }
}
