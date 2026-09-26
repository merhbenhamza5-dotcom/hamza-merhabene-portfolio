# Hamza Merhabene — Geomatics & GIS Engineer portfolio

Static, framework-free portfolio (HTML · CSS · vanilla JavaScript), bilingual EN / FR,
ready for **GitHub Pages** or **Cloudflare Pages**. No build step.

---

## 1. Structure

```
/
├── index.html                  One-page site (Home, About, Experience, Projects, Skills,
│                               3D / Maps, Education, Online resume, Contact)
├── 404.html                    Custom "page not found"
├── robots.txt
├── .nojekyll                   Tells GitHub Pages to serve files as-is
├── css/
│   └── style.css               Whole design (dark cartographic theme, responsive, print)
├── js/
│   ├── config.js               ← EDIT: GitHub link, CV path, placeholders, Potree URL
│   ├── i18n.js                 French translations + EN/FR switch
│   ├── projects.js             ← EDIT: project case studies (EN + FR), images, links
│   ├── main.js                 Navigation, hero contour animation, tabs, contact form, print
│   ├── map.js                  Leaflet project map (layers, popups, fullscreen, coordinates)
│   └── viewer3d.js             WebGL point-cloud viewer (demo cloud + local LAS / XYZ loading)
├── geojson/
│   └── project-locations.geojson   ← EDIT: map locations (EPSG:4326)
└── assets/
    ├── cv/Hamza_Merhabene_CV.pdf   ← your CV (already copied from the file you sent)
    ├── hamza-merhabene.vcf         Contact card
    ├── icons/                      favicon.svg, favicon-32.png, apple-touch-icon.png
    ├── images/
    │   ├── profile.webp / .jpg     Your portrait (480 × 480, used in About + online resume)
    │   ├── og-image.png            Social-media preview (1200 × 630)
    │   └── projects/               Project images (*.webp + *-thumb.webp) and neutral
    │                               illustrations (*.svg) for projects without images yet
    ├── videos/                     Compressed screen recordings (WebGIS 360°, LiDAR timelapse)
    └── vendor/leaflet/             Leaflet 1.9.4 (bundled, BSD-2 licence)
```

All paths are **relative**, so the site works at `https://<user>.github.io/`
and at `https://<user>.github.io/<repo>/`.

---

## 2. What you must replace / add

| Item | Where | What to do |
|---|---|---|
| GitHub profile link | `js/config.js` → `github` | Replace `"[ADD LINK]"` with `https://github.com/<you>`. Until then the GitHub link is hidden automatically. |
| Project images | `js/projects.js` → `images: []` of each project | Add screenshots (see §3). Until then, `[ADD PROJECT IMAGE]` frames are shown in the case studies. |
| Card thumbnails | `js/projects.js` → `cover` | Optional: point to a real image instead of the illustration SVG. |
| ArcPy code link | `js/projects.js` → `arcpy-automation.github` | Replace `"[ADD LINK]"` with the repository URL (hidden until set). |
| 3D model link | `js/projects.js` → `3d-reconstruction.model3d` | e.g. a Sketchfab link (hidden until set). |
| Flood-risk details | `js/projects.js` → `flood-risk.workflow` | Replace the `[ADD DESCRIPTION …]` notes (study area, data, method). |
| Social preview URL | `index.html` → `og:image`, `twitter:image` | After deploying, use the absolute URL, e.g. `https://<you>.github.io/assets/images/og-image.png` (LinkedIn / WhatsApp need absolute URLs). |

Recommended images per project (WebP or JPG, ~1600 px wide, < 400 KB each):

- **Drone photogrammetry** — orthomosaic extract, GCP layout, Metashape / Pix4D processing report screenshot
- **DSM / DTM** — hillshaded DTM, DSM vs DTM comparison, profile
- **3D reconstruction** — textured mesh view (or Sketchfab link)
- **LiDAR** — classified cloud (TerraScan view), before / after noise filtering
- **Cartography** — 2–3 finished map layouts (anonymised)
- **Mining tenure** — tenure / constraints map (anonymised, no client data)
- **ArcPy automation** — toolbox dialog, code excerpt
- **LV network database** — UML diagram, QField form, network in QGIS
- **WebGIS Lizmap** — application screenshot
- **Topographic & quarry** — topographic plan, volume computation
- **Flood risk** — final risk map

> Only publish images you are allowed to share. Remove client names, logos and exact
> coordinates where required.

---

## 3. Editing content

### Add images or videos to a project
Put `name.webp` (~1600 px) and `name-thumb.webp` (~720 px) in `assets/images/projects/`, then in `js/projects.js`:

```js
images: [
  img("name", "English caption", "Légende française"),
  vid("assets/videos/clip.mp4", "poster-image-name", "English caption", "Légende française")
],
```
Keep videos short and compressed (H.264 MP4, a few MB) — GitHub rejects files over 100 MB.
Images open in a lightbox. Once every project has images you may set
`showImagePlaceholders: false` in `js/config.js`.

### Add a project
Copy one object in the `PROJECTS` array of `js/projects.js`, give it a unique `id`,
fill both `en` and `fr`, and choose categories from `CATEGORIES`.
Only use real information — the site intentionally contains no invented figures.

### Map locations
Edit `geojson/project-locations.geojson` (longitude, latitude — WGS 84).
`type` is one of `work`, `freelance`, `academic`, `base`; `projects` lists the project ids
shown in the popup. Keep the inline copy at the bottom of `js/map.js` in sync if you want the
map to work when `index.html` is opened directly from disk.

### Text and translations
English text lives in `index.html`. French is in `js/i18n.js` (same keys as the
`data-i18n` attributes). Project texts are in `js/projects.js` (`en` / `fr`).

### Cache busting
When you change CSS or JS, bump `?v=1` → `?v=2` in `index.html`.

---

## 4. Run locally

The map fetches a GeoJSON file, so use a small local server (not `file://`):

```bash
cd portfolio-folder
python -m http.server 8000
# then open http://localhost:8000
```
or VS Code → *Live Server*. Basemap tiles and Google Fonts need an internet connection.

---

## 5. Publish on GitHub Pages

1. Create a GitHub account (if needed) and a repository:
   - **`<username>.github.io`** → site at `https://<username>.github.io/` (recommended), or
   - any name, e.g. `portfolio` → site at `https://<username>.github.io/portfolio/`.
2. Upload all files **from inside this folder** to the repository root
   (`index.html` must be at the top level):
   ```bash
   git init
   git add .
   git commit -m "Portfolio"
   git branch -M main
   git remote add origin https://github.com/<username>/<username>.github.io.git
   git push -u origin main
   ```
   (or drag-and-drop the files in GitHub → *Add file → Upload files*).
3. Repository → **Settings → Pages** → *Source: Deploy from a branch* → `main` / `/ (root)` → Save.
4. Wait 1–2 minutes and open the URL shown on that page.
5. Update `og:image` / `twitter:image` with the absolute URL (see §2) and push again.

**Custom domain (optional):** Settings → Pages → *Custom domain*, then add the DNS records
GitHub shows. GitHub creates a `CNAME` file for you.

### Cloudflare Pages (alternative)
Dashboard → *Workers & Pages → Create → Pages → Connect to Git* → select the repo →
framework preset **None**, build command empty, output directory `/`.

---

## 6. 3D viewer and Potree

The built-in viewer (`js/viewer3d.js`) shows a clearly labelled **procedural demo cloud**
and lets visitors open a `.las` (1.0–1.4, uncompressed) or `.xyz / .csv` file locally —
nothing is uploaded.

To publish your own large point clouds with **Potree**:

1. Convert your LAS/LAZ with **PotreeConverter 2.x**:
   `PotreeConverter input.las -o lidar/pointclouds/site01`
2. Download a Potree 1.8 release build and place its `build/` and `libs/` folders in `lidar/`.
3. Create `lidar/index.html` from Potree's `examples/viewer.html`, loading
   `pointclouds/site01/metadata.json` with `Potree.loadPointCloud(...)`.
4. Set `potreeUrl: "lidar/index.html"` in `js/config.js` — an "Open Potree viewer" button appears.

GitHub limits single files to 100 MB and repositories to ~1 GB; for large clouds host the
octree on object storage (e.g. Cloudflare R2, S3) and point Potree to that URL.

---

## 7. Contact form

The form opens the visitor's email client with the message pre-filled (`mailto:`), so no
server is needed. To receive messages directly, a form service such as Formspree can be
connected later by changing `initForm()` in `js/main.js`.

---

## 8. Checklist before sharing

- [ ] `js/config.js` → GitHub link set
- [ ] Real images added to projects (or `showImagePlaceholders: false`)
- [ ] `[ADD …]` placeholders resolved — search the project for `[ADD`
- [ ] `og:image` absolute URL set after deployment
- [ ] CV in `assets/cv/` is the version you want public (it currently includes your street address and phone number)
- [ ] Tested on phone and desktop, EN and FR

Leaflet © Vladimir Agafonkin (BSD-2-Clause). Basemaps © OpenStreetMap contributors, © CARTO, © Esri.
