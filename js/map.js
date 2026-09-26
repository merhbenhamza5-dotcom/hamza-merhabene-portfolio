/* ==========================================================================
   2D project map (Leaflet)
   - Leaflet is loaded on demand from a CDN when the section approaches.
   - Locations come from geojson/project-locations.geojson; an inline copy is
     used when the file cannot be fetched (e.g. opening index.html from disk).
   - To add a location: add a Feature to the GeoJSON (EPSG:4326, lon/lat) and
     list the related project ids in "projects".
   ========================================================================== */
(function () {
  "use strict";

  var LEAFLET = [
    { css: "assets/vendor/leaflet/leaflet.css", js: "assets/vendor/leaflet/leaflet.js" },
    { css: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css", js: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js" },
    { css: "https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css", js: "https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js" }
  ];
  var GEOJSON_URL = "geojson/project-locations.geojson";

  var TYPES = {
    work:      { color: "#58d6c4", en: "Professional work", fr: "Missions professionnelles" },
    freelance: { color: "#f5a524", en: "Freelance data regions", fr: "Régions de données (freelance)" },
    academic:  { color: "#9aa8ff", en: "Academic", fr: "Académique" },
    base:      { color: "#e6edf3", en: "Base", fr: "Base" }
  };

  var map = null, features = [], markers = {}, groups = {}, layerControl = null, baseLayers = null;
  var started = false, pendingLocation = null, needsFit = false;

  function lang() { return (window.I18N && window.I18N.lang) || "en"; }
  function T(k) { return window.I18N ? window.I18N.t(k) : k; }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }

  function loadCSS(href) {
    var l = document.createElement("link");
    l.rel = "stylesheet"; l.href = href; l.crossOrigin = "";
    document.head.appendChild(l);
  }
  function loadJS(src) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement("script");
      s.src = src; s.async = true; s.crossOrigin = "";
      s.onload = resolve; s.onerror = reject;
      document.head.appendChild(s);
    });
  }
  function loadLeaflet(i) {
    i = i || 0;
    if (window.L && window.L.map) return Promise.resolve();
    if (i >= LEAFLET.length) return Promise.reject(new Error("Leaflet unavailable"));
    loadCSS(LEAFLET[i].css);
    return loadJS(LEAFLET[i].js).catch(function () { return loadLeaflet(i + 1); });
  }

  function loadData() {
    return fetch(GEOJSON_URL)
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .catch(function () { return INLINE; });
  }

  function projectTitle(id) {
    var p = window.Projects && window.Projects.get(id);
    return p ? p[lang()].title : id;
  }

  function popupHTML(f) {
    var p = f.properties, l = lang();
    var list = (p.projects || []).map(function (id) {
      return '<li><button type="button" class="pop-link" data-open="' + esc(id) + '">' + esc(projectTitle(id)) + " →</button></li>";
    }).join("");
    var prec = p.precision === "region" ? (l === "fr" ? "Position indicative (région)" : "Indicative position (region)")
                                        : (l === "fr" ? "Position à l'échelle de la ville" : "City-level position");
    return '<div class="pop">' +
      '<p class="pop-type mono" style="color:' + TYPES[p.type].color + '">' + esc(TYPES[p.type][l]) + "</p>" +
      "<h4>" + esc(p["name_" + l] || p.name_en) + "</h4>" +
      '<p class="pop-org">' + esc(p.org) + "</p>" +
      "<p>" + esc(p["note_" + l] || p.note_en) + "</p>" +
      (list ? '<ul class="pop-list">' + list + "</ul>" : "") +
      '<p class="pop-prec mono">' + esc(prec) + "</p>" +
    "</div>";
  }

  function markerIcon(type) {
    return window.L.divIcon({
      className: "gis-marker gis-marker-" + type,
      html: '<span style="--c:' + TYPES[type].color + '"></span>',
      iconSize: [22, 22],
      iconAnchor: [11, 11],
      popupAnchor: [0, -10]
    });
  }

  function renderList() {
    var ul = document.getElementById("map-location-list");
    if (!ul) return;
    var l = lang();
    ul.innerHTML = features.map(function (f) {
      var p = f.properties;
      return '<li><button type="button" data-loc="' + esc(p.id) + '">' +
        '<span class="map-dot" style="background:' + TYPES[p.type].color + '"></span>' +
        '<span class="map-li-text"><strong>' + esc(p["name_" + l] || p.name_en) + "</strong>" +
        "<small>" + esc(p.org) + "</small></span></button></li>";
    }).join("");
  }

  function focusLocation(id) {
    if (!map || !markers[id]) { pendingLocation = id; return; }
    var m = markers[id];
    var f = features.filter(function (x) { return x.properties.id === id; })[0];
    var zoom = f && f.properties.precision === "region" ? 5 : 10;
    // Make sure the marker's group is visible
    var type = f.properties.type;
    if (!map.hasLayer(groups[type])) map.addLayer(groups[type]);
    map.flyTo(m.getLatLng(), zoom, { duration: 1.1 });
    map.once("moveend", function () { m.openPopup(); });
    document.querySelectorAll("#map-location-list button").forEach(function (b) {
      b.classList.toggle("is-active", b.getAttribute("data-loc") === id);
    });
  }

  function buildLayers() {
    var L = window.L, l = lang();
    Object.keys(groups).forEach(function (k) { map.removeLayer(groups[k]); });
    if (layerControl) map.removeControl(layerControl);
    groups = {}; markers = {};

    Object.keys(TYPES).forEach(function (t) { groups[t] = L.layerGroup(); });
    features.forEach(function (f) {
      var c = f.geometry.coordinates;
      var m = L.marker([c[1], c[0]], { icon: markerIcon(f.properties.type), title: f.properties["name_" + l] || f.properties.name_en, riseOnHover: true });
      m.bindPopup(popupHTML(f), { maxWidth: 300, className: "gis-popup" });
      m.addTo(groups[f.properties.type]);
      markers[f.properties.id] = m;
    });

    var overlays = {};
    Object.keys(TYPES).forEach(function (t) {
      groups[t].addTo(map);
      overlays['<span class="lc-dot" style="background:' + TYPES[t].color + '"></span>' + TYPES[t][l]] = groups[t];
    });
    var bases = {};
    bases[T("map.base.dark")] = baseLayers.dark;
    bases[T("map.base.osm")] = baseLayers.osm;
    bases[T("map.base.sat")] = baseLayers.sat;
    layerControl = L.control.layers(bases, overlays, { collapsed: window.innerWidth < 760 }).addTo(map);
  }

  function fitAll() {
    var L = window.L;
    var b = L.latLngBounds(features.map(function (f) { return [f.geometry.coordinates[1], f.geometry.coordinates[0]]; }));
    map.fitBounds(b, { padding: [40, 40], maxZoom: 5 });
  }

  function initMap(data) {
    var L = window.L;
    features = data.features || [];
    var el = document.getElementById("project-map");

    map = L.map(el, { zoomControl: true, worldCopyJump: true, scrollWheelZoom: false, minZoom: 2 });

    baseLayers = {
      dark: L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        subdomains: "abcd", maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
      }),
      osm: L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }),
      sat: L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
        maxZoom: 19, attribution: "Tiles &copy; Esri — Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community"
      })
    };
    baseLayers.dark.addTo(map);
    L.control.scale({ imperial: false }).addTo(map);

    buildLayers();
    renderList();
    if (el.clientWidth === 0) needsFit = true; else fitAll();

    // Enable scroll-zoom only after the user interacts with the map
    map.on("click focus", function () { map.scrollWheelZoom.enable(); });
    el.addEventListener("mouseleave", function () { map.scrollWheelZoom.disable(); });

    // Popup links open the related case study
    map.on("popupopen", function (e) {
      var root = e.popup.getElement();
      if (!root) return;
      root.querySelectorAll("[data-open]").forEach(function (b) {
        b.addEventListener("click", function (ev) {
          ev.preventDefault(); ev.stopPropagation();
          if (window.Projects) window.Projects.open(b.getAttribute("data-open"), b);
        });
      });
    });

    var hud = document.getElementById("map-hud");
    map.on("mousemove", function (e) {
      var lat = e.latlng.lat, lon = L.Util.wrapNum(e.latlng.lng, [-180, 180], true);
      hud.textContent = Math.abs(lat).toFixed(4) + "° " + (lat >= 0 ? "N" : "S") + "  " + Math.abs(lon).toFixed(4) + "° " + (lon >= 0 ? "E" : "W") + "  z" + map.getZoom();
    });

    document.getElementById("map-location-list").addEventListener("click", function (e) {
      var b = e.target.closest("[data-loc]");
      if (b) focusLocation(b.getAttribute("data-loc"));
    });

    document.addEventListener("langchange", function () {
      buildLayers();
      renderList();
    });
    document.addEventListener("panel-2d-shown", function () {
      setTimeout(function () {
        map.invalidateSize();
        if (needsFit) { needsFit = false; fitAll(); }
      }, 30);
    });

    if (pendingLocation) { var id = pendingLocation; pendingLocation = null; setTimeout(function () { focusLocation(id); }, 350); }
  }

  function fail() {
    var el = document.getElementById("project-map");
    el.innerHTML = '<div class="map-fallback"><p>' + esc(T("map.fallback")) + "</p></div>";
    // Still show the location list so the information is available
    loadData().then(function (d) { features = d.features || []; renderList(); });
  }

  function start() {
    if (started) return;
    started = true;
    Promise.all([loadLeaflet(), loadData()]).then(function (res) { initMap(res[1]); }).catch(fail);
  }

  function initFullscreen() {
    var wrap = document.getElementById("map-wrap");
    var btn = document.getElementById("map-fullscreen");
    btn.addEventListener("click", function () {
      if (document.fullscreenElement === wrap) { document.exitFullscreen(); return; }
      if (wrap.requestFullscreen) {
        wrap.requestFullscreen().catch(function () { wrap.classList.toggle("is-fs"); refresh(); });
      } else {
        wrap.classList.toggle("is-fs"); refresh();
      }
    });
    document.addEventListener("fullscreenchange", refresh);
    function refresh() { if (map) setTimeout(function () { map.invalidateSize(); }, 60); }
  }

  function init() {
    initFullscreen();
    document.addEventListener("show-location", function (e) { start(); focusLocation(e.detail.id); });
    var sec = document.getElementById("maps");
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (en) {
        if (en[0].isIntersecting) { start(); io.disconnect(); }
      }, { rootMargin: "400px 0px" });
      io.observe(sec);
    } else start();
  }

  // Inline copy of geojson/project-locations.geojson (used only if fetch fails, e.g. file://)
  var INLINE = {"type":"FeatureCollection","features":[
    {"type":"Feature","properties":{"id":"lisbon","type":"base","precision":"city","name_en":"Lisbon, Portugal","name_fr":"Lisbonne, Portugal","org":"Base · Universidade Lusófona","note_en":"Current base. Master's in Data Science.","note_fr":"Base actuelle. Master en Data Science.","projects":[]},"geometry":{"type":"Point","coordinates":[-9.1393,38.7223]}},
    {"type":"Feature","properties":{"id":"bc","type":"freelance","precision":"region","name_en":"British Columbia, Canada","name_fr":"Colombie-Britannique, Canada","org":"Freelance GIS consulting (remote)","note_en":"Mining and mineral tenure datasets, Crown tenure, LTSA title research data.","note_fr":"Données minières et titres miniers, tenures de la Couronne, recherches de titres LTSA.","projects":["mining-tenure","arcpy-automation","cartography"]},"geometry":{"type":"Point","coordinates":[-124.5,53.7]}},
    {"type":"Feature","properties":{"id":"us-plss","type":"freelance","precision":"region","name_en":"United States — PLSS / BLM data","name_fr":"États-Unis — données PLSS / BLM","org":"Freelance GIS consulting (remote)","note_en":"PLSS / BLM tenure datasets processed for tenure and constraints mapping.","note_fr":"Données foncières PLSS / BLM traitées pour la cartographie des tenures et des contraintes.","projects":["mining-tenure"]},"geometry":{"type":"Point","coordinates":[-112.0,40.5]}},
    {"type":"Feature","properties":{"id":"tunis-wolo","type":"work","precision":"city","name_en":"Tunis, Tunisia","name_fr":"Tunis, Tunisie","org":"WOLO Engineering · 2023–2025","note_en":"Photogrammetry, drone mapping, LiDAR and cartographic production.","note_fr":"Photogrammétrie, cartographie par drone, LiDAR et production cartographique.","projects":["drone-photogrammetry","dsm-dtm","3d-reconstruction","lidar","webgis-360","cartography"]},"geometry":{"type":"Point","coordinates":[10.197,36.843]}},
    {"type":"Feature","properties":{"id":"tunis-but","type":"work","precision":"city","name_en":"Tunis, Tunisia","name_fr":"Tunis, Tunisie","org":"Topography BUT, But Groupe · 2021","note_en":"Topographic surveying, quarry volumes, land subdivision.","note_fr":"Levés topographiques, cubatures de carrière, lotissement.","projects":["topo-quarry"]},"geometry":{"type":"Point","coordinates":[10.14,36.79]}},
    {"type":"Feature","properties":{"id":"tunis-esat","type":"academic","precision":"city","name_en":"Tunis, Tunisia","name_fr":"Tunis, Tunisie","org":"ESAT University · 2020–2023","note_en":"National Engineer's Degree in Geomatics and Surveying; academic projects.","note_fr":"Diplôme National d'Ingénieur en Géomatique et Topographie ; projets académiques.","projects":["flood-risk"]},"geometry":{"type":"Point","coordinates":[10.235,36.815]}},
    {"type":"Feature","properties":{"id":"nabeul","type":"work","precision":"city","name_en":"Nabeul, Tunisia","name_fr":"Nabeul, Tunisie","org":"GeoTop · ISET Nabeul 2017–2020","note_en":"GeoTop (final-year project host) and ISET Nabeul.","note_fr":"GeoTop (organisme d'accueil du PFE) et ISET Nabeul.","projects":[]},"geometry":{"type":"Point","coordinates":[10.7376,36.4561]}},
    {"type":"Feature","properties":{"id":"kerkennah","type":"work","precision":"region","name_en":"Kerkennah Islands, Tunisia","name_fr":"Îles Kerkennah, Tunisie","org":"GeoTop · STEG low-voltage network · 2023","note_en":"Low-voltage network database, QField field collection and WebGIS (final-year project).","note_fr":"Base de données du réseau basse tension, collecte QField et WebSIG (projet de fin d'études).","projects":["utility-gis-db","webgis-lizmap"]},"geometry":{"type":"Point","coordinates":[11.25,34.72]}}
  ]};

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
