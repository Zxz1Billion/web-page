/* ============================================================================
   vs-search.js — instant client-side search across the whole Almanac, plus a
   site-wide favicon injector. The index is generated into
   assets/data/vs-search-index.js (export const SEARCH_INDEX). Degrades quietly
   if the index is missing.

   Open with "/" or Ctrl/Cmd-K (or the floating button); arrow keys + Enter to
   navigate; Esc to close.
   ========================================================================== */
let INDEX = [];
try {
  ({ SEARCH_INDEX: INDEX } = await import("../data/vs-search-index.js"));
} catch (e) { INDEX = []; }

function ensureFavicon() {
  if (!document.querySelector('link[rel="icon"]')) {
    const l = document.createElement("link");
    l.rel = "icon"; l.type = "image/svg+xml"; l.href = "favicon.svg";
    document.head.appendChild(l);
  }
}

const norm = (s) => (s || "").toLowerCase();
function score(entry, terms) {
  const hay = entry._h || (entry._h = norm(entry.s + " " + entry.p + " " + entry.k));
  let sc = 0;
  for (const t of terms) {
    if (!t) continue;
    const i = hay.indexOf(t);
    if (i === -1) return -1;            // every term must appear
    sc += 12 - Math.min(10, i / 6);     // earlier = better
    if (norm(entry.s).startsWith(t)) sc += 8;
    if (norm(entry.s).includes(t)) sc += 4;
  }
  return sc;
}

export function initSearch() {
  ensureFavicon();
  if (!INDEX.length) return;

  // floating trigger
  const btn = document.createElement("button");
  btn.className = "vs-search-btn"; btn.type = "button";
  btn.setAttribute("aria-label", "Search the Almanac");
  btn.innerHTML = `<span>Search</span><kbd>/</kbd>`;
  document.body.appendChild(btn);

  // overlay
  const ov = document.createElement("div");
  ov.className = "vs-search"; ov.hidden = true;
  ov.innerHTML = `
    <div class="vs-search__backdrop" data-close></div>
    <div class="vs-search__box" role="dialog" aria-modal="true" aria-label="Search">
      <input class="vs-search__input" type="search" placeholder="Search the Almanac…  (try: bloomery, cellar, temporal gear)" autocomplete="off" spellcheck="false" />
      <ul class="vs-search__results" data-results></ul>
      <div class="vs-search__foot"><span><kbd>↑</kbd><kbd>↓</kbd> move · <kbd>↵</kbd> open · <kbd>esc</kbd> close</span><span>${INDEX.length} entries</span></div>
    </div>`;
  document.body.appendChild(ov);

  const input = ov.querySelector(".vs-search__input");
  const list = ov.querySelector("[data-results]");
  let results = [], sel = 0;

  const render = () => {
    list.innerHTML = results.length
      ? results.map((r, i) =>
          `<li class="${i === sel ? "on" : ""}" data-i="${i}"><a href="${r.u}">
             <span class="r-sec">${r.s}</span>
             <span class="r-page">${r.p}</span>
             <span class="r-snip">${r.k.slice(0, 120)}</span>
           </a></li>`).join("")
      : `<li class="vs-search__empty">No matches. Try a single keyword.</li>`;
  };
  const run = (q) => {
    const terms = norm(q).split(/\s+/).filter(Boolean);
    results = !terms.length ? []
      : INDEX.map((e) => [score(e, terms), e]).filter((x) => x[0] >= 0)
             .sort((a, b) => b[0] - a[0]).slice(0, 24).map((x) => x[1]);
    sel = 0; render();
  };
  const go = (i) => { const r = results[i]; if (r) location.href = r.u; };

  const open = () => { ov.hidden = false; document.body.style.overflow = "hidden"; input.value = ""; results = []; render(); setTimeout(() => input.focus(), 30); };
  const close = () => { ov.hidden = true; document.body.style.overflow = ""; };

  btn.addEventListener("click", open);
  ov.addEventListener("click", (e) => { if (e.target.closest("[data-close]")) close(); const li = e.target.closest("li[data-i]"); if (li) go(+li.dataset.i); });
  input.addEventListener("input", () => run(input.value));
  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") { sel = Math.min(sel + 1, results.length - 1); render(); e.preventDefault(); }
    else if (e.key === "ArrowUp") { sel = Math.max(sel - 1, 0); render(); e.preventDefault(); }
    else if (e.key === "Enter") { go(sel); e.preventDefault(); }
    else if (e.key === "Escape") { close(); }
  });
  document.addEventListener("keydown", (e) => {
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName) || document.activeElement?.isContentEditable;
    if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) { e.preventDefault(); ov.hidden ? open() : close(); }
    else if (e.key === "/" && !typing && ov.hidden) { e.preventDefault(); open(); }
  });
}
