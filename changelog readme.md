# changelog.json — Guide de rédaction

Fichier lu par `index.html` pour alimenter le bandeau ticker de nouveautés.
Déposer à la racine du repo : `/Memento-v0.11/changelog.json`

---

## Format d'une entrée

```json
{
  "date":  "2026-05-18",
  "titre": "Texte affiché dans le ticker (court, < 60 caractères)",
  "lien":  "/Memento-v0.11/Calculateur/conversions.html",
  "type":  "nouveau"
}
```

---

## Types de pastilles

| Valeur          | Pastille affichée | Usage |
|-----------------|-------------------|-------|
| `"nouveau"`     | 🟢 **Nouveau**    | Nouvelle page, nouvel outil, nouvelle fonctionnalité |
| `"amelioration"`| 🔵 **Amél.**      | Amélioration d'un outil existant, ajout d'unités, refonte d'interface |
| `"correctif"`   | 🟡 **Correctif**  | Correction d'un bug, erreur de calcul, lien cassé |

---

## Règles

- **Tri automatique** : le ticker trie du plus récent au plus ancien — inutile de trier manuellement
- **3 entrées affichées** : seules les 3 premières (après tri par date) sont visibles dans le ticker
- **Date** : format `YYYY-MM-DD` obligatoire
- **Titre** : court et opérationnel — éviter les phrases longues
- **Lien** : chemin absolu GitHub Pages depuis la racine `/Memento-v0.11/`

---

## Exemple complet

```json
[
  {
    "date":  "2026-05-18",
    "titre": "Onglet Irradiation — boutons préfixe débit de dose",
    "lien":  "/Memento-v0.11/Calculateur/conversions.html",
    "type":  "amelioration"
  },
  {
    "date":  "2026-05-17",
    "titre": "Page conversions d'unités",
    "lien":  "/Memento-v0.11/Calculateur/conversions.html",
    "type":  "nouveau"
  },
  {
    "date":  "2026-05-10",
    "titre": "Correction calcul débit de fuite R4",
    "lien":  "/Memento-v0.11/Calculateur/debitdefuite.html",
    "type":  "correctif"
  }
]
```

---

## Mise à jour rapide

Copier-coller ce bloc en tête du tableau JSON existant :

```json
{
  "date":  "YYYY-MM-DD",
  "titre": "",
  "lien":  "/Memento-v0.11/",
  "type":  "nouveau"
},
```
