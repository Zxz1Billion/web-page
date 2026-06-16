/* ============================================================================
   main.js — mounts the schematic viewers and drives the site chrome.
   ========================================================================== */
import { mountSchematic } from "./schematic-viewer.js";
import { altarSchematic, DECOR, RITUAL, INCENSE, WILL_GARDEN } from "../data/schematics.js";

/* ---- mount the schematic widgets ------------------------------------- */
mountSchematic(altarSchematic(), "#altar-viewer");
mountSchematic(RITUAL, "#ritual-viewer");
mountSchematic(WILL_GARDEN, "#will-garden-viewer");
mountSchematic(INCENSE, "#incense-viewer");
mountSchematic(DECOR.floor, "#decor-floor");
mountSchematic(DECOR.vault, "#decor-vault");
mountSchematic(DECOR.pillar, "#decor-pillar");
mountSchematic(DECOR.skylight, "#decor-skylight");
mountSchematic(DECOR.balcony, "#decor-balcony");

/* ---- mobile nav toggle ----------------------------------------------- */
const sidebar = document.querySelector("[data-sidebar]");
const menuBtn = document.querySelector("[data-menu]");
if (menuBtn) {
  menuBtn.addEventListener("click", () => sidebar.classList.toggle("open"));
  sidebar.addEventListener("click", (e) => {
    if (e.target.closest("a")) sidebar.classList.remove("open");
  });
}

/* ---- scroll-spy: highlight the active nav link ----------------------- */
const links = [...document.querySelectorAll("[data-nav] a")];
const byId = new Map(links.map((a) => [a.getAttribute("href").slice(1), a]));
const sections = [...document.querySelectorAll("section.doc, section.act, header.hero")];

const spy = new IntersectionObserver(
  (entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        const id = e.target.id;
        links.forEach((l) => l.classList.remove("active"));
        const active = byId.get(id);
        if (active) active.classList.add("active");
      }
    }
  },
  { rootMargin: "-30% 0px -60% 0px", threshold: 0 }
);
sections.forEach((s) => spy.observe(s));

/* ---- progression checklist: persistence + progress meter ------------- */
const STORE = "bm-roadmap-v1";
const boxes = [...document.querySelectorAll(".checklist input[data-ck]")];
if (boxes.length) {
  const fill = document.querySelector("[data-progress-fill]");
  const pLabel = document.querySelector("[data-progress-label]");
  const pPct = document.querySelector("[data-progress-pct]");
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
    if (pLabel) pLabel.textContent = done + " of " + total + " steps";
    if (pPct) pPct.textContent = pct + "%";
  };
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(STORE) || "{}"); } catch (e) {}
  for (const b of boxes) b.checked = !!saved[b.dataset.ck];
  boxes.forEach((b) => b.addEventListener("change", () => { save(); update(); }));
  const resetBtn = document.querySelector("[data-reset]");
  if (resetBtn) resetBtn.addEventListener("click", () => {
    boxes.forEach((b) => (b.checked = false));
    save(); update();
  });
  update();
}
