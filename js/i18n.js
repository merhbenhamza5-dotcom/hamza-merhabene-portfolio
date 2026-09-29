/* ==========================================================================
   EN / FR language switch.
   English lives in index.html (good for SEO); this file holds French.
   On first switch, the original English text is cached from the DOM so
   switching back restores it exactly.
   Elements:  data-i18n="key"         -> textContent (or innerHTML if the FR string contains a tag)
   ========================================================================== */
(function () {
  "use strict";

  var FR = {
    "skip": "Aller au contenu",
    "brand.role": "Ingénieur Géomaticien & SIG",
    "nav.home": "Accueil",
    "nav.about": "Profil",
    "nav.experience": "Expérience",
    "nav.projects": "Projets",
    "nav.skills": "Compétences",
    "nav.maps": "3D / Cartes",
    "nav.education": "Formation",
    "nav.contact": "Contact",
    "cta.cv": "Télécharger le CV",
    "cta.cvpdf": "Télécharger le CV (PDF)",
    "cta.projects": "Voir les projets",
    "cta.contact": "Me contacter",

    "hero.eyebrow": "Géomatique · SIG · Photogrammétrie · 3D",
    "hero.title1": "Ingénieur Géomaticien & SIG",
    "hero.title2": "Transformer la donnée géospatiale en solutions numériques.",
    "hero.lead": "Ingénieur en géomatique et topographie, spécialisé en SIG, traitement de données spatiales, cartographie, photogrammétrie, cartographie par drone et automatisation géospatiale.",
    "hero.meta.base": "Lisbonne, Portugal",
    "hero.meta.open": "Ouvert aux postes au Portugal, en Europe et à distance · Freelance",
    "hero.meta.lang": "Arabe · Français · Anglais",
    "hero.panel.title": "WORKFLOW // ACQUISITION → LIVRAISON",
    "pipe.1.t": "Acquisition",
    "pipe.1.d": "GNSS RTK · Station totale · Images drone · Points d'appui (GCP)",
    "pipe.2.t": "Traitement",
    "pipe.2.d": "Metashape · Pix4D · TerraScan · nuages de points",
    "pipe.3.t": "Modélisation & stockage",
    "pipe.3.d": "MNS / MNT · maillages 3D · PostgreSQL / PostGIS",
    "pipe.4.t": "Analyse & automatisation",
    "pipe.4.d": "ArcGIS Pro · QGIS · Python / ArcPy · FME",
    "pipe.5.t": "Livraison",
    "pipe.5.d": "Cartes · plans CAO · WebSIG (Lizmap, GeoJSON)",

    "about.kicker": "01 — Profil",
    "about.title": "Résumé professionnel",
    "about.p1": "Ingénieur en géomatique et topographie avec plus de 4 ans d'expérience en analyse SIG, levés topographiques, photogrammétrie par drone, traitement LiDAR et télédétection.",
    "about.p2": "Je conçois des chaînes de traitement géospatiales combinant SIG, photogrammétrie, topographie et traitement automatisé des données : des images drone calées sur points d'appui et des nuages de points classifiés jusqu'aux bases de données spatiales validées, aux livrables cartographiques et au WebSIG.",
    "about.p3": "Activité actuelle : consultant SIG freelance sur les données foncières et les titres miniers (données minières de la Colombie-Britannique, PLSS / BLM, tenures de la Couronne, recherches de titres LTSA), avec automatisation Python / ArcPy et production SIG vers CAO. En parallèle, je suis un Master en Data Science à l'Universidade Lusófona, Lisbonne.",
    "focus.1.t": "Analyse spatiale & cartographie",
    "focus.1.d": "Cartographie des contraintes, aptitude de sites, cartographie thématique, production cartographique.",
    "focus.2.t": "Photogrammétrie & LiDAR",
    "focus.2.d": "Géoréférencement par GCP, orthomosaïques, MNS / MNT, maillages, classification de nuages de points.",
    "focus.3.t": "Bases de données spatiales & WebSIG",
    "focus.3.d": "PostgreSQL / PostGIS, collecte terrain QField, publication Lizmap.",
    "focus.4.t": "Automatisation & data science",
    "focus.4.d": "Boîtes à outils Python / ArcPy, automatisation des géotraitements, analyse de données.",
    "glance.title": "Ingénieur en Géomatique & Topographie",
    "glance.base": "Basé à",
    "glance.base.v": "Lisbonne, Portugal",
    "glance.role": "Actuellement",
    "glance.role.v": "Consultant SIG freelance",
    "glance.study": "Formation",
    "glance.study.v": "Master en Data Science",
    "glance.phone": "Téléphone",
    "glance.lang": "Langues",
    "glance.lang.v": "Arabe (maternelle) · Français (courant) · Anglais (courant)",
    "glance.open": "Ouvert à",
    "glance.open.v": "Postes au Portugal et en Europe · à distance · freelance",

    "exp.kicker": "02 — Expérience",
    "exp.title": "Expérience professionnelle",
    "exp.link": "Étude de cas associée",
    "exp.1.date": "Oct. 2025 — Aujourd'hui",
    "exp.1.role": "Consultant SIG Freelance",
    "exp.1.org": "SIG foncier, tenures & mines",
    "exp.1.loc": "À distance / International",
    "exp.1.b1": "Cartes thématiques, mises en page cartographiques et documentation technique pour l'aptitude de sites, l'analyse foncière et l'évaluation des tenures sur plus de 15 zones de projet.",
    "exp.1.b2": "Cartographie des contraintes par croisement de données géologiques, cadastrales et de tenures : données minières de la Colombie-Britannique, PLSS / BLM, tenures de la Couronne, claims et concessions minières, données de recherche de titres LTSA.",
    "exp.1.b3": "Conversion SIG vers CAO et production de plans AutoCAD, avec gestion des systèmes de coordonnées de référence et des transformations de datum dans ArcGIS Pro.",
    "exp.1.b4": "Automatisation Python / ArcPy des géotraitements et de la gestion de fichiers répétitifs via des boîtes à outils ArcGIS personnalisées ; contrôle qualité des données géospatiales.",
    "exp.2.date": "Oct. 2023 — Oct. 2025",
    "exp.2.role": "Chargé d'Études Cartographiques & Photogrammétriques",
    "exp.2.loc": "Tunis, Tunisie",
    "exp.2.b1": "Identification des points d'appui (GCP) et géoréférencement d'images drone sur plus de 30 missions de levé pour des projets d'infrastructure et d'aménagement foncier.",
    "exp.2.b2": "Génération de nuages de points denses, MNS et MNT, orthomosaïques et modèles 3D maillés ; traitement de données photogrammétriques.",
    "exp.2.b3": "Classification de nuages de points LiDAR (sol, végétation, bâtiments) et filtrage du bruit sous MicroStation / TerraScan.",
    "exp.2.b4": "Production cartographique, analyse spatiale et cartographie thématique pour l'aménagement du territoire et l'évaluation de sites ; intégration SIG / CAO et contrôle qualité des livrables.",
    "exp.3.date": "Mars 2023 — Sept. 2023",
    "exp.3.role": "Ingénieur Topographe & SIG — Projet de Fin d'Études",
    "exp.3.loc": "Nabeul, Tunisie",
    "exp.3.b1": "Conception d'une base de données SIG pour le réseau électrique basse tension de l'île de Kerkennah (STEG) : dictionnaire de données, modèle UML sous Enterprise Architect, PostgreSQL / PostGIS.",
    "exp.3.b2": "Collecte terrain des éléments du réseau basse tension avec QField : plus de 1 000 équipements relevés.",
    "exp.3.b3": "Traitement des données de levé et correction des erreurs topologiques avec ArcGIS et ArcPy ; intégration SQL dans la base de production.",
    "exp.3.b4": "Réalisation du WebSIG de visualisation du réseau et de gestion du patrimoine : publication GeoServer, application web Leaflet et Lizmap.",
    "exp.4.date": "Juin 2021 — Août 2021",
    "exp.4.role": "Stage en Topographie",
    "exp.4.loc": "Tunis, Tunisie",
    "exp.4.b1": "Levés topographiques et calculs de cubatures de stocks en vue de l'exploitation d'une carrière.",
    "exp.4.b2": "Lotissement et implantation de lots pour des projets d'aménagement foncier.",
    "exp.4.b3": "Traitement des données de levé, plans topographiques sous AutoCAD / Covadis et calcul des cubatures de terrassement pour routes et plateformes selon les lignes de projet.",

    "proj.kicker": "03 — Projets",
    "proj.title": "Travaux sélectionnés",
    "proj.intro": "Études de cas issues de missions professionnelles, freelance et académiques. Les noms des clients et la localisation exacte des sites ne sont pas publiés.",

    "skills.kicker": "04 — Compétences",
    "skills.title": "Compétences techniques",
    "skills.gis": "SIG & Analyse spatiale",
    "skills.prog": "Programmation & Données",
    "skills.survey": "Topographie & CAO",
    "skills.photo": "Photogrammétrie & Télédétection",
    "skills.3d": "3D & Nuages de points",
    "skills.ds.h": "Data Science",
    "skills.ds.tag": "Master en cours",
    "sk.spatial": "Analyse spatiale",
    "sk.carto": "Cartographie",
    "sk.gdb": "Géodatabase",
    "sk.constraints": "Cartographie des contraintes",
    "sk.suit": "Aptitude de sites",
    "sk.topo": "Correction topologique",
    "sk.sdb": "Bases de données spatiales",
    "sk.ts": "Station totale",
    "sk.level": "Nivellement & implantation",
    "sk.toposurvey": "Levés topographiques",
    "sk.vol": "Calcul de cubatures",
    "sk.crs": "Systèmes de coordonnées",
    "sk.datum": "Transformations de datum",
    "sk.cadgis": "Intégration CAO / SIG",
    "sk.drone": "Cartographie par drone",
    "sk.ortho": "Orthomosaïques",
    "sk.3drec": "Reconstruction 3D",
    "sk.landcover": "Classification d'occupation du sol",
    "sk.pc": "Nuages de points",
    "sk.pcproc": "Classification de nuages de points",
    "sk.mesh": "Génération de maillages",
    "sk.3dviz": "Visualisation 3D",
    "sk.da": "Analyse de données",
    "sk.gdp": "Traitement de données géospatiales",
    "sk.spatial2": "Analyse spatiale",
    "sk.dataviz": "Visualisation de données",

    "maps.kicker": "05 — 3D / Cartes",
    "maps.title": "Explorer les travaux dans l'espace",
    "maps.intro": "Une carte interactive des lieux où les travaux ont été réalisés ou pilotés, et un visualiseur WebGL de nuages de points pour les données LiDAR et photogrammétriques.",
    "maps.tab2d": "Carte des projets 2D",
    "maps.tab3d": "Nuage de points 3D",
    "maps.locations": "LOCALISATIONS",
    "maps.note": "Les marqueurs sont placés à l'échelle de la ville ou de la région. Les sites exacts et les noms des clients ne sont pas publiés.",
    "viewer.badge": "Nuage de démonstration procédural — pas une donnée de projet",
    "viewer.drop": "Déposez un fichier .las / .xyz / .csv",
    "viewer.color": "COLORER PAR",
    "viewer.mode.class": "Classe",
    "viewer.mode.elev": "Altitude",
    "viewer.classes": "CLASSES (ASPRS)",
    "viewer.size": "TAILLE DES POINTS",
    "viewer.load": "Charger LAS / XYZ",
    "viewer.reset": "Réinitialiser la vue",
    "viewer.note": "Les fichiers sont lus localement dans votre navigateur et ne sont jamais envoyés. LAS 1.0–1.4 (non compressé). Pour de gros jeux de données, un visualiseur Potree peut être intégré (voir README).",

    "edu.kicker": "06 — Formation",
    "edu.title": "Formation & certifications",
    "edu.current": "En cours",
    "edu.1.date": "2026 — 2027",
    "edu.1.deg": "Master en Data Science",
    "edu.1.loc": "Lisbonne, Portugal",
    "edu.2.deg": "Diplôme National d'Ingénieur en Géomatique et Topographie",
    "edu.3.deg": "Licence Appliquée en Génie Civil — Topographie et Géographie Numérique",
    "edu.tn": "Tunisie",
    "edu.mention": "Mention :",
    "edu.grade.vg": "Très Bien",
    "edu.grade.g": "Bien",
    "edu.cert": "CERTIFICATION",
    "edu.acad": "PROJETS ACADÉMIQUES — ESAT UNIVERSITY",
    "edu.acad.1": "Cartographie du risque d'inondation",
    "edu.acad.2": "Système de suivi de colis en temps réel",
    "edu.acad.2.d": "conception d'une application de suivi de livraisons avec géolocalisation en temps réel.",

    "resume.kicker": "07 — CV",
    "resume.title": "CV en ligne",
    "resume.print": "Imprimer",
    "rs.role": "Ingénieur en Géomatique et Topographie · Ingénieur SIG / Géospatial",
    "rs.summary": "RÉSUMÉ PROFESSIONNEL",
    "rs.summary.p": "Ingénieur en géomatique et topographie avec plus de 4 ans d'expérience en SIG et analyse spatiale, levés topographiques, photogrammétrie par drone, traitement LiDAR et télédétection. Produit des cartes précises et conformes et maintient des bases de données SIG pour des projets d'infrastructure et d'aménagement, avec automatisation Python / ArcPy.",
    "rs.exp": "EXPÉRIENCE",
    "rs.exp3": "Stagiaire Ingénieur Topographe & SIG (projet de fin d'études)",
    "rs.exp4": "Stagiaire en Topographie",
    "rs.edu": "FORMATION",
    "rs.skills": "COMPÉTENCES",
    "rs.sk.data": "Données",
    "rs.sk.survey": "Topo / CAO",
    "rs.sk.photo": "Photogrammétrie / Télédétection",
    "rs.sk.3d": "nuages de points, maillages, Potree",
    "rs.lang": "LANGUES",
    "rs.lang.v": "Arabe — langue maternelle<br>Français — courant<br>Anglais — courant",
    "rs.cert": "CERTIFICATIONS / FORMATIONS",

    "contact.kicker": "08 — Contact",
    "contact.title": "Poste SIG, levé ou projet de données spatiales ?",
    "contact.p": "Disponible pour des postes à temps plein au Portugal et en Europe, du travail à distance, et des missions freelance en SIG, cartographie, photogrammétrie et automatisation.",
    "contact.phone": "Téléphone",
    "contact.vcard": "Enregistrer mes coordonnées",
    "form.note": "Ce formulaire ouvre votre messagerie avec le message pré-rempli.",
    "form.name": "Nom",
    "form.email": "E-mail",
    "form.reason": "Objet",
    "form.r1": "Poste SIG / Géomatique à temps plein",
    "form.r2": "Projet SIG freelance",
    "form.r3": "Projet de photogrammétrie / levé",
    "form.r4": "Autre",
    "form.msg": "Message",
    "form.send": "Envoyer le message",
    "footer.role": "Ingénieur Géomaticien & SIG",
    "footer.top": "Haut de page ↑"
  };

  // Strings used from JavaScript (both languages)
  var UI = {
    en: {
      "filter.all": "All",
      "card.open": "Open case study",
      "m.role": "My role",
      "m.context": "Context",
      "m.period": "Period",
      "m.tech": "Technologies",
      "m.objective": "Objective",
      "m.problem": "Problem",
      "m.workflow": "Workflow",
      "m.deliverables": "Deliverables",
      "m.outcomes": "Outcomes",
      "m.gallery": "Images & screenshots",
      "m.addimg": "[ADD PROJECT IMAGE]",
      "m.map": "View on map",
      "m.3d": "Open 3D viewer",
      "m.github": "Source on GitHub",
      "m.download": "Download the toolbox (.pyt)",
      "m.model": "3D model",
      "m.prev": "Previous",
      "m.next": "Next",
      "map.open": "Open case study",
      "map.fallback": "The interactive map needs an internet connection to load Leaflet and basemap tiles.",
      "map.base.dark": "Dark",
      "map.base.osm": "OpenStreetMap",
      "map.base.sat": "Imagery (Esri)",
      "form.ok": "Your email client should open now. If it does not, write to merhbenhamza07@gmail.com.",
      "form.err": "Please fill in your name, a valid email and a message.",
      "lang.aria": "Switch language to French",
      "viewer.nogl": "WebGL is not available in this browser.",
      "viewer.points": "points",
      "viewer.loading": "Reading file…",
      "viewer.loaded": "Loaded",
      "viewer.error": "Could not read this file.",
      "viewer.potree": "Open Potree viewer"
    },
    fr: {
      "filter.all": "Tous",
      "card.open": "Voir l'étude de cas",
      "m.role": "Mon rôle",
      "m.context": "Contexte",
      "m.period": "Période",
      "m.tech": "Technologies",
      "m.objective": "Objectif",
      "m.problem": "Problématique",
      "m.workflow": "Méthodologie",
      "m.deliverables": "Livrables",
      "m.outcomes": "Résultats",
      "m.gallery": "Images & captures",
      "m.addimg": "[ADD PROJECT IMAGE]",
      "m.map": "Voir sur la carte",
      "m.3d": "Ouvrir le visualiseur 3D",
      "m.github": "Code source sur GitHub",
      "m.download": "Télécharger la boîte à outils (.pyt)",
      "m.model": "Modèle 3D",
      "m.prev": "Précédent",
      "m.next": "Suivant",
      "map.open": "Voir l'étude de cas",
      "map.fallback": "La carte interactive nécessite une connexion internet pour charger Leaflet et les fonds de carte.",
      "map.base.dark": "Sombre",
      "map.base.osm": "OpenStreetMap",
      "map.base.sat": "Imagerie (Esri)",
      "form.ok": "Votre messagerie devrait s'ouvrir. Sinon, écrivez à merhbenhamza07@gmail.com.",
      "form.err": "Merci d'indiquer votre nom, un e-mail valide et un message.",
      "lang.aria": "Passer le site en anglais",
      "viewer.nogl": "WebGL n'est pas disponible dans ce navigateur.",
      "viewer.points": "points",
      "viewer.loading": "Lecture du fichier…",
      "viewer.loaded": "Chargé",
      "viewer.error": "Impossible de lire ce fichier.",
      "viewer.potree": "Ouvrir le visualiseur Potree"
    }
  };

  var cacheEN = null;
  var current = "en";

  function nodes() { return document.querySelectorAll("[data-i18n]"); }

  function cacheEnglish() {
    cacheEN = new Map();
    nodes().forEach(function (el) { cacheEN.set(el, el.innerHTML); });
  }

  function apply(lang) {
    if (!cacheEN) cacheEnglish();
    current = lang === "fr" ? "fr" : "en";
    document.documentElement.lang = current;
    document.documentElement.setAttribute("data-lang", current);

    nodes().forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      if (current === "en") {
        if (cacheEN.has(el)) el.innerHTML = cacheEN.get(el);
      } else if (Object.prototype.hasOwnProperty.call(FR, key)) {
        var val = FR[key];
        if (/<[a-z]/i.test(val)) el.innerHTML = val; else el.textContent = val;
      }
    });

    try { localStorage.setItem("hm-lang", current); } catch (e) { /* storage unavailable */ }
    document.dispatchEvent(new CustomEvent("langchange", { detail: { lang: current } }));
  }

  function t(key) {
    return (UI[current] && UI[current][key]) || UI.en[key] || key;
  }

  function initial() {
    var saved = null;
    try { saved = localStorage.getItem("hm-lang"); } catch (e) { /* ignore */ }
    if (saved === "en" || saved === "fr") return saved;
    var cfg = (window.SITE_CONFIG && window.SITE_CONFIG.defaultLang) || "en";
    return cfg;
  }

  window.I18N = {
    apply: apply,
    t: t,
    get lang() { return current; },
    initial: initial,
    _fr: FR
  };
})();
