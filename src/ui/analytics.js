// ========================================================================
// analytics.js — Mesure de fréquentation (GoatCounter, sans cookie)
// src/ui/analytics.js
// ========================================================================
// Script classique (pas un module) : utilisable depuis les pages racine ET
// les calculateurs. Méthode image 1x1 + cache-busting Date.now(), identique
// à celle validée sur le réseau SDIS.
//
// Source unique du code GoatCounter : la constante ci-dessous.
// scripts/fetch_stats.py la lit dans ce fichier — ne la dupliquer nulle part.
// ========================================================================
(function () {
  "use strict";

var GOATCOUNTER_CODE = "memento-ensosp";

  // Non configuré : aucune requête
  if (GOATCOUNTER_CODE.indexOf("REMPLACER") === 0) { return; }

  // Pas de comptage en local (Codespaces, aperçu, fichier ouvert directement)
  var h = location.hostname;
  if (h === "" || h === "localhost" || h === "127.0.0.1" || /\.localhost$/.test(h)) { return; }

  try {
    var img = new Image();
    img.src = "https://" + GOATCOUNTER_CODE + ".goatcounter.com/count" +
      "?p=" + encodeURIComponent(location.pathname) +
      "&t=" + encodeURIComponent(document.title) +
      "&_=" + Date.now();
  } catch (e) { /* la mesure ne doit jamais gêner l'outil */ }
})();
