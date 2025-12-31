// ======================================================================
// createFiche.js – Module principal de l'onglet création de fiche IA RCH
// Version corrigée : QR Code contient l'URL + Support "NC" pour indices IA
// ======================================================================

import { initVariablesUI, getVariablesFromUI } from "./uiVariables.js";
import { getMetaFromUI, resetMetaUI } from "./uiMeta.js";
import { getPromptFromUI, resetPromptUI } from "./uiPrompt.js";
import { resetConfidenceIndexes } from "./uiReset.js";
import { encodeFiche } from "../core/compression.js";
import { generateQrForFiche } from "../core/qrWriter.js";
import { generateFicheUrl } from "../core/urlEncoder.js";
import { loadFicheFromUrl } from "./loadFicheFromUrl.js";

// ================================================================
// INITIALISATION DE LA PAGE
// ================================================================
document.addEventListener("DOMContentLoaded", () => {

    console.log("🔧 createFiche.js chargé");

    // Pré-remplit la date du jour
    const dateField = document.getElementById("meta_date");
    if (dateField) {
        const today = new Date().toISOString().slice(0, 10);
        dateField.value = today;
    }

    // Initialise l'UI Variables
    initVariablesUI();

    // Bouton principal : Générer JSON + QR
    const btnGenerate = document.getElementById("btnGenerate");
    if (btnGenerate) {
        btnGenerate.addEventListener("click", onGenerate);
    }

    // Bouton RESET
    const btnReset = document.getElementById("btnReset");
    if (btnReset) {
        btnReset.addEventListener("click", onReset);
    }
    // Bouton CHARGER FICHE
    const btnLoadFiche = document.getElementById("btnLoadFiche");
    if (btnLoadFiche) {
        btnLoadFiche.addEventListener("click", loadFicheFromUrl);
    }
});


// ================================================================
// ✅ FONCTION MODIFIÉE : Récupérer les indices IA (avec support NC)
// ================================================================
function getAIIndicesFromUI() {
    const chatgpt = document.getElementById("aiChatGPT");
    const perplexity = document.getElementById("aiPerplexity");
    const mistral = document.getElementById("aiMistral");

    // Fonction helper pour gérer NC et les valeurs numériques
    function parseIndexValue(element, defaultValue = 3) {
        if (!element) return defaultValue;
        
        const value = element.value;
        
        // ✅ Si c'est "NC", on garde la string
        if (value === "NC") {
            console.log(`  - Indice "${element.id}" : NC (Non classé)`);
            return "NC";
        }
        
        // Sinon on parse en nombre
        const parsed = parseInt(value);
        if (isNaN(parsed)) {
            console.warn(`⚠️ Valeur invalide pour ${element.id}, fallback à ${defaultValue}`);
            return defaultValue;
        }
        
        console.log(`  - Indice "${element.id}" : ${parsed}`);
        return parsed;
    }

    console.log("📊 Récupération des indices IA :");
    
    return {
        chatgpt: parseIndexValue(chatgpt),
        perplexity: parseIndexValue(perplexity),
        mistral: parseIndexValue(mistral)
    };
}


