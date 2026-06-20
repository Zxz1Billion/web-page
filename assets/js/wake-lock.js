/* ============================================================================
   wake-lock.js — an opt-in "keep screen awake" toggle. Uses the Screen Wake
   Lock API (Safari 16.4+ / iPadOS 16.4+, Chrome, Edge). The lock is released
   by the browser whenever the tab is hidden, so we re-acquire on visibility
   change and on the first user gesture (iOS needs a gesture to grant it).
   The choice is remembered in localStorage. Hidden entirely if unsupported.
   ========================================================================== */

const KEY = "vs-wakelock";
let lock = null;
let want = false;
let btn = null;

function supported() {
  return typeof navigator !== "undefined" && "wakeLock" in navigator;
}

function render() {
  if (!btn) return;
  btn.setAttribute("aria-pressed", want ? "true" : "false");
  btn.querySelector(".wl-txt").textContent = want
    ? (lock ? "Screen stays on" : "Keeping awake…")
    : "Keep screen on";
}

async function acquire() {
  if (!supported() || lock || document.visibilityState !== "visible") return;
  try {
    lock = await navigator.wakeLock.request("screen");
    lock.addEventListener("release", () => { lock = null; render(); });
  } catch { lock = null; } // e.g. needs a gesture, or low battery — retry later
  render();
}

async function release() {
  try { await lock?.release(); } catch { /* ignore */ }
  lock = null;
  render();
}

export function initWakeLock() {
  if (!supported()) return;                       // older iOS / unsupported: no button
  if (document.querySelector("[data-wake]")) return;

  want = localStorage.getItem(KEY) === "1";

  btn = document.createElement("button");
  btn.className = "wakelock";
  btn.setAttribute("data-wake", "");
  btn.setAttribute("aria-pressed", "false");
  btn.title = "Stop the screen sleeping while you read";
  btn.innerHTML = `<span class="wl-dot" aria-hidden="true"></span><span class="wl-txt">Keep screen on</span>`;
  document.body.appendChild(btn);

  btn.addEventListener("click", async () => {
    want = !want;
    localStorage.setItem(KEY, want ? "1" : "0");
    if (want) await acquire(); else await release();
    render();
  });

  // re-acquire when returning to the tab (the lock drops while hidden)
  document.addEventListener("visibilitychange", () => {
    if (want && document.visibilityState === "visible") acquire();
  });

  // if it was on last time, grab it now and again on the first interaction
  render();
  if (want) {
    acquire();
    const once = () => { if (want && !lock) acquire(); document.removeEventListener("pointerdown", once); };
    document.addEventListener("pointerdown", once, { once: true });
  }
}
