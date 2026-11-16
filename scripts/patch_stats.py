#!/usr/bin/env python3
"""Applique les deux modifications ciblées nécessaires à la mesure de fréquentation.

  1. Ajoute <script src=".../src/ui/analytics.js" defer></script> avant </body>
     des pages du site (idempotent : une page déjà patchée est ignorée).
  2. Transforme le logo SDIS 76 du pied de page de index.html et nrbc.html en lien
     discret vers statistiques.html (idempotent).
  3. Ajoute à la fin de style.css le bloc de styles de statistiques.html
     (idempotent, entre marqueurs).

Usage (à la racine du dépôt, ex. dans Codespaces) :
    python3 scripts/patch_stats.py            # applique
    python3 scripts/patch_stats.py --dry-run  # affiche sans écrire

Rien d'autre n'est touché. Pages ignorées : indexTest.html, statistiques.html,
Calculateur/Archives/.
"""
import argparse
import glob
import os
import sys

PAGES_RACINE = ["index.html", "nrbc.html", "scan.html", "create.html", "qr-to-url.html"]
DOSSIER_CALCULATEURS = "Calculateur"   # pages de premier niveau uniquement
PAGES_LIEN_LOGO = ["index.html", "nrbc.html"]
LOGO_SDIS = '<img src="Image/logo sdis76.svg" alt="SDIS 76" class="footer-logo footer-logo--sdis">'
LOGO_SDIS_LIE = '<a href="statistiques.html" aria-label="Statistiques de fréquentation">' + LOGO_SDIS + '</a>'
MARQUEUR_CSS_DEBUT = "/* === STATISTIQUES (début) === */"
MARQUEUR_CSS_FIN = "/* === STATISTIQUES (fin) === */"

BLOC_CSS = f"""
{MARQUEUR_CSS_DEBUT}
.stats-main {{ max-width: 960px; margin: 0 auto; padding: 24px 16px 40px; box-sizing: border-box; }}
.stats-sub {{ color: #666; font-size: 14px; text-align: center; margin: -14px 0 24px; }}
.stats-kpis {{ display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; margin-bottom: 22px; }}
@media (max-width: 768px) {{ .stats-kpis {{ grid-template-columns: repeat(2, minmax(0, 1fr)); }} }}
.stats-kpi {{ background: white; border: 1px solid #e0e4f0; border-radius: 15px; padding: 16px 14px; box-shadow: 0 3px 8px rgba(0,0,0,.04); }}
.stats-kpi-label {{ font-size: 12px; color: #666; margin: 0 0 6px; }}
.stats-kpi-value {{ font-size: 26px; font-weight: 700; color: #001F8F; margin: 0; }}
.stats-kpi-delta {{ font-size: 12px; margin: 4px 0 0; color: #666; }}
.stats-kpi-delta.is-up {{ color: #2e7d32; }}
.stats-kpi-delta.is-down {{ color: #b3261e; }}
.stats-panel {{ background: white; border: 1px solid #e0e4f0; border-radius: 15px; padding: 18px 16px; box-shadow: 0 3px 8px rgba(0,0,0,.04); }}
.stats-tabs {{ display: flex; gap: 8px; margin-bottom: 14px; flex-wrap: wrap; }}
.stats-tab {{ padding: 8px 16px; border-radius: 10px; border: 1.5px solid #001F8F; background: white; color: #001F8F; font-family: "Inter", sans-serif; font-size: 13px; font-weight: 600; cursor: pointer; }}
.stats-tab[aria-pressed="true"] {{ background: #001F8F; color: white; }}
.stats-chart {{ width: 100%; height: auto; display: block; }}
.stats-chart .bar {{ fill: #001F8F; }}
.stats-chart .bar:hover {{ fill: #002bbf; }}
.stats-chart .grid {{ stroke: #e8ebf5; stroke-width: 1; }}
.stats-chart text {{ font-family: "Inter", sans-serif; font-size: 11px; fill: #666; }}
.stats-note {{ font-size: 12px; color: #666; line-height: 1.6; margin: 14px 0 0; }}
.stats-msg {{ text-align: center; color: #666; font-size: 14px; padding: 30px 10px; }}
.stats-details {{ margin-top: 14px; font-size: 13px; }}
.stats-details summary {{ cursor: pointer; color: #001F8F; font-weight: 600; }}
.stats-table {{ border-collapse: collapse; width: 100%; margin-top: 10px; }}
.stats-table th, .stats-table td {{ text-align: left; padding: 6px 8px; border-bottom: 1px solid #eef0f8; }}
.stats-table td:last-child, .stats-table th:last-child {{ text-align: right; }}
{MARQUEUR_CSS_FIN}
"""


def cibles_html(racine):
    for nom in PAGES_RACINE:
        chemin = os.path.join(racine, nom)
        if os.path.isfile(chemin):
            yield chemin, "./"
    for chemin in sorted(glob.glob(os.path.join(racine, DOSSIER_CALCULATEURS, "*.html"))):
        yield chemin, "../"


def patcher_page(chemin, prefixe, dry):
    with open(chemin, encoding="utf-8", newline="") as f:
        contenu = f.read()
    if "analytics.js" in contenu:
        return "déjà patchée"
    idx = contenu.lower().rfind("</body>")
    if idx == -1:
        return "IGNORÉE (pas de </body>)"
    saut = "\r\n" if "\r\n" in contenu else "\n"
    ligne = f'<script src="{prefixe}src/ui/analytics.js" defer></script>{saut}'
    nouveau = contenu[:idx] + ligne + contenu[idx:]
    if not dry:
        with open(chemin, "w", encoding="utf-8", newline="") as f:
            f.write(nouveau)
    return "patchée"


def lier_logo(chemin, dry):
    with open(chemin, encoding="utf-8", newline="") as f:
        contenu = f.read()
    if LOGO_SDIS_LIE in contenu:
        return "lien déjà présent"
    if contenu.count(LOGO_SDIS) != 1:
        return f"IGNORÉE (logo SDIS trouvé {contenu.count(LOGO_SDIS)} fois, attendu 1)"
    if not dry:
        with open(chemin, "w", encoding="utf-8", newline="") as f:
            f.write(contenu.replace(LOGO_SDIS, LOGO_SDIS_LIE))
    return "lien ajouté"


def patcher_css(racine, dry):
    chemin = os.path.join(racine, "style.css")
    if not os.path.isfile(chemin):
        return "style.css introuvable"
    with open(chemin, encoding="utf-8", newline="") as f:
        contenu = f.read()
    if MARQUEUR_CSS_DEBUT in contenu:
        return "bloc déjà présent"
    if not dry:
        with open(chemin, "a", encoding="utf-8", newline="") as f:
            f.write(("" if contenu.endswith("\n") else "\n") + BLOC_CSS)
    return "bloc ajouté"


def main():
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--racine", default=".")
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()
    if not os.path.isfile(os.path.join(args.racine, "index.html")):
        sys.exit("index.html introuvable : lancer depuis la racine du dépôt (ou --racine).")
    for chemin, prefixe in cibles_html(args.racine):
        print(f"{os.path.relpath(chemin, args.racine):60s} {patcher_page(chemin, prefixe, args.dry_run)}")
    for nom in PAGES_LIEN_LOGO:
        chemin = os.path.join(args.racine, nom)
        if os.path.isfile(chemin):
            print(f"{nom + ' (logo SDIS)':60s} {lier_logo(chemin, args.dry_run)}")
    print(f"{'style.css':60s} {patcher_css(args.racine, args.dry_run)}")
    if args.dry_run:
        print("(dry-run : aucun fichier modifié)")


if __name__ == "__main__":
    main()
