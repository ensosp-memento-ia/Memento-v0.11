# Statistiques de fréquentation — Guide mainteneurs

Mesure les **pages vues** du Mémento jour par jour et capitalise l'historique dans le dépôt.

```
Visiteur ouvre une page ─► analytics.js ─► GoatCounter (compte, sans cookie)
                                              │  chaque nuit
                              fetch_stats.py (GitHub Action, API) ─► stats/frequentation.json
                                                                          │
                                                       statistiques.html (jour / semaine / mois)
```

L'historique vit **dans le dépôt** (`stats/frequentation.json`) : il survit à un changement d'outil de mesure.
Le compteur `visitorbadge` de l'en-tête est conservé tel quel.

## Fichiers

| Fichier | Rôle |
|---|---|
| `src/ui/analytics.js` | Pixel de comptage (nouveau). **Seul endroit** où figure le code GoatCounter |
| `statistiques.html` | Page de consultation (nouvelle) |
| `stats/frequentation.json` | Historique quotidien (nouveau, alimenté par l'Action) |
| `scripts/fetch_stats.py` | Récupération via l'API GoatCounter |
| `scripts/patch_stats.py` | Modifie les pages existantes (voir ci-dessous) |
| `.github/workflows/stats.yml` | Collecte quotidienne à 03h17 UTC |
| `.github/workflows/appliquer-patch.yml` | Lancé une fois à la main : exécute `patch_stats.py` sans terminal |

## Installation (dans l'ordre)

**1. Créer le compteur** sur goatcounter.com (inscription gratuite, usage non commercial). Choisir un code, ex. `memento-ensosp`.
Dans *Settings → Site* : fuseau horaire **Europe/Paris** (les jours sont découpés dans ce fuseau).

**2. Créer un jeton API** : *Settings → API → Create new token*, permission **lecture des statistiques** uniquement.

**3. Ajouter le secret GitHub** : dépôt → *Settings → Secrets and variables → Actions → New repository secret* →
nom `GOATCOUNTER_TOKEN`, valeur = le jeton.

**4. Déposer les fichiers** à la racine du dépôt en gardant les chemins (zip fourni).

**5. Renseigner le code** : dans `src/ui/analytics.js`, remplacer `REMPLACER-PAR-VOTRE-CODE` par le code choisi.

**6. Patcher les pages existantes** — sans terminal : *Actions → Appliquer le patch statistiques → Run workflow*. Avec un terminal (racine du dépôt) :
```bash
python3 scripts/patch_stats.py --dry-run   # vérifier
python3 scripts/patch_stats.py             # appliquer
```
Il ajoute uniquement : une ligne `<script src=".../analytics.js" defer>` avant `</body>` de 13 pages
(`index`, `nrbc`, `scan`, `create`, `qr-to-url` et les 8 calculateurs), un lien discret sur le logo SDIS 76 du pied de page (`index.html`, `nrbc.html`) vers `statistiques.html`, et un bloc de styles en fin de `style.css`.
Relançable sans risque (idempotent). `indexTest.html`, `Calculateur/Archives/` et `statistiques.html` ne sont pas comptés.

**7. Commit + push**, puis *Actions → Fréquentation → Run workflow* pour une première collecte.

## À tester sur le réseau SDIS

Ouvrir une page du site publié depuis un poste SDIS, puis vérifier dans le tableau de bord GoatCounter qu'une vue apparaît
(le délai peut atteindre quelques minutes). Si rien n'apparaît, `goatcounter.com` est probablement filtré :
prévenir avant de changer d'outil, `fetch_stats.py` est le seul fichier à adapter.

## Limites à connaître

- **Pages vues, pas visiteurs** : une personne qui ouvre 5 pages = 5. Les robots sont en partie filtrés, pas totalement.
- **Postes qui bloquent le service** : leurs visites ne sont pas comptées ; les chiffres sont un minimum.
- **Pas de comptage en local** (Codespaces, `localhost`) : volontaire.
- **Jours récents** : redemandés pendant 7 jours pour corriger les jours partiels ; au-delà, l'archive n'est plus modifiée.
- **Accès à la page** : `statistiques.html` n'est accessible que par le logo SDIS 76 du pied de page (index et nrbc) et porte `noindex`, mais n'est pas protégée par mot de passe.
  Les données ne contiennent que des totaux quotidiens.
- **Premier jour** : `--debut` vaut `2026-11-01` par défaut dans `fetch_stats.py` (aucun effet avant la mise en service).

## Dépannage

| Symptôme | Piste |
|---|---|
| Action rouge « GOATCOUNTER_TOKEN absent » | Secret mal nommé ou non créé (étape 3) |
| Action verte mais « non configuré » | Code non remplacé dans `analytics.js` (étape 5) |
| Erreur API 401/403 | Jeton sans permission de lecture des statistiques |
| Page vide « Aucune donnée » | Normal avant la 1re collecte (lendemain de la mise en service) |
| « Données indisponibles » | Page ouverte en fichier local, ou `stats/frequentation.json` absent |
