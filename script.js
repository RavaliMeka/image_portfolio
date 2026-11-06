/* =====================================================================
   EDIT THIS BLOCK. Everything on the page comes from CONFIG.
   ---------------------------------------------------------------------
   photos[]: each entry is one photograph.
     title, place, year, exif, note   text shown in the readout and viewer
     src     URL or relative path of the full-size image ("photos/01.jpg")
     thumb   optional smaller copy for the sphere and grid (about 800px wide)
     aspect  width / height, e.g. 1.5 for 3:2, 0.667 for 2:3. Detected
             automatically from the image when src is set.
   Leave src empty to show a drawn sample landscape (scene + palette).
   ===================================================================== */
const CONFIG = {
  name: "Sandeep Komal",
  role: "Landscape and wildlife photographer",
  headline: ["Weather, light and the ", { em: "animals" }, " that move through it."],
  bio: [
    "I photograph remote places in the hours either side of bad weather, usually alone and usually waiting.",
    "Most of these frames came from returning to the same ridge, shoreline or forest edge until the light and the animals agreed."
  ],
  services: [
    ["Editorial", "Assignments for magazines, books and conservation charities."],
    ["Field workshops", "Two small-group trips a year, six people at most."],
    ["Prints", "Archival pigment prints, made to order in three sizes."]
  ],
  email: "sandeepkomalp@gmail.com",
  location: "Based in India. Working worldwide.",
  links: [],
  introVideo: "",     // optional: URL of a short, muted .mp4 played once after loading
  autoRotate: true,   // slow drift when nobody is touching the sphere
  sphereCount: 21,    // the sphere repeats photos until it shows at least this many

  photos: [
    { title:"Pier at Last Light", place:"", year:"", exif:"", note:"", src:"photos/lake-pier-sunset.jpg", thumb:"photos/lake-pier-sunset-thumb.jpg" },
    { title:"Fjord from Above", place:"", year:"", exif:"", note:"", src:"photos/fjord-overlook.jpg", thumb:"photos/fjord-overlook-thumb.jpg" },
    { title:"Aurora over the Snowfield", place:"", year:"", exif:"", note:"", src:"photos/aurora-snowfield.jpg", thumb:"photos/aurora-snowfield-thumb.jpg" },
    { title:"Poppies into the Sun", place:"", year:"", exif:"", note:"", src:"photos/poppy-field.jpg", thumb:"photos/poppy-field-thumb.jpg" },
    { title:"Road to the Volcanoes", place:"", year:"", exif:"", note:"", src:"photos/desert-road.jpg", thumb:"photos/desert-road-thumb.jpg" },
    { title:"Butterfly on Pentas", place:"", year:"", exif:"", note:"", src:"photos/butterfly-pentas.jpg", thumb:"photos/butterfly-pentas-thumb.jpg" },
    { title:"Oriole in Blossom", place:"", year:"", exif:"", note:"", src:"photos/oriole-blossom.jpg", thumb:"photos/oriole-blossom-thumb.jpg" },
    { title:"Lamb by the Fence", place:"", year:"", exif:"", note:"", src:"photos/lamb-meadow.jpg", thumb:"photos/lamb-meadow-thumb.jpg" },
    { title:"Under the Cherry Trees", place:"", year:"", exif:"", note:"", src:"photos/cherry-blossom-path.jpg", thumb:"photos/cherry-blossom-path-thumb.jpg" },
    { title:"First Crocus", place:"", year:"", exif:"", note:"", src:"photos/crocus-spring.jpg", thumb:"photos/crocus-spring-thumb.jpg" },
    { title:"Cosmos against a Pale Sky", place:"", year:"", exif:"", note:"", src:"photos/cosmos-meadow.jpg", thumb:"photos/cosmos-meadow-thumb.jpg" },
    { title:"Daisies in Evening Light", place:"", year:"", exif:"", note:"", src:"photos/daisies-evening.jpg", thumb:"photos/daisies-evening-thumb.jpg" },
    { title:"Looking up into Blossom", place:"", year:"", exif:"", note:"", src:"photos/cherry-blossom-trunk.jpg", thumb:"photos/cherry-blossom-trunk-thumb.jpg" }
  ]
};
/* ===================================================================== */

