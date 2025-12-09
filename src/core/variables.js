// ======================================================================
// variables.js – Gestion des variables dynamiques dans les prompts
// ======================================================================

/**
 * Construit le prompt final en remplaçant les variables par leurs valeurs
 * @param {string} basePrompt - Prompt de base avec {{variables}}
 * @param {Array} variables - Liste des variables avec leurs valeurs
 * @param {string} extraInfo - Informations complémentaires optionnelles
 * @returns {string} Prompt final avec variables remplacées
 */
export function buildFullPrompt(basePrompt, variables, extraInfo = "") {
  let prompt = basePrompt;

  // Remplacer chaque variable par sa valeur
  variables.forEach((v) => {
    const placeholder = `{{${v.id}}}`;
    const value = v.value || v.placeholder || `[${v.label}]`;
    prompt = prompt.replaceAll(placeholder, value);
  });

  // Ajouter les informations complémentaires si présentes
  if (extraInfo && extraInfo.trim()) {
    prompt += `\n\nInformations complémentaires :\n${extraInfo.trim()}`;
  }

  return prompt;
}

/**
 * Extrait les IDs de variables depuis un prompt (format {{id}})
 * @param {string} prompt - Prompt contenant des {{variables}}
 * @returns {Array<string>} Liste des IDs de variables trouvés
 */
export function extractVariableIds(prompt) {
  const regex = /\{\{([a-zA-Z0-9_]+)\}\}/g;
  const matches = [...prompt.matchAll(regex)];
  return matches.map((m) => m[1]);
}

/**
 * Valide qu'un prompt contient toutes les variables déclarées
 * @param {string} prompt - Prompt à valider
 * @param {Array} variables - Variables déclarées dans la fiche
 * @returns {Object} { valid: boolean, missingInPrompt: [], unusedVariables: [] }
 */
export function validatePromptVariables(prompt, variables) {
  const usedIds = extractVariableIds(prompt);
  const declaredIds = variables.map((v) => v.id);

  const missingInPrompt = declaredIds.filter((id) => !usedIds.includes(id));
  const unusedVariables = usedIds.filter((id) => !declaredIds.includes(id));

  return {
    valid: missingInPrompt.length === 0 && unusedVariables.length === 0,
    missingInPrompt,
    unusedVariables,
  };
}
