// ======================================================================
// uiPrompt.js — Gestion du prompt IA RCH
// Version corrigée : initialisation auto + validation temps réel + setPromptToUI
// ======================================================================

const MAX_PROMPT = 8000;

/**
 * Initialise le système de compteur de caractères
 * Appelée automatiquement au chargement
 */
export function initPromptUI() {
  const input = document.getElementById("prompt_input");
  const counter = document.getElementById("prompt_count");
  
  if (!input || !counter) {
    console.warn("⚠️ Champs prompt non trouvés, initialisation ignorée");
    return;
  }
  
  // Mise à jour temps réel
  input.addEventListener("input", () => {
    updateCounter(input, counter);
  });
  
  // Initialisation compteur
  updateCounter(input, counter);
  
  console.log("✅ UI Prompt initialisée");
}

/**
 * Met à jour le compteur avec code couleur
 */
function updateCounter(input, counter) {
  const length = input.value.length;
  
  // Troncature si dépassement
  if (length > MAX_PROMPT) {
    input.value = input.value.slice(0, MAX_PROMPT);
    counter.textContent = `${MAX_PROMPT} / ${MAX_PROMPT}`;
    counter.style.color = "#ff4d4d";
    counter.style.fontWeight = "700";
    return;
  }
  
  counter.textContent = `${length} / ${MAX_PROMPT}`;
  
  // Code couleur selon le remplissage
  if (length > MAX_PROMPT * 0.9) {
    counter.style.color = "#ff4d4d"; // Rouge : > 90%
    counter.style.fontWeight = "700";
  } else if (length > MAX_PROMPT * 0.7) {
    counter.style.color = "#ff9f1c"; // Orange : > 70%
    counter.style.fontWeight = "600";
  } else {
    counter.style.color = "#555"; // Gris : < 70%
    counter.style.fontWeight = "400";
  }
}

/**
 * Récupère le prompt depuis l'UI
 */
export function getPromptFromUI() {
  const input = document.getElementById("prompt_input");
  
  if (!input) {
    throw new Error("❌ Champ prompt introuvable.");
  }
  
  const value = input.value.trim();
  
  if (!value) {
    throw new Error("⚠️ Le prompt ne peut pas être vide.");
  }
  
  if (value.length > MAX_PROMPT) {
    // ✅ CORRECTION : Parenthèses au lieu de backticks
    throw new Error(`⚠️ Le prompt dépasse ${MAX_PROMPT} caractères.`);
  }
  
  return value;
}

/**
 * Réinitialise le champ prompt
 */
export function resetPromptUI() {
  const input = document.getElementById("prompt_input");
  const counter = document.getElementById("prompt_count");
  
  if (input) {
    input.value = "";
  }
  
  if (counter) {
    counter.textContent = `0 / ${MAX_PROMPT}`;
    counter.style.color = "#555";
    counter.style.fontWeight = "400";
  }
  
  console.log("🔄 Prompt réinitialisé");
}

/**
 * Charge le prompt d'une fiche dans l'interface
 * @param {string} promptText - Texte du prompt à charger
 */
export function setPromptToUI(promptText) {
  const promptEl = document.getElementById("prompt_input");
  
  if (promptEl && promptText) {
    promptEl.value = promptText;
    
    // Mettre à jour le compteur de caractères
    const counterEl = document.getElementById("prompt_count");
    if (counterEl) {
      const length = promptText.length;
      counterEl.textContent = `${length} / ${MAX_PROMPT}`;
      
      // ✅ AJOUT : Appliquer le code couleur aussi
      if (length > MAX_PROMPT * 0.9) {
        counterEl.style.color = "#ff4d4d";
        counterEl.style.fontWeight = "700";
      } else if (length > MAX_PROMPT * 0.7) {
        counterEl.style.color = "#ff9f1c";
        counterEl.style.fontWeight = "600";
      } else {
        counterEl.style.color = "#555";
        counterEl.style.fontWeight = "400";
      }
    }
    
    console.log("✅ Prompt chargé :", length, "caractères");
  }
}

// ✅ Auto-initialisation au chargement
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initPromptUI);
} else {
  // DOM déjà chargé
  initPromptUI();
}
