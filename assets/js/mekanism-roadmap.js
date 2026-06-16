/* ============================================================================
   mekanism-roadmap.js — mounts the multiblock schematics on the structured
   progression blueprint (reuses the shared engine + Mekanism schematic data),
   and drives the page chrome (mobile nav + scroll-spy).
   ========================================================================== */
import { mountSchematic } from "./schematic-viewer.js";
import { MULTIBLOCKS } from "../data/mekanism-schematics.js";

/* ---- mount the structures inline with their stages -------------------- */
mountSchematic(MULTIBLOCKS.tank, "#bp-tank");
mountSchematic(MULTIBLOCKS.evap, "#bp-evap");
mountSchematic(MULTIBLOCKS.boiler, "#bp-boiler");
mountSchematic(MULTIBLOCKS.turbine, "#bp-turbine");
mountSchematic(MULTIBLOCKS.fission, "#bp-fission");
mountSchematic(MULTIBLOCKS.fusion, "#bp-fusion");

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
const sections = [...document.querySelectorAll("section.doc, header.hero")];

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
