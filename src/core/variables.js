// ======================================================================
// variables.js — UI dynamique pour la LECTURE d'une fiche
// v0.11.18 : ajout type "meteo" — fetch Open-Meteo automatique dès GPS saisi
// ======================================================================

// Détection automatique : on est dans scan.html ?
const isScanMode = window.location.pathname.includes("scan.html");

// =================================================================
// Validation des coordonnées GPS
// =================================================================
function isValidLatitude(lat) {
  const num = parseFloat(lat);
  return !isNaN(num) && num >= -90 && num <= 90;
}

function isValidLongitude(lon) {
  const num = parseFloat(lon);
  return !isNaN(num) && num >= -180 && num <= 180;
}

// =================================================================
// Construire l'UI dynamique des variables
// =================================================================
export function buildVariablesUI(container, fiche) {
  if (!container) {
    console.error("❌ Container variables introuvable");
    return;
  }

  container.innerHTML = "";

  if (!fiche.prompt || !Array.isArray(fiche.prompt.variables)) {
    console.error("❌ Aucune variable trouvée dans la fiche");
    return;
  }

  fiche.prompt.variables.forEach(v => {

    const wrapper = document.createElement("div");
    wrapper.className = "var-field";

    // Label
    const label = document.createElement("label");
    label.textContent = v.label || v.id;
    label.htmlFor = v.id;
    
    // Indicateur obligatoire
    if (v.required) {
      const req = document.createElement("span");
      req.textContent = " *";
      req.style.color = "#ff4d4d";
      label.appendChild(req);
    }
    
    wrapper.appendChild(label);

    let inputEl = null;

    // --------------------------
    // TYPE : TEXT
    // --------------------------
    if (v.type === "text") {
      inputEl = document.createElement("input");
      inputEl.type = "text";
      inputEl.placeholder = v.placeholder || "";
      if (v.required) inputEl.required = true;
    }

    // --------------------------
    // TYPE : NUMBER
    // --------------------------
    else if (v.type === "number") {
      inputEl = document.createElement("input");
      inputEl.type = "number";
      inputEl.placeholder = v.placeholder || "";
      if (v.required) inputEl.required = true;
    }

    // --------------------------
    // TYPE : SELECT (choice)
    // --------------------------
    else if (v.type === "choice") {
      inputEl = document.createElement("select");
      if (v.required) inputEl.required = true;
      
      // Option vide si non requis
      if (!v.required) {
        const emptyOpt = document.createElement("option");
        emptyOpt.value = "";
        emptyOpt.textContent = "-- Sélectionner --";
        inputEl.appendChild(emptyOpt);
      }

      (v.options || []).forEach(opt => {
        const o = document.createElement("option");
        o.value = opt;
        o.textContent = opt;
        inputEl.appendChild(o);
      });
    }

    // --------------------------
    // TYPE : GEOLOC 
    // -> Affiché UNIQUEMENT dans scan.html
    // --------------------------
    else if (v.type === "geoloc") {

      inputEl = document.createElement("div");
      inputEl.className = "geoloc-container";

      if (isScanMode) {
        const btn = document.createElement("button");
        btn.textContent = "📍 Acquérir position GPS";
        btn.type = "button";
        btn.className = "btn-add-var";
        btn.style.marginBottom = "10px";

        const lat = document.createElement("input");
        lat.placeholder = "Latitude (ex: 48.8566)";
        lat.dataset.id = v.id + "_lat";
        lat.className = "geo-input";
        lat.type = "number";
        lat.step = "0.000001";
        if (v.required) lat.required = true;

        const lon = document.createElement("input");
        lon.placeholder = "Longitude (ex: 2.3522)";
        lon.dataset.id = v.id + "_lon";
        lon.className = "geo-input";
        lon.type = "number";
        lon.step = "0.000001";
        if (v.required) lon.required = true;

        // ✅ CORRECTION : Validation + gestion erreurs GPS
        btn.onclick = () => {
          btn.disabled = true;
          btn.textContent = "⏳ Localisation...";

          navigator.geolocation.getCurrentPosition(
            pos => {
              lat.value = pos.coords.latitude.toFixed(6);
              lon.value = pos.coords.longitude.toFixed(6);
              btn.disabled = false;
              btn.textContent = "✅ Position acquise";
              
              setTimeout(() => {
                btn.textContent = "📍 Acquérir position GPS";
              }, 2000);

              console.log("📍 GPS acquis :", lat.value, lon.value);
            },
            err => {
              console.error("❌ Erreur GPS :", err);
              btn.disabled = false;
              btn.textContent = "❌ Erreur GPS";
              
              let errorMsg = "Erreur de géolocalisation : ";
              switch(err.code) {
                case err.PERMISSION_DENIED:
                  errorMsg += "Permission refusée. Autorisez la géolocalisation dans les paramètres.";
                  break;
                case err.POSITION_UNAVAILABLE:
                  errorMsg += "Position indisponible.";
                  break;
                case err.TIMEOUT:
                  errorMsg += "Timeout dépassé.";
                  break;
                default:
                  errorMsg += err.message;
              }
              
              alert(errorMsg);
              
              setTimeout(() => {
                btn.textContent = "📍 Acquérir position GPS";
              }, 2000);
            },
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 0
            }
          );
        };

        inputEl.appendChild(btn);
        inputEl.appendChild(lat);
        inputEl.appendChild(lon);
      } 
      else {
        // Mode création => info uniquement
        const info = document.createElement("div");
        info.className = "helper";
        info.style.fontStyle = "italic";
        info.style.color = "#666";
        info.textContent = "ℹ️ (Géolocalisation — champs générés automatiquement lors du scan)";
        inputEl.appendChild(info);
      }
    }

    // --------------------------
    // TYPE : METEO
    // -> Géolocalisation + fetch Open-Meteo automatique + bloc résultat
    // --------------------------
    else if (v.type === "meteo") {

      inputEl = document.createElement("div");
      inputEl.className = "meteo-container";
      inputEl.dataset.id = v.id;

      if (isScanMode) {

        inputEl.innerHTML = `
          <div class="meteo-loc-row" style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px;">
            <input type="text" id="${v.id}_adresse" placeholder="Adresse complète du sinistre"
              style="flex:1;min-width:180px;padding:8px 10px;border:1px solid #ccc;border-radius:6px;font-size:13px;">
            <button type="button" id="${v.id}_btn_adresse" class="btn-add-var" style="white-space:nowrap;">
              🔍 Géocoder
            </button>
          </div>
          <div style="text-align:center;font-size:11px;color:#888;margin-bottom:6px;">— ou —</div>
          <div class="meteo-loc-row" style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px;">
            <input type="number" step="0.000001" id="${v.id}_lat" placeholder="Latitude" data-id="${v.id}_lat"
              style="flex:1;min-width:110px;padding:8px 10px;border:1px solid #ccc;border-radius:6px;font-size:13px;">
            <input type="number" step="0.000001" id="${v.id}_lon" placeholder="Longitude" data-id="${v.id}_lon"
              style="flex:1;min-width:110px;padding:8px 10px;border:1px solid #ccc;border-radius:6px;font-size:13px;">
            <button type="button" id="${v.id}_btn_gps" class="btn-add-var" style="white-space:nowrap;">
              📌 Ma position
            </button>
          </div>
          <div id="${v.id}_status" style="display:none;font-size:12px;padding:7px 10px;border-radius:6px;margin-bottom:8px;"></div>
          <div id="${v.id}_bloc" style="display:none;">
            <div id="${v.id}_source_banner" style="background:#e8f4fb;border:1px solid #aed6f1;border-radius:6px;
              padding:7px 12px;font-size:11px;color:#1a5276;margin-bottom:8px;"></div>
            <div style="overflow-x:auto;">
              <table id="${v.id}_table" style="width:100%;border-collapse:collapse;font-size:12px;background:#fff;
                border-radius:6px;overflow:hidden;box-shadow:0 1px 6px rgba(0,0,0,0.08);">
                <thead>
                  <tr style="background:#C0392B;color:#fff;">
                    <th style="padding:7px 10px;text-align:left;font-size:10px;letter-spacing:1px;text-transform:uppercase;">Paramètre</th>
                    <th style="padding:7px 10px;text-align:center;font-size:10px;letter-spacing:1px;text-transform:uppercase;">Actuel</th>
                    <th style="padding:7px 10px;text-align:center;font-size:10px;letter-spacing:1px;text-transform:uppercase;">H+6 (P)</th>
                    <th style="padding:7px 10px;text-align:center;font-size:10px;letter-spacing:1px;text-transform:uppercase;">H+12 (P)</th>
                  </tr>
                </thead>
                <tbody id="${v.id}_tbody"></tbody>
              </table>
            </div>
            <div id="${v.id}_note_pasquill" style="background:#fef9e7;border:1px solid #f9e79f;border-radius:6px;
              padding:8px 12px;font-size:11px;color:#7d6608;margin-top:8px;line-height:1.6;"></div>
            <div id="${v.id}_verif" style="background:#eafaf1;border:1px solid #a9dfbf;border-radius:6px;
              padding:7px 12px;font-size:11px;color:#1e8449;margin-top:6px;"></div>
          </div>
        `;

        // Stocker les données météo pour injection dans le prompt
        inputEl._meteoData = null;
        inputEl._lieu      = "";

        // ── helpers ──────────────────────────────────────────
        const setStatus = (msg, type) => {
          const s = document.getElementById(`${v.id}_status`);
          s.textContent = msg;
          s.style.display = "block";
          if (type === "loading") { s.style.background = "#fef9e7"; s.style.border = "1px solid #f9e79f"; s.style.color = "#7d6608"; }
          if (type === "success") { s.style.background = "#eafaf1"; s.style.border = "1px solid #a9dfbf"; s.style.color = "#1e8449"; }
          if (type === "error")   { s.style.background = "#fdedec"; s.style.border = "1px solid #f1948a"; s.style.color = "#922b21"; }
        };

        // ── Pasquill Turner 1964 ──────────────────────────────
        const pasquill = (kmh, neb, heure) => {
          const ms = kmh / 3.6;
          const jour = heure >= 6 && heure < 20;
          if (!jour) {
            if (neb >= 87) return "D";
            if (ms < 2)   return "F";
            if (ms < 3)   return "E";
            return "D";
          }
          const ins = neb < 25 ? "forte" : neb < 50 ? "modérée" : neb < 75 ? "faible" : "nulle";
          if (ms < 2) return ins === "nulle" ? "B" : "A";
          if (ms < 3) return ins === "forte" ? "A" : ins === "modérée" ? "B" : ins === "faible" ? "C" : "D";
          if (ms < 5) return ins === "forte" ? "B" : ins === "modérée" ? "B" : ins === "faible" ? "C" : "D";
          if (ms < 6) return ins === "forte" ? "C" : ins === "modérée" ? "C" : "D";
          return "D";
        };
        const pqDesc = c => ({ A:"Très instable — dispersion maximale", B:"Instable", C:"Légèrement instable",
          D:"Neutre — conditions standard", E:"Légèrement stable", F:"Stable — faible dispersion" }[c] || "—");

        // ── index horaire le plus proche ──────────────────────
        const iProche = (heures, cible) => {
          const t = new Date(cible).getTime();
          let idx = 0, min = Infinity;
          heures.forEach((h, i) => { const d = Math.abs(new Date(h).getTime() - t); if (d < min) { min = d; idx = i; } });
          return idx;
        };

        // ── direction vent ────────────────────────────────────
        const dirText = deg => {
          if (deg === null || deg === undefined) return "—";
          const dirs = ["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSO","SO","OSO","O","ONO","NO","NNO"];
          return dirs[Math.round(deg / 22.5) % 16] + ` (${Math.round(deg)}°)`;
        };

        const valStr = (arr, i, u, dec=0) => {
          if (!arr || arr[i] === null || arr[i] === undefined) return "—";
          const n = parseFloat(arr[i]);
          return isNaN(n) ? "—" : n.toFixed(dec) + (u ? " " + u : "");
        };

        // ── Affichage tableau + note ──────────────────────────
        const afficher = (data, lat, lon) => {
          const now  = new Date();
          const h6   = new Date(now.getTime() + 6  * 3600000).toISOString();
          const h12  = new Date(now.getTime() + 12 * 3600000).toISOString();
          const hres = data.hourly.time;
          const iN   = iProche(hres, now.toISOString());
          const i6   = iProche(hres, h6);
          const i12  = iProche(hres, h12);
          const d    = data.hourly;
          const cw   = data.current_weather;

          const pqN  = pasquill(d.windspeed_10m?.[iN]  ?? 0, d.cloudcover?.[iN]  ?? 50, now.getHours());
          const pq6  = pasquill(d.windspeed_10m?.[i6]  ?? 0, d.cloudcover?.[i6]  ?? 50, new Date(hres[i6]).getHours());
          const pq12 = pasquill(d.windspeed_10m?.[i12] ?? 0, d.cloudcover?.[i12] ?? 50, new Date(hres[i12]).getHours());

          const src = `Open-Meteo ${now.toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})} UTC`;

          const rows = [
            ["Vent — direction",    dirText(cw?.winddirection), dirText(d.winddirection_10m?.[i6]),  dirText(d.winddirection_10m?.[i12])],
            ["Vent — vitesse",      (cw ? Math.round(cw.windspeed)+" km/h" : "—"), valStr(d.windspeed_10m,i6,"km/h"),  valStr(d.windspeed_10m,i12,"km/h")],
            ["Vent — rafales",      valStr(d.windgusts_10m,iN,"km/h"),    valStr(d.windgusts_10m,i6,"km/h"),    valStr(d.windgusts_10m,i12,"km/h")],
            ["Température (°C)",    valStr(d.temperature_2m,iN,"°C",1),   valStr(d.temperature_2m,i6,"°C",1),   valStr(d.temperature_2m,i12,"°C",1)],
            ["Point de rosée (°C)", valStr(d.dewpoint_2m,iN,"°C",1),      valStr(d.dewpoint_2m,i6,"°C",1),      valStr(d.dewpoint_2m,i12,"°C",1)],
            ["Humidité (%)",        valStr(d.relativehumidity_2m,iN,"%"), valStr(d.relativehumidity_2m,i6,"%"), valStr(d.relativehumidity_2m,i12,"%")],
            ["Pression (hPa)",      valStr(d.surface_pressure,iN,"hPa",1),valStr(d.surface_pressure,i6,"hPa",1),valStr(d.surface_pressure,i12,"hPa",1)],
            ["Précipitations (mm/h)",valStr(d.precipitation,iN,"mm/h",1), valStr(d.precipitation,i6,"mm/h",1), valStr(d.precipitation,i12,"mm/h",1)],
            ["Visibilité",          valStr(d.visibility,iN,"m"),           valStr(d.visibility,i6,"m"),           valStr(d.visibility,i12,"m")],
            ["Nébulosité (%)",      valStr(d.cloudcover,iN,"%"),           valStr(d.cloudcover,i6,"%"),           valStr(d.cloudcover,i12,"%")],
            ["Stabilité Pasquill",  pqN, pq6 + " ⓟ", pq12 + " ⓟ"],
          ];

          document.getElementById(`${v.id}_tbody`).innerHTML = rows.map(([p,a,h6v,h12v]) =>
            `<tr style="border-bottom:1px solid #f0f0f0;">
              <td style="padding:6px 10px;color:#555;font-size:11px;font-weight:600;">${p}</td>
              <td style="padding:6px 10px;text-align:center;">${a}</td>
              <td style="padding:6px 10px;text-align:center;">${h6v}</td>
              <td style="padding:6px 10px;text-align:center;">${h12v}</td>
            </tr>`).join("");

          document.getElementById(`${v.id}_source_banner`).innerHTML =
            `<strong>Source :</strong> Open-Meteo API — <strong>Lieu :</strong> ${inputEl._lieu} — <strong>Coords :</strong> ${lat.toFixed(5)}, ${lon.toFixed(5)}`;

          document.getElementById(`${v.id}_note_pasquill`).innerHTML =
            `<strong>📐 Pasquill Turner (1964)</strong> — Actuel : <strong>${pqN}</strong> (${pqDesc(pqN)}) | H+6 : <strong>${pq6}</strong> | H+12 : <strong>${pq12}</strong><br>
            <em>ⓟ = prévision modèle numérique — incertitude croissante avec l'échéance</em>`;

          document.getElementById(`${v.id}_verif`).textContent =
            `✅ Données vérifiées le ${now.toLocaleDateString("fr-FR")} à ${now.toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})} UTC — Source : Open-Meteo API`;

          document.getElementById(`${v.id}_bloc`).style.display = "block";

          // Construire le bloc texte pour injection dans le prompt
          const dateStr = now.toLocaleDateString("fr-FR");
          const hUTC    = now.toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"}) + " UTC";
          inputEl._meteoData = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DONNÉES MÉTÉO RÉELLES — Source : Open-Meteo API
Lieu : ${inputEl._lieu} | Coords : ${lat.toFixed(5)}, ${lon.toFixed(5)}
Vérifiées le ${dateStr} à ${hUTC}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

| Paramètre              | Actuel          | H+6 (P)        | H+12 (P)       |
|------------------------|-----------------|----------------|----------------|
| Vent — direction       | ${dirText(cw?.winddirection).padEnd(15)} | ${dirText(d.winddirection_10m?.[i6]).padEnd(14)} | ${dirText(d.winddirection_10m?.[i12]).padEnd(14)} |
| Vent — vitesse (km/h)  | ${(cw ? Math.round(cw.windspeed)+" km/h" : "—").padEnd(15)} | ${valStr(d.windspeed_10m,i6,"km/h").padEnd(14)} | ${valStr(d.windspeed_10m,i12,"km/h").padEnd(14)} |
| Vent — rafales (km/h)  | ${valStr(d.windgusts_10m,iN,"km/h").padEnd(15)} | ${valStr(d.windgusts_10m,i6,"km/h").padEnd(14)} | ${valStr(d.windgusts_10m,i12,"km/h").padEnd(14)} |
| Température (°C)       | ${valStr(d.temperature_2m,iN,"°C",1).padEnd(15)} | ${valStr(d.temperature_2m,i6,"°C",1).padEnd(14)} | ${valStr(d.temperature_2m,i12,"°C",1).padEnd(14)} |
| Point de rosée (°C)    | ${valStr(d.dewpoint_2m,iN,"°C",1).padEnd(15)} | ${valStr(d.dewpoint_2m,i6,"°C",1).padEnd(14)} | ${valStr(d.dewpoint_2m,i12,"°C",1).padEnd(14)} |
| Humidité relative (%)  | ${valStr(d.relativehumidity_2m,iN,"%").padEnd(15)} | ${valStr(d.relativehumidity_2m,i6,"%").padEnd(14)} | ${valStr(d.relativehumidity_2m,i12,"%").padEnd(14)} |
| Pression atm. (hPa)    | ${valStr(d.surface_pressure,iN,"hPa",1).padEnd(15)} | ${valStr(d.surface_pressure,i6,"hPa",1).padEnd(14)} | ${valStr(d.surface_pressure,i12,"hPa",1).padEnd(14)} |
| Précipitations (mm/h)  | ${valStr(d.precipitation,iN,"mm/h",1).padEnd(15)} | ${valStr(d.precipitation,i6,"mm/h",1).padEnd(14)} | ${valStr(d.precipitation,i12,"mm/h",1).padEnd(14)} |
| Visibilité             | ${valStr(d.visibility,iN,"m").padEnd(15)} | ${valStr(d.visibility,i6,"m").padEnd(14)} | ${valStr(d.visibility,i12,"m").padEnd(14)} |
| Nébulosité (%)         | ${valStr(d.cloudcover,iN,"%").padEnd(15)} | ${valStr(d.cloudcover,i6,"%").padEnd(14)} | ${valStr(d.cloudcover,i12,"%").padEnd(14)} |
| Stabilité Pasquill     | Classe ${pqN.padEnd(8)} | Classe ${pq6.padEnd(7)} | Classe ${pq12.padEnd(7)} |

NOTE PASQUILL (Turner, 1964) :
• Actuel : Classe ${pqN} — ${pqDesc(pqN)}
• H+6 (P) : Classe ${pq6} — ${pqDesc(pq6)}
• H+12 (P) : Classe ${pq12} — ${pqDesc(pq12)}
(P) = prévision modèle numérique — incertitude croissante avec l'échéance
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
        };

        // ── Fetch Open-Meteo ──────────────────────────────────
        const fetchMeteo = async (lat, lon) => {
          setStatus("🔄 Interrogation Open-Meteo en cours…", "loading");
          const params = [
            "temperature_2m","relativehumidity_2m","dewpoint_2m",
            "precipitation","cloudcover","visibility",
            "windspeed_10m","winddirection_10m","windgusts_10m","surface_pressure"
          ].join(",");
          const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}`
            + `&hourly=${params}&current_weather=true&wind_speed_unit=kmh&timezone=auto&forecast_days=2`;
          try {
            const r = await fetch(url);
            if (!r.ok) throw new Error(`HTTP ${r.status}`);
            const data = await r.json();
            afficher(data, lat, lon);
            setStatus("✅ Données météo récupérées — Open-Meteo", "success");
          } catch(e) {
            setStatus("❌ Erreur Open-Meteo : " + e.message, "error");
          }
        };

        // ── Géocodage Nominatim ───────────────────────────────
        const geocoder = async () => {
          const adr = document.getElementById(`${v.id}_adresse`).value.trim();
          if (!adr) { setStatus("⚠️ Saisissez une adresse.", "error"); return; }
          setStatus("🔄 Géocodage…", "loading");
          try {
            const r = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(adr)}&limit=1`,
              { headers: { "Accept-Language": "fr" } });
            const d = await r.json();
            if (!d.length) { setStatus("❌ Adresse introuvable.", "error"); return; }
            const lat = parseFloat(d[0].lat), lon = parseFloat(d[0].lon);
            document.getElementById(`${v.id}_lat`).value = lat.toFixed(6);
            document.getElementById(`${v.id}_lon`).value = lon.toFixed(6);
            inputEl._lieu = d[0].display_name;
            await fetchMeteo(lat, lon);
          } catch(e) { setStatus("❌ Erreur géocodage : " + e.message, "error"); }
        };

        // ── Géolocalisation navigateur ────────────────────────
        const geolocMe = () => {
          if (!navigator.geolocation) { setStatus("❌ Géolocalisation non disponible.", "error"); return; }
          setStatus("🔄 Acquisition position GPS…", "loading");
          navigator.geolocation.getCurrentPosition(
            pos => {
              const lat = pos.coords.latitude, lon = pos.coords.longitude;
              document.getElementById(`${v.id}_lat`).value = lat.toFixed(6);
              document.getElementById(`${v.id}_lon`).value = lon.toFixed(6);
              inputEl._lieu = `Position GPS — Lat ${lat.toFixed(5)} / Lon ${lon.toFixed(5)}`;
              fetchMeteo(lat, lon);
            },
            err => setStatus("❌ GPS refusé ou indisponible.", "error"),
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
          );
        };

        // ── Déclenchement auto dès que lat ET lon sont renseignés ──
        const autoFetch = () => {
          const latEl = document.getElementById(`${v.id}_lat`);
          const lonEl = document.getElementById(`${v.id}_lon`);
          const lat   = parseFloat(latEl.value);
          const lon   = parseFloat(lonEl.value);
          if (!isNaN(lat) && !isNaN(lon)
              && lat >= -90 && lat <= 90
              && lon >= -180 && lon <= 180) {
            inputEl._lieu = `Lat ${lat.toFixed(5)} / Lon ${lon.toFixed(5)}`;
            fetchMeteo(lat, lon);
          }
        };

        // ── Binding événements ────────────────────────────────
        // Attendre que le DOM soit inséré avant de binder
        setTimeout(() => {
          document.getElementById(`${v.id}_btn_adresse`)?.addEventListener("click", geocoder);
          document.getElementById(`${v.id}_adresse`)?.addEventListener("keydown", e => { if (e.key === "Enter") geocoder(); });
          document.getElementById(`${v.id}_btn_gps`)?.addEventListener("click", geolocMe);
          document.getElementById(`${v.id}_lat`)?.addEventListener("change", autoFetch);
          document.getElementById(`${v.id}_lon`)?.addEventListener("change", autoFetch);
        }, 0);

      } else {
        // Mode création — info uniquement
        const info = document.createElement("div");
        info.className = "helper";
        info.style.cssText = "font-style:italic;color:#666;padding:8px;";
        info.textContent = "ℹ️ (Météo NRBC — données Open-Meteo chargées automatiquement à la lecture via GPS ou adresse)";
        inputEl.appendChild(info);
      }
    }

    // --------------------------
    // ATTRIBUT COMMUN
    // --------------------------
    if (inputEl && inputEl.dataset) {
      inputEl.dataset.id = v.id;
    }

    wrapper.appendChild(inputEl);
    container.appendChild(wrapper);
  });

  console.log(`✅ ${fiche.prompt.variables.length} variables affichées`);
}


