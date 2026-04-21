// ======================================================================
// uiPrompt.js — Gestion du prompt IA RCH
// v0.11.21 : Compteur simplifié (nb chars brut, sans mention de limite)
// ======================================================================

/**
 * Initialise le compteur de caractères du prompt.
 * Affiche uniquement le nombre de caractères saisis, sans barre de progression
 * ni mention de limite — neutre visuellement.
 */
export function initPromptUI() {
  const input   = document.getElementById("prompt_input");
  const counter = document.getElementById("prompt_count");

  if (!input || !counter) {
    console.warn("⚠️ Champs prompt non trouvés, initialisation ignorée");
    return;
  }

  input.addEventListener("input", () => updateCounter(input, counter));
  updateCounter(input, counter);

  console.log("✅ UI Prompt initialisée");
}

/**
 * Met à jour le compteur de caractères.
 * Affiche : "X caractères" — sans limite, sans couleur d'alerte.
 */
function updateCounter(input, counter) {
  const length = input.value.length;
  counter.textContent = `${length} caractère${length !== 1 ? "s" : ""}`;
  counter.style.color      = "#888";
  counter.style.fontWeight = "400";
}

/**
 * Récupère le prompt depuis l'UI.
 * La validation de la taille QR est déléguée à createFiche.js
 * au moment de la génération.
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

  return value;
}

/**
 * Réinitialise le champ prompt et le compteur.
 */
export function resetPromptUI() {
  const input   = document.getElementById("prompt_input");
  const counter = document.getElementById("prompt_count");

  if (input)   input.value = "";
  if (counter) {
    counter.textContent  = "0 caractère";
    counter.style.color  = "#888";
    counter.style.fontWeight = "400";
  }

  console.log("🔄 Prompt réinitialisé");
}

/**
 * Charge un prompt existant dans l'interface et met à jour le compteur.
 * @param {string} promptText
 */
export function setPromptToUI(promptText) {
  const input   = document.getElementById("prompt_input");
  const counter = document.getElementById("prompt_count");

  if (input && promptText) {
    input.value = promptText;

    if (counter) {
      const length = promptText.length;
      counter.textContent  = `${length} caractère${length !== 1 ? "s" : ""}`;
      counter.style.color  = "#888";
      counter.style.fontWeight = "400";
    }

    console.log("✅ Prompt chargé :", promptText.length, "caractères");
  }
}

// Auto-initialisation au chargement
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initPromptUI);
} else {
  initPromptUI();
}
