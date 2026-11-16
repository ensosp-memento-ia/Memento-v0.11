# JOURNAL.md — Guide mainteneurs

`JOURNAL.md` est généré automatiquement depuis l'historique Git. Il ne remplace pas
`CHANGELOG.md` (manuel, conservé tel quel) ni `changelog.json` (ticker public de `index.html`).

| Fichier | Rôle | Alimenté par |
|---|---|---|
| `changelog.json` | Ticker « nouveautés » visible des utilisateurs | À la main |
| `CHANGELOG.md` | Historique rédigé V0.11 → V0.11.5 | À la main (figé) |
| `JOURNAL.md` | Évolution du site dans le temps, pour les mainteneurs | **Automatique** |

## Contenu

1. **Chronologie globale** : par mois puis par jour — message de commit, pages touchées, lien vers le commit.
2. **Historique par page** : tableau récapitulatif puis les 15 dernières modifications de chaque page/fichier.

## Installation (une seule fois)

Déposer à la racine du dépôt, en conservant les chemins :

```
.github/workflows/journal.yml
scripts/generate_journal.py
JOURNAL-LISEZMOI.md
```

Puis dans GitHub : **Settings → Actions → General → Workflow permissions → Read and write permissions**.
Lancer une première fois via **Actions → Journal des évolutions → Run workflow**.

## Fonctionnement

- À chaque push sur `main`, l'Action relit tout l'historique et réécrit `JOURNAL.md`.
- Le commit du bot porte `[journal-auto]` : il est ignoré du journal et ne relance pas l'Action.
- Le journal n'est pas lié au déploiement GitHub Pages : il reste dans le dépôt, hors interface du site.

## Qualité du journal = qualité des messages de commit

Le journal reprend la première ligne de chaque message. Préférer un message court et opérationnel :

- ✅ `Débit de fuite : correction densité propane`
- ❌ `maj`, `fix`, `test`

## Test en local (Codespaces)

```bash
python3 scripts/generate_journal.py --repo . --out JOURNAL.md
```

## Réglages

En tête de `scripts/generate_journal.py` : nombre de modifications par page, dossiers exclus
(`Image/`, `Calculateur/Archives/`…), extensions suivies.