// =================================================================
// Récupérer toutes les valeurs du formulaire (scan mode only)
// =================================================================
export function getValues(fiche) {
  const vals = {};

  if (!fiche.prompt || !Array.isArray(fiche.prompt.variables)) {
    console.error("❌ Aucune variable dans la fiche");
    return vals;
  }

  fiche.prompt.variables.forEach(v => {

    // Type météo : retourner le bloc texte généré
    if (v.type === "meteo") {
      const container = document.querySelector(`.meteo-container[data-id="${v.id}"]`);
      vals[v.id] = container?._meteoData || "[DONNÉES MÉTÉO NON DISPONIBLES — GPS non saisi]";
      return;
    }

    if (v.type === "geoloc") {
      // GPS => latitude + longitude
      const lat = document.querySelector(`[data-id="${v.id}_lat"]`);
      const lon = document.querySelector(`[data-id="${v.id}_lon"]`);

      // ✅ CORRECTION : Validation des coordonnées
      if (lat && lon) {
        const latVal = lat.value.trim();
        const lonVal = lon.value.trim();

        if (latVal && lonVal) {
          if (isValidLatitude(latVal) && isValidLongitude(lonVal)) {
            vals[v.id] = `${latVal},${lonVal}`;
            console.log(`✅ GPS valide : ${v.id} = ${vals[v.id]}`);
          } else {
            console.error(`❌ Coordonnées GPS invalides pour ${v.id}`);
            vals[v.id] = "";
          }
        } else {
          vals[v.id] = "";
        }
      } else {
        vals[v.id] = "";
      }

      return;
    }

    // Variables simples
    const el = document.querySelector(`[data-id="${v.id}"]`);
    
    if (el) {
      vals[v.id] = el.value.trim();
      
      // Validation champs requis
      if (v.required && !vals[v.id]) {
        console.warn(`⚠️ Champ requis vide : ${v.label || v.id}`);
      }
    } else {
      console.warn(`⚠️ Champ introuvable : ${v.id}`);
      vals[v.id] = "";
    }
  });

  return vals;
}


// =================================================================
// Générer le prompt final
// =================================================================
export function generatePrompt(fiche, vals) {
  if (!fiche.prompt || !fiche.prompt.base) {
    throw new Error("❌ Prompt de base manquant dans la fiche");
  }

  let prompt = fiche.prompt.base;

  // Remplacement des variables
  Object.keys(vals).forEach(k => {
    const value = vals[k] || "";
    prompt = prompt.replaceAll(`{{${k}}}`, value);
  });

  // Vérification des variables non remplacées
  const unreplaced = prompt.match(/\{\{[^}]+\}\}/g);
  if (unreplaced) {
    console.warn("⚠️ Variables non remplacées :", unreplaced);
  }

  return prompt;
}
