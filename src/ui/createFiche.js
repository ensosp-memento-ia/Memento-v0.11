// ======================================================================
// createFiche.js – Module principal de l'onglet création de fiche IA RCH
// Version finale : QR avec URL + Support NC + Avertissement taille + QR adaptatif
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

    // ✅ Bouton CHARGER FICHE
    const btnLoadFiche = document.getElementById("btnLoadFiche");
    if (btnLoadFiche) {
        btnLoadFiche.addEventListener("click", loadFicheFromUrl);
        console.log("✅ Bouton Charger fiche initialisé");
    } else {
        console.warn("⚠️ Bouton btnLoadFiche introuvable");
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
    // ✅ ÉTAPE 1 : GÉNÉRER L'URL AVEC VÉRIFICATION TAILLE
    // ================================================================
    let ficheUrl;
    const urlContainer = document.getElementById("urlContainer");
    const generatedUrlInput = document.getElementById("generatedUrlCreate");
    
    console.log("🔗 Génération de l'URL cliquable...");
    
    try {
        // Générer l'URL
        ficheUrl = generateFicheUrl(fiche);
        
        // ✅ NOUVEAU : Vérifier la longueur de l'URL
        console.log("📊 Longueur URL générée:", ficheUrl.length, "caractères");
        
        // Afficher l'URL
        if (generatedUrlInput) {
            generatedUrlInput.value = ficheUrl;
        }
        if (urlContainer) {
            urlContainer.style.display = "block";
        }
        
        // ✅ NOUVEAU : Avertissement si URL très longue
        if (ficheUrl.length > 2500) {
            console.warn("⚠️ URL très longue:", ficheUrl.length, "caractères");
            
            // ✅ CORRECTION : Calculer le nombre de variables
            const nbVariables = Array.isArray(vars) ? vars.length : 0;
            
            const continueGeneration = confirm(
                `⚠️ ATTENTION : URL VOLUMINEUSE\n\n` +
                `Longueur : ${ficheUrl.length} caractères\n` +
                `Limite recommandée : 2000 caractères\n\n` +
                `Le QR Code généré risque d'être :\n` +
                `• Très dense et difficile à scanner\n` +
                `• Impossible à lire avec certains smartphones\n\n` +
                `RECOMMANDATIONS :\n` +
                `• Réduire le prompt (actuellement ${prompt.length} caractères)\n` +
                (nbVariables > 0 ? `• Limiter les variables (actuellement ${nbVariables})\n` : '') +
                `• Simplifier les métadonnées\n\n` +
                `Voulez-vous continuer malgré tout ?`
            );
            
            if (!continueGeneration) {
                console.log("❌ Génération annulée par l'utilisateur");
                // On garde l'URL affichée pour qu'ils puissent l'utiliser
                return;
            }
        }
        
        console.log("✅ URL générée avec succès");
        
    } catch (err) {
        console.error("❌ Erreur génération URL :", err);
        alert("❌ Impossible de générer l'URL : " + err.message);
        return;
    }

    // ================================================================
    // ✅ ÉTAPE 2 : GÉNÉRER LE QR CODE AVEC TAILLE ADAPTATIVE
    // ================================================================
    const qrContainer = document.getElementById("qrContainer");
    if (qrContainer) {
        qrContainer.innerHTML = "<p>⏳ Génération du QR Code...</p>";

        try {
            console.log("📱 Génération du QR Code avec l'URL...");
            
            // ✅ NOUVEAU : Taille adaptative selon longueur URL
            let qrSize = 512; // Taille par défaut
            
            if (ficheUrl.length > 2500) {
                qrSize = 1024; // Grande taille pour URLs longues
                console.log("  - URL longue détectée, taille QR augmentée à", qrSize, "px");
            } else if (ficheUrl.length > 2000) {
                qrSize = 768; // Taille intermédiaire
                console.log("  - URL moyenne, taille QR:", qrSize, "px");
            }
            
            // Générer le QR avec l'URL
            const result = generateQrForFiche(ficheUrl, "qrContainer", qrSize);
            
            console.log("🎉 QR généré avec succès !");
            console.log("  - Taille QR:", qrSize, "px");
            console.log("  - Longueur URL:", ficheUrl.length, "caractères");
            
            // ✅ NOUVEAU : Message adapté selon la longueur
            const successMsg = document.createElement("p");
            successMsg.style.fontWeight = "600";
            successMsg.style.marginTop = "15px";
            
            if (ficheUrl.length > 2500) {
                successMsg.style.color = "#ff9f1c"; // Orange - Avertissement
                successMsg.innerHTML = `
                    ⚠️ QR Code généré (${ficheUrl.length} car.)<br>
                    <small style="font-weight:400;">
                        Densité élevée - Scan mobile difficile possible.<br>
                        Préférez l'URL cliquable pour partager la fiche.
                    </small>
                `;
            } else if (ficheUrl.length > 2000) {
                successMsg.style.color = "#ff9f1c"; // Orange
                successMsg.innerHTML = `
                    ✅ QR Code généré (${ficheUrl.length} car.)<br>
                    <small style="font-weight:400;">
                        Densité moyenne - Testez le scan sur votre mobile.
                    </small>
                `;
            } else {
                successMsg.style.color = "#1dbf65"; // Vert - OK
                successMsg.innerHTML = `
                    ✅ QR Code généré avec succès !<br>
                    <small style="font-weight:400;">
                        Scanner ce QR ouvrira directement la fiche.
                    </small>
                `;
            }
            
            qrContainer.appendChild(successMsg);
            
        } catch (err) {
            console.error("❌ Erreur génération QR :", err);
            
            // ✅ Message d'erreur détaillé
            qrContainer.innerHTML = `
                <p style='color:#ff4d4d;font-weight:600;'>❌ Erreur lors de la génération du QR Code</p>
                <p style='font-size:14px;margin-top:10px;'>
                    L'URL est probablement trop longue (${ficheUrl.length} caractères).<br>
                    Limite maximale : ~2900 caractères
                </p>
                <p style='font-size:14px;margin-top:10px;background:#fff3cd;padding:10px;border-radius:6px;'>
                    <strong>💡 Solution :</strong><br>
                    Utilisez l'URL cliquable ci-dessus pour partager la fiche.<br>
                    Pour générer un QR Code, réduisez le contenu de la fiche.
                </p>
            `;
            
            // On n'affiche pas d'alert supplémentaire car le message est clair
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
