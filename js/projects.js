/* ==========================================================================
   Projects — data + rendering (cards, filters, case-study modal, lightbox)

   HOW TO EDIT
   - Every project below is based on the CV. Nothing here names clients
     beyond what the CV already states, and no figures are added beyond the CV.
   - images: add real screenshots, e.g.
       images: [{ src: "assets/images/projects/lidar-01.webp",
                  caption: { en: "Classified point cloud", fr: "Nuage de points classifié" } }]
     When images is empty, "[ADD PROJECT IMAGE]" frames are shown
     (toggle with SITE_CONFIG.showImagePlaceholders in js/config.js).
   - cover: card thumbnail. The default SVGs are neutral illustrations, not
     project data — replace them with your own images when available.
   - github / model3d: "[ADD LINK]" is hidden from visitors until replaced.
   - map: id of a location in geojson/project-locations.geojson (or null).
   ========================================================================== */
(function () {
  "use strict";

  var CATEGORIES = [
    { id: "photogrammetry", en: "Photogrammetry", fr: "Photogrammétrie" },
    { id: "lidar3d",        en: "LiDAR & 3D",     fr: "LiDAR & 3D" },
    { id: "gis",            en: "GIS & Cartography", fr: "SIG & Cartographie" },
    { id: "mining",         en: "Mining GIS",     fr: "SIG minier" },
    { id: "automation",     en: "Automation",     fr: "Automatisation" },
    { id: "database",       en: "Databases & WebGIS", fr: "Bases de données & WebSIG" },
    { id: "surveying",      en: "Surveying",      fr: "Topographie" }
  ];

  var IMG = "assets/images/projects/";
  // Image with a lightweight thumbnail (<name>-thumb.webp) for the gallery grid
  function img(name, en, fr) {
    return { src: IMG + name + ".webp", thumb: IMG + name + "-thumb.webp", caption: { en: en, fr: fr } };
  }
  // Video (MP4) with a poster image
  function vid(src, posterName, en, fr) {
    return { type: "video", src: src, poster: IMG + posterName + "-thumb.webp", caption: { en: en, fr: fr } };
  }

  var PROJECTS = [
    {
      id: "drone-photogrammetry",
      cats: ["photogrammetry"],
      cover: "assets/images/projects/photogrammetry-gcp-thumb.webp",
      tech: ["Agisoft Metashape", "Pix4D", "GCP", "ArcGIS Pro", "QGIS"],
      map: "tunis-wolo",
      viewer3d: false,
      github: "",
      model3d: "",
      images: [
        img("photogrammetry-gcp", "GCP layout over the drone imagery — markers placed manually in Metashape", "Répartition des GCP sur les images drone — pointés manuellement dans Metashape"),
        img("photogrammetry-dense-cloud", "Dense point cloud with GCP markers", "Nuage de points dense avec les marqueurs GCP"),
        img("photogrammetry-cloud-stadium", "Colourised, georeferenced point cloud — stadium", "Nuage de points colorisé et géoréférencé — stade"),
        img("photogrammetry-cloud-street", "Point cloud — street-level view", "Nuage de points — vue au niveau de la rue"),
        img("mesh-3", "Dense point cloud — close view of the urban area", "Nuage de points dense — vue rapprochée de la zone urbaine"),
        img("photogrammetry-metashape-ortho", "Orthomosaic generation in Agisoft Metashape", "Génération de l'orthomosaïque dans Agisoft Metashape"),
        img("photogrammetry-ortho", "Final orthomosaic of the surveyed area", "Orthomosaïque finale de la zone levée"),
        img("photogrammetry-ortho-basemap", "Orthomosaic overlaid on the basemap", "Orthomosaïque superposée au fond de carte"),
        img("photogrammetry-ortho-detail", "Orthomosaic detail — sports grounds", "Détail de l'orthomosaïque — terrains de sport")
      ],
      en: {
        title: "Drone Photogrammetry & Orthomosaic Production",
        category: "Photogrammetry · Drone mapping",
        context: "WOLO Engineering — exploitation of drone images and results",
        period: "2023 — 2025",
        summary: "GCP-controlled drone surveys processed in Agisoft Metashape into dense colourised point clouds, orthomosaics and processing reports, across 30+ survey missions.",
        objective: "Turn drone images into accurate, georeferenced products — point clouds, orthomosaics and reports — for mapping and site assessment.",
        problem: "Drone imagery is positioned only by on-board GNSS. Without ground control, the outputs cannot be relied on for engineering or cadastral use.",
        workflow: [
          "Prepare Ground Control Points (GCP) and mark them manually in Agisoft Metashape to tie the model tightly to real-world coordinates.",
          "Align the images and georeference the photogrammetric block on the GCPs.",
          "Generate a dense, colourised and georeferenced point cloud capturing the surface features of the area.",
          "Generate the orthomosaic and the processing reports.",
          "Quality-control the outputs and integrate them into GIS / CAD deliverables."
        ],
        deliverables: ["Georeferenced orthomosaics", "Dense colourised point clouds", "Processing reports", "Quality-controlled cartographic outputs"],
        outcomes: ["30+ drone survey missions georeferenced"]
      },
      fr: {
        title: "Photogrammétrie par drone & production d'orthomosaïques",
        category: "Photogrammétrie · Cartographie par drone",
        context: "WOLO Engineering — exploitation des images drone et des résultats",
        period: "2023 — 2025",
        summary: "Levés drone calés sur points d'appui (GCP), traités dans Agisoft Metashape en nuages de points denses colorisés, orthomosaïques et rapports de traitement, sur plus de 30 missions.",
        objective: "Transformer les images drone en produits précis et géoréférencés — nuages de points, orthomosaïques et rapports — pour la cartographie et l'évaluation de sites.",
        problem: "Les images drone ne sont positionnées que par le GNSS embarqué. Sans points d'appui, les produits ne sont pas exploitables pour un usage d'ingénierie ou cadastral.",
        workflow: [
          "Préparer les points d'appui (GCP) et les pointer manuellement dans Agisoft Metashape pour caler précisément le modèle sur les coordonnées réelles.",
          "Aligner les images et géoréférencer le bloc photogrammétrique sur les GCP.",
          "Générer un nuage de points dense, colorisé et géoréférencé restituant les éléments de surface de la zone.",
          "Générer l'orthomosaïque et les rapports de traitement.",
          "Contrôler la qualité des produits et les intégrer aux livrables SIG / CAO."
        ],
        deliverables: ["Orthomosaïques géoréférencées", "Nuages de points denses colorisés", "Rapports de traitement", "Produits cartographiques contrôlés"],
        outcomes: ["Plus de 30 missions drone géoréférencées"]
      }
    },

    {
      id: "dsm-dtm",
      cats: ["photogrammetry", "lidar3d"],
      cover: "assets/images/projects/dsm-3d-thumb.webp",
      tech: ["Agisoft Metashape", "ArcGIS Pro", "Pix4D", "TerraScan"],
      map: "tunis-wolo",
      viewer3d: true,
      github: "",
      model3d: "",
      images: [
        img("pc-colour", "Colourised photogrammetric point cloud", "Nuage de points photogrammétrique colorisé"),
        img("pc-auto-classification", "Automatic point-cloud classification in Metashape (buildings, vegetation, ground)", "Classification automatique du nuage de points dans Metashape (bâti, végétation, sol)"),
        img("pc-manual-classification", "Manual classification in Metashape — power line and vegetation", "Classification manuelle dans Metashape — ligne électrique et végétation"),
        img("dtm-ground-arcgis-1", "Automatic ground classification in ArcGIS Pro", "Classification automatique du sol dans ArcGIS Pro"),
        img("dtm-ground-arcgis-2", "Ground / non-ground points in ArcGIS Pro, used to produce the DTM", "Points sol / hors-sol dans ArcGIS Pro, utilisés pour produire le MNT"),
        img("dsm-metashape", "DSM generated in Agisoft Metashape", "MNS généré dans Agisoft Metashape"),
        img("dsm-3d", "DSM — 3D view", "MNS — vue 3D"),
        img("dtm-basemap", "DTM overlaid on the basemap", "MNT superposé au fond de carte"),
        img("dtm-3d-scene", "Terrain model in a 3D scene", "Modèle de terrain dans une scène 3D")
      ],
      en: {
        title: "Point-Cloud Classification & DSM / DTM Generation",
        category: "Elevation modelling",
        context: "WOLO Engineering — site assessment and planning",
        period: "2023 — 2025",
        summary: "Digital surface and terrain models derived from classified photogrammetric and LiDAR point clouds, covering an estimated 500+ hectares of terrain.",
        objective: "Deliver elevation models that separate the surface (buildings, vegetation) from the bare terrain.",
        problem: "Point clouds mix ground, vegetation, structures, power lines and noise. A terrain model is only valid once ground points are isolated and misclassified points corrected.",
        workflow: [
          "Generate the dense point cloud from the GCP-georeferenced block in Agisoft Metashape.",
          "Run automatic classification in Metashape (ground, vegetation, buildings).",
          "Refine the result with manual classification — e.g. power lines and vegetation.",
          "Run automatic ground classification in ArcGIS Pro to produce the DTM.",
          "Generate the DSM in Metashape, check both models and export them for GIS and CAD use."
        ],
        deliverables: ["Digital Surface Models (DSM)", "Digital Terrain Models (DTM)", "Classified point clouds"],
        outcomes: ["An estimated 500+ hectares of terrain modelled"]
      },
      fr: {
        title: "Classification de nuages de points & génération de MNS / MNT",
        category: "Modélisation altimétrique",
        context: "WOLO Engineering — évaluation de sites et aménagement",
        period: "2023 — 2025",
        summary: "Modèles numériques de surface et de terrain issus de nuages de points photogrammétriques et LiDAR classifiés, sur environ 500 hectares et plus.",
        objective: "Livrer des modèles altimétriques séparant la surface (bâti, végétation) du terrain naturel.",
        problem: "Les nuages de points mélangent sol, végétation, bâti, lignes électriques et bruit. Un MNT n'est valide qu'une fois les points sol isolés et les erreurs de classification corrigées.",
        workflow: [
          "Générer le nuage de points dense à partir du bloc géoréférencé sur GCP dans Agisoft Metashape.",
          "Lancer la classification automatique dans Metashape (sol, végétation, bâti).",
          "Affiner le résultat par classification manuelle — par exemple lignes électriques et végétation.",
          "Lancer la classification automatique du sol dans ArcGIS Pro pour produire le MNT.",
          "Générer le MNS dans Metashape, contrôler les deux modèles et les exporter pour un usage SIG et CAO."
        ],
        deliverables: ["Modèles Numériques de Surface (MNS)", "Modèles Numériques de Terrain (MNT)", "Nuages de points classifiés"],
        outcomes: ["Environ 500 hectares et plus de terrain modélisés"]
      }
    },

    {
      id: "3d-reconstruction",
      cats: ["photogrammetry", "lidar3d"],
      cover: "assets/images/projects/mesh-1-thumb.webp",
      tech: ["Agisoft Metashape", "Pix4D"],
      map: "tunis-wolo",
      viewer3d: true,
      github: "",
      model3d: "[ADD LINK]",
      images: [
        img("mesh-1", "Textured 3D model produced in Agisoft Metashape", "Modèle 3D texturé produit dans Agisoft Metashape"),
        img("mesh-2", "Textured 3D model — urban waterfront", "Modèle 3D texturé — front urbain")
      ],
      en: {
        title: "3D Photogrammetric Reconstruction",
        category: "3D mesh models",
        context: "WOLO Engineering — site assessment",
        period: "2023 — 2025",
        summary: "Textured 3D models reconstructed from drone imagery in Agisoft Metashape to document surveyed sites and support site assessment.",
        objective: "Produce 3D models of surveyed sites from the georeferenced photogrammetric block.",
        problem: "Orthomosaics are planimetric: relief, façades and volumes are not readable. Site assessment benefits from a navigable 3D representation.",
        workflow: [
          "Start from the aligned, GCP-georeferenced image block.",
          "Build the dense point cloud.",
          "Generate the mesh and apply texture from the source imagery in Agisoft Metashape.",
          "Check geometry and export the model for 3D visualisation."
        ],
        deliverables: ["Textured 3D models", "Dense point clouds"],
        outcomes: []
      },
      fr: {
        title: "Reconstruction photogrammétrique 3D",
        category: "Modèles 3D maillés",
        context: "WOLO Engineering — évaluation de sites",
        period: "2023 — 2025",
        summary: "Modèles 3D texturés reconstruits à partir d'images drone dans Agisoft Metashape pour documenter les sites levés et appuyer leur évaluation.",
        objective: "Produire des modèles 3D des sites levés à partir du bloc photogrammétrique géoréférencé.",
        problem: "L'orthomosaïque est planimétrique : le relief, les façades et les volumes n'y sont pas lisibles. L'évaluation d'un site gagne à disposer d'une représentation 3D navigable.",
        workflow: [
          "Partir du bloc d'images aligné et géoréférencé sur points d'appui.",
          "Calculer le nuage de points dense.",
          "Générer le maillage et le texturer à partir des images sources dans Agisoft Metashape.",
          "Contrôler la géométrie et exporter le modèle pour la visualisation 3D."
        ],
        deliverables: ["Modèles 3D texturés", "Nuages de points denses"],
        outcomes: []
      }
    },

    {
      id: "lidar",
      cats: ["lidar3d"],
      cover: "assets/images/projects/lidar-terrascan-1-thumb.webp",
      tech: ["MicroStation", "TerraScan", "LiDAR"],
      map: "tunis-wolo",
      viewer3d: true,
      github: "",
      model3d: "",
      images: [
        vid("assets/videos/lidar-terrascan-timelapse.mp4", "lidar-terrascan-1", "Screen recording (10× speed): LiDAR classification in MicroStation / TerraScan", "Enregistrement d'écran (vitesse ×10) : classification LiDAR sous MicroStation / TerraScan"),
        img("lidar-terrascan-1", "TerraScan: plan view by elevation, profile and elevation grid", "TerraScan : vue en plan par altitude, profil et grille altimétrique"),
        img("lidar-terrascan-2", "Classification with plan, profile and 3D views", "Classification avec vues en plan, en profil et 3D"),
        img("lidar-terrascan-3", "Point classes in TerraScan", "Classes de points dans TerraScan")
      ],
      en: {
        title: "LiDAR Point Cloud Classification",
        category: "LiDAR processing",
        context: "WOLO Engineering",
        period: "2023 — 2025",
        summary: "LiDAR point clouds classified into ground, vegetation and buildings, with noise filtering and DTM / DSM generation in MicroStation / TerraScan.",
        objective: "Turn raw LiDAR point clouds into classified datasets ready for terrain and surface modelling.",
        problem: "Raw point clouds contain noise and unclassified returns; terrain and surface products require a consistent classification first.",
        workflow: [
          "Load the point clouds in MicroStation / TerraScan.",
          "Filter noise and low / high outliers.",
          "Classify ground points.",
          "Classify vegetation and building points.",
          "Review the classification in plan and profile views and generate DTM / DSM outputs."
        ],
        deliverables: ["Classified point clouds (ground, vegetation, buildings)", "DTM / DSM"],
        outcomes: []
      },
      fr: {
        title: "Classification de nuages de points LiDAR",
        category: "Traitement LiDAR",
        context: "WOLO Engineering",
        period: "2023 — 2025",
        summary: "Nuages de points LiDAR classés en sol, végétation et bâtiments, avec filtrage du bruit et génération de MNT / MNS sous MicroStation / TerraScan.",
        objective: "Transformer des nuages de points LiDAR bruts en jeux de données classifiés, prêts pour la modélisation du terrain et de la surface.",
        problem: "Les nuages bruts contiennent du bruit et des retours non classés ; les produits altimétriques exigent d'abord une classification cohérente.",
        workflow: [
          "Charger les nuages de points dans MicroStation / TerraScan.",
          "Filtrer le bruit et les points aberrants bas / hauts.",
          "Classer les points sol.",
          "Classer les points de végétation et de bâtiments.",
          "Contrôler la classification en vues en plan et en profil et générer les MNT / MNS."
        ],
        deliverables: ["Nuages de points classifiés (sol, végétation, bâtiments)", "MNT / MNS"],
        outcomes: []
      }
    },

    {
      id: "webgis-360",
      cats: ["database", "photogrammetry"],
      cover: "assets/images/projects/webgis-360-network-thumb.webp",
      tech: ["WebGIS", "360° imagery", "Mobile mapping (MMS)", "Point clouds", "Drone orthophotos", "GCP"],
      map: "tunis-wolo",
      viewer3d: false,
      github: "",
      model3d: "",
      images: [
        vid("assets/videos/webgis-360-pointcloud-orthomosaic.mp4", "webgis-360-network", "Screen recording: WebGIS combining 360° imagery, point cloud and orthomosaic", "Enregistrement d'écran : WebSIG combinant imagerie 360°, nuage de points et orthomosaïque"),
        img("webgis-360-network", "360° street-level imagery linked to the orthophoto and network layers", "Imagerie 360° au niveau de la rue liée à l'orthophoto et aux couches réseau"),
        img("webgis-360-objects", "Object types for digitising: poles, manholes, GCPs, buildings…", "Types d'objets à digitaliser : poteaux, regards, GCP, bâtiments…"),
        img("webgis-layers", "Layer manager: object layers, labels, orthophoto groups", "Gestionnaire de couches : couches d'objets, étiquettes, groupes d'orthophotos"),
        img("webgis-360-gcp", "Drone GCP located in both the 360° view and the orthophoto", "GCP drone localisé à la fois dans la vue 360° et sur l'orthophoto")
      ],
      en: {
        title: "WebGIS: 360° Imagery, Point Cloud & Orthomosaic",
        category: "WebGIS · Mobile mapping · Photogrammetry",
        context: "WOLO Engineering — infrastructure network mapping · [ADD DESCRIPTION — your role]",
        period: "2023 — 2025",
        summary: "A web GIS combining drone orthophotos, 360° street-level imagery from mobile mapping and point clouds to locate, digitise and edit network objects — poles, trenches, cabinets, manholes and building connections.",
        objective: "Map and update infrastructure network objects in one web environment, with plan, street-level and 3D context for every feature.",
        problem: "Network design needs accurate positions for field objects. Orthophotos give the plan view but not what is visible at street level; street imagery alone is not a georeferenced plan.",
        workflow: [
          "Load GCP-controlled drone orthophotos and satellite imagery as base layers.",
          "Link 360° mobile-mapping imagery and point-cloud markers to the map.",
          "Organise object layers — poles, trenches, cabinets, building connections, working areas and GCPs.",
          "Digitise and edit objects in 2D / 3D by clicking in the 360° imagery and on the orthophoto.",
          "Check positions against the drone and mobile-mapping GCP layers."
        ],
        deliverables: ["Network object layers (poles, trenches, cabinets, manholes, building connections)", "Orthophoto base layers", "360° and point-cloud context in the WebGIS"],
        outcomes: []
      },
      fr: {
        title: "WebSIG : imagerie 360°, nuage de points & orthomosaïque",
        category: "WebSIG · Cartographie mobile · Photogrammétrie",
        context: "WOLO Engineering — cartographie de réseaux d'infrastructure · [ADD DESCRIPTION — votre rôle]",
        period: "2023 — 2025",
        summary: "Un WebSIG combinant orthophotos drone, imagerie 360° issue de la cartographie mobile et nuages de points pour localiser, digitaliser et éditer les objets réseau — poteaux, tranchées, armoires, regards et raccordements d'immeubles.",
        objective: "Cartographier et mettre à jour les objets des réseaux d'infrastructure dans un seul environnement web, avec un contexte en plan, au niveau de la rue et en 3D pour chaque élément.",
        problem: "La conception de réseaux exige des positions précises pour les objets terrain. L'orthophoto donne la vue en plan mais pas ce qui est visible depuis la rue ; l'imagerie de rue seule n'est pas un plan géoréférencé.",
        workflow: [
          "Charger les orthophotos drone calées sur GCP et l'imagerie satellite comme fonds de carte.",
          "Lier l'imagerie 360° de cartographie mobile et les marqueurs de nuage de points à la carte.",
          "Organiser les couches d'objets — poteaux, tranchées, armoires, raccordements, zones de travaux et GCP.",
          "Digitaliser et éditer les objets en 2D / 3D en cliquant dans l'imagerie 360° et sur l'orthophoto.",
          "Contrôler les positions à l'aide des couches de GCP drone et de cartographie mobile."
        ],
        deliverables: ["Couches d'objets réseau (poteaux, tranchées, armoires, regards, raccordements)", "Fonds orthophotos", "Contexte 360° et nuage de points dans le WebSIG"],
        outcomes: []
      }
    },

    {
      id: "municipal-geodatabase",
      cats: ["database", "gis"],
      cover: "assets/images/projects/tm-gdb-map-thumb.webp",
      tech: ["ArcGIS Pro", "SQL Server", "Python", "Arcade", "Coded domains", "Attribute rules"],
      map: null,
      viewer3d: false,
      github: "",
      model3d: "",
      images: [
        img("tm-gdb-map", "Schema overview of the municipal geodatabase design (image courtesy of Tlili Mohamed)", "Géodatabase municipale — carte des couches structurées · ArcGIS Pro (image : Tlili Mohamed)"),
        img("tm-gdb-domains", "Coded domain values imported into the geodatabase (image courtesy of Tlili Mohamed)", "Domaines codés importés depuis CSV dans la géodatabase · ArcGIS Pro (image : Tlili Mohamed)"),
        img("tm-gdb-attribute-rules", "Attribute table with enforced domains and attribute rules (image courtesy of Tlili Mohamed)", "Édition avec domaines et règles attributaires appliqués sur imagerie (image : Tlili Mohamed)")
      ],
      en: {
        role: "Planner",
        title: "Design and Integration of a Geodatabase",
        category: "Database architecture · Team project",
        context: "Team project with Tlili Mohamed — municipality running a multi-department GIS program (client details withheld)",
        period: "2025",
        summary: "A centralized municipal geodatabase on SQL Server that turned fragmented legacy data into a validated, multi-user spatial data system — ~100 feature classes, 10+ years of legacy records, multi-user editing.",
        objective: "Give several departments one centralized GIS database, with validation at entry and multi-user editing.",
        problem: "Several departments needed one centralized GIS database instead of disconnected files. The system had to model complex data relationships, enforce validation at entry, and support multi-user editing with proper conflict management.",
        workflow: [
          "Designed a normalized geodatabase schema of approximately 100 feature classes from custom data dictionaries.",
          "Implemented coded domains so invalid values are blocked at entry, not discovered downstream.",
          "Created Arcade attribute rules that automate validation and calculated attributes in real time.",
          "Developed a Python toolbox for ETL and the migration of 10+ years of legacy data into SQL Server.",
          "Built versioned editing workflows with conflict resolution for simultaneous multi-user work."
        ],
        deliverables: [
          "Enterprise geodatabase in SQL Server, Python migration toolbox, and attribute-rule documentation for each department.",
          "Every migration batch reconciled against source records to confirm zero feature loss before sign-off."
        ],
        outcomes: [
          "90% fewer data-entry errors after validation rules were enforced",
          "10+ years of legacy data migrated without loss",
          "Departments now edit one shared database instead of separate files",
          "Automated routines save hours of manual work every day"
        ]
      },
      fr: {
        role: "Planificateur",
        title: "Conception et intégration d'une géodatabase",
        category: "Architecture de bases de données · Projet d'équipe",
        context: "Projet d'équipe avec Tlili Mohamed — municipalité menant un programme SIG multi-services (détails client non publiés)",
        period: "2025",
        summary: "Une géodatabase municipale centralisée sous SQL Server qui a transformé des données historiques fragmentées en un système de données spatiales validé et multi-utilisateur — ~100 classes d'entités, plus de 10 ans d'archives, édition multi-utilisateur.",
        objective: "Offrir à plusieurs services une base SIG centralisée unique, avec validation à la saisie et édition multi-utilisateur.",
        problem: "Plusieurs services avaient besoin d'une base SIG centralisée au lieu de fichiers déconnectés. Le système devait modéliser des relations complexes, imposer la validation à la saisie et gérer l'édition multi-utilisateur avec résolution des conflits.",
        workflow: [
          "Conception d'un schéma de géodatabase normalisé d'environ 100 classes d'entités à partir de dictionnaires de données sur mesure.",
          "Mise en place de domaines codés pour bloquer les valeurs invalides dès la saisie.",
          "Création de règles attributaires Arcade automatisant la validation et le calcul d'attributs en temps réel.",
          "Développement d'une boîte à outils Python pour l'ETL et la migration de plus de 10 ans de données historiques vers SQL Server.",
          "Mise en place de flux d'édition versionnés avec résolution des conflits pour le travail multi-utilisateur simultané."
        ],
        deliverables: [
          "Géodatabase d'entreprise sous SQL Server, boîte à outils Python de migration et documentation des règles attributaires pour chaque service.",
          "Chaque lot de migration rapproché des données sources pour confirmer l'absence de perte d'entités avant validation."
        ],
        outcomes: [
          "90 % d'erreurs de saisie en moins après application des règles de validation",
          "Plus de 10 ans de données historiques migrées sans perte",
          "Les services éditent désormais une base partagée au lieu de fichiers séparés",
          "Des routines automatisées font gagner des heures de travail manuel chaque jour"
        ]
      }
    },

    {
      id: "urban-digitization",
      cats: ["gis", "photogrammetry"],
      cover: "assets/images/projects/tm-digitization-features-thumb.webp",
      tech: ["QGIS", "PyQGIS", "Drone imagery", "QA / QC", "AutoCAD"],
      map: null,
      viewer3d: false,
      github: "",
      model3d: "",
      images: [
        img("tm-digitization-features", "Digitized urban features over drone imagery (image courtesy of Tlili Mohamed)", "Éléments urbains digitalisés sur imagerie drone — voirie, trottoirs, stationnement, signalisation, bâtiments (image : Tlili Mohamed)"),
        img("tm-digitization-qc", "Quality control — vector overlay on orthophoto (image courtesy of Tlili Mohamed)", "Contrôle qualité de la digitalisation — superposition vecteur (image : Tlili Mohamed)")
      ],
      en: {
        role: "Planner",
        title: "Digitization & QGIS Plugin Development",
        category: "Cartography · GIS · Team project",
        context: "Team project with Tlili Mohamed — engineering firm running a multi-municipality cadastral mapping program (client details withheld)",
        period: "2024",
        summary: "Cadastral and urban features digitized from drone imagery across 40+ municipalities, with a PyQGIS plugin that automated bulk attribute editing.",
        objective: "Deliver rapid, accurate digitization of cadastral maps over drone imagery that slots straight into existing GIS workflows.",
        problem: "An engineering firm needed rapid, accurate digitization of cadastral maps over drone imagery — with results that had to slot straight into existing GIS workflows and hold up to sub-meter accuracy requirements.",
        workflow: [
          "Digitized cadastral and urban features from drone imagery, following strict QA/QC procedures.",
          "Developed a QGIS plugin that applies multiple rule-based conditions simultaneously to bulk-update attributes on large datasets.",
          "Integrated Python batch-processing scripts for vector layers to cut repetitive editing steps."
        ],
        deliverables: [
          "Clean digitized layers for 40+ municipalities, plus a reusable, adaptable plugin retained for future projects.",
          "Each batch passed visual inspection and spatial-accuracy checks against reference imagery before delivery."
        ],
        outcomes: [
          "Digitized 40+ municipalities",
          "Cut processing time by about 20% compared with fully manual workflows",
          "Held sub-meter spatial accuracy consistently across batches",
          "The plugin remains reusable for future mapping programs"
        ]
      },
      fr: {
        role: "Planificateur",
        title: "Digitalisation & développement d'un plugin QGIS",
        category: "Cartographie · SIG · Projet d'équipe",
        context: "Projet d'équipe avec Tlili Mohamed — bureau d'ingénierie menant un programme de cartographie cadastrale multi-communes (détails client non publiés)",
        period: "2024",
        summary: "Éléments cadastraux et urbains digitalisés sur imagerie drone dans plus de 40 communes, avec un plugin PyQGIS automatisant l'édition attributaire en masse.",
        objective: "Livrer une digitalisation rapide et précise des plans cadastraux sur imagerie drone, directement intégrable dans les chaînes SIG existantes.",
        problem: "Un bureau d'ingénierie avait besoin d'une digitalisation rapide et précise des plans cadastraux sur imagerie drone — avec des résultats directement intégrables dans les chaînes SIG existantes et conformes à une exigence de précision submétrique.",
        workflow: [
          "Digitalisation des éléments cadastraux et urbains sur imagerie drone selon des procédures strictes de contrôle qualité.",
          "Développement d'un plugin QGIS appliquant simultanément plusieurs conditions pour la mise à jour attributaire en masse de grands jeux de données.",
          "Intégration de scripts Python de traitement par lots des couches vectorielles pour réduire les étapes d'édition répétitives."
        ],
        deliverables: [
          "Couches digitalisées propres pour plus de 40 communes, et un plugin réutilisable conservé pour les projets futurs.",
          "Chaque lot a passé une inspection visuelle et des contrôles de précision spatiale sur l'imagerie de référence avant livraison."
        ],
        outcomes: [
          "Plus de 40 communes digitalisées",
          "Temps de traitement réduit d'environ 20 % par rapport à un flux entièrement manuel",
          "Précision spatiale submétrique maintenue sur tous les lots",
          "Le plugin reste réutilisable pour de futurs programmes de cartographie"
        ]
      }
    },

    {
      id: "cartography",
      cats: ["gis"],
      cover: "assets/images/projects/carto-qgis-grid-thumb.webp",
      tech: ["ArcGIS Pro", "QGIS", "AutoCAD"],
      map: "tunis-wolo",
      viewer3d: false,
      github: "",
      model3d: "",
      images: [
        img("carto-qgis-grid", "Map production in QGIS — analysis grid over satellite imagery", "Production cartographique sous QGIS — grille d'analyse sur imagerie satellite"),
        img("mining-geology-draft", "Geological map (draft) — rock types, mineral tenure, parcels and contours · ArcGIS Pro", "Carte géologique (projet) — types de roches, titres miniers, parcelles et courbes de niveau · ArcGIS Pro")
      ],
      en: {
        title: "GIS & Cartographic Production",
        category: "Cartography · Spatial analysis",
        context: "WOLO Engineering and freelance consulting",
        period: "2023 — present",
        summary: "Thematic maps, cartographic layouts and technical documentation for territorial planning, site suitability and tenure assessment.",
        objective: "Communicate spatial analysis results through clear, consistent and compliant map products.",
        problem: "Map deliverables combine datasets from several sources, coordinate systems and standards; they have to be harmonised and checked before release.",
        workflow: [
          "Compile source datasets and harmonise coordinate reference systems.",
          "Run the spatial analysis (overlay, selection, constraints).",
          "Design symbology and cartographic layouts.",
          "Quality-control content and presentation.",
          "Export maps and, where required, CAD plans."
        ],
        deliverables: ["Thematic maps", "Cartographic layouts", "Technical documentation"],
        outcomes: []
      },
      fr: {
        title: "Production SIG & cartographique",
        category: "Cartographie · Analyse spatiale",
        context: "WOLO Engineering et conseil freelance",
        period: "2023 — aujourd'hui",
        summary: "Cartes thématiques, mises en page cartographiques et documentation technique pour l'aménagement du territoire, l'aptitude de sites et l'évaluation des tenures.",
        objective: "Communiquer les résultats d'analyse spatiale par des produits cartographiques clairs, cohérents et conformes.",
        problem: "Les livrables cartographiques combinent des données de sources, de systèmes de coordonnées et de normes différents ; ils doivent être harmonisés et contrôlés avant diffusion.",
        workflow: [
          "Compiler les données sources et harmoniser les systèmes de référence.",
          "Réaliser l'analyse spatiale (superposition, sélection, contraintes).",
          "Concevoir la symbologie et les mises en page.",
          "Contrôler le contenu et la présentation.",
          "Exporter les cartes et, si nécessaire, les plans CAO."
        ],
        deliverables: ["Cartes thématiques", "Mises en page cartographiques", "Documentation technique"],
        outcomes: []
      }
    },

    {
      id: "mining-tenure",
      cats: ["mining", "gis"],
      cover: "assets/images/projects/mining-bgm-claims-thumb.webp",
      tech: ["ArcGIS Pro", "ArcPy", "Python", "AutoCAD", "BC Mineral Titles Online", "CRS / datum transformations"],
      map: "bc",
      viewer3d: false,
      github: "",
      model3d: "",
      images: [
        img("mining-bgm-claims", "Mineral claims expiring within 90 days (BC) — tenure ownership and third-party claims · NAD 83 / UTM 10 · ArcGIS Pro", "Claims miniers expirant sous 90 jours (C.-B.) — propriété des tenures et claims de tiers · NAD 83 / UTM 10 · ArcGIS Pro"),
        img("mining-geology-draft", "Geological map (draft) — rock types, mineral tenure, parcels and contours", "Carte géologique (projet) — types de roches, titres miniers, parcelles et courbes de niveau"),
        img("tm-roundtop-map", "Round Top Mountain, Texas — geology and relief map (image courtesy of Tlili Mohamed)", "Round Top Mountain, Texas — carte géologique et du relief (image : Tlili Mohamed)"),
        img("mining-mto-acquisition", "Mineral claim acquisition in BC Mineral Titles Online — cell selection (client data blurred)", "Acquisition de claims miniers dans BC Mineral Titles Online — sélection des cellules (données client floutées)")
      ],
      en: {
        title: "Mining GIS & Mineral Tenure Mapping",
        category: "Mining GIS · Land & tenure",
        context: "Freelance GIS consulting — remote",
        period: "Oct 2025 — present",
        summary: "Constraints and tenure mapping that cross-references geological, cadastral and tenure datasets for mining due diligence, across 15+ project areas.",
        objective: "Give a clear spatial picture of mineral tenure, land status and constraints for each project area.",
        problem: "Tenure information sits in heterogeneous systems — British Columbia mineral tenure, Crown tenure, PLSS / BLM, LTSA title records — with different coordinate systems and datums.",
        workflow: [
          "Collect British Columbia mining datasets, PLSS / BLM and Crown tenure data, mining claims and concessions.",
          "Process LTSA title-research data into GIS-ready attributes.",
          "Harmonise coordinate reference systems and apply datum transformations in ArcGIS Pro.",
          "Cross-reference geological, cadastral and tenure layers to map constraints — e.g. competitor claims expiring within 90 days.",
          "Prepare cell selections and mineral claim acquisitions in BC Mineral Titles Online (MTO).",
          "Produce thematic and geological maps, AutoCAD plans and technical documentation; quality-control the data."
        ],
        deliverables: ["Tenure and constraints maps", "Geological maps", "Mineral claim acquisitions (MTO)", "AutoCAD plans converted from GIS", "Technical documentation"],
        outcomes: ["15+ project areas mapped", "Due-diligence review time reduced by approximately 40%"]
      },
      fr: {
        title: "SIG minier & cartographie des titres miniers",
        category: "SIG minier · Foncier & tenures",
        context: "Conseil SIG freelance — à distance",
        period: "Oct. 2025 — aujourd'hui",
        summary: "Cartographie des contraintes et des tenures croisant données géologiques, cadastrales et foncières pour la due diligence minière, sur plus de 15 zones de projet.",
        objective: "Donner une image spatiale claire des titres miniers, du statut foncier et des contraintes de chaque zone de projet.",
        problem: "L'information sur les tenures est répartie dans des systèmes hétérogènes — titres miniers de Colombie-Britannique, tenures de la Couronne, PLSS / BLM, registres LTSA — avec des systèmes de coordonnées et des datums différents.",
        workflow: [
          "Collecter les données minières de Colombie-Britannique, les données PLSS / BLM et de tenures de la Couronne, les claims et concessions minières.",
          "Traiter les données de recherche de titres LTSA en attributs exploitables en SIG.",
          "Harmoniser les systèmes de référence et appliquer les transformations de datum dans ArcGIS Pro.",
          "Croiser les couches géologiques, cadastrales et foncières pour cartographier les contraintes — par exemple les claims concurrents expirant sous 90 jours.",
          "Préparer la sélection des cellules et les acquisitions de claims miniers dans BC Mineral Titles Online (MTO).",
          "Produire cartes thématiques et géologiques, plans AutoCAD et documentation technique ; contrôler la qualité des données."
        ],
        deliverables: ["Cartes des tenures et des contraintes", "Cartes géologiques", "Acquisitions de claims miniers (MTO)", "Plans AutoCAD convertis depuis le SIG", "Documentation technique"],
        outcomes: ["Plus de 15 zones de projet cartographiées", "Temps de revue de due diligence réduit d'environ 40 %"]
      }
    },

    {
      id: "arcpy-automation",
      cats: ["automation"],
      cover: "assets/images/projects/arcpy-toolbox-code-thumb.webp",
      tech: ["Python", "ArcPy", "ArcGIS Pro", "Python toolbox (.pyt)", "arcpy.da cursors", "CSV reporting"],
      map: "bc",
      viewer3d: false,
      github: "[ADD LINK]",
      model3d: "",
      download: "code/arcpy-toolbox/GISAutomation.pyt",
      images: [
        img("arcpy-toolbox-code", "GISAutomation.pyt — Batch Project tool and the five tools of the toolbox", "GISAutomation.pyt — outil Batch Project et les cinq outils de la boîte à outils")
      ],
      en: {
        title: "Python / ArcPy GIS Automation",
        category: "GIS automation",
        context: "Freelance GIS consulting",
        period: "Oct 2025 — present",
        summary: "A Python toolbox for ArcGIS Pro that automates repetitive geoprocessing and file-management tasks: batch reprojection, clip & export, QC reporting, GIS-to-CAD export and deliverable packaging.",
        objective: "Make recurring GIS processing faster, repeatable and less error-prone.",
        problem: "The same geoprocessing and file-management steps recur across many project areas; done by hand they are slow and inconsistent.",
        workflow: [
          "Batch Project — reproject every feature class of a workspace (including feature datasets) to a target CRS, with an optional datum transformation; layers without a defined CRS are flagged and skipped.",
          "Batch Clip & Export — clip several layers to one area of interest and report empty results.",
          "QC Checks — CSV report of geometry problems (Check Geometry), duplicate geometries, empty values in required fields and undefined coordinate systems.",
          "GIS to CAD — export layers to DWG / DXF for AutoCAD, with a CRS check.",
          "Package Deliverables — copy maps, reports and CAD files into a dated project folder, sorted by type, and zip it."
        ],
        deliverables: ["GISAutomation.pyt — ArcGIS Pro Python toolbox (5 tools)", "CSV quality-control reports", "Packaged, dated deliverable archives"],
        outcomes: ["Manual processing time cut by an estimated 60%"]
      },
      fr: {
        title: "Automatisation SIG Python / ArcPy",
        category: "Automatisation SIG",
        context: "Conseil SIG freelance",
        period: "Oct. 2025 — aujourd'hui",
        summary: "Une boîte à outils Python pour ArcGIS Pro qui automatise les géotraitements et la gestion de fichiers répétitifs : reprojection par lots, découpage & export, rapports de contrôle qualité, export SIG vers CAO et préparation des livrables.",
        objective: "Rendre les traitements SIG récurrents plus rapides, reproductibles et fiables.",
        problem: "Les mêmes géotraitements et opérations de gestion de fichiers se répètent sur de nombreuses zones de projet ; réalisés à la main, ils sont lents et hétérogènes.",
        workflow: [
          "Batch Project — reprojeter toutes les classes d'entités d'un espace de travail (y compris les jeux de classes) vers un système cible, avec transformation de datum optionnelle ; les couches sans système défini sont signalées et ignorées.",
          "Batch Clip & Export — découper plusieurs couches sur une zone d'intérêt et signaler les résultats vides.",
          "QC Checks — rapport CSV des erreurs de géométrie (Check Geometry), géométries en double, valeurs vides dans les champs obligatoires et systèmes de coordonnées non définis.",
          "GIS to CAD — exporter les couches en DWG / DXF pour AutoCAD, avec contrôle du système de coordonnées.",
          "Package Deliverables — copier cartes, rapports et fichiers CAO dans un dossier de projet daté, classés par type, et les archiver en ZIP."
        ],
        deliverables: ["GISAutomation.pyt — boîte à outils Python ArcGIS Pro (5 outils)", "Rapports CSV de contrôle qualité", "Archives de livrables datées"],
        outcomes: ["Temps de traitement manuel réduit d'environ 60 % (estimation)"]
      }
    },

    {
      id: "utility-gis-db",
      cats: ["database"],
      cover: "assets/images/projects/pfe-12-thumb.webp",
      tech: ["PostgreSQL", "PostGIS", "pgAdmin", "Enterprise Architect (UML)", "QGIS", "QField", "ArcPy", "SQL", "VS Code"],
      map: "kerkennah",
      viewer3d: false,
      github: "",
      model3d: "",
      images: [
        img("pfe-05", "Study area — Kerkennah Island (Sfax), WGS 84 / UTM zone 32N", "Zone d'étude — île de Kerkennah (Sfax), WGS 84 / UTM zone 32N"),
        img("pfe-08", "Work plan: from the data dictionary to the WebGIS", "Plan de travail : du dictionnaire de données au WebSIG"),
        img("pfe-10", "Data dictionary of the low-voltage network", "Dictionnaire de données du réseau basse tension"),
        img("pfe-12", "UML model of the database (Enterprise Architect)", "Modèle UML de la base de données (Enterprise Architect)"),
        img("pfe-13", "SQL code generated from the UML model", "Code SQL généré à partir du modèle UML"),
        img("pfe-15", "PostgreSQL / PostGIS database and tables", "Base de données PostgreSQL / PostGIS et tables"),
        img("pfe-19", "Collection forms and drop-down lists in QGIS", "Formulaires de collecte et listes déroulantes dans QGIS"),
        img("pfe-20", "QField project on the field tablet", "Projet QField sur la tablette de terrain"),
        img("pfe-22", "Control of the collected data", "Contrôle des données collectées"),
        img("pfe-24", "Attribute entry for the network features", "Renseignement des attributs des entités du réseau"),
        img("pfe-25", "Correction of intersection / topological errors", "Correction des erreurs d'intersection / topologiques"),
        img("pfe-26", "Integration of the data into the database", "Intégration des données dans la base")
      ],
      en: {
        title: "Low-Voltage Network GIS Database — Kerkennah Island",
        category: "Utility GIS · Spatial database",
        context: "GeoTop — final-year engineering project (ESAT University), low-voltage network for STEG",
        period: "Mar 2023 — Sep 2023",
        summary: "Design of a spatial database for collecting the low-voltage electrical network of Kerkennah Island: data dictionary, UML model, PostgreSQL / PostGIS, QField field collection of 1,000+ assets and data integration.",
        objective: "Design a database for the low-voltage network, collect and process its data, and integrate it into PostgreSQL / PostGIS as the basis for a WebGIS.",
        problem: "Growing electricity demand requires better management and control of network equipment — delivery points, supports, anchor points, distribution boards and lines — which needs a consistent data model and reliable field data.",
        workflow: [
          "Establish the data dictionary of the low-voltage network.",
          "Model the database in UML with Enterprise Architect and generate the SQL code.",
          "Check the SQL in VS Code and create the PostgreSQL / PostGIS database (WGS 84 / UTM zone 32N).",
          "Prepare the point layers, drop-down lists and collection forms in QGIS; package the QField project and transfer it to the tablet.",
          "Collect the network features in the field with QField.",
          "Control the collected data, create junctions and line features, fill attributes and correct topological errors.",
          "Integrate the validated data into the database."
        ],
        deliverables: ["Data dictionary", "UML model and SQL schema", "PostgreSQL / PostGIS network database", "Field-collected asset dataset"],
        outcomes: ["1,000+ network assets captured in the field"]
      },
      fr: {
        title: "Base de données SIG du réseau basse tension — île de Kerkennah",
        category: "SIG réseaux · Base de données spatiale",
        context: "GeoTop — projet de fin d'études d'ingénieur (ESAT University), réseau basse tension de la STEG",
        period: "Mars 2023 — Sept. 2023",
        summary: "Conception d'une base de données pour la collecte du réseau électrique basse tension de l'île de Kerkennah : dictionnaire de données, modèle UML, PostgreSQL / PostGIS, collecte QField de plus de 1 000 équipements et intégration des données.",
        objective: "Concevoir une base de données du réseau basse tension, collecter et traiter ses données et les intégrer dans PostgreSQL / PostGIS comme socle d'un WebSIG.",
        problem: "La croissance de la demande en énergie électrique impose une meilleure gestion et un meilleur contrôle des équipements — points de livraison, supports, points d'ancrage, tableaux de distribution et lignes — ce qui exige un modèle de données cohérent et des données terrain fiables.",
        workflow: [
          "Établir le dictionnaire de données du réseau basse tension.",
          "Modéliser la base en UML avec Enterprise Architect et générer le code SQL.",
          "Vérifier le SQL sous VS Code et créer la base PostgreSQL / PostGIS (WGS 84 / UTM zone 32N).",
          "Préparer les couches ponctuelles, les listes déroulantes et les formulaires de collecte dans QGIS ; préparer le projet QField et le transférer sur la tablette.",
          "Collecter les entités du réseau sur le terrain avec QField.",
          "Contrôler les données collectées, créer les jonctions et les entités linéaires, renseigner les attributs et corriger les erreurs topologiques.",
          "Intégrer les données validées dans la base."
        ],
        deliverables: ["Dictionnaire de données", "Modèle UML et schéma SQL", "Base de données réseau PostgreSQL / PostGIS", "Jeu de données des équipements relevés"],
        outcomes: ["Plus de 1 000 équipements relevés sur le terrain"]
      }
    },

    {
      id: "webgis-lizmap",
      cats: ["database"],
      cover: "assets/images/projects/pfe-30-thumb.webp",
      tech: ["GeoServer", "Leaflet", "HTML / CSS / JavaScript", "PostGIS", "Lizmap", "GitHub"],
      map: "kerkennah",
      viewer3d: false,
      github: "",
      model3d: "",
      images: [
        img("pfe-28", "Publishing the network layers with GeoServer", "Publication des couches du réseau avec GeoServer"),
        img("pfe-29", "Web application stack: Leaflet, HTML, CSS, JavaScript, GitHub", "Pile de l'application web : Leaflet, HTML, CSS, JavaScript, GitHub"),
        img("pfe-30", "The WebGIS application", "L'application WebSIG")
      ],
      en: {
        title: "WebGIS for Low-Voltage Network Management",
        category: "WebGIS",
        context: "GeoTop — final-year engineering project (ESAT University)",
        period: "2023",
        summary: "A WebGIS for the Kerkennah low-voltage network: PostGIS layers published with GeoServer and displayed in a Leaflet web application, with Lizmap used for network visualisation and asset management.",
        objective: "Give access to the network data in the browser — visualise the equipment and query its attributes without desktop GIS.",
        problem: "Data held in a spatial database and desktop GIS is not directly accessible to the people who manage the network day to day.",
        workflow: [
          "Connect the PostgreSQL / PostGIS database and publish the network layers with GeoServer.",
          "Develop the web application with Leaflet, HTML, CSS and JavaScript (versioned on GitHub).",
          "Display the network and its attributes through attribute queries.",
          "Use Lizmap for network visualisation and asset management."
        ],
        deliverables: ["GeoServer layers", "Leaflet WebGIS application", "Lizmap project"],
        outcomes: []
      },
      fr: {
        title: "WebSIG de gestion du réseau basse tension",
        category: "WebSIG",
        context: "GeoTop — projet de fin d'études d'ingénieur (ESAT University)",
        period: "2023",
        summary: "Un WebSIG pour le réseau basse tension de Kerkennah : couches PostGIS publiées avec GeoServer et affichées dans une application web Leaflet, avec Lizmap pour la visualisation du réseau et la gestion du patrimoine.",
        objective: "Donner accès aux données du réseau dans le navigateur — visualiser les équipements et interroger leurs attributs sans SIG bureautique.",
        problem: "Les données stockées dans une base spatiale et un SIG bureautique ne sont pas directement accessibles aux personnes qui gèrent le réseau au quotidien.",
        workflow: [
          "Connecter la base PostgreSQL / PostGIS et publier les couches du réseau avec GeoServer.",
          "Développer l'application web avec Leaflet, HTML, CSS et JavaScript (versionnée sur GitHub).",
          "Afficher le réseau et ses attributs via des requêtes attributaires.",
          "Utiliser Lizmap pour la visualisation du réseau et la gestion du patrimoine."
        ],
        deliverables: ["Couches GeoServer", "Application WebSIG Leaflet", "Projet Lizmap"],
        outcomes: []
      }
    },

    {
      id: "topo-quarry",
      cats: ["surveying"],
      cover: "assets/images/projects/topo-11-thumb.webp",
      tech: ["GeoMax GNSS", "GeoMax total station", "Covadis", "AutoCAD", "Google Earth Pro"],
      map: "tunis-but",
      viewer3d: false,
      github: "",
      model3d: "",
      images: [
        img("topo-06", "Equipment: GeoMax GNSS, GeoMax total station, tripod, pole and prism", "Matériel : GNSS GeoMax, station totale GeoMax, trépied, canne et prisme"),
        img("topo-08", "Land subdivision (lotissement) plan", "Plan de lotissement"),
        img("topo-11", "Traverse (cheminement polygonal) over aerial imagery", "Cheminement polygonal sur image aérienne"),
        img("topo-12", "Survey plan of the site", "Plan de levé du site"),
        img("topo-13", "Traverse computation and coordinate table", "Calcul du cheminement et tableau des coordonnées"),
        img("topo-14", "Topographic survey plan", "Plan de levé topographique")
      ],
      en: {
        title: "Topographic & Quarry Surveying",
        category: "Topographic surveying · Volumes",
        context: "Topography BUT, But Groupe (surveying and land-affairs firm) — internship",
        period: "Jun 2021 — Aug 2021",
        summary: "Field and office surveying work: traverses, topographic surveys, boundary re-establishment, land subdivision, stockpile volumes for quarry exploitation and earthwork volumes for roads and platforms.",
        objective: "Provide the topographic base, boundaries and volume figures needed for land-development works and quarry exploitation.",
        problem: "Land-development and exploitation works need reliable survey control, correctly re-established boundaries and volumes computed from surveyed ground against design lines.",
        workflow: [
          "Field work: site reconnaissance, traverses and topographic surveys with GeoMax GNSS and total station.",
          "Re-establish property boundary markers from known coordinates (rétablissement des bornes).",
          "Office work: data processing, traverse junction and plan editing in Covadis / AutoCAD.",
          "Subdivide land parcels and plot lots for development projects.",
          "Calculate stockpile volumes before quarry exploitation and earthwork volumes for roads and platforms from the design lines."
        ],
        deliverables: ["Topographic plans", "Traverse computations", "Subdivision / lot plans", "Stockpile and earthwork volume calculations"],
        outcomes: []
      },
      fr: {
        title: "Levés topographiques & carrière",
        category: "Topographie · Cubatures",
        context: "Topography BUT, But Groupe (cabinet de topographie et affaires foncières) — stage",
        period: "Juin 2021 — Août 2021",
        summary: "Travaux de terrain et de bureau : cheminements polygonaux, levés topographiques, rétablissement de bornes, lotissement, cubatures de stocks pour l'exploitation d'une carrière et cubatures de terrassement pour routes et plateformes.",
        objective: "Fournir la base topographique, les limites et les cubatures nécessaires aux travaux d'aménagement et à l'exploitation de la carrière.",
        problem: "Les travaux d'aménagement et d'exploitation exigent un canevas fiable, des limites correctement rétablies et des cubatures calculées à partir du terrain levé et des lignes de projet.",
        workflow: [
          "Travail de terrain : reconnaissance, cheminements polygonaux et levés topographiques au GNSS et à la station totale GeoMax.",
          "Rétablir les bornes des propriétés à partir de coordonnées connues.",
          "Travail de bureau : traitement des données, jonction des cheminements et édition des plans sous Covadis / AutoCAD.",
          "Réaliser le lotissement des parcelles et l'implantation des lots.",
          "Calculer les cubatures des stocks avant exploitation de la carrière et les cubatures de terrassement pour routes et plateformes à partir des lignes de projet."
        ],
        deliverables: ["Plans topographiques", "Calculs de cheminements", "Plans de lotissement", "Calculs de cubatures (stocks et terrassements)"],
        outcomes: []
      }
    },

    {
      id: "flood-risk",
      cats: ["gis"],
      cover: "assets/images/projects/flood-risk.svg",
      tech: ["GIS", "Remote sensing", "Spatial analysis"],
      map: "tunis-esat",
      viewer3d: false,
      github: "",
      model3d: "",
      images: [],
      en: {
        title: "Flood Risk Mapping",
        category: "Spatial analysis · Remote sensing",
        context: "ESAT University — academic project",
        period: "Oct 2022 — Jan 2023",
        summary: "Spatial analysis of flood-prone areas combining remote sensing and GIS, producing risk maps to support territorial planning strategies.",
        objective: "Identify flood-prone areas and map flood risk as an input to territorial planning.",
        problem: "Planning decisions need a spatial view of where flooding is likely; this requires combining imagery-derived and GIS data layers.",
        workflow: [
          "Compile remote-sensing and GIS data for the study area.",
          "Analyse flood-prone areas with spatial analysis.",
          "Produce flood-risk maps for territorial planning."
        ],
        deliverables: ["Flood-risk maps"],
        outcomes: []
      },
      fr: {
        title: "Cartographie du risque d'inondation",
        category: "Analyse spatiale · Télédétection",
        context: "ESAT University — projet académique",
        period: "Oct. 2022 — Janv. 2023",
        summary: "Analyse spatiale des zones inondables combinant télédétection et SIG, avec production de cartes de risque pour les stratégies d'aménagement du territoire.",
        objective: "Identifier les zones inondables et cartographier le risque d'inondation pour l'aménagement du territoire.",
        problem: "Les décisions d'aménagement nécessitent une vision spatiale des zones susceptibles d'être inondées, ce qui suppose de combiner des données issues de l'imagerie et des couches SIG.",
        workflow: [
          "Compiler les données de télédétection et SIG de la zone d'étude.",
          "Analyser les zones inondables par analyse spatiale.",
          "Produire les cartes de risque d'inondation pour l'aménagement du territoire."
        ],
        deliverables: ["Cartes de risque d'inondation"],
        outcomes: []
      }
    }
  ];

  /* ---------------------------------------------------------------------- */

  var cfg = window.SITE_CONFIG || { isSet: function () { return false; }, showImagePlaceholders: true };
  var activeFilter = "all";
  var lastFocus = null;
  var currentId = null;

  function L() { return (window.I18N && window.I18N.lang) || "en"; }
  function T(k) { return window.I18N ? window.I18N.t(k) : k; }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function get(id) { for (var i = 0; i < PROJECTS.length; i++) if (PROJECTS[i].id === id) return PROJECTS[i]; return null; }
  function catLabel(id) { for (var i = 0; i < CATEGORIES.length; i++) if (CATEGORIES[i].id === id) return CATEGORIES[i][L()]; return id; }
  // Highlight "[ADD …]" placeholders so they are easy to spot
  function mark(s) { return esc(s).replace(/\[ADD[^\]]*\]/g, function (m) { return '<span class="ph">' + m + "</span>"; }); }

  function renderFilters() {
    var box = document.getElementById("project-filters");
    if (!box) return;
    var used = {};
    PROJECTS.forEach(function (p) { p.cats.forEach(function (c) { used[c] = (used[c] || 0) + 1; }); });
    var html = '<button type="button" class="filter" data-filter="all" aria-pressed="' + (activeFilter === "all") + '">' +
      esc(T("filter.all")) + ' <span class="count">' + PROJECTS.length + "</span></button>";
    CATEGORIES.forEach(function (c) {
      if (!used[c.id]) return;
      html += '<button type="button" class="filter" data-filter="' + c.id + '" aria-pressed="' + (activeFilter === c.id) + '">' +
        esc(c[L()]) + ' <span class="count">' + used[c.id] + "</span></button>";
    });
    box.innerHTML = html;
  }

  function renderGrid() {
    var grid = document.getElementById("project-grid");
    if (!grid) return;
    var lang = L();
    var html = "";
    PROJECTS.forEach(function (p, i) {
      var d = p[lang];
      var hidden = activeFilter !== "all" && p.cats.indexOf(activeFilter) === -1;
      html +=
        '<article class="project-card' + (hidden ? " is-hidden" : "") + '" data-id="' + p.id + '">' +
          '<button type="button" class="card-hit" data-open="' + p.id + '" aria-label="' + esc(T("card.open") + ": " + d.title) + '"></button>' +
          '<div class="card-media">' +
            '<img src="' + esc(p.cover) + '" alt="" loading="lazy" decoding="async" width="640" height="400">' +
            '<span class="card-index mono">' + String(i + 1).padStart(2, "0") + "</span>" +
            (p.viewer3d ? '<span class="card-flag mono">3D</span>' : "") +
          "</div>" +
          '<div class="card-body">' +
            '<p class="card-cat mono">' + esc(d.category) + "</p>" +
            "<h3>" + esc(d.title) + "</h3>" +
            '<p class="card-sum">' + esc(d.summary) + "</p>" +
            '<ul class="chips chips-sm">' + p.tech.slice(0, 4).map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") + "</ul>" +
            '<p class="card-foot mono"><span>' + esc(d.period) + '</span><span class="card-more">' + esc(T("card.open")) + ' <svg class="icon"><use href="#i-arrow"/></svg></span></p>' +
          "</div>" +
        "</article>";
    });
    grid.innerHTML = html;
  }

  function modalHTML(p) {
    var d = p[L()];
    var idx = PROJECTS.indexOf(p);
    var prev = PROJECTS[(idx - 1 + PROJECTS.length) % PROJECTS.length];
    var next = PROJECTS[(idx + 1) % PROJECTS.length];

    var gallery = "";
    if (p.images && p.images.length) {
      gallery = '<div class="gallery">' + p.images.map(function (im) {
        var cap = im.caption ? (im.caption[L()] || im.caption.en || "") : "";
        if (im.type === "video") {
          return '<figure class="gal-video"><video controls preload="none" playsinline poster="' + esc(im.poster || "") + '">' +
            '<source src="' + esc(im.src) + '" type="video/mp4"></video>' +
            (cap ? "<figcaption>" + esc(cap) + "</figcaption>" : "") + "</figure>";
        }
        return '<figure><button type="button" class="gal-btn" data-lightbox="' + esc(im.src) + '" data-caption="' + esc(cap) + '">' +
          '<img src="' + esc(im.thumb || im.src) + '" alt="' + esc(cap || d.title) + '" loading="lazy" decoding="async"></button>' +
          (cap ? "<figcaption>" + esc(cap) + "</figcaption>" : "") + "</figure>";
      }).join("") + "</div>";
    } else if (cfg.showImagePlaceholders) {
      gallery = '<div class="gallery">' + [1, 2, 3].map(function () {
        return '<figure class="ph-frame"><span class="mono">' + esc(T("m.addimg")) + "</span></figure>";
      }).join("") + "</div>";
    }

    var actions = "";
    if (p.map) actions += '<button type="button" class="btn btn-sm btn-outline" data-goto-map="' + esc(p.map) + '"><svg class="icon"><use href="#i-map"/></svg>' + esc(T("m.map")) + "</button>";
    if (p.viewer3d) actions += '<button type="button" class="btn btn-sm btn-outline" data-goto-3d><svg class="icon"><use href="#i-cube"/></svg>' + esc(T("m.3d")) + "</button>";
    if (p.download) actions += '<a class="btn btn-sm btn-primary" href="' + esc(p.download) + '" download><svg class="icon"><use href="#i-download"/></svg>' + esc(T("m.download")) + "</a>";
    if (cfg.isSet(p.github)) actions += '<a class="btn btn-sm btn-outline" href="' + esc(p.github) + '" target="_blank" rel="noopener"><svg class="icon"><use href="#i-github"/></svg>' + esc(T("m.github")) + "</a>";
    if (cfg.isSet(p.model3d)) actions += '<a class="btn btn-sm btn-outline" href="' + esc(p.model3d) + '" target="_blank" rel="noopener"><svg class="icon"><use href="#i-cube"/></svg>' + esc(T("m.model")) + "</a>";

    function list(arr) { return "<ul>" + arr.map(function (x) { return "<li>" + mark(x) + "</li>"; }).join("") + "</ul>"; }

    return (
      '<header class="m-head">' +
        '<p class="card-cat mono">' + esc(p.cats.map(catLabel).join(" · ")) + "</p>" +
        '<h2 id="modal-title">' + esc(d.title) + "</h2>" +
        '<p class="m-sum">' + esc(d.summary) + "</p>" +
      "</header>" +
      '<dl class="m-facts' + (d.role ? " has-role" : "") + '">' +
        (d.role ? '<div class="m-role"><dt>' + esc(T("m.role")) + "</dt><dd>" + esc(d.role) + "</dd></div>" : "") +
        "<div><dt>" + esc(T("m.context")) + "</dt><dd>" + esc(d.context) + "</dd></div>" +
        "<div><dt>" + esc(T("m.period")) + '</dt><dd class="mono">' + esc(d.period) + "</dd></div>" +
        "<div><dt>" + esc(T("m.tech")) + '</dt><dd><ul class="chips chips-sm">' + p.tech.map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") + "</ul></dd></div>" +
      "</dl>" +
      '<div class="m-cols">' +
        '<section><h3 class="mono">' + esc(T("m.objective")) + "</h3><p>" + mark(d.objective) + "</p></section>" +
        '<section><h3 class="mono">' + esc(T("m.problem")) + "</h3><p>" + mark(d.problem) + "</p></section>" +
      "</div>" +
      '<section class="m-sec"><h3 class="mono">' + esc(T("m.workflow")) + '</h3><ol class="m-steps">' +
        d.workflow.map(function (s) { return "<li>" + mark(s) + "</li>"; }).join("") + "</ol></section>" +
      '<div class="m-cols">' +
        '<section><h3 class="mono">' + esc(T("m.deliverables")) + "</h3>" + list(d.deliverables) + "</section>" +
        (d.outcomes && d.outcomes.length ? '<section><h3 class="mono">' + esc(T("m.outcomes")) + '</h3><div class="m-outcomes">' + list(d.outcomes) + "</div></section>" : "") +
      "</div>" +
      (gallery ? '<section class="m-sec"><h3 class="mono">' + esc(T("m.gallery")) + "</h3>" + gallery + "</section>" : "") +
      (actions ? '<div class="m-actions">' + actions + "</div>" : "") +
      '<nav class="m-nav" aria-label="Case studies">' +
        '<button type="button" class="m-nav-btn" data-open="' + prev.id + '"><span class="mono">← ' + esc(T("m.prev")) + "</span>" + esc(prev[L()].title) + "</button>" +
        '<button type="button" class="m-nav-btn m-nav-next" data-open="' + next.id + '"><span class="mono">' + esc(T("m.next")) + " →</span>" + esc(next[L()].title) + "</button>" +
      "</nav>"
    );
  }

  var modal, body;

  function open(id, fromEl) {
    var p = get(id);
    if (!p || !modal) return;
    if (modal.hidden) lastFocus = fromEl || document.activeElement;
    currentId = id;
    stopMedia();
    body.innerHTML = modalHTML(p);
    modal.hidden = false;
    document.body.classList.add("no-scroll");
    body.parentElement.scrollTop = 0;
    requestAnimationFrame(function () { modal.classList.add("is-open"); });
    var closeBtn = modal.querySelector(".modal-close");
    if (closeBtn) closeBtn.focus({ preventScroll: true });
    if (history.replaceState) history.replaceState(null, "", "#project/" + id);
  }

  function stopMedia() {
    if (body) body.querySelectorAll("video").forEach(function (v) { try { v.pause(); } catch (e) { /* ignore */ } });
  }

  function close(restore) {
    if (!modal || modal.hidden) return;
    stopMedia();
    modal.classList.remove("is-open");
    modal.hidden = true;
    currentId = null;
    document.body.classList.remove("no-scroll");
    if (history.replaceState) history.replaceState(null, "", "#projects");
    if (restore !== false && lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }

  function trapFocus(e, root) {
    if (e.key !== "Tab") return;
    var f = root.querySelectorAll('a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])');
    f = Array.prototype.filter.call(f, function (el) { return el.offsetParent !== null; });
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { last.focus(); e.preventDefault(); }
    else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault(); }
  }

  /* Lightbox */
  var lb, lbImg, lbCap, lbLast;
  function openLightbox(src, cap) {
    lbLast = document.activeElement;
    lbImg.src = src; lbImg.alt = cap || ""; lbCap.textContent = cap || "";
    lb.hidden = false;
    lb.querySelector(".modal-close").focus();
  }
  function closeLightbox() {
    lb.hidden = true; lbImg.removeAttribute("src");
    if (lbLast && lbLast.focus) lbLast.focus();
  }

  function init() {
    modal = document.getElementById("project-modal");
    body = document.getElementById("modal-body");
    lb = document.getElementById("lightbox");
    lbImg = document.getElementById("lightbox-img");
    lbCap = document.getElementById("lightbox-cap");

    renderFilters();
    renderGrid();

    document.getElementById("project-filters").addEventListener("click", function (e) {
      var b = e.target.closest("[data-filter]");
      if (!b) return;
      activeFilter = b.getAttribute("data-filter");
      renderFilters();
      document.querySelectorAll(".project-card").forEach(function (card) {
        var p = get(card.getAttribute("data-id"));
        var show = activeFilter === "all" || p.cats.indexOf(activeFilter) !== -1;
        card.classList.toggle("is-hidden", !show);
      });
    });

    document.addEventListener("click", function (e) {
      var o = e.target.closest("[data-open]");
      if (o) { e.preventDefault(); open(o.getAttribute("data-open"), o); return; }

      var ext = e.target.closest("[data-open-project]");
      if (ext) { e.preventDefault(); open(ext.getAttribute("data-open-project"), ext); return; }

      if (e.target.closest("#project-modal [data-close]")) { close(); return; }

      var gm = e.target.closest("[data-goto-map]");
      if (gm) {
        var loc = gm.getAttribute("data-goto-map");
        close(false);
        document.dispatchEvent(new CustomEvent("show-location", { detail: { id: loc } }));
        return;
      }
      if (e.target.closest("[data-goto-3d]")) {
        close(false);
        document.dispatchEvent(new CustomEvent("show-3d"));
        return;
      }

      var g = e.target.closest("[data-lightbox]");
      if (g) { openLightbox(g.getAttribute("data-lightbox"), g.getAttribute("data-caption")); return; }
      if (e.target.closest("#lightbox [data-close]") || e.target === lb) { closeLightbox(); }
    });

    document.addEventListener("keydown", function (e) {
      if (lb && !lb.hidden) {
        if (e.key === "Escape") closeLightbox();
        return;
      }
      if (modal && !modal.hidden) {
        if (e.key === "Escape") close();
        else if (e.key === "ArrowRight" && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) {
          var i = PROJECTS.indexOf(get(currentId)); open(PROJECTS[(i + 1) % PROJECTS.length].id);
        } else if (e.key === "ArrowLeft" && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) {
          var j = PROJECTS.indexOf(get(currentId)); open(PROJECTS[(j - 1 + PROJECTS.length) % PROJECTS.length].id);
        } else trapFocus(e, modal);
      }
    });

    document.addEventListener("langchange", function () {
      renderFilters();
      renderGrid();
      if (currentId) body.innerHTML = modalHTML(get(currentId));
    });

    // Deep link: #project/<id>
    var m = location.hash.match(/^#project\/([\w-]+)/);
    if (m && get(m[1])) setTimeout(function () { open(m[1]); }, 60);
  }

  window.Projects = {
    list: PROJECTS,
    categories: CATEGORIES,
    get: get,
    open: open,
    close: close,
    init: init
  };
})();