// ================================================================
// GÉNÉRATION JSON + QR CODE
// ================================================================
async function onGenerate() {
    console.log("🟦 Génération de la fiche demandée…");

    let meta, vars, prompt, aiIndices;

    try {
        meta = getMetaFromUI();
        vars = getVariablesFromUI();
        prompt = getPromptFromUI();
        aiIndices = getAIIndicesFromUI();
    }
    catch (e) {
        alert("❌ Erreur dans la saisie : " + e.message);
        console.error("Erreur saisie :", e);
        return;
    }

    // Vérification prompt
    if (!prompt) {
        alert("⚠️ Le prompt ne peut pas être vide !");
        return;
    }

    if (prompt.length > 4000) {
        alert("❌ Le prompt dépasse 4000 caractères !");
        return;
    }

    // Construction JSON final (AVEC indices IA)
    const fiche = {
        meta,
        ai: aiIndices,
        prompt: {
            base: prompt,
            variables: vars
        }
    };

    console.log("📦 Fiche JSON construite :", fiche);

    // Compression + wrapper
    let encoded;
    try {
        encoded = encodeFiche(fiche);
        console.log("📊 Stats compression :", encoded.stats);

        // ⚠️ Vérification taille finale
        if (encoded.stats.base64 > 2900) {
            const confirm = window.confirm(
                `⚠️ Attention : QR volumineux (${encoded.stats.base64} caractères).\n` +
                `Il pourrait être difficile à scanner.\n\n` +
                `Voulez-vous continuer ?`
            );
            if (!confirm) return;
        }
    }
    catch (err) {
        alert("❌ Erreur compression : " + err.message);
        console.error("Erreur compression :", err);
        return;
    }

    // ================================================================
    // ✅ ÉTAPE 1 : GÉNÉRER L'URL EN PREMIER
    // ================================================================
    let ficheUrl;
    const urlContainer = document.getElementById("urlContainer");
    const generatedUrlInput = document.getElementById("generatedUrlCreate");
    
    console.log("🔗 Génération de l'URL cliquable...");
    
    try {
        // Générer l'URL
        ficheUrl = generateFicheUrl(fiche);
        
        // Afficher l'URL
        if (generatedUrlInput) {
            generatedUrlInput.value = ficheUrl;
        }
        if (urlContainer) {
            urlContainer.style.display = "block";
        }
        
        console.log("✅ URL générée avec succès");
        console.log("  - Longueur:", ficheUrl.length, "caractères");
        
    } catch (err) {
        console.error("❌ Erreur génération URL :", err);
        alert("❌ Impossible de générer l'URL : " + err.message);
        return;
    }

    // ================================================================
    // ✅ ÉTAPE 2 : GÉNÉRER LE QR CODE AVEC L'URL
    // ================================================================
    const qrContainer = document.getElementById("qrContainer");
    if (qrContainer) {
        qrContainer.innerHTML = "<p>⏳ Génération du QR Code...</p>";

        try {
            // ✅ MODIFICATION PRINCIPALE : Utiliser l'URL au lieu des données
            console.log("📱 Génération du QR Code avec l'URL...");
            
            // Générer le QR avec l'URL au lieu de fiche
            const result = generateQrForFiche(ficheUrl, "qrContainer");
            
            console.log("🎉 QR généré avec l'URL !");
            console.log("  - Taille QR:", result.qrSize, "px");
            console.log("  - Contenu: URL (", ficheUrl.length, "caractères)");
            
            // Ajout d'un message de succès
            const successMsg = document.createElement("p");
            successMsg.style.color = "#1dbf65";
            successMsg.style.fontWeight = "600";
            successMsg.style.marginTop = "15px";
            successMsg.textContent = "✅ QR Code généré avec l'URL de la fiche !";
            qrContainer.appendChild(successMsg);
            
            // Info supplémentaire
            const infoMsg = document.createElement("p");
            infoMsg.style.color = "#666";
            infoMsg.style.fontSize = "12px";
            infoMsg.style.marginTop = "5px";
            infoMsg.textContent = `Scanner ce QR ouvrira directement la fiche dans le navigateur`;
            qrContainer.appendChild(infoMsg);
            
        } catch (err) {
            alert("❌ Erreur génération QR : " + err.message);
            console.error("Erreur QR :", err);
            qrContainer.innerHTML = "<p style='color:#ff4d4d;'>❌ Erreur lors de la génération</p>";
            return;
        }
    }
}

// ================================================================
// GESTION DU BOUTON COPIER L'URL
// ================================================================
const btnCopyUrlCreate = document.getElementById("btnCopyUrlCreate");
if (btnCopyUrlCreate) {
    btnCopyUrlCreate.addEventListener("click", async () => {
        const urlInput = document.getElementById("generatedUrlCreate");
        const url = urlInput?.value;
        
        if (!url) {
            alert("⚠️ Aucune URL à copier");
            return;
        }

        try {
            await navigator.clipboard.writeText(url);
            
            // Feedback visuel animé
            const originalText = btnCopyUrlCreate.textContent;
            const originalBg = btnCopyUrlCreate.style.background;
            
            btnCopyUrlCreate.textContent = "✅ URL copiée !";
            btnCopyUrlCreate.style.background = "#1dbf65";
            btnCopyUrlCreate.style.transition = "all 0.3s ease";
            
            setTimeout(() => {
                btnCopyUrlCreate.textContent = originalText;
                btnCopyUrlCreate.style.background = originalBg;
            }, 2000);

            console.log("✅ URL copiée dans le presse-papiers");

        } catch (e) {
            console.error("❌ Erreur lors de la copie :", e);
            
            // Fallback : sélectionner le texte
            urlInput.select();
            urlInput.setSelectionRange(0, 99999);
            
            try {
                document.execCommand('copy');
                alert("✅ URL copiée !");
            } catch (err) {
                alert("❌ Impossible de copier automatiquement. Veuillez copier manuellement.");
            }
        }
    });
}


// ================================================================
// RESET COMPLET
// ================================================================
function onReset() {
    const confirm = window.confirm("⚠️ Voulez-vous vraiment tout réinitialiser ?");
    if (!confirm) return;

    console.log("🔄 Réinitialisation complète demandée");

    // 1. Métadonnées
    resetMetaUI();

    // 2. Variables
    initVariablesUI();

    // 3. Prompt
    resetPromptUI();

    // 4. Indices IA → remise à 3
    resetConfidenceIndexes();

    // 5. Nettoyer QR
    const qrContainer = document.getElementById("qrContainer");
    if (qrContainer) qrContainer.innerHTML = "";

    // 6. Nettoyer URL
    const urlContainer = document.getElementById("urlContainer");
    const generatedUrlInput = document.getElementById("generatedUrlCreate");
    if (urlContainer) urlContainer.style.display = "none";
    if (generatedUrlInput) generatedUrlInput.value = "";

    // 7. Remettre la date du jour
    const dateField = document.getElementById("meta_date");
    if (dateField) {
        const today = new Date().toISOString().slice(0, 10);
        dateField.value = today;
    }

    console.log("♻️ Réinitialisation terminée");
}
