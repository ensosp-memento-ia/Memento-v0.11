"""
patch_calculateurs.py
=====================
Applique 2 modifications sur chacun des 5 fichiers calculateurs :
  1. Supprime header{...} du bloc <style> inline
  2. Supprime .header-sub{...} du bloc <style> inline
  3. Ajoute <link rel="stylesheet" href="../style.css"> après la police Inter

Usage :
  python patch_calculateurs.py

Placer ce script à la racine du projet (même niveau que style.css).
Les calculateurs sont dans Calculateur/.
"""

import re
import os

CALCULATEURS = [
    "Calculateur/fluxthermique.html",
    "Calculateur/tnt.html",
    "Calculateur/uvce.html",
    "Calculateur/debitdefuite.html",
    "Calculateur/debitdedose.html",
]

STYLESHEET = "../style.css"
INTER_TAG  = '<link rel="stylesheet" href="https://rsms.me/inter/inter.css">'


def patch(content: str) -> str:
    # 1. Supprimer header{...} du <style>
    content = re.sub(
        r'\n[ \t]*header\s*\{[^}]*\}',
        '',
        content,
        flags=re.DOTALL
    )
    # 2. Supprimer .header-sub{...} du <style>
    content = re.sub(
        r'\n[ \t]*\.header-sub\s*\{[^}]*\}',
        '',
        content,
        flags=re.DOTALL
    )
    # 3. Ajouter style.css après Inter (si absent)
    if STYLESHEET not in content and INTER_TAG in content:
        content = content.replace(
            INTER_TAG,
            INTER_TAG + f'\n  <link rel="stylesheet" href="{STYLESHEET}">'
        )
    return content


def main():
    for path in CALCULATEURS:
        if not os.path.exists(path):
            print(f"  SKIP  {path} (introuvable)")
            continue

        with open(path, "r", encoding="utf-8") as f:
            original = f.read()

        patched = patch(original)

        if patched == original:
            print(f"  NOOP  {path} (déjà à jour)")
            continue

        with open(path, "w", encoding="utf-8") as f:
            f.write(patched)

        # Vérification
        ok_h  = "header{" not in patched
        ok_hs = ".header-sub{" not in patched
        ok_css = STYLESHEET in patched
        status = "✅" if (ok_h and ok_hs and ok_css) else "⚠️"
        print(f"  {status}  {path}")
        if not ok_h:  print("        ⚠ header{} encore présent")
        if not ok_hs: print("        ⚠ .header-sub{} encore présent")
        if not ok_css: print("        ⚠ style.css non ajouté")

    print("\nPatch terminé.")


if __name__ == "__main__":
    main()
