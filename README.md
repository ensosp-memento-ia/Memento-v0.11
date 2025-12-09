# Mémento IA RCH - Version 0.9 Complète + QR vers URL

## 📋 Description

Application web complète pour créer et scanner des fiches opérationnelles IA destinées aux Conseillers en Risque Chimique (RCH) des sapeurs-pompiers.

**Version :** v0.9 Stable + Fonctionnalité QR vers URL (Jeudi soir)  
**Date de reconstitution :** Décembre 2025

Cette version combine :
- ✅ La version 0.9 stable (avant implémentation QR vers URL)
- ✅ L'ajout de la fonctionnalité QR Code → URL cliquable (jeudi)
- ✅ **SANS** le bouton "Retour utilisateur" (ajouté après)

---

## 📁 Structure complète du projet

```
Memento-IA-RCH/
│
├── 📄 index.html              # Page d'accueil
├── 📄 create.html             # Page de création de fiches
├── 📄 scan.html               # Page de lecture de fiches
├── 📄 qr-to-url.html          # Page utilitaire QR → URL ✨
├── 📄 app.js                  # Orchestrateur global (DOMContentLoaded)
├── 🎨 style.css               # Feuille de styles
│
├── src/
│   ├── core/                  # Moteur technique
│   │   ├── compression.js         # Compression/décompression pako
│   │   ├── jsonSchema.js          # Validation des fiches
│   │   ├── qrWriter.js            # Génération de QR Codes
│   │   ├── qrReaderFile.js        # Lecture QR depuis fichier
│   │   ├── qrReaderCamera.js      # Lecture QR avec caméra
│   │   ├── variables.js           # Gestion des variables dynamiques
│   │   └── urlEncoder.js          # Génération d'URL cliquables ✨
│   │
│   └── ui/                    # Interface utilisateur
│       ├── createFiche.js         # Logique de création (avec URL)
│       ├── scanModule.js          # Module de scan
│       ├── uiScan.js              # Logique de lecture
│       ├── uiCamera.js            # Gestion caméra
│       ├── uiMeta.js              # Gestion métadonnées
│       ├── uiPrompt.js            # Gestion prompt
│       ├── uiVariables.js         # Éditeur de variables
│       └── uiReset.js             # Réinitialisation
│
└── tests/
    └── test_modules.html          # Tests modules
```

---

## ✨ Fonctionnalités

### ✅ Création de fiches
- Métadonnées complètes (titre, catégorie, contexte, version, date, auteur)
- Sélection des IA recommandées avec indices (ChatGPT, Perplexity, Mistral)
- Gestion des variables dynamiques
- Génération de prompt personnalisé
- **Génération de QR Code**
- **Génération d'URL cliquable** (pour intégration dans PDF) ✨
- Export JSON
- Validation et compression des données

### ✅ Lecture de fiches
- Import de QR Code depuis fichier image
- Scan en temps réel avec caméra
- **Chargement automatique depuis URL** (paramètre `?fiche=...`) ✨
- Affichage des métadonnées condensées
- Remplissage des variables de situation
- Génération automatique du prompt final
- Boutons d'envoi vers les IA recommandées (codes couleur)

### ✅ Utilitaire QR → URL
- Page dédiée pour convertir un QR Code existant en lien cliquable
- Idéal pour créer des liens dans les PDF après coup
- Scan du QR et génération automatique de l'URL

---

## 🔧 Technologies utilisées

- **HTML5 / CSS3 / JavaScript ES6+ (Modules)**
- **Pako** (compression DEFLATE) - https://github.com/nodeca/pako
- **QRCode.js** (génération QR) - https://github.com/davidshimjs/qrcodejs
- **qr-scanner** (lecture QR) - https://github.com/nimiq/qr-scanner

---

## 🚀 Installation et déploiement

### Développement local

1. Télécharger et extraire l'archive
2. Ouvrir `index.html` dans un navigateur moderne
3. Pas de serveur nécessaire pour les tests de base

### Déploiement sur GitHub Pages

1. Créer un repository GitHub
2. Uploader tous les fichiers
3. Activer GitHub Pages dans les paramètres
4. Accéder à l'URL : `https://[username].github.io/[repo-name]`

---

## 📝 Fichiers clés

