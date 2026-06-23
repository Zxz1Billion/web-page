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
import { initSearch } from "./vs-search.js";
import { initWakeLock } from "./wake-lock.js";
export { mountSchematic, SchematicViewer } from "./schematic-viewer.js";
export { mountIso, IsoViewer } from "./iso-viewer.js";

/* The Drifter's Almanac, in reading order — drives the chapter pager. */
const ALMANAC = [
  { f: "vs-getting-started.html",  t: "The First Day",        s: "🌅" },
  { f: "vs-classes.html",          t: "The Six Classes",      s: "🎭" },
  { f: "vs-questline.html",        t: "The Questline",        s: "📜" },
  { f: "vs-progression.html",      t: "The Long Road",        s: "⛏" },
  { f: "vs-crafting.html",         t: "The Four Crafts",      s: "🪨" },
  { f: "vs-metalworking.html",     t: "Fire & Metal",         s: "🔥" },
  { f: "vs-arsenal.html",          t: "The Arsenal",          s: "⚔️" },
  { f: "vs-mechanical-power.html", t: "The Turning World",    s: "⚙" },
  { f: "vs-food.html",             t: "The Larder",           s: "🍲" },
  { f: "vs-clothing-cold.html",    t: "Warmth & Wear",        s: "🧥" },
  { f: "vs-structures.html",       t: "The Homestead",        s: "🏠" },
  { f: "vs-architect.html",        t: "The Architect",        s: "🏛️" },
  { f: "vs-builds.html",           t: "The Pattern Book",     s: "🧱" },
  { f: "vs-dreamhome.html",        t: "A Home Worth Keeping", s: "🏡" },
  { f: "vs-dreamhome-estate.html", t: "The Dream Estate",     s: "🏡" },
  { f: "vs-house-schematic.html",  t: "House Floor Plans",    s: "📐" },
  { f: "vs-temporal.html",         t: "The Rust & The Gear",  s: "🌀" },
  { f: "vs-world.html",            t: "The World",            s: "🧭" },
  { f: "vs-creatures.html",        t: "The Bestiary",         s: "🐺" },
  { f: "vs-combat.html",           t: "The Art of War",       s: "🛡️" },
  { f: "vs-locations.html",        t: "Ruins & Wayfarers",    s: "🏛" },
  { f: "vs-reference.html",        t: "The Codex",            s: "📊" },
  { f: "vs-glossary.html",         t: "The Glossary",         s: "📖" },
  { f: "vs-whatsnew.html",         t: "What's New in 1.22",   s: "✨" },
  { f: "vs-cheatsheet.html",       t: "The Cheat Sheet",      s: "🗂️" },
];

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

