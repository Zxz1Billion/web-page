/* ============================================================================
   guide-chrome.js — shared site chrome for every mod guide:
   mobile nav toggle + scroll-spy nav highlighting. Import and call initChrome().
   Schematic viewers are mounted per-page from the reusable engine.
   ========================================================================== */
export { mountSchematic, SchematicViewer } from "./schematic-viewer.js";

export function initChrome() {
  /* mobile nav toggle */
  const sidebar = document.querySelector("[data-sidebar]");
  const menuBtn = document.querySelector("[data-menu]");
  if (menuBtn && sidebar) {
    menuBtn.addEventListener("click", () => sidebar.classList.toggle("open"));
    sidebar.addEventListener("click", (e) => {
      if (e.target.closest("a")) sidebar.classList.remove("open");
    });
  }

  /* scroll-spy: highlight the active nav link */
  const links = [...document.querySelectorAll("[data-nav] a")];
  if (!links.length) return;
  const byId = new Map(links.map((a) => [a.getAttribute("href").slice(1), a]));
  const sections = [...document.querySelectorAll("section.doc, header.hero")];
  const spy = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          links.forEach((l) => l.classList.remove("active"));
          const active = byId.get(e.target.id);
          if (active) active.classList.add("active");
        }
      }
    },
    { rootMargin: "-30% 0px -60% 0px", threshold: 0 }
  );
  sections.forEach((s) => spy.observe(s));
}
