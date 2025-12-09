// ======================================================================
// jsonSchema.js – Validation et structure des fiches IA RCH
// ======================================================================

/**
 * Valide qu'une fiche contient les champs obligatoires
 * @param {Object} fiche - Objet fiche à valider
 * @returns {boolean} true si valide
 * @throws {Error} si invalide
 */
export function validateFiche(fiche) {
  const required = ['title', 'category', 'context', 'prompt'];

  for (const field of required) {
    if (!fiche[field] || fiche[field].trim() === '') {
      throw new Error(`Le champ "${field}" est obligatoire.`);
    }
  }

  if (!Array.isArray(fiche.variables)) {
    throw new Error('Le champ "variables" doit être un tableau.');
  }

  console.log("✅ Fiche valide");
  return true;
}

/**
 * Crée une structure de fiche vide
 * @returns {Object} Fiche vide avec structure par défaut
 */
export function createEmptyFiche() {
  return {
    title: "",
    category: "",
    context: "",
    version: "1.0",
    date: new Date().toISOString().split('T')[0],
    author: "",
    prompt: "",
    variables: [],
    ai: {
      chatgpt: 3,
      perplexity: 3,
      mistral: 3
    }
  };
}

/**
 * Crée une variable vide
 * @returns {Object} Variable avec structure par défaut
 */
export function createEmptyVariable() {
  return {
    id: `var_${Date.now()}`,
    label: "",
    type: "text",
    placeholder: "",
    required: true
  };
}