(() => {
"use strict";
const $ = (s, r = document) => r.querySelector(s);
const el = (tag, props = {}, ...kids) => {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (k === "class") n.className = v;
    else if (k === "text") n.textContent = v;
    else if (k.startsWith("on")) n.addEventListener(k.slice(2), v);
    else if (v !== false && v != null) n.setAttribute(k, v === true ? "" : v);
  }
  for (const c of kids) if (c != null) n.append(c);
  return n;
};
const P = CONFIG.photos, N = P.length;
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
const width = Math.max(2, String(N).length);
const num = n => String(n).padStart(width, "0");
const D = Math.PI / 180;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const wait = ms => new Promise(r => setTimeout(r, ms));
const body = document.body;
body.dataset.view = "sphere";

/* ---------- Text from CONFIG ---------- */
document.title = CONFIG.name + " · Photographs";
const years = P.map(p => p.year).filter(Boolean);
const span = years.length ? (Math.min(...years) === Math.max(...years) ? String(years[0]) : Math.min(...years) + "–" + Math.max(...years)) : "";
$("#loadName").textContent = CONFIG.name;
$("#markName").textContent = CONFIG.name;
$("#markRole").textContent = span ? "Photographs " + span : "Photographs";
$("#mark").setAttribute("aria-label", CONFIG.name + ", back to the sphere");
const hl = $("#headline");
for (const part of CONFIG.headline) hl.append(typeof part === "string" ? part : el("em", { text: part.em }));
$("#statMeta").textContent = [N + " photographs", span, finePointer ? "Drag to turn, click to open" : "Swipe to turn, tap to open"].filter(Boolean).join(" · ");
$("#indexCount").textContent = N + " photographs";
$("#gridCount").textContent = N + " photographs";
$("#aName").textContent = CONFIG.name;
$("#aRole").textContent = CONFIG.role;
for (const t of CONFIG.bio) $("#aBio").append(el("p", { text: t }));
for (const [t, d] of CONFIG.services) $("#aServices").append(el("div", {}, el("dt", { text: t }), el("dd", { text: d })));
$("#aEmail").textContent = CONFIG.email;
$("#aLocation").textContent = CONFIG.location;
if (!CONFIG.links.length) $("#aLinks").hidden = true;
for (const l of CONFIG.links) $("#aLinks").append(el("a", { class: "pill", href: l.url, target: "_blank", rel: "noopener", text: l.label + " ↗" }));
if (P.some(p => !p.src)) $("#sampleNote").hidden = false;

/* ---------- Sample landscapes (used when a photo has no src) ---------- */
const PAL = {
  slate:  { sky:["#59646d","#aab2b3"], far:"#8b959a", near:"#1a2024" },
  dawn:   { sky:["#3e4b6c","#e8b8a0"], sun:"#ffe3c6", far:"#9b90a3", near:"#232534" },
  golden: { sky:["#6c7a8b","#f0c483"], sun:"#fff0cc", far:"#a88f78", near:"#29211b" },
  blue:   { sky:["#1c2943","#7189aa"], far:"#4e6384", near:"#0e1521" },
  mist:   { sky:["#98a1a1","#dadcd6"], far:"#b2b8b4", near:"#46504e" },
  dusk:   { sky:["#433a5c","#e29a8e"], sun:"#ffd2b4", far:"#8a6d85", near:"#211a25" },
  amber:  { sky:["#b9764e","#f2cf98"], sun:"#fff2d4", far:"#d99b62", near:"#6b391f" },
  rose:   { sky:["#a77479","#efc6a8"], sun:"#ffe7d0", far:"#c79383", near:"#583333" },
  polar:  { sky:["#03070b","#11303a"], far:"#24363e", near:"#0b1215", aurora:"#7fe3a9", aurora2:"#8c7fe0" },
  fog:    { sky:["#7e8987","#c7cdc8"], far:"#a8b0ac", near:"#27312f" },
  green:  { sky:["#5b6e5d","#b9c5a7"], far:"#87967e", near:"#19221a" }
};
const hx = c => { const n = parseInt(c.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
const mix = (a, b, t) => { const A = hx(a), B = hx(b); return "#" + A.map((v, k) => Math.round(v + (B[k] - v) * t).toString(16).padStart(2, "0")).join(""); };
const rgba = (c, a) => { const A = hx(c); return `rgba(${A[0]},${A[1]},${A[2]},${a})`; };
const hash = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
const rng = seed => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const wave = (r, w, amp, oct = 5) => {
  const k = [];
  for (let j = 0; j < oct; j++) k.push({ f: (1 + r() * 1.6) * Math.pow(1.9, j) * Math.PI * 2 / w, a: amp / Math.pow(1.8, j), p: r() * 6.283 });
  return x => k.reduce((s, o) => s + o.a * Math.sin(o.f * x + o.p), 0);
};
const skyFill = (ctx, w, h, pal, hz) => { const g = ctx.createLinearGradient(0, 0, 0, hz); g.addColorStop(0, pal.sky[0]); g.addColorStop(1, pal.sky[1]); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h); };
const glow = (ctx, x, y, rad, col, core) => { const g = ctx.createRadialGradient(x, y, 0, x, y, rad); g.addColorStop(0, rgba(col, .95)); g.addColorStop(core, rgba(col, .6)); g.addColorStop(Math.min(1, core * 3), rgba(col, .18)); g.addColorStop(1, rgba(col, 0)); ctx.fillStyle = g; ctx.fillRect(x - rad, y - rad, rad * 2, rad * 2); };
const ridge = (ctx, w, h, f, col) => { ctx.beginPath(); ctx.moveTo(0, h); for (let x = 0; x <= w + 4; x += 4) ctx.lineTo(x, f(x)); ctx.lineTo(w, h); ctx.closePath(); ctx.fillStyle = col; ctx.fill(); };
const haze = (ctx, w, y0, y1, col, a) => { const g = ctx.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, rgba(col, 0)); g.addColorStop(1, rgba(col, a)); ctx.fillStyle = g; ctx.fillRect(0, y0, w, y1 - y0); };
const tree = (ctx, x, y, hh, bw, col) => {
  const T = 6; ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(x, y - hh);
  for (let k = 1; k <= T; k++) { const ty = y - hh + hh * k / T, tw = bw * k / T; ctx.lineTo(x + tw, ty); if (k < T) ctx.lineTo(x + tw * .45, ty); }
  for (let k = T; k >= 1; k--) { const ty = y - hh + hh * k / T, tw = bw * k / T; if (k < T) ctx.lineTo(x - tw * .45, ty); ctx.lineTo(x - tw, ty); }
  ctx.closePath(); ctx.fill();
};
const SCENES = {
  ridges(ctx, w, h, r, pal) {
    const hz = h * (.42 + r() * .14); skyFill(ctx, w, h, pal, hz + h * .1);
    if (pal.sun) glow(ctx, w * (.2 + r() * .6), hz - h * .05, h * .6, pal.sun, .03);
    const L = 5;
    for (let j = 0; j < L; j++) {
      const t = j / (L - 1), f = wave(r, w, h * (.035 + .05 * (1 - t) * (.5 + r()))), base = hz + t * h * .36 - h * .04 * (1 - t);
      ridge(ctx, w, h, x => base + f(x), mix(pal.far, pal.near, Math.pow(t, .85)));
      if (j < L - 1) haze(ctx, w, base - h * .03, h, pal.sky[1], .16);
    }
  },
  sea(ctx, w, h, r, pal) {
    const hz = Math.round(h * (.5 + r() * .1)); skyFill(ctx, w, h, pal, hz);
    const sx = w * (.25 + r() * .5), sc = pal.sun || pal.sky[1];
    if (pal.sun) glow(ctx, sx, hz - h * .03, h * .6, pal.sun, .025);
    const left = r() < .5, f = wave(r, w, h * .02);
    ctx.save(); ctx.beginPath(); ctx.rect(left ? 0 : w * .55, 0, w * .45, h); ctx.clip();
    ridge(ctx, w, h, x => { const t = left ? 1 - x / (w * .45) : 1 - (w - x) / (w * .45); return hz - h * .12 * Math.max(0, t) + f(x) * Math.max(0, t); }, mix(pal.far, pal.near, .55));
    ctx.restore();
    const g = ctx.createLinearGradient(0, hz, 0, h); g.addColorStop(0, mix(pal.sky[1], pal.near, .3)); g.addColorStop(1, pal.near);
    ctx.fillStyle = g; ctx.fillRect(0, hz, w, h - hz);
    for (let k = 0; k < 280; k++) {
      const d = Math.pow(r(), 1.6), y = hz + d * (h - hz), sp = w * (.04 + d * .35), x = sx + (r() - .5) * 2 * sp * r(), len = w * (.01 + r() * .05) * (.4 + d);
      ctx.fillStyle = rgba(sc, .06 + .34 * (1 - d) * r()); ctx.fillRect(x - len / 2, y, len, 1 + d * 2);
    }
    ctx.fillStyle = rgba(sc, .3); ctx.fillRect(0, hz, w, 1);
  },
  dunes(ctx, w, h, r, pal) {
    const hz = h * (.3 + r() * .12); skyFill(ctx, w, h, pal, hz + h * .05);
    if (pal.sun) glow(ctx, w * (.15 + r() * .7), hz - h * .1, h * .4, pal.sun, .05);
    for (let j = 0; j < 4; j++) {
      const m = Math.min(w, h), t = j / 3, f = wave(r, w, m * (.05 + .035 * t), 3), base = hz + h * (.04 + t * .42), fn = x => base + f(x);
      const lit = mix(pal.far, pal.sky[1], .3 * (1 - t)), shade = mix(pal.near, pal.far, .35 * (1 - t));
      ridge(ctx, w, h, fn, lit); ctx.fillStyle = shade;
      for (let x = 0; x < w; x += 3) { const s = (fn(x + 3) - fn(x)) / 3; if (s > 0) ctx.fillRect(x, fn(x), 3.5, Math.min(m * .1, s * m * .05)); }
      if (j < 3) haze(ctx, w, base - h * .02, h, pal.sky[1], .1);
    }
  },
  forest(ctx, w, h, r, pal) {
    skyFill(ctx, w, h, pal, h);
    if (pal.sun) glow(ctx, w * (.2 + r() * .6), h * .3, h * .55, pal.sun, .04);
    const L = 5;
    for (let j = 0; j < L; j++) {
      const t = j / (L - 1), base = h * (.45 + t * .5), col = mix(pal.far, pal.near, Math.pow(t, .8)), f = wave(r, w, h * .03, 3);
      ridge(ctx, w, h, x => base + f(x), col);
      const th = h * (.1 + t * .22); let x = -20;
      while (x < w + 20) { const hh = th * (.6 + r() * .6), bw = hh * (.22 + r() * .06); tree(ctx, x, base + f(x) + 2, hh, bw, col); x += bw * (.5 + r() * .9); }
      if (j < L - 1) haze(ctx, w, base - th * 1.4, h, pal.sky[1], .3);
    }
  },
  aurora(ctx, w, h, r, pal, p) {
    skyFill(ctx, w, h, pal, h * .85);
    const stars = Math.round(w * h / 2500);
    for (let k = 0; k < stars; k++) { ctx.fillStyle = `rgba(255,255,255,${(.2 + r() * .6).toFixed(2)})`; const s = r() < .93 ? 1 : 2; ctx.fillRect(r() * w, r() * h * .8, s, s); }
    const strength = p.glow == null ? 1 : p.glow;
    if (strength > 0) {
      ctx.save(); ctx.globalCompositeOperation = "lighter";
      const bands = 2 + Math.floor(r() * 2);
      for (let b = 0; b < bands; b++) {
        const f = wave(r, w, h * .08, 3), yc = h * (.28 + r() * .2), len = h * (.18 + r() * .2), ph = r() * 6;
        const g = ctx.createLinearGradient(0, 0, 0, len);
        g.addColorStop(0, rgba(pal.aurora2, 0)); g.addColorStop(.35, rgba(pal.aurora2, .05 * strength));
        g.addColorStop(.8, rgba(pal.aurora, .22 * strength)); g.addColorStop(.95, rgba(pal.aurora, .34 * strength)); g.addColorStop(1, rgba(pal.aurora, 0));
        ctx.fillStyle = g;
        for (let x = 0; x < w; x += 2) {
          const y = yc + f(x) + (x / w) * h * .12 * (b % 2 ? 1 : -1);
          ctx.globalAlpha = Math.max(.15, .55 + .45 * Math.sin(x * .045 + ph) * Math.sin(x * .011 + b));
          ctx.save(); ctx.translate(x, y - len); ctx.fillRect(0, 0, 2, len); ctx.restore();
        }
      }
      ctx.restore();
    }
    if (p.moon) glow(ctx, w * .72, h * .24, h * .16, "#f2f0e4", .14);
    const f1 = wave(r, w, h * .05), f2 = wave(r, w, h * .03);
    ridge(ctx, w, h, x => h * .74 + f1(x), pal.far);
    ridge(ctx, w, h, x => h * .87 + f2(x), pal.near);
  },
  birds(ctx, w, h, r, pal, p) {
    const hz = h * .78; skyFill(ctx, w, h, pal, h);
    if (pal.sun) glow(ctx, w * (.2 + r() * .6), hz - h * .08, h * .5, pal.sun, .04);
    const f = wave(r, w, h * .03), f2 = wave(r, w, h * .02);
    ridge(ctx, w, h, x => hz + f(x), mix(pal.far, pal.near, .6));
    ridge(ctx, w, h, x => hz + h * .1 + f2(x), pal.near);
    ctx.strokeStyle = pal.near; ctx.lineCap = "round";
    const bird = (x, y, s) => { const up = (r() - .3) * s * .6; ctx.lineWidth = Math.max(1, s * .22); ctx.beginPath(); ctx.moveTo(x - s, y - up); ctx.quadraticCurveTo(x - s * .4, y - up * .2, x, y); ctx.quadraticCurveTo(x + s * .4, y - up * .2, x + s, y - up); ctx.stroke(); };
    if (p.flock === "cloud") {
      const cx = w * (.3 + r() * .4), cy = h * (.35 + r() * .15);
      for (let k = 0; k < 900; k++) { const a = r() * 6.283, d = Math.pow(r(), .6); bird(cx + Math.cos(a) * d * w * .22 * (1 + .4 * Math.sin(a * 2)), cy + Math.sin(a) * d * h * .12, 1.4 + r() * 2); }
    } else {
      const n = p.count || 9, lx = w * (.35 + r() * .35), ly = h * (.25 + r() * .2), s = w * .014;
      for (let k = 0; k < n; k++) { const side = k % 2 ? 1 : -1, rank = Math.ceil(k / 2); bird(lx + side * rank * s * 2.6 + rank * s * .4, ly + rank * s * 1.5 + (r() - .5) * s * .5, s * (1 - rank * .03)); }
    }
  }
};
let noiseTile = null;
function makeNoise() {
  const c = el("canvas"); c.width = c.height = 128; const x = c.getContext("2d"), d = x.createImageData(128, 128);
  for (let i = 0; i < d.data.length; i += 4) { const v = Math.random() * 255 | 0; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; }
  x.putImageData(d, 0, 0); return c;
}
function paintSample(p, i) {
  const a = p.aspect || 1.5, L = 1200, w = a >= 1 ? L : Math.round(L * a), h = a >= 1 ? Math.round(L / a) : L;
  const c = el("canvas"); c.width = w; c.height = h; const ctx = c.getContext("2d");
  const pal = PAL[p.palette] || PAL.slate;
  (SCENES[p.scene] || SCENES.ridges)(ctx, w, h, rng(hash(p.title || "") + i * 7919), pal, p);
  ctx.save(); ctx.globalCompositeOperation = "overlay"; ctx.globalAlpha = .1; ctx.fillStyle = ctx.createPattern(noiseTile, "repeat"); ctx.fillRect(0, 0, w, h); ctx.restore();
  const g = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * .35, w / 2, h / 2, Math.hypot(w, h) / 2);
  g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(0,0,0,.38)"); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  return c.toDataURL("image/jpeg", .86);
}
const loadImg = src => new Promise((res, rej) => { const im = new Image(); im.decoding = "async"; im.onload = () => res(im); im.onerror = rej; im.src = src; });

