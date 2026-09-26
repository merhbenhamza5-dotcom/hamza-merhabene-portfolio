/* ==========================================================================
   Main UI: language, navigation, reveal-on-scroll, hero contour canvas,
   map/3D tabs, contact form, resume printing.
   ========================================================================== */
(function () {
  "use strict";

  var cfg = window.SITE_CONFIG || {};
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Config-driven links ---------- */
  function applyConfig() {
    document.querySelectorAll("[data-config-link]").forEach(function (el) {
      var key = el.getAttribute("data-config-link");
      var val = cfg[key];
      if (cfg.isSet && cfg.isSet(val)) {
        var a = el.tagName === "A" ? el : el.querySelector("a");
        if (a) a.href = val;
        el.querySelectorAll('[data-config-text="' + key + '"]').forEach(function (t) {
          t.textContent = val.replace(/^https?:\/\/(www\.)?/, "");
        });
      } else {
        el.hidden = true; // placeholder still in config.js -> hide from visitors
      }
    });
    if (cfg.cv) document.querySelectorAll("[data-cv-link]").forEach(function (a) { a.setAttribute("href", cfg.cv); });
  }

  /* ---------- Language ---------- */
  function initLang() {
    var btn = document.getElementById("lang-toggle");
    function sync(lang) {
      btn.querySelectorAll("[data-lang-opt]").forEach(function (s) {
        s.classList.toggle("is-active", s.getAttribute("data-lang-opt") === lang);
      });
      btn.setAttribute("aria-label", window.I18N.t("lang.aria"));
    }
    var start = window.I18N.initial();
    if (start !== "en") window.I18N.apply(start);
    sync(window.I18N.lang);
    btn.addEventListener("click", function () {
      var next = window.I18N.lang === "en" ? "fr" : "en";
      window.I18N.apply(next);
      sync(next);
    });
  }

  /* ---------- Navigation ---------- */
  function initNav() {
    var header = document.querySelector(".site-header");
    var toggle = document.getElementById("nav-toggle");
    var nav = document.getElementById("main-nav");

    function setOpen(open) {
      document.body.classList.toggle("nav-open", open);
      toggle.setAttribute("aria-expanded", String(open));
    }
    toggle.addEventListener("click", function () { setOpen(!document.body.classList.contains("nav-open")); });
    nav.addEventListener("click", function (e) { if (e.target.closest("a")) setOpen(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") setOpen(false); });
    window.addEventListener("resize", function () { if (window.innerWidth > 980) setOpen(false); });

    var onScroll = function () { header.classList.toggle("is-scrolled", window.scrollY > 12); };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // Active section highlighting
    var links = {};
    nav.querySelectorAll('a[href^="#"]').forEach(function (a) { links[a.getAttribute("href").slice(1)] = a; });
    var alias = { resume: "education" };
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          var id = alias[en.target.id] || en.target.id;
          Object.keys(links).forEach(function (k) {
            links[k].classList.toggle("is-active", k === id);
            if (k === id) links[k].setAttribute("aria-current", "true"); else links[k].removeAttribute("aria-current");
          });
        });
      }, { rootMargin: "-45% 0px -50% 0px" });
      document.querySelectorAll("main > section[id]").forEach(function (s) { io.observe(s); });
    }
  }

  /* ---------- Reveal on scroll ---------- */
  function initReveal() {
    var els = document.querySelectorAll(".reveal");
    if (reduceMotion || !("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-visible"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Hero: animated contour lines (marching squares) ---------- */
  function initHeroCanvas() {
    var canvas = document.getElementById("hero-canvas");
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext("2d");
    var hero = canvas.parentElement;
    var hudC = document.getElementById("hud-coords");
    var hudZ = document.getElementById("hud-elev");

    var W = 0, H = 0, dpr = 1, cell = 18, cols = 0, rows = 0, field = null;
    var mouse = { x: -1, y: -1, tx: -1, ty: -1, active: false };
    var t = 0, running = false, visible = true, last = 0;
    var LEVELS = 16;

    // Fixed pseudo-random "GCP" markers (decorative)
    var gcps = [[0.62, 0.22], [0.83, 0.58], [0.55, 0.78], [0.93, 0.18], [0.72, 0.9]];

    function resize() {
      var r = hero.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = Math.max(1, Math.round(r.width)); H = Math.max(1, Math.round(r.height));
      canvas.width = W * dpr; canvas.height = H * dpr;
      canvas.style.width = W + "px"; canvas.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cell = W < 700 ? 22 : 18;
      cols = Math.ceil(W / cell) + 1; rows = Math.ceil(H / cell) + 1;
      field = new Float32Array(cols * rows);
      if (!running) draw();
    }

    function height(nx, ny) {
      // Smooth terrain-like field (sum of oriented waves) + mouse "hill"
      var v =
        0.55 * Math.sin(nx * 0.9 + t * 0.045) * Math.cos(ny * 1.05 - t * 0.02) +
        0.38 * Math.sin(nx * 1.7 - ny * 1.3 + 1.3) +
        0.24 * Math.cos(nx * 2.8 + ny * 2.2 - t * 0.07) +
        0.12 * Math.sin(nx * 4.6 - ny * 3.9 + t * 0.05);
      if (mouse.active) {
        var dx = nx - mouse.x, dy = ny - mouse.y;
        v += 0.75 * Math.exp(-(dx * dx + dy * dy) / 0.35);
      }
      return v;
    }

    function compute() {
      var sc = 1 / 150;
      for (var j = 0; j < rows; j++) for (var i = 0; i < cols; i++) {
        field[j * cols + i] = height(i * cell * sc, j * cell * sc);
      }
    }

    function draw() {
      if (!field) return;
      compute();
      ctx.clearRect(0, 0, W, H);
      var min = -1.3, max = 1.9, step = (max - min) / LEVELS;

      for (var l = 1; l < LEVELS; l++) {
        var iso = min + l * step;
        var index = l % 4 === 0;
        ctx.beginPath();
        for (var j = 0; j < rows - 1; j++) {
          for (var i = 0; i < cols - 1; i++) {
            var a = field[j * cols + i], b = field[j * cols + i + 1];
            var c = field[(j + 1) * cols + i + 1], d = field[(j + 1) * cols + i];
            var code = (a > iso ? 8 : 0) | (b > iso ? 4 : 0) | (c > iso ? 2 : 0) | (d > iso ? 1 : 0);
            if (code === 0 || code === 15) continue;
            var x = i * cell, y = j * cell;
            var top = [x + cell * (iso - a) / (b - a), y];
            var right = [x + cell, y + cell * (iso - b) / (c - b)];
            var bottom = [x + cell * (iso - d) / (c - d), y + cell];
            var left = [x, y + cell * (iso - a) / (d - a)];
            var segs;
            switch (code) {
              case 1: case 14: segs = [left, bottom]; break;
              case 2: case 13: segs = [bottom, right]; break;
              case 3: case 12: segs = [left, right]; break;
              case 4: case 11: segs = [top, right]; break;
              case 5: segs = [left, top, bottom, right]; break;
              case 6: case 9: segs = [top, bottom]; break;
              case 7: case 8: segs = [left, top]; break;
              case 10: segs = [left, bottom, top, right]; break;
            }
            for (var s = 0; s < segs.length; s += 2) {
              ctx.moveTo(segs[s][0], segs[s][1]);
              ctx.lineTo(segs[s + 1][0], segs[s + 1][1]);
            }
          }
        }
        ctx.strokeStyle = index ? "rgba(88, 214, 196, 0.30)" : "rgba(88, 214, 196, 0.11)";
        ctx.lineWidth = index ? 1.1 : 0.8;
        ctx.stroke();
      }

      // GCP markers
      ctx.font = "10px 'JetBrains Mono', ui-monospace, monospace";
      gcps.forEach(function (g, k) {
        var gx = g[0] * W, gy = g[1] * H;
        if (W < 700 && g[0] < 0.7) return;
        ctx.strokeStyle = "rgba(245, 165, 36, 0.55)";
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(gx, gy, 7, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(gx, gy - 4); ctx.lineTo(gx + 3.5, gy + 2.5); ctx.lineTo(gx - 3.5, gy + 2.5); ctx.closePath();
        ctx.fillStyle = "rgba(245, 165, 36, 0.7)"; ctx.fill();
        ctx.fillStyle = "rgba(245, 165, 36, 0.6)";
        ctx.fillText("GCP-" + String(k + 1).padStart(2, "0"), gx + 11, gy + 3);
      });

      // Cursor crosshair + HUD
      if (mouse.active) {
        var mx = mouse.tx, my = mouse.ty;
        ctx.strokeStyle = "rgba(230, 237, 243, 0.25)";
        ctx.setLineDash([3, 5]);
        ctx.beginPath(); ctx.moveTo(mx, 0); ctx.lineTo(mx, H); ctx.moveTo(0, my); ctx.lineTo(W, my); ctx.stroke();
        ctx.setLineDash([]);
        ctx.strokeStyle = "rgba(88, 214, 196, 0.9)";
        ctx.beginPath(); ctx.arc(mx, my, 10, 0, Math.PI * 2); ctx.stroke();
      }
    }

    function updateHud(px, py) {
      if (!hudC) return;
      // Map canvas position to a window around Lisbon (decorative readout)
      var lon = -9.30 + (px / W) * 0.34;
      var lat = 38.80 - (py / H) * 0.14;
      hudC.textContent = Math.abs(lat).toFixed(4) + "° N · " + Math.abs(lon).toFixed(4) + "° W";
      var z = (height(px / 150, py / 150) + 1.3) * 42;
      hudZ.textContent = "Z " + z.toFixed(1) + " m";
    }

    function loop(now) {
      if (!running) return;
      if (now - last > 40) { // ~25 fps is enough for slow contours
        t += 0.35;
        draw();
        last = now;
      }
      requestAnimationFrame(loop);
    }
    function start() { if (running || reduceMotion) return; running = true; requestAnimationFrame(loop); }
    function stop() { running = false; }

    hero.addEventListener("pointermove", function (e) {
      if (e.pointerType === "touch") return;
      var r = canvas.getBoundingClientRect();
      mouse.tx = e.clientX - r.left; mouse.ty = e.clientY - r.top;
      mouse.x = mouse.tx / 150; mouse.y = mouse.ty / 150;
      mouse.active = true;
      updateHud(mouse.tx, mouse.ty);
      if (!running) draw();
    });
    hero.addEventListener("pointerleave", function () { mouse.active = false; if (!running) draw(); });

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (en) {
        visible = en[0].isIntersecting;
        if (visible && !document.hidden) start(); else stop();
      }).observe(hero);
    }
    document.addEventListener("visibilitychange", function () { if (document.hidden) stop(); else if (visible) start(); });
    window.addEventListener("resize", debounce(resize, 150));
    resize();
    start();
  }

  function debounce(fn, ms) { var id; return function () { clearTimeout(id); id = setTimeout(fn, ms); }; }

  /* ---------- 2D / 3D tabs ---------- */
  function initTabs() {
    var tabs = [document.getElementById("tab-2d"), document.getElementById("tab-3d")];
    var panels = [document.getElementById("panel-2d"), document.getElementById("panel-3d")];
    function select(i, focus) {
      tabs.forEach(function (t, k) {
        var on = k === i;
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
        panels[k].hidden = !on;
      });
      if (focus) tabs[i].focus();
      document.dispatchEvent(new CustomEvent(i === 0 ? "panel-2d-shown" : "panel-3d-shown"));
    }
    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () { select(i); });
      t.addEventListener("keydown", function (e) {
        if (e.key === "ArrowRight" || e.key === "ArrowLeft") { select(i === 0 ? 1 : 0, true); e.preventDefault(); }
      });
    });
    function scrollToMaps() {
      var sec = document.getElementById("maps");
      sec.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    }
    document.addEventListener("show-3d", function () { select(1); scrollToMaps(); });
    document.addEventListener("show-location", function () { select(0); scrollToMaps(); });
  }

  /* ---------- Contact form (mailto, no backend needed) ---------- */
  function initForm() {
    var form = document.getElementById("contact-form");
    var status = document.getElementById("form-status");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = form.name.value.trim();
      var email = form.email.value.trim();
      var msg = form.message.value.trim();
      var reason = form.reason.value;
      var okEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (!name || !okEmail || !msg) {
        status.textContent = window.I18N.t("form.err");
        status.className = "form-status is-error";
        return;
      }
      var subject = reason + " — " + name;
      var bodyText = msg + "\n\n—\n" + name + "\n" + email;
      var to = cfg.email || "merhbenhamza07@gmail.com";
      window.location.href = "mailto:" + to + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(bodyText);
      status.textContent = window.I18N.t("form.ok");
      status.className = "form-status is-ok";
    });
  }

  /* ---------- Print the online resume only ---------- */
  function initPrint() {
    var btn = document.getElementById("print-resume");
    if (!btn) return;
    btn.addEventListener("click", function () {
      document.body.classList.add("print-resume");
      window.print();
    });
    window.addEventListener("afterprint", function () { document.body.classList.remove("print-resume"); });
  }

  function init() {
    applyConfig();
    initLang();
    initNav();
    if (window.Projects) window.Projects.init();
    initReveal();
    initHeroCanvas();
    initTabs();
    initForm();
    initPrint();
    var y = document.getElementById("year");
    if (y) y.textContent = new Date().getFullYear();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