### **app.js** - Orchestrateur global
Point d'entrée principal qui initialise tous les modules au chargement de la page (DOMContentLoaded).

### **src/core/urlEncoder.js** ✨ NOUVEAU
Génère des URL cliquables contenant les données de la fiche compressées.
- Encode la fiche en Base64 URL-safe
- Crée une URL du format : `scan.html?fiche=[données]`
- Permet le chargement direct d'une fiche via lien

### **src/ui/createFiche.js** (mis à jour)
Intègre maintenant :
- La génération de QR Code
- **La génération d'URL cliquable**
- L'affichage et la copie du lien

### **qr-to-url.html** ✨ NOUVEAU
Page utilitaire pour convertir un QR Code existant en URL cliquable.

---

## 🔗 Utilisation de l'URL cliquable

### Comment ça marche ?

1. **Créez une fiche** sur `create.html`
2. **Cliquez sur "Générer JSON + QR code"**
3. **Copiez l'URL générée** (bouton "🔗 Copier le lien")
4. **Dans votre document Word/PDF :**
   - Insérez l'image du QR Code
   - Sélectionnez l'image → Clic droit → Lien hypertexte
   - Collez l'URL copiée
   - Exportez en PDF
5. **Le QR Code devient cliquable dans le PDF !**

### Format de l'URL

```
https://[votre-domaine]/scan.html?fiche=[données-compressées-base64]
```

L'URL contient toutes les données de la fiche compressées et encodées en Base64 URL-safe.

---

## 🎨 Architecture des modules

### Moteur technique (`src/core/`)
- **compression.js** : Compression DEFLATE avec pako
- **jsonSchema.js** : Validation des structures de fiches
- **qrWriter.js** : Génération de QR Codes de taille adaptative
- **qrReaderFile.js** : Lecture QR depuis fichiers image
- **qrReaderCamera.js** : Scan QR en temps réel avec caméra
- **variables.js** : Gestion des variables dynamiques dans les prompts
- **urlEncoder.js** : Génération d'URL cliquables ✨

### Interface utilisateur (`src/ui/`)
- **createFiche.js** : Orchestration création + génération QR/URL
- **scanModule.js** : Module de scan QR
- **uiScan.js** : Interface de lecture et exploitation
- **uiCamera.js** : Gestion de l'accès caméra
- **uiMeta.js** : Gestion des métadonnées
- **uiPrompt.js** : Édition du prompt de base
- **uiVariables.js** : Éditeur de variables dynamiques
- **uiReset.js** : Réinitialisation de l'interface

---

## ⚠️ Ce qui n'est PAS dans cette version

- ❌ **Bouton "Retour utilisateur"** (ajouté APRÈS jeudi)
- ❌ Améliorations ultérieures de l'interface
- ❌ Corrections apportées après jeudi soir

---

## 🎯 Points de différence avec la version précédente

### ✅ Nouveautés (par rapport à v0.9)
1. **Fichier `urlEncoder.js`** dans `src/core/`
2. **Page `qr-to-url.html`** pour conversion QR → URL
3. **Génération automatique d'URL** lors de la création de fiche
4. **Chargement automatique** d'une fiche depuis URL dans `scan.html`

### ✅ Fichiers présents (par rapport à version précédente incomplète)
1. **app.js** - Orchestrateur global
2. **scanModule.js** - Module de scan
3. **uiCamera.js** - Gestion caméra
4. **uiMeta.js** - Gestion métadonnées
5. **uiPrompt.js** - Gestion prompt
6. **uiVariables.js** - Éditeur variables
7. **uiReset.js** - Réinitialisation

---

## 📞 Support

Pour toute question ou amélioration :
- **ENSOSP** - École Nationale Supérieure des Officiers de Sapeurs-Pompiers
- **Auteurs :** Cne E. Fischer, Cdt A. Tirelle

---

## 📄 Licence

© ENSOSP - Usage interne et pédagogique

---

**✅ Cette version est COMPLÈTE et fonctionnelle !**

Elle combine :
- La stabilité de la v0.9
- Les fichiers manquants (app.js, scanModule.js, etc.)
- La fonctionnalité QR vers URL (jeudi soir)
- SANS le bouton "Retour utilisateur" (ajouté plus tard)

**C'est la base propre idéale pour repartir !** 🚀