/* ---------- Build the sphere, index and grid ---------- */
const stage = $("#stage"), world = $("#world");
const cards = [], vecs = [], rows = [], tiles = [];
const GA = Math.PI * (3 - Math.sqrt(5));
const M = Math.max(N, CONFIG.sphereCount || 0);
const photoOf = k => k % N;
for (let k = 0; k < M; k++) {
  const y = M > 1 ? 1 - (k / (M - 1)) * 2 : 0, rad = Math.sqrt(Math.max(0, 1 - y * y)), th = k * GA;
  const x = Math.cos(th) * rad, z = Math.sin(th) * rad;
  vecs.push({ x, y: -y, z, lat: Math.asin(y) / D, lon: Math.atan2(x, z) / D, d: -1 });
  const p = P[photoOf(k)];
  const card = el("button", { class: "card", type: "button", "data-i": photoOf(k), "aria-label": `${p.place ? `${p.title}, ${p.place}` : p.title}. Open photograph.`, tabindex: k < N ? null : "-1" }, el("img", { alt: "", draggable: "false" }));
  world.append(card); cards.push(card);
}
for (let i = 0; i < N; i++) {
  const p = P[i];
  const label = p.place ? `${p.title}, ${p.place}` : p.title;

  const row = el("button", { type: "button", "data-i": i },
    el("span", { class: "n", text: num(i + 1) }), el("span", { class: "t", text: p.title }),
    el("span", { class: "p", text: p.place }), el("span", { class: "y", text: p.year || "" }), el("span", { class: "x", text: p.exif || "" }));
  $("#list").append(el("li", { class: "row" }, row)); rows.push(row);

  const a = p.aspect || 1.5, timg = el("img", { alt: label, width: Math.round(600 * Math.min(a, 1)), height: Math.round(600 / Math.max(a, 1)), loading: "lazy" });
  const tile = el("button", { class: "tile", type: "button", "data-i": i }, el("span", { class: "ph" }, timg), el("span", { class: "cap" }, el("b", { text: p.title }), el("span", { text: p.place })));
  $("#masonry").append(tile); tiles.push(tile);
}

