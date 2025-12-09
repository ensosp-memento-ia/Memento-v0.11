# Procédures de Test - Mémento IA ENSOSP

Ce document décrit les procédures de test à effectuer après chaque modification du code.

## Tests de Non-Régression (Obligatoires après chaque modification)

### 1. Tests de Base
- [ ] L'application se charge correctement
- [ ] Aucune erreur console au chargement
- [ ] Navigation entre les pages fonctionne
- [ ] Le footer affiche la bonne version

### 2. Tests Multi-Navigateurs
- [ ] Chrome (dernière version)
- [ ] Firefox (dernière version)
- [ ] Safari (iOS + macOS)
- [ ] Edge (dernière version)

### 3. Tests Multi-Dispositifs
- [ ] Smartphone iOS (portrait/paysage)
- [ ] Smartphone Android (portrait/paysage)
- [ ] Tablette (portrait/paysage)
- [ ] Ordinateur (différentes résolutions)

---

## Tests Fonctionnels par Module

### Module : Page d'Accueil (index.html)
**Chemin de test :**
1. Ouvrir index.html
2. Vérifier l'affichage du titre et des boutons
3. Cliquer sur "Lire une fiche" → doit rediriger vers scan.html
4. Retour → Cliquer sur "Créer une fiche IA" → doit rediriger vers create.html
5. Vérifier le footer avec la version correcte

**Résultat attendu :**
- ✅ Affichage correct sur tous les appareils
- ✅ Navigation fluide
- ✅ Aucune erreur console

---

### Module : Création de Fiche (create.html)
**Chemin de test :**
1. Ouvrir create.html
2. Remplir tous les champs obligatoires
3. Ajouter des données optionnelles
4. Générer la fiche
5. Vérifier la génération du QR code
6. Télécharger la fiche générée

**Résultat attendu :**
- ✅ Tous les champs fonctionnent
- ✅ Validation correcte des données
- ✅ QR code généré et téléchargeable
- ✅ Données correctement compressées

**Points de vigilance :**
- Caractères spéciaux dans les champs texte
- Limites de taille des données
- Format de sortie conforme au schéma JSON

---

### Module : Scan QR Code (scan.html)
**Chemin de test :**

#### Test Scan Caméra
1. Ouvrir scan.html
2. Autoriser l'accès à la caméra
3. Scanner un QR code valide
4. Vérifier l'affichage des données décodées
5. Tester le basculement de caméra (si plusieurs disponibles)

#### Test Upload Fichier
1. Cliquer sur "Upload QR Code"
2. Sélectionner une image contenant un QR code
3. Vérifier le décodage
4. Afficher les informations extraites

**Résultat attendu :**
- ✅ Accès caméra fonctionnel
- ✅ Décodage correct des QR codes
- ✅ Upload de fichier fonctionnel
- ✅ Affichage structuré des données
- ✅ Décompression correcte des données

**Points de vigilance :**
- Permissions caméra sur iOS/Android
- Qualité de scan en basse lumière
- Format des QR codes (compatibilité)

---

## Tests de Performance

### Temps de Chargement
- [ ] Index.html : < 1 seconde
- [ ] Create.html : < 2 secondes
- [ ] Scan.html : < 2 secondes (hors caméra)

### Taille des Fichiers
- [ ] HTML : < 50 KB chacun
- [ ] JS modules : < 100 KB total
- [ ] CSS : < 20 KB

### Génération QR Code
- [ ] Génération : < 500ms
- [ ] Téléchargement : instantané

---

## Tests de Compression

### Données d'Entrée
```json
{
  "titre": "Test Compression",
  "description": "Description longue avec beaucoup de texte pour tester la compression...",
  "variables": ["var1", "var2", "var3"]
}
```

**Vérifications :**
- [ ] Compression réussie
- [ ] Taille réduite significativement
- [ ] Décompression identique aux données d'origine
- [ ] Aucune perte de données

---

## Tests de Sécurité

### Injection de Code
- [ ] Tester avec `<script>alert('XSS')</script>` dans les champs
- [ ] Vérifier l'échappement HTML
- [ ] Valider la sanitization des entrées

### Données Malformées
- [ ] QR code invalide
- [ ] JSON malformé
- [ ] Champs vides/null
- [ ] Caractères spéciaux extrêmes

---

## Checklist de Validation Finale

Avant de considérer une version comme stable :

- [ ] Tous les tests de non-régression passent
- [ ] Tests multi-navigateurs effectués
- [ ] Tests multi-dispositifs effectués
- [ ] Aucune erreur console
- [ ] Performance acceptable
- [ ] Documentation à jour (CHANGELOG)
- [ ] Version incrémentée dans index.html
- [ ] Code commenté et lisible
- [ ] Pas d'impact sur fonctionnalités existantes

---

## Rapport de Test Template

```markdown
# Test Report - Version X.XX.X

**Date :** JJ/MM/AAAA
**Testeur :** Nom
**Environnement :** [Navigateur] / [OS] / [Appareil]

## Modifications Testées
- [Description de la modification]

## Résultats
- ✅ Test 1 : Réussi
- ✅ Test 2 : Réussi
- ❌ Test 3 : Échoué (description du problème)

## Problèmes Identifiés
1. [Description du problème]
   - Impact : Critique/Majeur/Mineur
   - Reproduction : [Étapes]

## Recommandations
- [Actions à prendre]
```

---

## Contact

Pour toute question sur les tests :
- Cne Eddy Fischer
- Cdt Anne Tirelle
