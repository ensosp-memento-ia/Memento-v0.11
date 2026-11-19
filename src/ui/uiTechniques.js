// ======================================================================
// uiTechniques.js — Aide au choix des techniques de prompt (create.html)
// Volet droit, fermé par défaut, ouvert/fermé en un clic.
//   - Onglet « Conseiller » : situation → combinaison recommandée
//   - Onglet « Catalogue »  : les techniques de la fiche 1.3, avec recherche par mot-clé
// Données : ./techniques.json (source unique — modifier les textes là-bas).
// Le module n'écrit que dans #prompt_input (insertion de blocs) et déclenche
// l'événement "input" : le compteur reste géré par uiPrompt.js.
// Aucune dépendance.
// ======================================================================

const DATA_URL = new URL("./techniques.json", import.meta.url);

let DATA = null;
let situation = null;
let enjeu = false;
const ouvertes = new Set();
const inseres  = new Set();
let recherche = "";

// ----------------------------------------------------------------------
// Utilitaires
// ----------------------------------------------------------------------
const $ = (id) => document.getElementById(id);

function el(tag, attrs = {}, ...kids) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") n.className = v;
    else if (k.startsWith("on")) n.addEventListener(k.slice(2), v);
    else n.setAttribute(k, v);
  }
  kids.flat().forEach((c) => {
    if (c === null || c === undefined || c === false) return;
    n.append(c instanceof Node ? c : document.createTextNode(c));
  });
  return n;
}

// Acronyme + nom complet (ex. « CoT — Chain-of-Thought »)
const titre = (t) => (t.acro ? `${t.acro} — ${t.nom}` : t.nom);

// Minuscules et sans accents : « Élevé » est trouvé par « eleve »
const norm = (s) => String(s).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

function toast(msg) {
  const t = $("aideToast");
  if (!t) return;
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => t.classList.remove("show"), 3800);
}

// ----------------------------------------------------------------------
// Ouverture / fermeture du volet (fermé par défaut)
// ----------------------------------------------------------------------
function isOpen() {
  return document.body.classList.contains("aide-open");
}

function setOpen(open) {
  document.body.classList.toggle("aide-open", open);
  document.querySelectorAll("[data-aide-toggle]").forEach((b) =>
    b.setAttribute("aria-expanded", String(open))
  );
  if (open) majBadges();
}

function showTab(name) {
  document.querySelectorAll(".aide-tabs button").forEach((b) =>
    b.setAttribute("aria-selected", String(b.dataset.tab === name))
  );
  $("tabConseiller").hidden = name !== "conseiller";
  $("tabCatalogue").hidden  = name !== "catalogue";
}

// ----------------------------------------------------------------------
// Insertion dans le prompt
// ----------------------------------------------------------------------
function inserer(ids) {
  const ta = $("prompt_input");
  if (!ta) return;

  const liste = DATA.ordre.filter((id) => ids.includes(id));
  const texte = liste.map((id) => DATA.techniques[id].bloc).join("\n\n");

  const s = ta.selectionStart ?? ta.value.length;
  const e = ta.selectionEnd ?? s;
  const avant = ta.value.slice(0, s);
  const apres = ta.value.slice(e);
  const pre  = avant ? (avant.endsWith("\n\n") ? "" : avant.endsWith("\n") ? "\n" : "\n\n") : "";
  const post = apres && !apres.startsWith("\n") ? "\n\n" : "";

  ta.value = avant + pre + texte + post + apres;
  const fin = (avant + pre + texte).length;
  ta.focus();
  ta.setSelectionRange(fin, fin);

  // uiPrompt.js écoute « input » pour mettre à jour le compteur
  ta.dispatchEvent(new Event("input", { bubbles: true }));

  liste.forEach((id) => inseres.add(id));
  majBadges();

  ta.classList.add("flash");
  setTimeout(() => ta.classList.remove("flash"), 900);

  const noms = liste.map((id) => DATA.techniques[id].acro || DATA.techniques[id].nom).join(", ");
  toast(`Inséré : ${noms} (+${texte.length.toLocaleString("fr-FR")} caractères). La taille maximale est vérifiée à la génération (section 5).`);
}

