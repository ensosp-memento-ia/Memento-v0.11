# Changelog - Mémento IA ENSOSP

Toutes les modifications notables de ce projet seront documentées dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/lang/fr/).

## [V0.11.27] - 2026-11-19

### 🆕 Ajouté
- **Aide « Techniques de prompt » sur `create.html`** (section 4, Rédaction du prompt) :
  - Volet dans la colonne de droite, **fermé par défaut**, ouvert ou fermé en un clic (languette bleue au bord droit, bouton « 💡 Aide » de la section 4, croix, touche Échap)
  - Sources affichées en en-tête : Fiche 1.3 « Ingénierie de prompt » et article Schulhoff et al., *The Prompt Report: A Systematic Survey of Prompt Engineering Techniques*, arXiv:2406.06608 (v6, février 2025)
  - Rappel du minimum à définir dans tout prompt : Rôle / contexte, Tâche, Format
- **Onglet « Conseiller »** : on choisit une situation, l'aide propose la combinaison recommandée par la fiche 1.3
  - Analyse ou identification : Rôle + Self-Calibration + CoT
  - Calcul ou dimensionnement : Rôle + Self-Calibration + PoT
  - Analyse pluridisciplinaire (plusieurs acteurs ou points de vue) : Rôle + MoRE + Self-Calibration
  - Informations incomplètes ou ambiguës : Rôle + Self-Ask + CoT
  - Production de documents standardisés : Rôle + Few-Shot (+ Self-Calibration si enjeu critique)
  - Autre situation : Rôle (+ Self-Calibration si requête à enjeu opérationnel)
- **Onglet « Catalogue »** : les 7 techniques de la fiche 1.3 (Rôle / Persona, Few-Shot Prompting, Self-Ask, Self-Calibration, CoT — Chain-of-Thought, PoT — Program-of-Thought, MoRE — Mixture of Reasoning Experts)
  - Pour chacune : bénéfice, « Utiliser quand », principe, résultat attendu, bloc inséré, exemple de prompt RCH
  - Conseils d'optimisation des exemples few-shot (poster : ordre, format, distribution des labels, similarité, quantité, qualité des étiquettes)
  - **Recherche par mot-clé** : insensible aux majuscules et aux accents, mots cumulés, mention « Aussi trouvé dans : … », compteur de résultats, croix ou Échap pour effacer
- **Insertion dans le prompt** : un bloc ou toute la combinaison, à la position du curseur, dans l'ordre logique d'un prompt ; `[crochets]` à compléter ; badge « ✓ inséré » ; bouton « Copier l'exemple RCH » ; le compteur de caractères existant se met à jour
- Nouveaux fichiers : `src/ui/techniques.json` (source unique des contenus), `src/ui/uiTechniques.js`
- Entrée « Création de fiche : aide aux techniques de prompt » dans `changelog.json` (bandeau des nouveautés)

### 🔧 Modifié
- `create.html` : 4 ajouts (conteneur `create-layout`, bouton dans le titre de la section 4, volet `<aside id="aidePanel">`, chargement de `uiTechniques.js`)
- `style.css` : blocs « AIDE — TECHNIQUES DE PROMPT » et « recherche par mot-clé » ajoutés en fin de fichier
- `index.html` : numéro de version du pied de page V0.11.26 → V0.11.27
- `createFiche.js` : **non modifié** (le nouveau module se charge de lui-même)

### 📝 Décisions
- Volet dans la colonne de droite de `create.html`, fermé par défaut
- Conseil **et** insertion automatique de blocs
- Phase 1 : uniquement les 7 techniques de la fiche 1.3 ; extension aux techniques du poster à décider plus tard
- MoRE rattaché aux analyses pluridisciplinaires (confrontation de points de vue)
- Pas de mention de compatibilité par IA
- Acronyme **et** nom complet affichés, sans infobulle de lexique
- Intitulés de situations génériques (non spécifiques RCH) ; « Autre situation » conservée sans sous-titre
- Blocs insérés génériques repris des consignes des exemples de la fiche 1.3, avec `[crochets]` ; l'exemple RCH complet reste consultable et copiable
- Pas de budget de caractères en direct : la limite dépend de l'URL compressée et reste vérifiée à la génération (section 5)
- Phrase du poster complétée par Anne : « Exemple le plus complexe ou plus similaire en dernier pour bénéficier de l'effet de récence »

