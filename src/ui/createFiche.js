// ======================================================================
// createFiche.js — Module principal de l'onglet création de fiche IA RCH
// Version corrigée : ajout des indices IA + validation renforcée + génération URL
// ======================================================================

import { initVariablesUI, getVariablesFromUI } from "./uiVariables.js";
import { getMetaFromUI, resetMetaUI } from "./uiMeta.js";
import { getPromptFromUI, resetPromptUI } from "./uiPrompt.js";
import { resetConfidenceIndexes } from "./uiReset.js";
import { encodeFiche } from "../core/compression.js";
import { generateQrForFiche } from "../core/qrWriter.js";
import { generateFicheUrl } from "../core/urlEncoder.js";

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

});


// ================================================================
// NOUVELLE FONCTION : Récupérer les indices IA
// ================================================================
function getAIIndicesFromUI() {
    const chatgpt = document.getElementById("aiChatGPT");
    const perplexity = document.getElementById("aiPerplexity");
    const mistral = document.getElementById("aiMistral");

    return {
        chatgpt: chatgpt ? parseInt(chatgpt.value) : 3,
        perplexity: perplexity ? parseInt(perplexity.value) : 3,
        mistral: mistral ? parseInt(mistral.value) : 3
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
        ai: aiIndices,  // ✅ CORRECTION : ajout des indices
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

    // Génération QR
    const qrContainer = document.getElementById("qrContainer");
    if (qrContainer) {
        qrContainer.innerHTML = "<p>⏳ Génération du QR Code...</p>";

        try {
            const result = generateQrForFiche(fiche, "qrContainer");
            console.log("🎉 QR généré ! Taille :", result.qrSize, "px");
            
            // Ajout d'un message de succès
            const successMsg = document.createElement("p");
            successMsg.style.color = "#1dbf65";
            successMsg.style.fontWeight = "600";
            successMsg.style.marginTop = "15px";
            successMsg.textContent = "✅ QR Code généré avec succès !";
            qrContainer.appendChild(successMsg);
        }
        catch (err) {
            alert("❌ Erreur génération QR : " + err.message);
            console.error("Erreur QR :", err);
            qrContainer.innerHTML = "<p style='color:#ff4d4d;'>❌ Erreur lors de la génération</p>";
            return; // Arrêter si le QR a échoué
        }
    }

    // ================================================================
    // ✅ NOUVELLE FONCTIONNALITÉ : GÉNÉRATION DE L'URL
    // ================================================================
    const urlContainer = document.getElementById("urlContainer");
    const generatedUrlInput = document.getElementById("generatedUrlCreate");
    
    if (urlContainer && generatedUrlInput) {
        console.log("🔗 Génération de l'URL cliquable...");
        
        try {
            // Générer l'URL
            const ficheUrl = generateFicheUrl(fiche);
            
            // Afficher l'URL
            generatedUrlInput.value = ficheUrl;
            urlContainer.style.display = "block";
            
            console.log("✅ URL générée avec succès");
            console.log("  - Longueur:", ficheUrl.length, "caractères");
            
        } catch (err) {
            console.error("❌ Erreur génération URL :", err);
            // Ne pas bloquer si l'URL échoue, le QR est déjà généré
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