let R = 300, cw = 120;
function layout() {
  const W = innerWidth, H = innerHeight, bar = $("#bar").offsetHeight;
  document.documentElement.style.setProperty("--barh", bar + "px");
  const bottom = W < 900 ? $("#statement").offsetHeight + 40 : 48;
  const avail = Math.max(160, H - bar - bottom), cy = bar + avail / 2;
  R = Math.max(100, Math.min(440, avail * .40, W * (W < 640 ? .42 : .36)));
  cw = Math.round(Math.max(56, R * (W < 640 ? .42 : .38)));
  world.style.top = cy + "px";
  stage.style.setProperty("--persp", Math.round(Math.max(560, R * 2.8)) + "px");
  stage.style.perspectiveOrigin = `50% ${cy}px`;
  cards.forEach((c, i) => {
    const a = P[photoOf(i)].aspect || 1.5; let w, h;
    if (a >= 1) { w = cw; h = cw / a; } else { h = cw * 1.05; w = h * a; }
    const v = vecs[i];
    c.style.width = w + "px"; c.style.height = h + "px"; c.style.marginLeft = -w / 2 + "px"; c.style.marginTop = -h / 2 + "px";
    c.style.transform = `translate3d(${v.x * R}px,${v.y * R}px,${v.z * R}px) rotateY(${v.lon}deg) rotateX(${v.lat}deg)`;
  });
  if (cur >= 0) fitViewer();
}

