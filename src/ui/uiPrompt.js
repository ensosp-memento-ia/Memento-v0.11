// ===============================================================
// uiPrompt.js – Gestion UI du prompt de base
// ===============================================================

export function initPromptUI() {
  const promptInput = document.getElementById("base_prompt");
  if (promptInput) {
    // Initialisation si nécessaire
    console.log("✅ Prompt UI initialisé");
  }
}

export function getPromptFromUI() {
  const promptInput = document.getElementById("base_prompt");
  return promptInput?.value.trim() || "";
}

export function resetPromptUI() {
  const promptInput = document.getElementById("base_prompt");
  if (promptInput) {
    promptInput.value = "";
  }
}
