# Changelog - Mémento IA ENSOSP

Toutes les modifications notables de ce projet seront documentées dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/lang/fr/).

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