async function copier(texte) {
  try {
    await navigator.clipboard.writeText(texte);
  } catch (_) {
    const t = el("textarea", { style: "position:fixed;opacity:0" });
    t.value = texte;
    document.body.append(t);
    t.select();
    document.execCommand("copy");
    t.remove();
  }
  toast("Exemple copié dans le presse-papiers.");
}

// Badge « ✓ inséré » : visible tant que le prompt n'a pas été vidé
function majBadges() {
  const ta = $("prompt_input");
  if (ta && !ta.value.trim()) inseres.clear();
  document.querySelectorAll("[data-ok]").forEach((s) => {
    s.hidden = !inseres.has(s.dataset.ok);
  });
}

// ----------------------------------------------------------------------
// Onglet « Conseiller »
// ----------------------------------------------------------------------
function renderConseiller() {
  const c = $("tabConseiller");
  c.replaceChildren();
  c.append(el("p", { class: "aide-q" }, "Quelle est votre situation ?"));

  DATA.situations.forEach((s) => {
    c.append(
      el("button", {
        class: "sit", type: "button",
        "aria-pressed": String(situation === s.id),
        onclick: () => { situation = s.id; enjeu = false; renderConseiller(); }
      }, s.label)
    );
  });

  const s = DATA.situations.find((x) => x.id === situation);
  if (!s) return;

  if (s.enjeu) {
    const cb = el("input", {
      type: "checkbox",
      onchange: (e) => { enjeu = e.target.checked; renderConseiller(); }
    });
    cb.checked = enjeu;
    c.append(el("label", { class: "opt-enjeu" }, cb, el("span", {}, s.enjeuLabel)));
  }

  const combo   = enjeu && s.enjeu ? [...s.combo, s.enjeu] : s.combo;
  const formule = s.formule + (enjeu && s.enjeu ? " + Self-Calibration" : "");

  const reco = el("div", { class: "reco" },
    el("h4", {}, "Combinaison recommandée"),
    el("div", { class: "formule" }, formule)
  );

  DATA.ordre.filter((id) => combo.includes(id)).forEach((id) => {
    const t = DATA.techniques[id];
    const row = el("div", { class: "reco-row" },
      el("b", {}, titre(t)),
      el("p", {}, t.quand),
      el("div", { class: "reco-actions" },
        el("button", { class: "mini primary", type: "button", onclick: () => inserer([id]) }, "Insérer ce bloc"),
        el("button", { class: "mini", type: "button", onclick: () => { showTab("catalogue"); ouvrir(id); } }, "Voir la fiche")
      )
    );
    row.style.setProperty("--c", t.couleur);
    reco.append(row);
  });

  reco.append(
    el("button", { class: "mini primary btn-combo", type: "button", onclick: () => inserer(combo) },
      "➕ Insérer la combinaison dans le prompt"),
    el("p", { class: "helper-small" },
      "Les blocs sont insérés à la position du curseur, dans l'ordre logique d'un prompt. Remplacez ensuite les [crochets].")
  );
  c.append(reco);
}

// ----------------------------------------------------------------------
// Onglet « Catalogue »
// ----------------------------------------------------------------------
function ouvrir(id) {
  effacerRecherche();
  ouvertes.add(id);
  renderCatalogue();
  setTimeout(() => $("tech-" + id)?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 30);
}

// Champs interrogés par la recherche (clé du JSON, libellé affiché)
const CHAMPS = [
  ["nom", "nom"], ["benefice", "bénéfice"], ["quand", "situation"],
  ["principe", "principe"], ["attendu", "résultat attendu"],
  ["exemple", "exemple"], ["bloc", "bloc inséré"], ["conseils", "optimisation des exemples"]
];
// Champs déjà visibles dans l'en-tête de la carte (inutile de les signaler)
const CHAMPS_VISIBLES = ["nom", "bénéfice", "situation"];