/* Per-page citations, injected as a "Sources" block before the pager. */
const W = "https://wiki.vintagestory.at/";
const SOURCES = {
  "vs-getting-started.html": [["Survival Guide — first day", W+"Survival_Guide_-_Your_first_day"], ["Controls", W+"Controls"], ["Classes", W+"Classes"], ["Knapping", W+"Knapping"]],
  "vs-classes.html": [["Classes", W+"Classes"], ["Class", W+"Class"]],
  "vs-progression.html": [["Metal", W+"Metal"], ["Smithing", W+"Smithing"], ["Crafting", W+"Crafting"], ["Steel making", W+"Steel_making"]],
  "vs-crafting.html": [["Knapping", W+"Knapping"], ["Clay forming", W+"Clay_forming"], ["Smithing", W+"Smithing"], ["Casting", W+"Casting"], ["Crucible", W+"Crucible"], ["Pit kiln", W+"Pit_kiln"]],
  "vs-metalworking.html": [["Metal", W+"Metal"], ["Ore", W+"Ore"], ["Bloomery", W+"Bloomery"], ["Steel making", W+"Steel_making"], ["Fuel", W+"Fuel"], ["Bellows", W+"Bellows"], ["Anvil", W+"Anvil"]],
  "vs-arsenal.html": [["Tools", W+"Tools"], ["Weapons", W+"Weapons"], ["Armor", W+"Armor"], ["Metal", W+"Metal"], ["Anvil", W+"Anvil"]],
  "vs-mechanical-power.html": [["Mechanical power", W+"Mechanical_power"], ["Windmill", W+"Windmill"], ["Water wheel", W+"Water_wheel"], ["Helve hammer", W+"Helve_hammer"], ["Quern", W+"Quern"]],
  "vs-food.html": [["Health", W+"Health"], ["Satiety", W+"Satiety"], ["Farming", W+"Farming"], ["Cooking", W+"Cooking"], ["Cooking pot", W+"Cooking_pot"], ["Pie", W+"Pie"], ["Food preservation", W+"Food_preservation"], ["Bait", W+"Bait"]],
  "vs-clothing-cold.html": [["Temperature", W+"Temperature"], ["Clothes", W+"Clothes"], ["Armor", W+"Armor"], ["Prepare for Winter", W+"Guide:Prepare_for_Winter"]],
  "vs-structures.html": [["Cellar (Room)", W+"Guide:Cellar"], ["Food preservation", W+"Food_preservation"], ["Storage vessel", W+"Storage_vessel"], ["Crock", W+"Crock"], ["Pit kiln", W+"Pit_kiln"]],
  "vs-architect.html": [["Chiseling", W+"Chiseling"], ["Clay forming", W+"Clay_forming"], ["Building blocks", W+"Building"]],
  "vs-builds.html": [["Building", W+"Building"], ["Windmill", W+"Windmill"], ["Water wheel", W+"Water_wheel"], ["Bloomery", W+"Bloomery"], ["Pit kiln", W+"Pit_kiln"], ["Cellar (Room)", W+"Guide:Cellar"]],
  "vs-dreamhome.html": [["Building", W+"Building"], ["Chiseling", W+"Chiseling"], ["Cellar (Room)", W+"Guide:Cellar"], ["Clay forming", W+"Clay_forming"], ["Storage vessel", W+"Storage_vessel"]],
  "vs-temporal.html": [["Temporal stability", W+"Temporal_stability"], ["Temporal storm", W+"Temporal_storm"], ["Temporal rift", W+"Temporal_rift"], ["Temporal gear", W+"Temporal_gear"], ["Drifter", W+"Drifter"]],
  "vs-world.html": [["Rock", W+"Rock"], ["Ore Deposits", W+"Ore_Deposits"], ["Prospecting Pick", W+"Prospecting_Pick"], ["Temperature", W+"Temperature"], ["Sea level", W+"Sea_level"]],
  "vs-creatures.html": [["Hostile entities", W+"Hostile_entities"], ["Drifter", W+"Drifter"], ["Wolf", W+"Wolf"], ["Bear", W+"Bear"], ["Animal husbandry", W+"Animal_husbandry"]],
  "vs-combat.html": [["Combat", W+"Combat"], ["Weapons", W+"Weapons"], ["Armor", W+"Armor"], ["Health", W+"Health"], ["Hostile entities", W+"Hostile_entities"], ["Temporal storm", W+"Temporal_storm"]],
  "vs-locations.html": [["Translocator", W+"Translocator"], ["Trader", W+"Trader"], ["Temporal gear", W+"Temporal_gear"]],
  "vs-reference.html": [["Metal", W+"Metal"], ["Ore", W+"Ore"], ["Farming", W+"Farming"], ["Health", W+"Health"], ["Temporal stability", W+"Temporal_stability"]],
  "vs-whatsnew.html": [["1.22.0 release notes", "https://www.vintagestory.at/blog.html/news/1220-fishing-mechanisms-metalworking-and-more-r441/"], ["Version history", W+"Version_history"]],
  "vs-glossary.html": [["Vintage Story Wiki", W+"Main_Page"]],
  "vs-cheatsheet.html": [["Vintage Story Wiki", W+"Main_Page"], ["Survival Handbook (in-game)", W+"Main_Page"]],
  "vs-questline.html": [["Vintage Story Wiki", W+"Main_Page"], ["Survival Guide — first day", W+"Survival_Guide_-_Your_first_day"]],
};

function injectSources() {
  const main = document.querySelector("main.content");
  if (!main || main.querySelector(".sources")) return;
  const page = (location.pathname.split("/").pop() || "").toLowerCase();
  const src = SOURCES[page];
  if (!src || !src.length) return;
  const sec = document.createElement("section");
  sec.className = "sources";
  sec.innerHTML =
    `<h3>Sources &amp; further reading</h3><ul>` +
    src.map(([t, u]) => `<li><a href="${u}" target="_blank" rel="noopener">${esc(t)}</a></li>`).join("") +
    `</ul><p class="sources-note">Unofficial fan guide · mechanics target v1.22.3 and are config-tunable · the in-game Survival Handbook and the official wiki are ground truth.</p>`;
  main.appendChild(sec);
}

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

