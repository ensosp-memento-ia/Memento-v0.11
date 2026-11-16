#!/usr/bin/env python3
"""Récupère les pages vues quotidiennes depuis GoatCounter et les fusionne dans
stats/frequentation.json (historique capitalisé dans le dépôt).

Variables d'environnement :
  GOATCOUNTER_TOKEN  (obligatoire) jeton API, permission « lecture des statistiques »
  GOATCOUNTER_CODE   (optionnel)   sinon lu dans src/ui/analytics.js (source unique)
  GOATCOUNTER_API    (optionnel)   URL de base de l'API, pour les tests

Usage :
    python3 scripts/fetch_stats.py [--racine .] [--debut 2026-11-01] [--recouvrement 7]

Principe : seules les dates récentes sont redemandées (recouvrement de N jours pour
corriger les jours partiels) ; les jours plus anciens déjà archivés ne sont jamais
réécrits. Aucune dépendance externe.
"""
import argparse
import datetime as dt
import json
import os
import re
import sys
import time
import urllib.error
import urllib.request

FICHIER_SORTIE = os.path.join("stats", "frequentation.json")
FICHIER_ANALYTICS = os.path.join("src", "ui", "analytics.js")
DEBUT_PAR_DEFAUT = "2026-11-01"
PAUSE_API = 0.3  # l'API limite le débit (≈ 4 requêtes/s)


def lire_code(racine):
    code = os.environ.get("GOATCOUNTER_CODE", "").strip()
    if code:
        return code
    chemin = os.path.join(racine, FICHIER_ANALYTICS)
    if not os.path.isfile(chemin):
        return ""
    m = re.search(r'GOATCOUNTER_CODE\s*=\s*"([^"]+)"', open(chemin, encoding="utf-8").read())
    return m.group(1) if m else ""


def appel_api(base, token, chemin, **params):
    qs = "&".join(f"{k}={v}" for k, v in params.items())
    url = f"{base}{chemin}" + (f"?{qs}" if qs else "")
    req = urllib.request.Request(url, headers={
        "Authorization": f"Bearer {token}", "Content-Type": "application/json",
    })
    try:
        with urllib.request.urlopen(req, timeout=30) as rep:
            return json.load(rep)
    except urllib.error.HTTPError as e:
        corps = e.read().decode("utf-8", "replace")[:300]
        sys.exit(f"Erreur API {e.code} sur {chemin} : {corps}")
    except urllib.error.URLError as e:
        sys.exit(f"API injoignable : {e.reason}")


def rfc3339(d, fin=False):
    return f"{d.isoformat()}T{'23:59:59' if fin else '00:00:00'}Z"


def jours_depuis_reponse(rep):
    """Extrait {date: pages vues} d'une réponse /stats/total (tolère plusieurs formes)."""
    jours = {}
    for item in rep.get("stats") or []:
        date = item.get("day") or item.get("date")
        if not date:
            continue
        if item.get("daily") is not None:
            valeur = item["daily"]
        else:
            valeur = sum(item.get("hourly") or [])
        jours[str(date)[:10]] = int(valeur)
    return jours


def recuperer(base, token, debut, fin):
    """Essaie d'abord une requête groupée ; sinon un appel par jour."""
    rep = appel_api(base, token, "/stats/total",
                                        start=rfc3339(debut), end=rfc3339(fin, True))
    jours = jours_depuis_reponse(rep)
    if jours:
        return jours
    print("Réponse sans détail quotidien : repli sur un appel par jour.")
    jours, d = {}, debut
    while d <= fin:
        r = appel_api(base, token, "/stats/total", start=rfc3339(d), end=rfc3339(d, True))
        jours[d.isoformat()] = int(r.get("total", 0))
        d += dt.timedelta(days=1)
        time.sleep(PAUSE_API)
    return jours


def charger(chemin):
    if os.path.isfile(chemin):
        with open(chemin, encoding="utf-8") as f:
            return json.load(f)
    return {"source": "GoatCounter", "unite": "pages vues", "jours": {}}


def main():
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--racine", default=".")
    ap.add_argument("--debut", default=DEBUT_PAR_DEFAUT)
    ap.add_argument("--recouvrement", type=int, default=7)
    args = ap.parse_args()

    code = lire_code(args.racine)
    if not code or code.startswith("REMPLACER"):
        print("GoatCounter non configuré (code absent ou par défaut) : rien à faire.")
        return
    token = os.environ.get("GOATCOUNTER_TOKEN", "").strip()
    if not token:
        sys.exit("GOATCOUNTER_TOKEN absent : ajouter le secret dans GitHub (voir STATISTIQUES-LISEZMOI.md).")
    base = os.environ.get("GOATCOUNTER_API") or f"https://{code}.goatcounter.com/api/v0"

    sortie = os.path.join(args.racine, FICHIER_SORTIE)
    donnees = charger(sortie)
    jours = donnees.setdefault("jours", {})

    aujourdhui = dt.datetime.now(dt.timezone.utc).date()
    if jours:
        dernier = dt.date.fromisoformat(max(jours))
        debut = max(dt.date.fromisoformat(args.debut), dernier - dt.timedelta(days=args.recouvrement))
    else:
        debut = dt.date.fromisoformat(args.debut)

    recus = recuperer(base, token, debut, aujourdhui)
    jours.update(recus)

    donnees["source"] = "GoatCounter"
    donnees["unite"] = "pages vues"
    donnees["maj"] = dt.datetime.now(dt.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    donnees["jours"] = dict(sorted(jours.items()))

    os.makedirs(os.path.dirname(sortie), exist_ok=True)
    with open(sortie, "w", encoding="utf-8", newline="\n") as f:
        json.dump(donnees, f, ensure_ascii=False, indent=1)
        f.write("\n")
    print(f"{sortie} : {len(recus)} jour(s) mis à jour, {len(donnees['jours'])} au total.")


if __name__ == "__main__":
    main()
