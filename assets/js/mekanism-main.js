/* ============================================================================
   mekanism-main.js — mounts the multiblock schematic viewers (shared engine)
   and drives the page chrome (mobile nav + scroll-spy).
   ========================================================================== */
import { mountSchematic } from "./schematic-viewer.js";
import { MULTIBLOCKS } from "../data/mekanism-schematics.js";

/* ---- mount the multiblock widgets ------------------------------------ */
mountSchematic(MULTIBLOCKS.tank, "#mb-tank");
mountSchematic(MULTIBLOCKS.evap, "#mb-evap");
mountSchematic(MULTIBLOCKS.boiler, "#mb-boiler");
mountSchematic(MULTIBLOCKS.turbine, "#mb-turbine");
mountSchematic(MULTIBLOCKS.fission, "#mb-fission");
mountSchematic(MULTIBLOCKS.fusion, "#mb-fusion");

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
