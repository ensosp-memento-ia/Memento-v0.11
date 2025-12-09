// ===============================================================
// uiVariables.js – Gestion UI des variables pour CREATE MODE
// ===============================================================

let varCount = 0;
const MAX_VARS = 10;

export function initVariablesUI() {
  const btnAdd = document.getElementById("btnAddVariable");
  if (btnAdd) {
    btnAdd.addEventListener("click", addVariableUI);
  }
  
  const container = document.getElementById("variablesContainer");
  if (container) {
    container.innerHTML = "";
  }
  
  varCount = 0;
  addVariableUI(); // ajoute une variable vide par défaut
}

export function addVariableUI() {
  if (varCount >= MAX_VARS) {
    alert("Maximum 10 variables.");
    return;
  }

  varCount++;

  const container = document.getElementById("variablesContainer");
  if (!container) return;

  const div = document.createElement("div");
  div.className = "variable-item";
  div.dataset.index = varCount;

  div.innerHTML = `
    <label>Identifiant de la variable *</label>
    <input type="text" class="var-id" placeholder="Ex: produit" data-index="${varCount}">
    
    <label>Libellé affiché *</label>
    <input type="text" class="var-label" placeholder="Ex: Nom du produit chimique" data-index="${varCount}">
    
    <label>Type</label>
    <select class="var-type" data-index="${varCount}">
      <option value="text">Texte</option>
      <option value="number">Nombre</option>
      <option value="textarea">Texte long</option>
    </select>
    
    <label>Placeholder</label>
    <input type="text" class="var-placeholder" placeholder="Texte d'aide" data-index="${varCount}">
    
    <button class="btn-remove" data-index="${varCount}">🗑️ Supprimer</button>
  `;

  container.appendChild(div);

  // Événement suppression
  const btnRemove = div.querySelector(".btn-remove");
  if (btnRemove) {
    btnRemove.addEventListener("click", () => {
      div.remove();
      varCount--;
    });
  }
}

export function getVariablesFromUI() {
  const variables = [];
  const blocks = document.querySelectorAll(".variable-item");

  blocks.forEach((block) => {
    const idx = block.dataset.index;
    
    const id = block.querySelector(".var-id")?.value.trim() || "";
    const label = block.querySelector(".var-label")?.value.trim() || "";
    const type = block.querySelector(".var-type")?.value || "text";
    const placeholder = block.querySelector(".var-placeholder")?.value.trim() || "";

    if (id && label) {
      variables.push({
        id,
        label,
        type,
        placeholder,
        required: true
      });
    }
  });

  return variables;
}