/* ---------- Camera loop ---------- */
let yaw = 0, pitch = -8, vYaw = 0, vPitch = 0, camZ = 0, camT = 0;
let dragging = false, hovered = -1, facing = -1, aim = null, viewing = false;
function frame() {
  if (!viewing && body.dataset.view === "sphere") {
    if (aim && !dragging) {
      const dy = ((aim.yaw - yaw) % 360 + 540) % 360 - 180;
      yaw += dy * .12; pitch += (aim.pitch - pitch) * .12;
      if (Math.abs(dy) < .05 && Math.abs(aim.pitch - pitch) < .05) aim = null;
    } else if (!dragging) {
      yaw += vYaw; pitch += vPitch; vYaw *= .94; vPitch *= .94;
      if (Math.abs(vYaw) < .002) vYaw = 0; if (Math.abs(vPitch) < .002) vPitch = 0;
      if (CONFIG.autoRotate && !reduce && hovered < 0 && body.classList.contains("ready")) yaw += .04;
    }
    pitch = clamp(pitch, -50, 50);
  }
  camZ += (camT - camZ) * .07;
  world.style.transform = `translateZ(${camZ.toFixed(2)}px) rotateX(${pitch.toFixed(3)}deg) rotateY(${yaw.toFixed(3)}deg)`;
  const cY = Math.cos(yaw * D), sY = Math.sin(yaw * D), cP = Math.cos(pitch * D), sP = Math.sin(pitch * D);
  let best = -1, bz = -2;
  for (let i = 0; i < M; i++) {
    const v = vecs[i], z1 = -v.x * sY + v.z * cY, z2 = v.y * sP + z1 * cP;
    if (z2 > bz) { bz = z2; best = i; }
    const d = Math.round((1 - Math.pow((z2 + 1) / 2, .8)) * .86 * 100) / 100;
    if (d !== v.d) { v.d = d; cards[i].style.setProperty("--d", d); cards[i].style.pointerEvents = z2 < -.15 ? "none" : ""; }
  }
  if (best !== facing) { facing = best; if (hovered < 0) readout(photoOf(best)); }
  requestAnimationFrame(frame);
}
function readout(i) {
  if (i < 0) return; const p = P[i];
  $("#rNo").textContent = "Frame " + num(i + 1) + " / " + num(N);
  $("#rYear").textContent = p.year || "";
  $("#rTitle").textContent = p.title; $("#rPlace").textContent = p.place; $("#rExif").textContent = p.exif || "";
}

