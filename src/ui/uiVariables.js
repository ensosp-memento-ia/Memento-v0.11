// ===============================================================
// uiVariables.js — Gestion UI des variables pour CREATE MODE
// ===============================================================

let varCount = 0;
const MAX_VARS = 10;

export function initVariablesUI() {
  document.getElementById("btnAddVariable").addEventListener("click", addVariableUI);
  document.getElementById("variablesContainer").innerHTML = "";
  varCount = 0;
  addVariableUI(); // ajoute une variable vide par défaut
}

export function addVariableUI() {
  if (varCount >= MAX_VARS) return alert("Maximum 10 variables.");

  varCount++;

  const container = document.getElementById("variablesContainer");

  const div = document.createElement("div");
  div.className = "variableBlock";
  div.dataset.index = varCount;

  div.innerHTML = `
    <input class="input" placeholder="Label (ex : Code ONU)" id="var_label_${varCount}">
    <input class="input" placeholder="Identifiant (ex : code_onu)" id="var_id_${varCount}">

    <select class="input varTypeSelect" id="var_type_${varCount}">
      <option value="text">text</option>
      <option value="number">number</option>
      <option value="choice">choice</option>
      <option value="geoloc">geoloc</option>
    </select>

    <div id="var_choice_options_${varCount}" class="choiceOptions hidden">
      <input class="input" placeholder="Choix séparés par ;" id="var_opts_${varCount}">
      <p class="helper-small">Exemple : rouge ; vert ; bleu</p>
    </div>

    <label class="checkbox">
      <input type="checkbox" id="var_req_${varCount}">
      Obligatoire
    </label>

    <button class="btnSmall" data-del="${varCount}">Supprimer</button>
  `;

  // Suppression du bloc
  div.querySelector("button").addEventListener("click", () => {
    div.remove();
    varCount--;
  });

  // Détection du type pour afficher les options
  const typeSelect = div.querySelector(".varTypeSelect");
  typeSelect.addEventListener("change", () => {
    const optBox = document.getElementById(`var_choice_options_${varCount}`);
    if (typeSelect.value === "choice") {
      optBox.classList.remove("hidden");
    } else {
      optBox.classList.add("hidden");
    }
  });

  container.appendChild(div);
}
// ======================================================================
// AJOUT À uiVariables.js
// Fonction pour charger les variables depuis une fiche
// ======================================================================

/**
 * Charge les variables d'une fiche dans l'interface
 * @param {Array} variables - Tableau de variables à charger
 */
export function setVariablesToUI(variables) {
    if (!Array.isArray(variables) || variables.length === 0) {
        console.log("  ℹ️ Aucune variable à charger");
        return;
    }
    
    // Vider les variables actuelles
    const container = document.getElementById("variablesContainer");
    if (!container) {
        console.error("❌ Conteneur variables introuvable");
        return;
    }
    
    container.innerHTML = "";
    
    // Recréer chaque variable
    variables.forEach((variable, index) => {
        // Créer un bloc variable
        const block = document.createElement("div");
        block.className = "variable-item";
        block.dataset.index = index;
        
        // HTML du bloc variable
        block.innerHTML = `
            <div style="display:flex;gap:10px;align-items:flex-start;">
                <div style="flex:1;">
                    <label>Identifiant
                        <input type="text" class="var-id" value="${variable.id || ''}" placeholder="Ex: produit">
                    </label>
                </div>
                <div style="flex:1;">
                    <label>Label
                        <input type="text" class="var-label" value="${variable.label || ''}" placeholder="Ex: Nom du produit">
                    </label>
                </div>
                <div style="flex:0.7;">
                    <label>Type
                        <select class="var-type">
                            <option value="text" ${variable.type === 'text' ? 'selected' : ''}>Texte</option>
                            <option value="number" ${variable.type === 'number' ? 'selected' : ''}>Nombre</option>
                            <option value="textarea" ${variable.type === 'textarea' ? 'selected' : ''}>Texte long</option>
                            <option value="choice" ${variable.type === 'choice' ? 'selected' : ''}>Choix</option>
                            <option value="geoloc" ${variable.type === 'geoloc' ? 'selected' : ''}>Géoloc</option>
                        </select>
                    </label>
                </div>
                <button class="btn-remove-var" data-index="${index}" style="align-self:flex-end;">❌</button>
            </div>
            
            <div style="margin-top:10px;">
                <label>Placeholder / Options
                    <input type="text" class="var-placeholder" value="${variable.placeholder || ''}" placeholder="Texte d'aide">
                </label>
            </div>
            
            <div style="margin-top:8px;">
                <label style="display:flex;align-items:center;gap:8px;">
                    <input type="checkbox" class="var-required" ${variable.required ? 'checked' : ''}>
                    <span>Champ requis</span>
                </label>
            </div>
        `;
        
        container.appendChild(block);
    });
    
    // Réattacher les événements de suppression
    attachRemoveEvents();
    
    console.log(`  ✅ ${variables.length} variable(s) chargée(s)`);
}

/**
 * Attache les événements de suppression aux boutons
 */
function attachRemoveEvents() {
    const removeButtons = document.querySelectorAll(".btn-remove-var");
    removeButtons.forEach(btn => {
        btn.addEventListener("click", (e) => {
            const block = e.target.closest(".variable-item");
            if (block) {
                block.remove();
            }
        });
    });
}

// ======================================================================
// FONCTIONS EXISTANTES restent inchangées
// ======================================================================

// ===============================================================
// EXTRACTION DU JSON FINAL
// ===============================================================
export function getVariablesFromUI() {
  const blocks = [...document.querySelectorAll(".variableBlock")];
  const vars = [];

  const ids = new Set();

  for (const b of blocks) {
    const idx = b.dataset.index;

    const label = document.getElementById(`var_label_${idx}`).value.trim();
    const id = document.getElementById(`var_id_${idx}`).value.trim();
    const type = document.getElementById(`var_type_${idx}`).value;
    const req = document.getElementById(`var_req_${idx}`).checked;

    if (!label || !id) continue;

    if (ids.has(id)) {
      throw new Error(`Identifiant '${id}' dupliqué.`);
    }
    ids.add(id);

    let entry = { id, label, type, required: req };

    // Gestion du type CHOICE
    if (type === "choice") {
      const raw = document.getElementById(`var_opts_${idx}`).value.trim();
      const opts = raw.split(";").map(s => s.trim()).filter(s => s.length > 0);

      if (opts.length < 2) {
        throw new Error(`La variable '${label}' doit avoir au moins deux choix.`);
      }

      entry.options = opts;
    }

    vars.push(entry);
  }

  return vars;
}