function texteChamp(t, cle) {
  if (cle === "nom") return `${t.acro || ""} ${t.nom}`;
  if (cle === "conseils") return (t.conseils || []).map((r) => `${r.niveau} ${r.critere} ${r.pratique}`).join(" ");
  return t[cle] || "";
}

const motsRecherche = () => norm(recherche).split(/\s+/).filter(Boolean);

// Tous les mots doivent figurer quelque part dans la technique.
// Retourne les libellés des champs touchés, ou null si la technique ne correspond pas.
function resultatRecherche(t, mots) {
  const champs = CHAMPS.map(([cle, lib]) => [lib, norm(texteChamp(t, cle))]);
  const touches = new Set();
  for (const m of mots) {
    const trouve = champs.filter(([, txt]) => txt.includes(m));
    if (!trouve.length) return null;
    trouve.forEach(([lib]) => touches.add(lib));
  }
  return [...touches];
}

function effacerRecherche() {
  recherche = "";
  const champ = $("catRecherche");
  if (champ) champ.value = "";
  const x = $("catEffacer");
  if (x) x.hidden = true;
}

function renderCatalogue() {
  const c = $("catListe");
  c.replaceChildren();

  const mots = motsRecherche();
  let total = 0;

  DATA.groupes.forEach((g) => {
    const cartes = [];

    DATA.ordre.filter((id) => DATA.techniques[id].groupe === g.id).forEach((id) => {
      const t = DATA.techniques[id];
      const touches = mots.length ? resultatRecherche(t, mots) : [];
      if (touches === null) return;
      total++;

      const cachees = touches.filter((lib) => !CHAMPS_VISIBLES.includes(lib));

      const head = el("button", {
        class: "tech-h", type: "button",
        "aria-expanded": String(ouvertes.has(id)),
        onclick: () => {
          ouvertes.has(id) ? ouvertes.delete(id) : ouvertes.add(id);
          renderCatalogue();
        }
      },
        el("span", { class: "chev" }, "▸"),
        el("b", {}, titre(t), el("span", { class: "ok", "data-ok": id, hidden: "" }, "✓ inséré")),
        el("span", { class: "ben" }, t.benefice),
        el("span", { class: "quand" }, "Utiliser quand : " + t.quand),
        cachees.length ? el("span", { class: "trouve" }, "Aussi trouvé dans : " + cachees.join(", ")) : null
      );

      const detail = el("div", { class: "tech-d" },
        el("h5", {}, "Principe"),            el("p", {}, t.principe),
        el("h5", {}, "Résultat attendu"),    el("p", { class: "attendu" }, t.attendu),
        el("h5", {}, "Bloc inséré dans votre prompt"), el("pre", { class: "code" }, t.bloc),
        el("h5", {}, "Exemple de prompt RCH (fiche 1.3)"), el("pre", { class: "code" }, t.exemple)
      );

      if (t.conseils) {
        const tb = el("table", { class: "fs" });
        t.conseils.forEach((r) =>
          tb.append(el("tr", {},
            el("td", {}, el("span", { class: "prio " + r.classe }, r.niveau)),
            el("td", {}, el("b", {}, r.critere)),
            el("td", {}, r.pratique)
          ))
        );
        detail.append(el("h5", {}, "Optimiser les exemples (poster)"), tb);
      }

      detail.append(
        el("div", { class: "reco-actions", style: "margin-top:12px" },
          el("button", { class: "mini primary", type: "button", onclick: () => inserer([id]) }, "Insérer le bloc"),
          el("button", { class: "mini", type: "button", onclick: () => copier(t.exemple) }, "Copier l'exemple RCH")
        )
      );

      const carte = el("div", { class: "tech" + (ouvertes.has(id) ? " open" : ""), id: "tech-" + id }, head, detail);
      carte.style.setProperty("--c", t.couleur);
      cartes.push(carte);
    });

    if (cartes.length) c.append(el("div", { class: "groupe" }, g.libelle), ...cartes);
  });

  const compte = $("catCompte");
  if (compte) {
    compte.textContent = mots.length && total
      ? `${total} technique${total > 1 ? "s" : ""} sur ${DATA.ordre.length}`
      : "";
  }
  if (mots.length && !total) {
    c.append(el("p", { class: "cat-vide" },
      `Aucune technique ne correspond à « ${recherche.trim()} ». Essayez un mot plus court (ex. calcul, hallucination, format).`));
  }

  majBadges();
}