/* ---------- Drag, wheel and keys on the sphere ---------- */
let press = null;
const slop = matchMedia("(pointer: coarse)").matches ? 12 : 6;
stage.addEventListener("pointerdown", e => {
  if (viewing || e.button > 0) return;
  press = { id: e.pointerId, x: e.clientX, y: e.clientY, lx: e.clientX, ly: e.clientY, card: e.target.closest(".card"), moved: false };
  dragging = true; aim = null; vYaw = vPitch = 0;
  try { stage.setPointerCapture(e.pointerId); } catch (_) {}
  stage.classList.add("dragging");
});
stage.addEventListener("pointermove", e => {
  if (!press || e.pointerId !== press.id) return;
  const dx = e.clientX - press.lx, dy = e.clientY - press.ly;
  press.lx = e.clientX; press.ly = e.clientY;
  yaw += dx * .18; pitch -= dy * .18; vYaw = dx * .18; vPitch = -dy * .18;
  if (Math.hypot(e.clientX - press.x, e.clientY - press.y) > slop) press.moved = true;
});
const release = (e, click) => {
  if (!press || e.pointerId !== press.id) return;
  const p = press; press = null; dragging = false; stage.classList.remove("dragging");
  if (click && !p.moved) { vYaw = vPitch = 0; if (p.card) openShot(+p.card.dataset.i, p.card); }
};
stage.addEventListener("pointerup", e => release(e, true));
stage.addEventListener("pointercancel", e => release(e, false));
stage.addEventListener("wheel", e => { e.preventDefault(); camT = clamp(camT - e.deltaY * .4, -R * .8, R * .45); }, { passive: false });
cards.forEach((c, k) => {
  const i = photoOf(k);
  c.addEventListener("click", e => { if (e.detail === 0) openShot(i, c); });
  c.addEventListener("pointerenter", () => { if (finePointer) { hovered = k; readout(i); } });
  c.addEventListener("pointerleave", () => { if (hovered === k) { hovered = -1; readout(photoOf(facing)); } });
  c.addEventListener("focus", () => { if (c.matches(":focus-visible")) { aim = { yaw: -vecs[k].lon, pitch: clamp(-vecs[k].lat, -50, 50) }; readout(i); } });
});

/* ---------- Views ---------- */
const VIEWS = ["sphere", "index", "grid"];
function setView(v, write = true) {
  if (!VIEWS.includes(v)) v = "sphere";
  body.dataset.view = v;
  document.querySelectorAll(".views button").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.view === v)));
  if (write) { try { history.replaceState(null, "", "#" + v); } catch (_) {} }
}
document.querySelectorAll(".views button").forEach(b => b.addEventListener("click", () => setView(b.dataset.view)));
$("#mark").addEventListener("click", () => setView("sphere"));
addEventListener("hashchange", () => setView(location.hash.slice(1), false));
rows.forEach((b, i) => b.addEventListener("click", () => openShot(i, b)));
tiles.forEach((b, i) => b.addEventListener("click", () => openShot(i, b.querySelector("img"))));

