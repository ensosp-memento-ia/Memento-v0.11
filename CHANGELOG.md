# Changelog - Mémento IA ENSOSP

Toutes les modifications notables de ce projet seront documentées dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/lang/fr/).

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
