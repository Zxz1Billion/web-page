/* ============================================================================
   vs-guide.js — shared bootstrap for the Vintage Story guides.

   On import it: re-exports the schematic engine, runs the site chrome (mobile
   nav + scroll spy), injects the "chapter pager" (wired prev/next navigation +
   a Print/Save-as-PDF button) at the foot of the page, and wires any
   progression/quest checklist to localStorage with a live progress meter.

   Checklist persistence covers EVERY checkbox with a data-ck attribute (both
   the .checklist rows on progression/first-day pages and the .qtasks rows on
   the questline page), keyed by <body data-ckstore="…">.
   ========================================================================== */
import { initChrome } from "./guide-chrome.js";
export { mountSchematic, SchematicViewer } from "./schematic-viewer.js";

/* The Drifter's Almanac, in reading order — drives the chapter pager. */
const ALMANAC = [
  { f: "vs-getting-started.html",  t: "The First Day",        s: "🌅" },
  { f: "vs-questline.html",        t: "The Questline",        s: "📜" },
  { f: "vs-progression.html",      t: "The Long Road",        s: "⛏" },
  { f: "vs-crafting.html",         t: "The Four Crafts",      s: "🪨" },
  { f: "vs-metalworking.html",     t: "Fire & Metal",         s: "🔥" },
  { f: "vs-mechanical-power.html", t: "The Turning World",    s: "⚙" },
  { f: "vs-food.html",             t: "The Larder",           s: "🍲" },
  { f: "vs-clothing-cold.html",    t: "Warmth & Wear",        s: "🧥" },
  { f: "vs-structures.html",       t: "The Homestead",        s: "🏠" },
  { f: "vs-temporal.html",         t: "The Rust & The Gear",  s: "🌀" },
  { f: "vs-world.html",            t: "The World",            s: "🧭" },
  { f: "vs-creatures.html",        t: "The Bestiary",         s: "🐺" },
  { f: "vs-locations.html",        t: "Ruins & Wayfarers",    s: "🏛" },
];

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

function injectPager() {
  const main = document.querySelector("main.content");
  if (!main || main.querySelector(".chapter-pager")) return;
  const page = (location.pathname.split("/").pop() || "").toLowerCase();
  const i = ALMANAC.findIndex((c) => c.f === page);
  if (i === -1) return; // not a known almanac chapter — skip

  const prev = ALMANAC[i - 1];
  const next = ALMANAC[i + 1];
  const card = (c, dir) =>
    c
      ? `<a class="pg ${dir}" href="${c.f}"><span class="dir">${dir === "prev" ? "◂ Previous" : "Next ▸"}</span><span class="ttl">${c.s} ${esc(c.t)}</span></a>`
      : `<span class="pg ${dir}" aria-hidden="true"></span>`;

  const nav = document.createElement("nav");
  nav.className = "chapter-pager";
  nav.setAttribute("aria-label", "Chapter navigation");
  nav.innerHTML =
    `<div class="pager-nav">${card(prev, "prev")}${card(next, "next")}</div>` +
    `<div class="tools">` +
    `<a class="allchapters" href="vintage-story.html">⌂ All chapters — The Drifter's Almanac</a>` +
    `<button class="print-btn" type="button" data-print>🖨 Print / Save as PDF</button>` +
    `</div>`;
  main.appendChild(nav);

  const btn = nav.querySelector("[data-print]");
  if (btn) btn.addEventListener("click", () => window.print());
}

function wireChecklists() {
  const boxes = [...document.querySelectorAll('input[type="checkbox"][data-ck]')];
  if (!boxes.length) return;

  const STORE = document.body.dataset.ckstore || "vs-checklist-v1";
  const fill = document.querySelector("[data-progress-fill]");
  const pLabel = document.querySelector("[data-progress-label]");
  const pPct = document.querySelector("[data-progress-pct]");
  const resetBtn = document.querySelector("[data-reset]");

  const save = () => {
    const out = {};
    for (const b of boxes) if (b.checked) out[b.dataset.ck] = 1;
    try { localStorage.setItem(STORE, JSON.stringify(out)); } catch (e) {}
  };
  const update = () => {
    const total = boxes.length;
    const done = boxes.filter((b) => b.checked).length;
    const pct = total ? Math.round((done / total) * 100) : 0;
    if (fill) fill.style.width = pct + "%";
    if (pLabel) pLabel.textContent = done + " of " + total + " done";
    if (pPct) pPct.textContent = pct + "%";
  };

  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(STORE) || "{}"); } catch (e) {}
  for (const b of boxes) b.checked = !!saved[b.dataset.ck];
  boxes.forEach((b) => b.addEventListener("change", () => { save(); update(); }));
  if (resetBtn) resetBtn.addEventListener("click", () => {
    boxes.forEach((b) => (b.checked = false));
    save(); update();
  });
  update();
}

export function initVS() {
  initChrome();
  injectPager();
  wireChecklists();
}

/* auto-init unless a page opts out with data-manual on <body> */
if (typeof document !== "undefined" && !document.body?.dataset.manual) {
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", initVS);
  else initVS();
}