const peek = $("#peek"), peekImg = $("#peekImg");
if (finePointer) {
  rows.forEach((b, i) => {
    b.addEventListener("pointerenter", () => { if (images[i]) { peekImg.src = images[i].thumb; peek.classList.add("on"); } });
    b.addEventListener("pointerleave", () => peek.classList.remove("on"));
  });
  $("#index").addEventListener("pointermove", e => {
    const w = 240, h = peek.offsetHeight || 160;
    const x = Math.min(innerWidth - w - 16, e.clientX + 28), y = clamp(e.clientY - h / 2, 16, innerHeight - h - 16);
    peek.style.transform = `translate3d(${x}px,${y}px,0)`;
  });
  $("#index").addEventListener("scroll", () => peek.classList.remove("on"), { passive: true });
}

/* ---------- Viewer ---------- */
const viewer = $("#viewer"), vimg = $("#vimg"), vbox = $("#vBox");
const mainParts = [$("#bar"), $("main")];
let cur = -1, token = 0, opener = null;
function sourceFor(i) {
  const v = body.dataset.view;
  if (v === "index") return rows[i];
  if (v === "grid") return tiles[i].querySelector("img");
  let best = null, bd = .55;
  cards.forEach((c, k) => { if (photoOf(k) === i && vecs[k].d < bd) { bd = vecs[k].d; best = c; } });
  return best;
}
function fitViewer() {
  const a = P[cur].aspect || 1.5, bw = vbox.clientWidth, bh = vbox.clientHeight;
  let w = bw, h = bw / a; if (h > bh) { h = bh; w = bh * a; }
  vimg.style.width = Math.floor(w) + "px"; vimg.style.height = Math.floor(h) + "px";
}
function fill(i) {
  const p = P[i], im = images[i];
  vimg.alt = p.place ? `${p.title}, ${p.place}` : p.title;
  if (im) {
    vimg.src = im.thumb;
    if (im.full !== im.thumb) { const t = ++token; loadImg(im.full).then(x => { if (t === token) vimg.src = x.src; }).catch(() => {}); }
  }
  $("#vTitle").textContent = p.title; $("#vPlace").textContent = [p.place, p.year].filter(Boolean).join(" · ");
  $("#vExif").textContent = p.exif || ""; $("#vNote").textContent = p.note || "";
  $("#vCount").textContent = num(i + 1) + " / " + num(N);
}
function flip(from, toHome) {
  if (!from || reduce) return false;
  const a = from.getBoundingClientRect(), b = vimg.getBoundingClientRect();
  if (!a.width || !b.width) return false;
  const t = `translate(${a.left - b.left}px,${a.top - b.top}px) scale(${Math.max(.04, a.width / b.width)},${Math.max(.04, a.height / b.height)})`;
  if (toHome) {
    vimg.style.transition = "none"; vimg.style.transform = t; void vimg.offsetWidth;
    vimg.style.transition = ""; vimg.style.transform = "";
  } else vimg.style.transform = t;
  return true;
}
function openShot(i, from) {
  if (viewing) return;
  opener = document.activeElement; cur = i; viewing = true;
  fill(i); body.classList.add("viewing"); mainParts.forEach(e => e.inert = true);
  fitViewer(); flip(from, true);
  $("#vClose").focus({ preventScroll: true });
}
function closeShot() {
  if (!viewing) return;
  token++; flip(sourceFor(cur), false);
  body.classList.remove("viewing"); mainParts.forEach(e => e.inert = false);
  const back = cur; viewing = false; cur = -1;
  setTimeout(() => { if (!viewing) { vimg.style.transition = "none"; vimg.style.transform = ""; void vimg.offsetWidth; vimg.style.transition = ""; } }, 650);
  const target = body.dataset.view === "index" ? rows[back] : body.dataset.view === "grid" ? tiles[back] : opener;
  if (target && target.focus) target.focus({ preventScroll: true });
}
function go(d) {
  if (!viewing) return;
  cur = (cur + d + N) % N; fill(cur); fitViewer();
  if (!reduce) vimg.animate([{ opacity: 0, transform: `translateX(${d * 24}px)` }, { opacity: 1, transform: "none" }], { duration: 380, easing: "cubic-bezier(.2,.7,.2,1)" });
}
$("#vClose").addEventListener("click", closeShot);
$("#vPrev").addEventListener("click", () => go(-1));
$("#vNext").addEventListener("click", () => go(1));
vbox.addEventListener("click", e => { if (e.target === vbox) closeShot(); });
let swipe = null;
vbox.addEventListener("pointerdown", e => { swipe = { x: e.clientX, y: e.clientY }; });
vbox.addEventListener("pointerup", e => {
  if (!swipe) return; const dx = e.clientX - swipe.x, dy = e.clientY - swipe.y; swipe = null;
  if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.3) go(dx < 0 ? 1 : -1);
});

