/* ==========================================================================
   Site configuration — edit these values, no other file needs to change.
   Any value still starting with "[ADD" is treated as "not set yet":
   the matching link is hidden from visitors automatically.
   ========================================================================== */
window.SITE_CONFIG = {
  name: "Hamza Merhabene",
  email: "merhbenhamza07@gmail.com",
  phone: "+351 932 238 935",
  linkedin: "https://www.linkedin.com/in/merhabene-hamza-b388a6219",

  // [ADD LINK] — e.g. "https://github.com/your-username"
  github: "[ADD LINK]",

  // CV file (relative path — works on GitHub Pages project and user sites)
  cv: "assets/cv/Hamza_Merhabene_CV.pdf",

  // Show "[ADD PROJECT IMAGE]" frames in case studies that have no images yet.
  // Set to false before sharing the site widely if some projects still have no images.
  showImagePlaceholders: false,

  // Optional: URL of a Potree viewer page (e.g. "lidar/index.html" or a hosted viewer).
  // When set, a "Open Potree viewer" button appears in the 3D panel. See README.
  potreeUrl: "",

  // Default language when the visitor has no saved preference: "en" or "fr".
  defaultLang: "en"
};

window.SITE_CONFIG.isSet = function (value) {
  return typeof value === "string" && value.trim() !== "" && !/^\[ADD/i.test(value.trim());
};
