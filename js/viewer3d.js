/* ==========================================================================
   Lightweight WebGL point-cloud viewer (no dependencies)
   - Shows a procedural demo cloud (clearly labelled: not project data).
   - Visitors — or you — can load a .las (1.0–1.4, uncompressed) or .xyz/.csv
     file; it is parsed locally in the browser, nothing is uploaded.
   - For very large published datasets, use Potree (see README) and set
     SITE_CONFIG.potreeUrl in js/config.js.
   ========================================================================== */
(function () {
  "use strict";

  var MAX_POINTS = 1500000;
  var CLASS_INFO = {
    1: { c: [0.62, 0.66, 0.70], en: "Unclassified", fr: "Non classé" },
    2: { c: [0.79, 0.64, 0.42], en: "Ground", fr: "Sol" },
    3: { c: [0.66, 0.85, 0.46], en: "Low vegetation", fr: "Végétation basse" },
    4: { c: [0.42, 0.72, 0.33], en: "Medium vegetation", fr: "Végétation moyenne" },
    5: { c: [0.20, 0.55, 0.26], en: "High vegetation", fr: "Végétation haute" },
    6: { c: [0.89, 0.34, 0.18], en: "Building", fr: "Bâtiment" },
    7: { c: [1.00, 0.20, 0.85], en: "Low point (noise)", fr: "Point bas (bruit)" },
    9: { c: [0.23, 0.55, 0.87], en: "Water", fr: "Eau" }
  };
  var RAMP = [[0.17, 0.48, 0.71], [0.67, 0.85, 0.91], [1.0, 1.0, 0.75], [0.99, 0.68, 0.38], [0.84, 0.10, 0.11]];

  var canvas, gl, prog, bufPos, bufCol, loc = {};
  var cloud = null;              // { pos: Float32Array, cls: Uint8Array, rgb: Uint8Array|null, count, min:[], max:[], name }
  var mode = "class", pointSize = 2, hidden = {};
  var cam = { yaw: -0.8, pitch: 0.55, dist: 300, target: [0, 0, 0] };
  var started = false, dirty = true, dpr = 1;

  function lang() { return (window.I18N && window.I18N.lang) || "en"; }
  function T(k) { return window.I18N ? window.I18N.t(k) : k; }

  /* ---------------- math ---------------- */
  function perspective(fovy, aspect, near, far) {
    var f = 1 / Math.tan(fovy / 2), nf = 1 / (near - far);
    return [f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) * nf, -1, 0, 0, 2 * far * near * nf, 0];
  }
  function lookAt(eye, c, up) {
    var zx = eye[0] - c[0], zy = eye[1] - c[1], zz = eye[2] - c[2];
    var l = Math.hypot(zx, zy, zz); zx /= l; zy /= l; zz /= l;
    var xx = up[1] * zz - up[2] * zy, xy = up[2] * zx - up[0] * zz, xz = up[0] * zy - up[1] * zx;
    l = Math.hypot(xx, xy, xz); xx /= l; xy /= l; xz /= l;
    var yx = zy * xz - zz * xy, yy = zz * xx - zx * xz, yz = zx * xy - zy * xx;
    return [xx, yx, zx, 0, xy, yy, zy, 0, xz, yz, zz, 0,
      -(xx * eye[0] + xy * eye[1] + xz * eye[2]), -(yx * eye[0] + yy * eye[1] + yz * eye[2]), -(zx * eye[0] + zy * eye[1] + zz * eye[2]), 1];
  }
  function mul(a, b) {
    var o = new Array(16);
    for (var i = 0; i < 4; i++) for (var j = 0; j < 4; j++) {
      o[j * 4 + i] = a[i] * b[j * 4] + a[4 + i] * b[j * 4 + 1] + a[8 + i] * b[j * 4 + 2] + a[12 + i] * b[j * 4 + 3];
    }
    return o;
  }
  function eyePos() {
    var cp = Math.cos(cam.pitch);
    return [cam.target[0] + cam.dist * cp * Math.cos(cam.yaw), cam.target[1] + cam.dist * cp * Math.sin(cam.yaw), cam.target[2] + cam.dist * Math.sin(cam.pitch)];
  }

  /* ---------------- GL setup ---------------- */
  var VS = [
    "attribute vec3 aPos; attribute vec4 aCol;",
    "uniform mat4 uMVP; uniform float uSize; uniform float uRef;",
    "varying vec4 vCol;",
    "void main(){ gl_Position = uMVP * vec4(aPos,1.0);",
    " float s = uSize * clamp(uRef / gl_Position.w, 0.6, 3.0);",
    " gl_PointSize = aCol.a < 0.5 ? 0.0 : s; vCol = aCol; }"
  ].join("\n");
  var FS = [
    "precision mediump float; varying vec4 vCol;",
    "void main(){ vec2 d = gl_PointCoord - 0.5; if (dot(d,d) > 0.25 || vCol.a < 0.5) discard;",
    " gl_FragColor = vec4(vCol.rgb, 1.0); }"
  ].join("\n");

  function shader(type, src) {
    var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  }

  function setupGL() {
    gl = canvas.getContext("webgl", { antialias: true, preserveDrawingBuffer: false }) || canvas.getContext("experimental-webgl");
    if (!gl) return false;
    prog = gl.createProgram();
    gl.attachShader(prog, shader(gl.VERTEX_SHADER, VS));
    gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog);
    gl.useProgram(prog);
    loc.pos = gl.getAttribLocation(prog, "aPos");
    loc.col = gl.getAttribLocation(prog, "aCol");
    loc.mvp = gl.getUniformLocation(prog, "uMVP");
    loc.size = gl.getUniformLocation(prog, "uSize");
    loc.ref = gl.getUniformLocation(prog, "uRef");
    bufPos = gl.createBuffer();
    bufCol = gl.createBuffer();
    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(0.035, 0.05, 0.07, 1);
    return true;
  }

  /* ---------------- data ---------------- */
  function upload() {
    gl.bindBuffer(gl.ARRAY_BUFFER, bufPos);
    gl.bufferData(gl.ARRAY_BUFFER, cloud.pos, gl.STATIC_DRAW);
    recolor();
    resetView();
    buildClassList();
    stats();
  }

  function rampColor(t) {
    t = Math.max(0, Math.min(1, t)) * (RAMP.length - 1);
    var i = Math.min(RAMP.length - 2, Math.floor(t)), f = t - i;
    var a = RAMP[i], b = RAMP[i + 1];
    return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f];
  }

  function recolor() {
    var n = cloud.count, col = new Uint8Array(n * 4);
    var zmin = cloud.min[2], zr = (cloud.max[2] - cloud.min[2]) || 1;
    var useRgb = mode === "rgb" && cloud.rgb;
    for (var i = 0; i < n; i++) {
      var k = cloud.cls[i], c;
      if (mode === "elev" || (mode === "rgb" && !cloud.rgb)) c = rampColor((cloud.pos[i * 3 + 2] + cloud.offZ - zmin) / zr);
      else if (useRgb) c = [cloud.rgb[i * 3] / 255, cloud.rgb[i * 3 + 1] / 255, cloud.rgb[i * 3 + 2] / 255];
      else c = (CLASS_INFO[k] || CLASS_INFO[1]).c;
      col[i * 4] = c[0] * 255; col[i * 4 + 1] = c[1] * 255; col[i * 4 + 2] = c[2] * 255;
      col[i * 4 + 3] = hidden[k] ? 0 : 255;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, bufCol);
    gl.bufferData(gl.ARRAY_BUFFER, col, gl.STATIC_DRAW);
    dirty = true;
  }

  // Build a cloud object from absolute coordinates; recentres for float precision.
  function makeCloud(xyz, cls, rgb, count, name) {
    var min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
    for (var i = 0; i < count; i++) for (var a = 0; a < 3; a++) {
      var v = xyz[i * 3 + a]; if (v < min[a]) min[a] = v; if (v > max[a]) max[a] = v;
    }
    var cx = (min[0] + max[0]) / 2, cy = (min[1] + max[1]) / 2, cz = min[2];
    var pos = new Float32Array(count * 3);
    for (var j = 0; j < count; j++) {
      pos[j * 3] = xyz[j * 3] - cx; pos[j * 3 + 1] = xyz[j * 3 + 1] - cy; pos[j * 3 + 2] = xyz[j * 3 + 2] - cz;
    }
    return { pos: pos, cls: cls, rgb: rgb, count: count, min: min, max: max, offZ: cz, name: name };
  }

  /* Procedural demo: terrain + trees + buildings + a pond (for illustration only) */
  function demoCloud() {
    var rnd = mulberry(7);
    var pts = [], cls = [], rgb = [];
    function h(x, y) {
      return 18 * Math.sin(x / 55) * Math.cos(y / 70) + 9 * Math.sin((x + y) / 31) + 4 * Math.cos(x / 13 - y / 17) + 0.02 * x;
    }
    function push(x, y, z, k, r, g, b) { pts.push(x, y, z); cls.push(k); rgb.push(r, g, b); }
    var S = 200, step = 0.95;
    var buildings = [[-60, 40, 26, 16, 12], [-20, 55, 18, 18, 9], [30, -50, 30, 14, 15], [65, -20, 16, 22, 8], [-70, -60, 20, 12, 10]];
    var pond = [40, 60, 22];
    function inBuilding(x, y) {
      for (var b = 0; b < buildings.length; b++) {
        var B = buildings[b];
        if (Math.abs(x - B[0]) < B[2] / 2 && Math.abs(y - B[1]) < B[3] / 2) return B;
      }
      return null;
    }
    // Ground (+ water)
    for (var gx = -S / 2; gx <= S / 2; gx += step) {
      for (var gy = -S / 2; gy <= S / 2; gy += step) {
        var x = gx + (rnd() - 0.5) * step, y = gy + (rnd() - 0.5) * step;
        if (inBuilding(x, y)) continue;
        var dp = Math.hypot(x - pond[0], y - pond[1]);
        if (dp < pond[2]) { push(x, y, h(pond[0] + pond[2], pond[1]) - 1.5, 9, 70, 110, 140); continue; }
        var z = h(x, y) + (rnd() - 0.5) * 0.25;
        var shade = 150 + 40 * rnd();
        push(x, y, z, 2, shade, shade * 0.83, shade * 0.6);
      }
    }
    // Buildings: roofs + walls
    buildings.forEach(function (B) {
      var base = h(B[0], B[1]), top = base + B[4];
      for (var bx = -B[2] / 2; bx <= B[2] / 2; bx += 0.9) for (var by = -B[3] / 2; by <= B[3] / 2; by += 0.9) {
        var ridge = (1 - Math.abs(by) / (B[3] / 2)) * 2.5;
        push(B[0] + bx, B[1] + by, top + ridge, 6, 170, 80, 60);
      }
      for (var wz = base; wz < top; wz += 1.2) {
        for (var e = -B[2] / 2; e <= B[2] / 2; e += 1.6) { push(B[0] + e, B[1] - B[3] / 2, wz, 6, 200, 195, 185); push(B[0] + e, B[1] + B[3] / 2, wz, 6, 200, 195, 185); }
        for (var f = -B[3] / 2; f <= B[3] / 2; f += 1.6) { push(B[0] - B[2] / 2, B[1] + f, wz, 6, 200, 195, 185); push(B[0] + B[2] / 2, B[1] + f, wz, 6, 200, 195, 185); }
      }
    });
    // Trees
    for (var t = 0; t < 120; t++) {
      var tx = (rnd() - 0.5) * S * 0.95, ty = (rnd() - 0.5) * S * 0.95;
      if (inBuilding(tx, ty) || Math.hypot(tx - pond[0], ty - pond[1]) < pond[2] + 3) continue;
      var tb = h(tx, ty), th = 7 + rnd() * 10, cr = 2.5 + rnd() * 3.5;
      var np = Math.round(cr * cr * 10);
      for (var p = 0; p < np; p++) {
        var u = rnd() * 2 * Math.PI, v = Math.acos(2 * rnd() - 1), rr = cr * Math.cbrt(rnd());
        var px = tx + rr * Math.sin(v) * Math.cos(u), py = ty + rr * Math.sin(v) * Math.sin(u);
        var pz = tb + th + rr * Math.cos(v) * 1.2;
        var k = pz - tb > 5 ? 5 : 4;
        push(px, py, pz, k, 40 + 40 * rnd(), 100 + 60 * rnd(), 40 + 30 * rnd());
      }
      for (var s = 0; s < 10; s++) push(tx + (rnd() - 0.5) * 0.4, ty + (rnd() - 0.5) * 0.4, tb + rnd() * th * 0.8, 4, 90, 70, 50);
    }
    // Low vegetation patches
    for (var q = 0; q < 5000; q++) {
      var lx = (rnd() - 0.5) * S, ly = (rnd() - 0.5) * S;
      if (inBuilding(lx, ly) || Math.hypot(lx - pond[0], ly - pond[1]) < pond[2]) continue;
      if (Math.sin(lx / 20) * Math.cos(ly / 25) < 0.35) continue;
      push(lx, ly, h(lx, ly) + 0.2 + rnd() * 1.1, 3, 110, 160, 70);
    }
    // Noise
    for (var nz = 0; nz < 120; nz++) {
      var nx = (rnd() - 0.5) * S, ny = (rnd() - 0.5) * S;
      push(nx, ny, h(nx, ny) - 4 - rnd() * 10, 7, 255, 0, 200);
    }
    var n = cls.length;
    return makeCloud(new Float64Array(pts), new Uint8Array(cls), new Uint8Array(rgb), n, "demo");
  }
  function mulberry(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

  /* ---------------- file parsing ---------------- */
  function parseLAS(buf) {
    var dv = new DataView(buf);
    var sig = String.fromCharCode(dv.getUint8(0), dv.getUint8(1), dv.getUint8(2), dv.getUint8(3));
    if (sig !== "LASF") throw new Error("Not a LAS file");
    var minor = dv.getUint8(25);
    var offset = dv.getUint32(96, true);
    var fmtRaw = dv.getUint8(104);
    if (fmtRaw & 0x80 || fmtRaw & 0x40) throw new Error("Compressed LAZ is not supported — export uncompressed LAS");
    var fmt = fmtRaw & 0x3f;
    var recLen = dv.getUint16(105, true);
    var n = dv.getUint32(107, true);
    if (minor >= 4 && n === 0 && buf.byteLength > 255) n = Number(dv.getBigUint64(247, true));
    var sx = dv.getFloat64(131, true), sy = dv.getFloat64(139, true), sz = dv.getFloat64(147, true);
    var ox = dv.getFloat64(155, true), oy = dv.getFloat64(163, true), oz = dv.getFloat64(171, true);
    n = Math.min(n, Math.floor((buf.byteLength - offset) / recLen));
    var stride = Math.max(1, Math.ceil(n / MAX_POINTS));
    var count = Math.floor((n - 1) / stride) + 1;
    var xyz = new Float64Array(count * 3), cls = new Uint8Array(count);
    var rgbOff = { 2: 20, 3: 28, 5: 28, 7: 30, 8: 30, 10: 30 }[fmt];
    var rgb = rgbOff ? new Uint8Array(count * 3) : null;
    var rgbMax = 0;
    for (var i = 0, j = 0; i < n && j < count; i += stride, j++) {
      var o = offset + i * recLen;
      xyz[j * 3] = dv.getInt32(o, true) * sx + ox;
      xyz[j * 3 + 1] = dv.getInt32(o + 4, true) * sy + oy;
      xyz[j * 3 + 2] = dv.getInt32(o + 8, true) * sz + oz;
      cls[j] = fmt >= 6 ? dv.getUint8(o + 16) : (dv.getUint8(o + 15) & 0x1f);
      if (rgb) {
        var r = dv.getUint16(o + rgbOff, true), g = dv.getUint16(o + rgbOff + 2, true), b = dv.getUint16(o + rgbOff + 4, true);
        rgbMax = Math.max(rgbMax, r, g, b);
        rgb[j * 3] = r >> 8; rgb[j * 3 + 1] = g >> 8; rgb[j * 3 + 2] = b >> 8;
      }
    }
    if (rgb && rgbMax > 0 && rgbMax < 256) { // 8-bit colours stored in 16-bit fields
      for (var k = 0, o2 = offset; k < count; k++) {
        o2 = offset + k * stride * recLen;
        rgb[k * 3] = dv.getUint16(o2 + rgbOff, true); rgb[k * 3 + 1] = dv.getUint16(o2 + rgbOff + 2, true); rgb[k * 3 + 2] = dv.getUint16(o2 + rgbOff + 4, true);
      }
    }
    if (rgb && rgbMax === 0) rgb = null;
    return makeCloud(xyz, cls, rgb, count, "las");
  }

  function parseXYZ(text) {
    var lines = text.split(/\r?\n/);
    var stride = Math.max(1, Math.ceil(lines.length / MAX_POINTS));
    var xyz = [], rgb = [], cls = [], hasRgb = null;
    for (var i = 0; i < lines.length; i += stride) {
      var parts = lines[i].trim().split(/[\s,;]+/);
      if (parts.length < 3) continue;
      var x = +parts[0], y = +parts[1], z = +parts[2];
      if (!isFinite(x) || !isFinite(y) || !isFinite(z)) continue;
      xyz.push(x, y, z); cls.push(1);
      if (hasRgb === null) hasRgb = parts.length >= 6;
      if (hasRgb) {
        var r = +parts[3], g = +parts[4], b = +parts[5];
        if (r > 255 || g > 255 || b > 255) { r /= 257; g /= 257; b /= 257; }
        rgb.push(r, g, b);
      }
    }
    if (!cls.length) throw new Error("No XYZ points found");
    return makeCloud(new Float64Array(xyz), new Uint8Array(cls), hasRgb ? new Uint8Array(rgb) : null, cls.length, "xyz");
  }

  function loadFile(file) {
    var st = document.getElementById("pc-stats");
    st.textContent = T("viewer.loading");
    var isLas = /\.las$/i.test(file.name);
    if (/\.laz$/i.test(file.name)) { st.textContent = T("viewer.error") + " (LAZ)"; return; }
    var reader = new FileReader();
    reader.onerror = function () { st.textContent = T("viewer.error"); };
    reader.onload = function () {
      try {
        cloud = isLas ? parseLAS(reader.result) : parseXYZ(reader.result);
        cloud.name = file.name;
        if (!cloud.rgb && mode === "rgb") setMode("class");
        hidden = {};
        upload();
        var badge = document.getElementById("pc-badge");
        badge.removeAttribute("data-i18n");
        badge.textContent = T("viewer.loaded") + ": " + file.name;
        badge.classList.add("is-user");
      } catch (err) {
        st.textContent = T("viewer.error") + " " + (err && err.message ? "(" + err.message + ")" : "");
      }
    };
    if (isLas) reader.readAsArrayBuffer(file); else reader.readAsText(file);
  }

  /* ---------------- UI ---------------- */
  function buildClassList() {
    var box = document.getElementById("pc-classes");
    var counts = {};
    for (var i = 0; i < cloud.count; i++) counts[cloud.cls[i]] = (counts[cloud.cls[i]] || 0) + 1;
    var keys = Object.keys(counts).map(Number).sort(function (a, b) { return a - b; });
    box.innerHTML = keys.map(function (k) {
      var info = CLASS_INFO[k] || { c: CLASS_INFO[1].c, en: "Class " + k, fr: "Classe " + k };
      var c = info.c.map(function (v) { return Math.round(v * 255); }).join(",");
      return '<label class="pc-class"><input type="checkbox" data-class="' + k + '"' + (hidden[k] ? "" : " checked") + ">" +
        '<span class="sw" style="background:rgb(' + c + ')"></span>' +
        '<span class="nm">' + k + " · " + (info[lang()] || info.en) + '</span><span class="ct mono">' + counts[k].toLocaleString() + "</span></label>";
    }).join("");
  }

  function stats() {
    var st = document.getElementById("pc-stats");
    var dx = cloud.max[0] - cloud.min[0], dy = cloud.max[1] - cloud.min[1], dz = cloud.max[2] - cloud.min[2];
    st.textContent = cloud.count.toLocaleString() + " " + T("viewer.points") + " · " +
      dx.toFixed(0) + " × " + dy.toFixed(0) + " × " + dz.toFixed(1) + " m";
  }

  function setMode(m) {
    mode = m;
    document.querySelectorAll("#pc-colormode button").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-mode") === m));
    });
    if (cloud) recolor();
  }

  function resetView() {
    var dx = cloud.max[0] - cloud.min[0], dy = cloud.max[1] - cloud.min[1], dz = cloud.max[2] - cloud.min[2];
    var r = Math.max(dx, dy, dz, 1);
    cam.target = [0, 0, dz * 0.25];
    cam.dist = r * 1.25; cam.yaw = -0.8; cam.pitch = 0.55;
    dirty = true;
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = canvas.clientWidth, h = canvas.clientHeight;
    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    }
    dirty = true;
  }

  function render() {
    requestAnimationFrame(render);
    if (!dirty || !cloud) return;
    dirty = false;
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    var aspect = canvas.width / Math.max(1, canvas.height);
    var far = cam.dist * 10 + 1000;
    var mvp = mul(perspective(0.9, aspect, Math.max(0.05, cam.dist / 500), far), lookAt(eyePos(), cam.target, [0, 0, 1]));
    gl.uniformMatrix4fv(loc.mvp, false, new Float32Array(mvp));
    gl.uniform1f(loc.size, pointSize * dpr);
    gl.uniform1f(loc.ref, cam.dist);
    gl.bindBuffer(gl.ARRAY_BUFFER, bufPos);
    gl.enableVertexAttribArray(loc.pos);
    gl.vertexAttribPointer(loc.pos, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, bufCol);
    gl.enableVertexAttribArray(loc.col);
    gl.vertexAttribPointer(loc.col, 4, gl.UNSIGNED_BYTE, true, 0, 0);
    gl.drawArrays(gl.POINTS, 0, cloud.count);
  }

  function initControls() {
    var pointers = new Map(), lastPinch = 0;
    canvas.addEventListener("pointerdown", function (e) {
      canvas.setPointerCapture(e.pointerId);
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY, btn: e.button, shift: e.shiftKey });
    });
    canvas.addEventListener("pointermove", function (e) {
      if (!pointers.has(e.pointerId)) return;
      var p = pointers.get(e.pointerId), dx = e.clientX - p.x, dy = e.clientY - p.y;
      if (pointers.size === 2) {
        var arr = Array.from(pointers.values()); p.x = e.clientX; p.y = e.clientY;
        var d = Math.hypot(arr[0].x - arr[1].x, arr[0].y - arr[1].y);
        if (lastPinch) cam.dist = Math.max(1, cam.dist * lastPinch / d);
        lastPinch = d; dirty = true; return;
      }
      p.x = e.clientX; p.y = e.clientY;
      if (p.btn === 2 || p.shift) {
        var s = cam.dist / canvas.clientHeight;
        var sy = Math.sin(cam.yaw), cy = Math.cos(cam.yaw);
        // Move the orbit target in the camera's screen plane
        cam.target[0] += (dx * sy - dy * cy * Math.sin(cam.pitch)) * s;
        cam.target[1] += (-dx * cy - dy * sy * Math.sin(cam.pitch)) * s;
        cam.target[2] += dy * Math.cos(cam.pitch) * s;
      } else {
        cam.yaw -= dx * 0.008;
        cam.pitch = Math.max(-0.1, Math.min(1.5, cam.pitch + dy * 0.006));
      }
      dirty = true;
    });
    function up(e) { pointers.delete(e.pointerId); if (pointers.size < 2) lastPinch = 0; }
    canvas.addEventListener("pointerup", up);
    canvas.addEventListener("pointercancel", up);
    canvas.addEventListener("contextmenu", function (e) { e.preventDefault(); });
    canvas.addEventListener("wheel", function (e) {
      e.preventDefault();
      cam.dist = Math.max(1, cam.dist * Math.exp(e.deltaY * 0.0012));
      dirty = true;
    }, { passive: false });
    canvas.addEventListener("dblclick", function () { if (cloud) resetView(); });
  }

  function initUI() {
    document.getElementById("pc-colormode").addEventListener("click", function (e) {
      var b = e.target.closest("[data-mode]"); if (b) setMode(b.getAttribute("data-mode"));
    });
    document.getElementById("pc-classes").addEventListener("change", function (e) {
      var k = e.target.getAttribute("data-class"); if (!k) return;
      hidden[k] = !e.target.checked; recolor();
    });
    document.getElementById("pc-size").addEventListener("input", function (e) { pointSize = +e.target.value; dirty = true; });
    document.getElementById("pc-reset").addEventListener("click", function () { if (cloud) resetView(); });
    document.getElementById("pc-file").addEventListener("change", function (e) { if (e.target.files[0]) loadFile(e.target.files[0]); });

    var wrap = document.getElementById("viewer-wrap"), drop = document.getElementById("pc-drop");
    ["dragenter", "dragover"].forEach(function (ev) { wrap.addEventListener(ev, function (e) { e.preventDefault(); drop.hidden = false; }); });
    ["dragleave", "drop"].forEach(function (ev) { wrap.addEventListener(ev, function (e) { e.preventDefault(); if (ev === "dragleave" && wrap.contains(e.relatedTarget)) return; drop.hidden = true; }); });
    wrap.addEventListener("drop", function (e) { var f = e.dataTransfer.files[0]; if (f) loadFile(f); });

    document.getElementById("pc-fullscreen").addEventListener("click", function () {
      if (document.fullscreenElement === wrap) document.exitFullscreen();
      else if (wrap.requestFullscreen) wrap.requestFullscreen().catch(function () { wrap.classList.toggle("is-fs"); resize(); });
      else { wrap.classList.toggle("is-fs"); resize(); }
    });
    document.addEventListener("fullscreenchange", function () { setTimeout(resize, 60); });

    var cfg = window.SITE_CONFIG || {};
    if (cfg.isSet && cfg.isSet(cfg.potreeUrl)) {
      document.getElementById("potree-slot").innerHTML =
        '<a class="btn btn-sm btn-primary btn-block" href="' + cfg.potreeUrl + '" target="_blank" rel="noopener">' + T("viewer.potree") + "</a>";
    }

    document.addEventListener("langchange", function () { if (cloud) { buildClassList(); stats(); } });
  }

  function start() {
    if (started) return;
    started = true;
    canvas = document.getElementById("pc-canvas");
    try {
      if (!setupGL()) throw new Error("no webgl");
    } catch (e) {
      document.getElementById("pc-stats").textContent = T("viewer.nogl");
      return;
    }
    initControls();
    initUI();
    if ("ResizeObserver" in window) new ResizeObserver(resize).observe(canvas); else window.addEventListener("resize", resize);
    resize();
    cloud = demoCloud();
    upload();
    requestAnimationFrame(render);
  }

  function init() {
    document.addEventListener("panel-3d-shown", function () { start(); setTimeout(function () { if (canvas) resize(); }, 30); });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();

  window.PointViewer = { start: start };
})();