/* hover-to-copy permalink on every section heading (a wiki affordance) */
function injectAnchors() {
  const heads = document.querySelectorAll("section.doc > h2, section.doc h3[id]");
  heads.forEach((h) => {
    const id = h.id || (h.closest("section.doc") || {}).id;
    if (!id || h.querySelector(".anchor-link")) return;
    const a = document.createElement("a");
    a.className = "anchor-link"; a.href = "#" + id; a.textContent = "#";
    a.setAttribute("aria-label", "Copy link to this section");
    a.addEventListener("click", () => {
      try { navigator.clipboard.writeText(location.origin + location.pathname + "#" + id); } catch (e) {}
    });
    h.appendChild(a);
  });
}

/* Global chapter switcher + a discoverable search button, injected into the
   sidebar so the drawer becomes a real nav hub (lateral jumps in one open). */
function injectNav() {
  const sidebar = document.querySelector("[data-sidebar]");
  if (!sidebar || sidebar.querySelector(".nav-chapters")) return;
  const page = (location.pathname.split("/").pop() || "").toLowerCase();

  const home = sidebar.querySelector(".home-link");
  if (home && !sidebar.querySelector("[data-search-open]")) {
    const sb = document.createElement("button");
    sb.type = "button"; sb.className = "side-search"; sb.setAttribute("data-search-open", "");
    sb.innerHTML = `<span>🔎 Search the Almanac</span><kbd>/</kbd>`;
    home.insertAdjacentElement("afterend", sb);
  }

  const det = document.createElement("details");
  det.className = "nav nav-chapters"; det.open = true;
  det.innerHTML = `<summary>All chapters</summary>` + ALMANAC.map((c) =>
    `<a href="${c.f}" class="${c.f === page ? "current" : ""}"${c.f === page ? ' aria-current="page"' : ""}><span class="ix">${c.s}</span> ${esc(c.t)}</a>`
  ).join("");
  const dn = sidebar.querySelector("[data-nav]");
  if (dn) { const lbl = document.createElement("p"); lbl.className = "group-label"; lbl.textContent = "On this page"; dn.insertAdjacentElement("beforebegin", det); dn.insertAdjacentElement("beforebegin", lbl); }
  else sidebar.appendChild(det);
}

/* breadcrumb at the top of the content column — constant orientation + home */
function injectCrumbs() {
  const main = document.querySelector("main.content");
  if (!main || main.querySelector(".crumbs")) return;
  const page = (location.pathname.split("/").pop() || "").toLowerCase();
  const cur = ALMANAC.find((c) => c.f === page);
  const name = cur ? cur.t : (document.title.split(/—|·/)[0].trim());
  const nav = document.createElement("nav");
  nav.className = "crumbs"; nav.setAttribute("aria-label", "Breadcrumb");
  nav.innerHTML = `<a href="vintage-story.html">⌂ The Drifter's Almanac</a><span class="sep">›</span><span class="here">${esc(name)}</span>`;
  main.insertAdjacentElement("afterbegin", nav);
}

/* a11y: skip-link + keep the menu toggle's aria-expanded honest */
function injectA11y() {
  if (!document.querySelector(".skip-link")) {
    const s = document.createElement("a");
    s.className = "skip-link"; s.href = "#top"; s.textContent = "Skip to content";
    document.body.insertAdjacentElement("afterbegin", s);
  }
  const mb = document.querySelector("[data-menu]");
  const sb = document.querySelector("[data-sidebar]");
  if (mb && sb) {
    mb.setAttribute("aria-expanded", "false");
    mb.setAttribute("aria-controls", "vs-sidebar");
    if (!sb.id) sb.id = "vs-sidebar";
    mb.addEventListener("click", () => mb.setAttribute("aria-expanded", sb.classList.contains("open") ? "true" : "false"));
    sb.addEventListener("click", (e) => { if (e.target.closest("a")) mb.setAttribute("aria-expanded", "false"); });
  }
}

/* touch: tap a schematic cell to pin its block label (hover doesn't exist) */
function wireSchematicTaps() {
  document.addEventListener("click", (e) => {
    const cell = e.target.closest(".schematic .cell");
    const open = document.querySelector(".cell.show");
    if (open && open !== cell) open.classList.remove("show");
    if (cell && cell.classList.contains("filled")) cell.classList.toggle("show");
  });
}

export function initVS() {
  initChrome();
  injectNav();
  injectCrumbs();
  injectA11y();
  injectSources();
  injectPager();
  injectAnchors();
  wireSchematicTaps();
  wireChecklists();
  initSearch();
  initWakeLock();
}

/* auto-init unless a page opts out with data-manual on <body> */
if (typeof document !== "undefined" && !document.body?.dataset.manual) {
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", initVS);
  else initVS();
}
