# Mémento IA RCH - Version Jeudi Soir

## 📋 Description

Application web pour créer et scanner des fiches opérationnelles IA destinées aux Conseillers en Risque Chimique (RCH) des sapeurs-pompiers.

**Version :** v0.10 - État jeudi soir  
**Date de reconstitution :** Décembre 2025

## ✨ Fonctionnalités incluses dans cette version

### ✅ Création de fiches
- Métadonnées complètes (titre, catégorie, contexte, version, date, auteur)
- Sélection des IA recommandées (ChatGPT, Perplexity, Mistral)
- Gestion des variables dynamiques
- Génération de prompt personnalisé
- **Génération de QR Code**
- **Génération d'URL cliquable** (pour intégration dans PDF)
- Export JSON

### ✅ Lecture de fiches
- Import de QR Code depuis fichier image
- Scan en temps réel avec caméra
- **Chargement automatique depuis URL** (paramètre `?fiche=...`)
- Affichage des métadonnées (version condensée)
- Remplissage des variables
- Génération automatique du prompt final
- Boutons d'envoi vers les IA recommandées

### ✅ Utilitaire QR → URL
- Page dédiée pour convertir un QR Code existant en lien cliquable
- Pratique pour créer des liens dans les PDF après coup

## 📁 Structure du projet

```
Memento-IA-RCH/
│
├── index.html              # Page d'accueil
├── create.html             # Page de création de fiches
├── scan.html               # Page de lecture de fiches
├── qr-to-url.html          # Page utilitaire QR → URL
├── style.css               # Feuille de styles
│
└── src/
    ├── core/               # Moteur technique
    │   ├── compression.js       # Compression/décompression pako
    │   ├── jsonSchema.js        # Validation des fiches
    │   ├── qrWriter.js          # Génération de QR Codes
    │   ├── qrReaderFile.js      # Lecture QR depuis fichier
    │   ├── qrReaderCamera.js    # Lecture QR avec caméra
    │   ├── variables.js         # Gestion des variables
    │   └── urlEncoder.js        # Génération d'URL cliquables ✨
    │
    └── ui/                 # Interface utilisateur
        ├── createFiche.js       # Logique de création
        └── uiScan.js            # Logique de lecture
```

## 🔧 Technologies utilisées

- **HTML5 / CSS3 / JavaScript ES6+**
- **Pako** (compression DEFLATE) - https://github.com/nodeca/pako
- **QRCode.js** (génération QR) - https://github.com/davidshimjs/qrcodejs
- **qr-scanner** (lecture QR) - https://github.com/nimiq/qr-scanner

## 🚀 Installation et déploiement

### Développement local

1. Télécharger les fichiers
2. Ouvrir `index.html` dans un navigateur moderne
3. Pas de serveur nécessaire pour les tests de base

### Déploiement sur GitHub Pages

1. Créer un repository GitHub
2. Uploader tous les fichiers
3. Activer GitHub Pages dans les paramètres
4. Accéder à l'URL : `https://[username].github.io/[repo-name]`

## 📝 Points importants de cette version

### ✅ Ce qui fonctionne

- Création complète de fiches avec métadonnées
- Variables dynamiques personnalisables
- Génération de QR Code (**Canvas fix appliqué**)
- **Génération d'URL cliquable pour PDF**
- Compression efficace des données (pako DEFLATE)
- Lecture QR depuis fichier image
- Lecture QR avec caméra en temps réel
- **Chargement automatique de fiche depuis URL**
- Page utilitaire QR → URL

### ⚠️ Ce qui n'est PAS dans cette version

- ❌ **Bouton "Retour utilisateur"** (ajouté APRÈS cette version)
- ❌ Amélioration ultérieure de qrWriter.js (correction canvas)
- ❌ Fonctionnalités ajoutées après jeudi soir

## 🔗 Utilisation de l'URL cliquable

### Comment ça marche ?

1. Créez une fiche sur `create.html`
2. Cliquez sur "Générer JSON + QR Code + URL"
3. Copiez l'URL générée
4. Dans votre document Word/PDF :
   - Insérez l'image du QR Code
   - Ajoutez un hyperlien sur l'image avec l'URL
   - Exportez en PDF
5. Le QR Code devient cliquable dans le PDF !

### Format de l'URL

```
https://[votre-domaine]/scan.html?fiche=[données-compressées-base64]
```

L'URL contient toutes les données de la fiche compressées et encodées en Base64.

## 🎨 Personnalisation

### Couleurs principales

- **Bleu ENSOSP :** `#001F8F`
- **Orange accent :** `#ff9f1c`
- **Vert succès :** `#1dbf65`
- **Gris secondaire :** `#6c757d`

### Modifier les IA disponibles

Éditez `src/ui/createFiche.js` et `src/ui/uiScan.js` pour ajouter/modifier les boutons d'IA.

## 📞 Support

Pour toute question ou amélioration :
- **ENSOSP** - École Nationale Supérieure des Officiers de Sapeurs-Pompiers
- **Auteurs :** Cne E. Fischer, Cdt A. Tirelle

## 📄 Licence

© ENSOSP - Usage interne et pédagogique

---

**⚠️ Avertissement :** Cette version représente l'état de l'application **jeudi soir**, avant l'ajout du bouton "Retour utilisateur" et autres améliorations ultérieures. C'est une base propre pour repartir du développement à ce stade précis.
