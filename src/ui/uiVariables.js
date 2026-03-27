// ===============================================================
// uiVariables.js — Gestion UI des variables pour CREATE MODE
// Version corrigée : Support chargement depuis URL
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

// ===============================================================
// ✅ NOUVEAU : CHARGEMENT DEPUIS FICHE
// ===============================================================

/**
 * Charge les variables d'une fiche dans l'interface
 * @param {Array} variables - Tableau de variables à charger
 */
export function setVariablesToUI(variables) {
    if (!Array.isArray(variables) || variables.length === 0) {
        console.log("  ℹ️ Aucune variable à charger");
        // Initialiser avec une variable vide par défaut
        initVariablesUI();
        return;
    }
    
    const container = document.getElementById("variablesContainer");
    if (!container) {
        console.error("❌ Conteneur variables introuvable");
        return;
    }
    
    // Vider et réinitialiser
    container.innerHTML = "";
    varCount = 0;
    
    // Recréer chaque variable
    variables.forEach((variable) => {
        varCount++;
        
        const div = document.createElement("div");
        div.className = "variableBlock";
        div.dataset.index = varCount;
        
        // Construire le HTML avec les valeurs
        div.innerHTML = `
            <input class="input" placeholder="Label (ex : Code ONU)" id="var_label_${varCount}" value="${variable.label || ''}">
            <input class="input" placeholder="Identifiant (ex : code_onu)" id="var_id_${varCount}" value="${variable.id || ''}">

            <select class="input varTypeSelect" id="var_type_${varCount}">
              <option value="text" ${variable.type === 'text' ? 'selected' : ''}>text</option>
              <option value="number" ${variable.type === 'number' ? 'selected' : ''}>number</option>
              <option value="choice" ${variable.type === 'choice' ? 'selected' : ''}>choice</option>
              <option value="geoloc" ${variable.type === 'geoloc' ? 'selected' : ''}>geoloc</option>
            </select>

            <div id="var_choice_options_${varCount}" class="choiceOptions ${variable.type === 'choice' ? '' : 'hidden'}">
              <input class="input" placeholder="Choix séparés par ;" id="var_opts_${varCount}" value="${variable.options ? variable.options.join(' ; ') : ''}">
              <p class="helper-small">Exemple : rouge ; vert ; bleu</p>
            </div>

            <label class="checkbox">
              <input type="checkbox" id="var_req_${varCount}" ${variable.required ? 'checked' : ''}>
              Obligatoire
            </label>

            <button class="btnSmall" data-del="${varCount}">Supprimer</button>
        `;
        
        // Suppression du bloc
        const currentIndex = varCount;
        div.querySelector("button").addEventListener("click", () => {
            div.remove();
            varCount--;
        });
        
        // Détection du type pour afficher les options
        const typeSelect = div.querySelector(".varTypeSelect");
        typeSelect.addEventListener("change", () => {
            const optBox = document.getElementById(`var_choice_options_${currentIndex}`);
            if (typeSelect.value === "choice") {
                optBox.classList.remove("hidden");
            } else {
                optBox.classList.add("hidden");
            }
        });
        
        container.appendChild(div);
    });
    
    console.log(`  ✅ ${variables.length} variable(s) chargée(s)`);
}
