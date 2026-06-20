/* ============================================================================
   vs-guide.js — shared bootstrap for the Vintage Story guides.

   Re-exports the schematic engine, runs the site chrome (mobile nav + scroll
   spy) and wires any progression checklist on the page to localStorage with a
   live progress meter. Page-specific schematics are still mounted per page.

     <body data-ckstore="vs-progression-v1"> ...
     <div class="progress-wrap"> … [data-progress-fill] [data-progress-pct]
                                     [data-progress-label] [data-reset] </div>
     <ul class="checklist"><li><label>
        <input type="checkbox" data-ck="unique-id">
        <span class="ck-body"><span class="ck-title">…</span>
              <span class="ck-note">…</span></span>
     </label></li></ul>
   ========================================================================== */
import { initChrome } from "./guide-chrome.js";
export { mountSchematic, SchematicViewer } from "./schematic-viewer.js";

export function initVS() {
  initChrome();

  const boxes = [...document.querySelectorAll(".checklist input[data-ck]")];
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

/* auto-init unless a page opts out with data-manual on <body> */
if (typeof document !== "undefined" && !document.body?.dataset.manual) {
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", initVS);
  else initVS();
}