### ℹ️ À savoir
- L'article source a changé de titre : « …Survey of Prompting Techniques » (v1 à v5), « …Survey of Prompt Engineering Techniques » (v6, février 2025). Le poster cite encore l'ancien titre.
- Les mentions « Utiliser quand » du catalogue reprennent la formulation de la fiche 1.3 (BLEVE, UVCE, zones d'effets)

---

## Historique reconstitué des conversations (avril – novembre 2026)

> Ces évolutions n'ont pas reçu de numéro de version dans les conversations. Elles sont classées par date de conversation, de la plus récente à la plus ancienne. Dates et regroupements à confirmer.

### 2026-11-17 — Bandeau des nouveautés
- Question : augmenter le nombre de nouveautés affichées → réglage `MAX_ENTRIES` dans `index.html` (valeur 4). Aucune modification du dépôt.

### 2026-11-16 — Journal des évolutions et fréquentation
- **Journal des évolutions** `JOURNAL.md` généré automatiquement depuis l'historique Git (`scripts/generate_journal.py`, GitHub Action), guide `JOURNAL-LISEZMOI.md`. Il ne remplace ni `CHANGELOG.md` ni `changelog.json`.
- **Mesure de fréquentation GoatCounter** : `src/ui/analytics.js`, `scripts/fetch_stats.py`, `scripts/patch_stats.py`, relevé quotidien dans `stats/frequentation.json`, guide `STATISTIQUES-LISEZMOI.md`
- **Page `statistiques.html`** : vues par jour, semaine ou mois, onglet Cumul ouvert par défaut, bouton « ← Retour à l'accueil »
- Accès discret à `statistiques.html` par un clic sur le logo SDIS 76 du pied de page (`index.html`, `nrbc.html`)
- Historique visitorbadge d'octobre–novembre 2026 intégré dans `stats/historique.json`
- Constat : écart temporaire entre GoatCounter (direct) et la page du site (mise à jour nocturne) ; libellé « pages vues » jugé imprécis, « visites » proposé

### 2026-05-21 — Conversions d'unités et bandeau des nouveautés
- **Calculateur « Conversions d'unités »** (`Calculateur/conversions.html`) : 9 familles (pressions, températures, débits, concentrations, dimensions, temps, vitesse avec manche à air et Beaufort, masse molaire, GPS, irradiation), widgets de type Google, boutons de préfixes SI (pressions, irradiation), facteur Q pour les doses
- **Bandeau défilant des nouveautés** sur `index.html`, alimenté par `changelog.json` (`MAX_ENTRIES = 4`, contournement du cache, types « nouveau », « amélioration », « correctif »)
- `nrbc.html` : bouton « Conversions d'unités » dans les outils transversaux NRBC

### 2026-05-13 — Partage de prompt et centralisation du style
- **Bouton « Partager un prompt »** sur `create.html` vers le formulaire beta-testeur ; lien unique `BETA_FORM_URL` dans `src/ui/config.js`, importé par `uiScan.js` et `createFiche.js`
- Classe de base `.btn-action` (`.btn-reset`, `.btn-beta-test`) : boutons uniformes sur tout le site
- Styles `header` et `.header-sub` centralisés dans `style.css` ; script `patch_calculateurs.py` appliqué aux calculateurs ; exception documentée : `debitdedose.html` garde les polices IBM Plex pour l'affichage numérique

### 2026-04-25 — Débit de fuite et cartographie NRBC
- **Calculateur « Débit de fuite »** (`Calculateur/debitdefuite.html`) : quatre régimes (R1 liquide, R2 cryogénique, R3 gaz sous pression, R4 gaz liquéfié avec L < 3D / L > 3D), bascule Pa / bar, ΔP par défaut (PVS − pression atmosphérique) en R4, calcul surface / rayon de flaque dans les deux sens, schéma de dispersion, tableau des coefficients de décharge, produit personnalisé, température en K, alerte en R3 si ΔP ≥ PVS
- Corrections scientifiques : masse volumique du propane (493 kg/m³), du CO₂ (1,83 kg/m³), exposant de la formule d'évaporation
- Reconstruction complète du fichier après une corruption (reste de code SVG dans le JavaScript, erreur de syntaxe confirmée par Node.js)
- **Fiche 4.8 (débit de fuite)** : blocs de données d'entrée physico-chimiques et météorologiques (vent, température ; classe de Pasquill retirée, état physique retiré), conditions normales de stockage ajoutées, sources élargies (FDS fabricant, QuickFDS) ; indice de confiance IA en attente de test terrain
- `nrbc.html` : bouton vers le calculateur de débit de fuite
- Diagnostic d'un défaut d'affichage de `qevap` au passage du régime R1 au régime R2 (correction à vérifier)
- Cartographie des experts NRBC rendue autonome (sans dépendance à `style.css`, liens de navigation en chemins absolus `/Memento-v0.11/`)

---

## [V0.11.5] - 2024-12-09

### 🆕 Ajouté
- **Message d'avertissement sur index.html et scan.html** :
  - Encadré jaune avec bordure orange
  - Icône ⚠️ + Titre "Avertissement"
  - Message : "L'IA peut faire des erreurs. Veuillez vérifier les réponses et exercer votre jugement professionnel avant toute action opérationnelle."
  - Visible en permanence pour rappeler l'importance de la vérification humaine

### 🔧 Modifié
- Page `index.html` :
  - Ajout du message d'avertissement après le titre
  - Modification des boutons : `btn-scan` et `btn-create` → `btn-primary`
  - Harmonisation du style des 3 boutons (bleu ENSOSP #001F8F)
  - Texte modifié : "grâce au QR code" → "au moyen du scan"
- Page `scan.html` :
  - Ajout du message d'avertissement après le titre
  - Positionnement cohérent avec index.html
- Fichier `style.css` :
  - Nouvelle classe `.btn` : Style de base pour tous les boutons
  - Nouvelle classe `.btn-primary` : Boutons bleu ENSOSP avec hover et animations
  - Shadow et transitions pour améliorer l'UX
- Version mise à jour : V0.11.4 → V0.11.5

### 🎨 Design
- Encadré d'avertissement :
  - Background : #fff3cd (jaune clair)
  - Bordure gauche : 4px #ff9f1c (orange)
  - Texte : #856404 (marron foncé)
  - Border-radius : 8px
- Boutons primaires :
  - Background : #001F8F (bleu ENSOSP)
  - Hover : #002bbf (bleu plus clair)
  - Shadow : rgba(0, 31, 143, 0.3)
  - Transform sur hover : translateY(-2px)

### ✅ Tests requis
- ✅ Page index.html : Message d'avertissement visible
- ✅ Page scan.html : Message d'avertissement visible
- ✅ Les 3 boutons de l'index sont bleus et identiques
- ✅ Hover sur les boutons : élévation + changement de couleur
- ✅ Message lisible sur mobile et desktop
- ✅ Style cohérent sur toutes les pages

### 📝 Notes techniques
- Message d'avertissement placé stratégiquement pour être visible sans surcharger
- Couleurs conformes à l'identité visuelle ENSOSP
- Accessibilité : contraste suffisant pour la lisibilité
- Responsive : adaptation automatique sur mobile

---

## [V0.11.4] - 2024-12-09

### 🆕 Ajouté
- **Bouton Beta Test sur la page scan.html** :
  - Bouton bleu "📝 Donner mon avis" à côté du bouton de réinitialisation
  - Ouvre le formulaire Microsoft Forms pour les beta testeurs dans un nouvel onglet
  - Visible uniquement quand une fiche est chargée (comme le bouton reset)
  - Lien : https://forms.office.com/Pages/ResponsePage.aspx?id=8fedXl6ZuESKAGhF_Bb8M5J2aSnQSghAnRmJ9DwIhUxUOFA1Q0lOT0FCSUU4TDU3WklSTTVGRzlMMy4u

### 🔧 Modifié
- Page `scan.html` :
  - Création d'un conteneur flex `#actionButtons` pour les deux boutons
  - Ajout du bouton "📝 Donner mon avis" avec style bleu (#001F8F)
  - Les deux boutons s'affichent côte à côte (responsive : wrap sur mobile)
- Module `src/ui/uiScan.js` :
  - Modification de `onFicheDecoded()` : affiche le conteneur `actionButtons` au lieu du bouton seul
  - Modification de `executeReset()` : masque le conteneur `actionButtons`
  - Nouvel événement pour le bouton Beta Test : ouverture du formulaire dans nouvel onglet
  - Logs console pour le suivi
- Version mise à jour : V0.11.3 → V0.11.4

### ✅ Tests requis
- ✅ Charger une fiche (scan/upload/URL)
- ✅ Vérifier que les deux boutons apparaissent côte à côte
- ✅ Bouton orange "🔄 Scanner une nouvelle fiche" à gauche
- ✅ Bouton bleu "📝 Donner mon avis" à droite
- ✅ Cliquer sur "Donner mon avis" → Formulaire s'ouvre dans nouvel onglet
- ✅ Vérifier que les deux boutons disparaissent après reset
- ✅ Responsive : Sur mobile, les boutons passent en colonne si nécessaire

### 📝 Notes techniques
- Style bleu identique au bouton "Compiler le prompt" (#001F8F)
- Conteneur flex pour alignement horizontal avec wrap responsive
- Événement simple : `window.open(url, "_blank")`
- Logs console pour débogage
- Aucun impact sur les fonctionnalités existantes

---

## [V0.11.3] - 2024-12-09

### 🆕 Ajouté
- **Bouton de réinitialisation sur la page scan.html** :
  - Bouton "🔄 Scanner une nouvelle fiche" (orange, masqué par défaut)
  - Visible uniquement quand une fiche est chargée
  - Popup de confirmation moderne avec animations
  - Message d'avertissement : "Voulez-vous vraiment scanner une nouvelle fiche ?"
  - Boutons "OK" (bleu) et "Annuler" (gris)
  - Design conforme aux maquettes fournies

### 🔧 Modifié
- Page `scan.html` :
  - Ajout du bouton reset après le titre principal (ligne 173)
  - Ajout de la popup de confirmation (lignes 241-251)
  - Styles CSS intégrés pour le bouton et la modal (lignes 18-158)
- Module `src/ui/uiScan.js` :
  - Nouvelle fonction `resetScanPage()` : Affiche la popup de confirmation
  - Nouvelle fonction `executeReset()` : Réinitialisation complète
  - Nouvelle fonction `cancelReset()` : Fermeture de la popup
  - Affichage du bouton reset dans `onFicheDecoded()`
  - Gestion des événements (click boutons + fermeture overlay)
  - Nettoyage de l'URL : suppression du paramètre ?fiche= de la barre d'adresse

### ✅ Fonctionnalités de réinitialisation
- ✅ Réaffiche la section de scan (caméra + upload)
- ✅ Masque toutes les sections (métadonnées, variables, prompt)
- ✅ Nettoie tous les champs et données saisies
- ✅ Supprime le message "Fiche chargée depuis un lien"
- ✅ Nettoie l'URL de la barre d'adresse (Option A)
- ✅ Arrête la caméra si elle est active
- ✅ Réinitialise l'input fichier
- ✅ Masque le bouton reset après réinitialisation

### 🎨 Design
- Bouton orange (#ff9f1c) avec effet hover et shadow
- Popup moderne avec animations (fadeIn + slideUp)
- Responsive et accessible sur tous les appareils
- Fermeture possible en cliquant sur le fond de la popup

### ✅ Tests requis
- ✅ Charger une fiche (scan/upload/URL)
- ✅ Vérifier que le bouton orange apparaît
- ✅ Cliquer sur "Scanner une nouvelle fiche"
- ✅ Vérifier l'affichage de la popup
- ✅ Tester le bouton "Annuler" (ferme la popup)
- ✅ Tester le bouton "OK" (réinitialise tout)
- ✅ Vérifier que l'URL est nettoyée
- ✅ Vérifier que la section scan réapparaît
- ✅ Scanner une nouvelle fiche pour vérifier que tout fonctionne

### 📝 Notes techniques
- Amélioration de l'UX : plus besoin de recharger la page (F5)
- Workflow simplifié pour scanner plusieurs fiches successivement
- Confirmation demandée pour éviter les pertes de données accidentelles
- Compatible avec toutes les méthodes de chargement (caméra, fichier, URL)

---

## [V0.11.2] - 2024-12-09

### 🆕 Ajouté
- **Génération automatique d'URL lors de la création de fiche** :
  - L'URL cliquable est maintenant générée EN MÊME TEMPS que le QR code
  - Nouvelle section dans create.html affichant l'URL après génération
  - Bouton "📋 Copier l'URL" avec feedback visuel animé
  - Instructions d'utilisation pour Word/PDF/PowerPoint directement dans l'interface

### 🔧 Modifié
- Page `create.html` :
  - Titre de la section 5 : "Génération du QR Code + URL cliquable"
  - Bouton : "🚀 Générer JSON + QR code + URL"
  - Ajout de la zone d'affichage de l'URL (masquée par défaut)
- Module `src/ui/createFiche.js` :
  - Import de `generateFicheUrl` depuis urlEncoder.js
  - Génération automatique de l'URL après le QR code
  - Gestion du bouton copier avec animation de succès
  - Nettoyage de l'URL dans la fonction reset
- Version mise à jour : V0.11.1 → V0.11.2

### ✅ Tests requis
- ✅ Création d'une fiche avec génération QR + URL simultanée
- ✅ Affichage de la zone URL après génération
- ✅ Copie de l'URL dans le presse-papier
- ✅ Animation du bouton "Copier l'URL"
- ✅ Instructions d'utilisation visibles
- ✅ Bouton Reset nettoie aussi la zone URL
- ✅ Compatibilité multi-navigateurs maintenue

### 📝 Notes techniques
- Workflow simplifié : plus besoin de passer par qr-to-url.html
- L'utilisateur obtient QR + URL en une seule action
- Gain de temps et amélioration de l'expérience utilisateur
- Compatibilité totale avec les fonctionnalités existantes

---

## [V0.11.1] - 2024-12-09

### 🆕 Ajouté
- Bouton "QR Code → URL (pour PDF)" sur la page d'accueil
- Lien vers la nouvelle page qr-to-url.html pour conversion de QR codes existants
- **Nouvelle page `qr-to-url.html`** :
  - Upload d'image QR code
  - Génération automatique d'URL cliquable
  - Aperçu de l'image uploadée
  - Copie de l'URL dans le presse-papier
  - Test de l'URL générée
  - Affichage des informations de la fiche
  - Instructions détaillées pour intégration dans Word/PDF/PowerPoint
- **Nouveau module `src/core/urlEncoder.js`** :
  - Génération d'URLs cliquables à partir des fiches
  - Détection automatique de l'environnement (local, GitHub Pages, custom)
  - Encodage URL-safe compatible tous navigateurs
  - Extraction des paramètres depuis l'URL
  - Fonctions utilitaires (validation, copie presse-papier)
  - Avertissements si URL trop longue (>2000 caractères)
  - Support futur pour services de raccourcissement d'URL
- **Nouveau module `src/ui/uiQrToUrl.js`** :
  - Gestion de l'interface de conversion QR → URL
  - Upload et aperçu d'images QR code
  - Décodage robuste avec gestion d'erreurs détaillée
  - Validation et décompression des fiches
  - Génération et affichage d'URL cliquable
  - Copie dans le presse-papier avec feedback visuel animé
  - Test d'URL dans nouvel onglet
  - Affichage formaté des métadonnées
  - Avertissements automatiques pour URLs longues
  - Sécurité XSS (échappement HTML)

### 🔧 Modifié
- Page `index.html` : ajout d'un troisième bouton d'action
- Version mise à jour dans le footer
- **Module `src/ui/uiScan.js`** :
  - Ajout de l'import `getFicheFromUrl` depuis urlEncoder.js
  - Nouvelle fonction `checkAndLoadFromUrl()` pour détecter paramètre URL
  - Nouvelle fonction `showUrlLoadMessage()` pour feedback utilisateur
  - Initialisation automatique au chargement de la page
  - **Compatibilité totale maintenue** avec scan caméra et upload fichier

### ✅ Tests requis
- ✅ Navigation vers qr-to-url.html fonctionnelle
- ✅ Upload d'image QR code
- ✅ Décodage du QR code et génération d'URL
- ✅ Copie de l'URL dans le presse-papier
- ✅ Ouverture de l'URL dans un nouvel onglet
- ✅ **Chargement automatique de la fiche dans scan.html depuis URL**
- ✅ **Message d'information affiché quand fiche chargée depuis URL**
- ✅ **Compatibilité avec scan caméra/fichier maintenue**
- ✅ Affichage responsive sur smartphone/tablette/ordinateur
- ✅ Style cohérent avec les autres pages
- ✅ Compatibilité Safari, Chrome, Firefox

### 📝 Notes techniques
- Aucun impact sur les fonctionnalités existantes (scan.html, create.html)
- Utilisation du style.css existant pour cohérence visuelle
- Encodage UTF-8 correct pour tous les caractères spéciaux
- Module JavaScript `uiQrToUrl.js` requis (sera créé à l'étape suivante)

---

## [V0.11] - 2024-12-09

### Établi
- Version de référence stable
- Architecture modulaire (core + ui)
- Fonctionnalités de base :
  - Création de fiches opérationnelles IA
  - Lecture de QR codes (caméra + fichier)
  - Génération de QR codes
  - Compression des données
  - Interface responsive

### Fichiers principaux
- `index.html` : Page d'accueil
- `create.html` : Interface de création de fiches
- `scan.html` : Interface de scan QR
- `app.js` : Logique applicative principale
- `src/core/` : Modules métier (compression, QR, schéma JSON)
- `src/ui/` : Modules d'interface utilisateur

### Compatibilité
- ✅ Smartphones (iOS/Android)
- ✅ Tablettes
- ✅ Ordinateurs
- ✅ Navigateurs : Safari, Chrome, Firefox, Edge

---

## Format des prochaines versions

### [VX.XX.X] - AAAA-MM-JJ

#### Ajouté
- Nouvelles fonctionnalités

#### Modifié
- Changements dans les fonctionnalités existantes

#### Corrigé
- Corrections de bugs

#### Supprimé
- Fonctionnalités retirées

#### Sécurité
- Correctifs de sécurité

#### Tests
- Tests ajoutés ou modifiés

---

**Légende des symboles**
- 🆕 Nouvelle fonctionnalité
- 🔧 Modification/Amélioration
- 🐛 Correction de bug
- 🔒 Sécurité
- ⚠️ Breaking change
- 📝 Documentation
- ✅ Tests