/* ---------- About ---------- */
function setAbout(on) {
  body.classList.toggle("about", on);
  $("#aboutBtn").setAttribute("aria-expanded", String(on));
  mainParts.forEach(e => e.inert = on);
  (on ? $("#aboutClose") : $("#aboutBtn")).focus({ preventScroll: true });
}
$("#aboutBtn").addEventListener("click", () => setAbout(true));
$("#aboutClose").addEventListener("click", () => setAbout(false));
$("#shade").addEventListener("click", () => setAbout(false));
$("#copyBtn").addEventListener("click", e => {
  const btn = e.currentTarget;
  const fallback = () => { const r = document.createRange(); r.selectNodeContents($("#aEmail")); const s = getSelection(); s.removeAllRanges(); s.addRange(r); btn.textContent = "Selected"; };
  try {
    navigator.clipboard.writeText(CONFIG.email).then(() => { btn.textContent = "Copied"; }, fallback);
  } catch (_) { fallback(); }
  setTimeout(() => { btn.textContent = "Copy"; }, 2000);
});

/* ---------- Keyboard ---------- */
addEventListener("keydown", e => {
  if (e.key === "Escape") { if (viewing) closeShot(); else if (body.classList.contains("about")) setAbout(false); return; }
  if (viewing) { if (e.key === "ArrowRight") go(1); if (e.key === "ArrowLeft") go(-1); return; }
  if (body.classList.contains("about") || body.dataset.view !== "sphere") return;
  const t = e.target; if (t && t.closest && t.closest("button:not(.card), a, input")) return;
  if (e.key === "ArrowLeft") vYaw -= 1.6; else if (e.key === "ArrowRight") vYaw += 1.6;
  else if (e.key === "ArrowUp") vPitch += 1.2; else if (e.key === "ArrowDown") vPitch -= 1.2;
  else if (e.key === "+" || e.key === "=") camT = clamp(camT + 60, -R * .8, R * .45);
  else if (e.key === "-") camT = clamp(camT - 60, -R * .8, R * .45);
  else return;
  aim = null; e.preventDefault();
});

/* ---------- Resize ---------- */
let lastW = innerWidth, lastH = innerHeight, rq = 0;
const relayout = force => {
  if (!force && Math.abs(innerWidth - lastW) < 20 && Math.abs(innerHeight - lastH) < 20) return;
  lastW = innerWidth; lastH = innerHeight; cancelAnimationFrame(rq); rq = requestAnimationFrame(() => layout());
};
addEventListener("resize", () => relayout(false));
addEventListener("orientationchange", () => setTimeout(() => relayout(true), 220));
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => layout());

/* ---------- Load sequence ---------- */
const images = new Array(N);
const ticks = $("#ticks");
for (let i = 0; i < N; i++) ticks.append(el("i"));
function playIntro() {
  return new Promise(res => {
    const v = el("video", { playsinline: true, muted: true, preload: "auto" });
    v.muted = true; v.defaultMuted = true; v.playsInline = true; v.src = CONFIG.introVideo;
    const skip = el("button", { class: "pill", type: "button", text: "Skip intro" });
    const wrap = el("div", { id: "intro" }, v, skip);
    let done = false;
    const end = () => { if (done) return; done = true; wrap.classList.add("gone"); setTimeout(() => wrap.remove(), 700); res(); };
    v.addEventListener("ended", end); v.addEventListener("error", end); skip.addEventListener("click", end);
    setTimeout(end, 20000);
    body.append(wrap);
    const p = v.play(); if (p && p.catch) p.catch(() => setTimeout(end, 1200));
  });
}
async function start() {
  const t0 = performance.now();
  layout();
  if (!reduce) { camZ = camT = -R * 1.8; }
  frame();
  noiseTile = makeNoise();
  for (let i = 0; i < N; i++) {
    const p = P[i];
    if (p.src) {
      try { const im = await loadImg(p.thumb || p.src); p.aspect = im.naturalWidth / im.naturalHeight; images[i] = { thumb: im.src, full: p.src }; }
      catch (_) { images[i] = { thumb: paintSample(p, i), full: null }; images[i].full = images[i].thumb; }
    } else {
      const url = paintSample(p, i); images[i] = { thumb: url, full: url };
    }
    cards.forEach((c, k) => { if (photoOf(k) === i) { const ci = c.querySelector("img"); ci.src = images[i].thumb; ci.classList.add("in"); } });
    const ti = tiles[i].querySelector("img"); ti.src = images[i].thumb; ti.onload = () => ti.classList.add("in");
    ticks.children[i].classList.add("on");
    $("#loadLabel").textContent = "Preparing photograph " + num(i + 1) + " of " + num(N);
    await wait(0);
  }
  if (P.some(p => p.src)) layout();
  await wait(Math.max(0, 1000 - (performance.now() - t0)));
  const intro = CONFIG.introVideo ? playIntro() : null;
  $("#loader").classList.add("done");
  setTimeout(() => $("#loader").remove(), 800);
  if (intro) await intro;
  body.classList.add("ready");
  camT = 0;
}
setView(location.hash.slice(1), false);
start();
})();