// Champ de recherche (créé une seule fois pour ne pas perdre le focus à la frappe)
function initRecherche() {
  const champ = el("input", {
    type: "text", id: "catRecherche", autocomplete: "off",
    placeholder: "Rechercher un mot-clé (ex. calcul, hallucination, format…)",
    "aria-label": "Rechercher une technique par mot-clé"
  });
  const effacer = el("button", {
    type: "button", id: "catEffacer", class: "cat-effacer", hidden: "",
    "aria-label": "Effacer la recherche",
    onclick: () => { effacerRecherche(); renderCatalogue(); champ.focus(); }
  }, "×");

  champ.addEventListener("input", () => {
    recherche = champ.value;
    effacer.hidden = !recherche;
    renderCatalogue();
  });
  // Échap : efface d'abord la recherche (sans fermer le volet)
  champ.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && champ.value) {
      e.stopPropagation();
      effacerRecherche();
      renderCatalogue();
    }
  });

  $("tabCatalogue").replaceChildren(
    el("div", { class: "cat-recherche" }, champ, effacer),
    el("div", { class: "cat-compte", id: "catCompte", "aria-live": "polite" }),
    el("div", { id: "catListe" })
  );
}

// ----------------------------------------------------------------------
// Initialisation
// ----------------------------------------------------------------------
async function init() {
  const panel = $("aidePanel");
  if (!panel || !$("prompt_input")) {
    console.warn("⚠️ uiTechniques : volet d'aide ou champ prompt introuvable, initialisation ignorée");
    return;
  }

  // Languette fixe au bord droit + zone de message (créées ici pour limiter le HTML)
  document.body.append(
    el("button", {
      class: "aide-tab", type: "button", "data-aide-toggle": "",
      "aria-expanded": "false", "aria-controls": "aidePanel"
    }, "💡 Aide : techniques de prompt"),
    el("div", { class: "aide-toast", id: "aideToast", role: "status", "aria-live": "polite" })
  );

  document.querySelectorAll("[data-aide-toggle]").forEach((b) =>
    b.addEventListener("click", () => setOpen(!isOpen()))
  );
  $("aideClose")?.addEventListener("click", () => setOpen(false));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && isOpen()) setOpen(false); });
  document.querySelectorAll(".aide-tabs button").forEach((b) =>
    b.addEventListener("click", () => showTab(b.dataset.tab))
  );
  $("prompt_input").addEventListener("input", majBadges);

  try {
    const rep = await fetch(DATA_URL, { cache: "no-cache" });
    if (!rep.ok) throw new Error("HTTP " + rep.status);
    DATA = await rep.json();
  } catch (err) {
    console.error("❌ uiTechniques : chargement de techniques.json impossible", err);
    $("tabConseiller").replaceChildren(
      el("p", { class: "helper" }, "⚠️ Aide indisponible : le fichier techniques.json n'a pas pu être chargé.")
    );
    return;
  }

  renderConseiller();
  initRecherche();
  renderCatalogue();
  showTab("conseiller");
  console.log("✅ Aide techniques de prompt initialisée");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
