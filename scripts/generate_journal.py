#!/usr/bin/env python3
"""Génère JOURNAL.md à partir de l'historique Git du Mémento IA ENSOSP.

Usage :
    python3 scripts/generate_journal.py [--repo .] [--out JOURNAL.md]

Sections produites :
  1. Chronologie globale (par mois, puis par jour)
  2. Historique par page / fichier du site

Aucune dépendance externe : Python 3.8+ et git suffisent.
"""
import argparse
import os
import subprocess
import sys
from collections import OrderedDict, defaultdict

# ── Réglages (à adapter ici, source unique) ──────────────────────────────────
TITRE = "Journal des évolutions — Mémento IA ENSOSP"
MAX_COMMITS_PAR_PAGE = 15          # derniers changements listés par page
EXCLURE_PREFIXES = (               # chemins ignorés dans l'historique par page
    ".github/", "Image/", "Calculateur/Archives/", "scripts/", "stats/",
)
EXCLURE_FICHIERS = {"JOURNAL.md"}  # le journal ne se référence pas lui-même
EXTENSIONS_SUIVIES = (".html", ".js", ".css", ".json", ".md", ".py")
MARQUEURS_BOT = ("[journal-auto]", "[stats-auto]")  # commits des workflows, ignorés du journal
SEP = "\x1f"                       # séparateurs sûrs pour parser git log
FIN = "\x1e"


def git(repo, *args):
    res = subprocess.run(
        ["git", "-C", repo, *args],
        capture_output=True, text=True, encoding="utf-8", check=False,
    )
    if res.returncode != 0:
        sys.exit(f"Erreur git {' '.join(args)} : {res.stderr.strip()}")
    return res.stdout


def lire_commits(repo):
    fmt = FIN + SEP.join(["%H", "%h", "%ad", "%an", "%s"])
    brut = git(
        repo, "log", "--no-merges", "--no-renames", "--date=short",
        f"--pretty=format:{fmt}", "--name-only",
    )
    commits = []
    for bloc in brut.split(FIN):
        bloc = bloc.strip("\n")
        if not bloc:
            continue
        entete, _, fichiers = bloc.partition("\n")
        champs = entete.split(SEP)
        if len(champs) != 5:
            continue
        sha, court, date, auteur, sujet = champs
        if any(m in sujet for m in MARQUEURS_BOT):
            continue
        liste = [f for f in fichiers.split("\n") if f.strip()]
        commits.append({
            "sha": sha, "court": court, "date": date,
            "auteur": auteur, "sujet": sujet.strip(), "fichiers": liste,
        })
    return commits  # du plus récent au plus ancien


def fichier_suivi(chemin):
    if chemin in EXCLURE_FICHIERS or chemin.startswith(EXCLURE_PREFIXES):
        return False
    return chemin.lower().endswith(EXTENSIONS_SUIVIES)


def url_depot():
    depot = os.environ.get("GITHUB_REPOSITORY", "")
    return f"https://github.com/{depot}" if depot else ""


def lien_commit(base, c):
    return f"[`{c['court']}`]({base}/commit/{c['sha']})" if base else f"`{c['court']}`"


def echapper(texte):
    return texte.replace("|", "\\|").replace("\n", " ")


MOIS = ["", "janvier", "février", "mars", "avril", "mai", "juin", "juillet",
        "août", "septembre", "octobre", "novembre", "décembre"]


def titre_mois(date_iso):
    annee, mois, _ = date_iso.split("-")
    return f"{MOIS[int(mois)].capitalize()} {annee}"


def section_chronologie(commits, base):
    lignes = ["## Chronologie globale", ""]
    par_mois = OrderedDict()
    for c in commits:
        par_mois.setdefault(titre_mois(c["date"]), OrderedDict()) \
                .setdefault(c["date"], []).append(c)
    for mois, jours in par_mois.items():
        lignes += [f"### {mois}", ""]
        for jour, items in jours.items():
            lignes.append(f"**{jour}**")
            lignes.append("")
            for c in items:
                pages = [f for f in c["fichiers"] if fichier_suivi(f)]
                detail = ""
                if pages:
                    affiche = ", ".join(f"`{p}`" for p in pages[:4])
                    reste = len(pages) - 4
                    detail = f" — {affiche}" + (f" (+{reste})" if reste > 0 else "")
                lignes.append(f"- {echapper(c['sujet'])}{detail} · {lien_commit(base, c)}")
            lignes.append("")
    return lignes


def section_par_page(commits, base):
    par_page = defaultdict(list)
    for c in commits:
        for f in c["fichiers"]:
            if fichier_suivi(f):
                par_page[f].append(c)
    lignes = ["## Historique par page", ""]
    if not par_page:
        return lignes + ["_Aucune page suivie._", ""]
    # Pages les plus récemment modifiées en premier
    ordre = sorted(par_page, key=lambda p: (par_page[p][0]["date"], p), reverse=True)
    lignes += ["| Page | Modifications | Dernière modification |", "|---|---:|---|"]
    for p in ordre:
        lignes.append(f"| [`{p}`](#{ancre(p)}) | {len(par_page[p])} | {par_page[p][0]['date']} |")
    lignes.append("")
    for p in ordre:
        items = par_page[p]
        lignes += [f"### `{p}`", ""]
        for c in items[:MAX_COMMITS_PAR_PAGE]:
            lignes.append(f"- {c['date']} — {echapper(c['sujet'])} · {lien_commit(base, c)}")
        if len(items) > MAX_COMMITS_PAR_PAGE:
            lignes.append(f"- _… et {len(items) - MAX_COMMITS_PAR_PAGE} modification(s) plus ancienne(s)._")
        lignes.append("")
    return lignes


def ancre(chemin):
    """Ancre GitHub d'un titre ### `chemin` : minuscules, sans ponctuation sauf - et _."""
    brut = chemin.lower().replace(" ", "-")
    return "".join(ch for ch in brut if ch.isalnum() or ch in "-_")


def main():
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--repo", default=".")
    ap.add_argument("--out", default="JOURNAL.md")
    args = ap.parse_args()

    commits = lire_commits(args.repo)
    base = url_depot()

    en_tete = [
        f"# {TITRE}",
        "",
        "> Fichier **généré automatiquement** depuis l'historique Git — ne pas modifier à la main.",
        "> Voir `JOURNAL-LISEZMOI.md` pour le fonctionnement.",
        "",
    ]
    if commits:
        en_tete += [
            f"**{len(commits)}** modifications · du {commits[-1]['date']} au {commits[0]['date']}",
            "",
        ]
    corps = en_tete + section_chronologie(commits, base) + section_par_page(commits, base)

    chemin_sortie = args.out if os.path.isabs(args.out) else os.path.join(args.repo, args.out)
    with open(chemin_sortie, "w", encoding="utf-8", newline="\n") as f:
        f.write("\n".join(corps).rstrip("\n") + "\n")
    print(f"{chemin_sortie} : {len(commits)} commits")


if __name__ == "__main__":
    main()
