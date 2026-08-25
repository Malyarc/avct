window.__audit = () => {
  const issues = [];
  const add = (kind, detail) => issues.push({ kind, ...detail });
  const desc = (el) => {
    const cls = (el.className || "").toString().split(/\s+/).slice(0, 3).join(".");
    const txt = (el.innerText || el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 40);
    return `${el.tagName.toLowerCase()}${el.id ? "#" + el.id : ""}${cls ? "." + cls : ""} «${txt}»`;
  };

  // 1. Horizontal page overflow
  const doc = document.documentElement;
  if (doc.scrollWidth > doc.clientWidth + 1) {
    add("h-overflow-page", { by: doc.scrollWidth - doc.clientWidth });
    for (const el of document.querySelectorAll("body *")) {
      const r = el.getBoundingClientRect();
      if (r.width === 0) continue;
      if (r.right > doc.clientWidth + 1 || r.left < -1) {
        const cs = getComputedStyle(el);
        if (cs.position === "fixed" && (cs.left.startsWith("-") || parseFloat(cs.left) < -1000)) continue;
        if (cs.visibility === "hidden" || cs.display === "none") continue;
        add("h-overflow-el", { el: desc(el), left: Math.round(r.left), right: Math.round(r.right) });
        if (issues.filter(i => i.kind === "h-overflow-el").length > 6) break;
      }
    }
  }

  // 2. Content hidden behind a fixed bottom bar
  const fixedBars = [...document.querySelectorAll("body *")].filter((el) => {
    const cs = getComputedStyle(el);
    if (cs.position !== "fixed" && cs.position !== "sticky") return false;
    const r = el.getBoundingClientRect();
    return r.height > 20 && r.bottom > innerHeight - 8 && r.width > innerWidth * 0.5;
  });
  for (const bar of fixedBars) {
    const barRect = bar.getBoundingClientRect();
    const covered = [...document.querySelectorAll("main *, aside *")].filter((el) => {
      if (bar.contains(el) || el.contains(bar)) return false;
      const cs = getComputedStyle(el);
      if (cs.visibility === "hidden" || cs.display === "none" || cs.opacity === "0") return false;
      const r = el.getBoundingClientRect();
      if (r.width < 8 || r.height < 8) return false;
      const text = (el.innerText || "").trim();
      if (!text && el.tagName !== "IMG" && el.tagName !== "CANVAS") return false;
      // Only count leaf-ish elements so we do not report every ancestor.
      if (el.children.length > 0 && el.tagName !== "BUTTON" && el.tagName !== "A") return false;
      return r.top < barRect.bottom && r.bottom > barRect.top && r.left < barRect.right && r.right > barRect.left;
    });
    for (const el of covered.slice(0, 6)) {
      add("covered-by-bar", { bar: desc(bar), el: desc(el) });
    }
  }

  // 3. Touch targets that are too small
  for (const el of document.querySelectorAll('button, a[href], [role="button"], [role="checkbox"], [role="radio"], input, select')) {
    const cs = getComputedStyle(el);
    if (cs.display === "none" || cs.visibility === "hidden") continue;
    // Deliberately-hidden affordances (skip links, file inputs) are not targets.
    if (el.closest(".sr-only-focusable") || el.classList.contains("sr-only-focusable")) continue;
    // An inline link inside a sentence is text, not a control.
    if (el.tagName === "A" && el.closest("p, dd, li") && getComputedStyle(el).display === "inline") continue;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    if (r.height < 32 || r.width < 24) {
      add("small-target", { el: desc(el), w: Math.round(r.width), h: Math.round(r.height) });
      if (issues.filter(i => i.kind === "small-target").length > 8) break;
    }
  }

  // 4. Text clipped by its own box
  for (const el of document.querySelectorAll("h1, h2, h3, p, span, button, a, label, td, th, li")) {
    if (el.children.length > 0) continue;
    const cs = getComputedStyle(el);
    if (cs.display === "none" || cs.visibility === "hidden") continue;
    if (el.closest(".sr-only-focusable") || el.classList.contains("sr-only-focusable")) continue;
    if (cs.overflow === "visible" && cs.overflowX === "visible") continue;
    if (cs.textOverflow === "ellipsis") continue;
    if (el.scrollWidth > el.clientWidth + 2 || el.scrollHeight > el.clientHeight + 2) {
      add("clipped-text", { el: desc(el), sw: el.scrollWidth, cw: el.clientWidth });
      if (issues.filter(i => i.kind === "clipped-text").length > 6) break;
    }
  }

  // 5. Images without alt handling
  for (const img of document.querySelectorAll("img")) {
    if (img.alt === undefined || img.alt === null) add("img-no-alt", { el: desc(img) });
    if (img.complete && img.naturalWidth === 0) add("img-broken", { src: img.src.slice(0, 60) });
  }

  // 6. Duplicate ids
  const ids = {};
  for (const el of document.querySelectorAll("[id]")) {
    ids[el.id] = (ids[el.id] || 0) + 1;
  }
  for (const [id, n] of Object.entries(ids)) if (n > 1) add("duplicate-id", { id, n });

  // 7. Buttons and links without an accessible name
  for (const el of document.querySelectorAll('button, a[href], [role="button"], [role="checkbox"], [role="radio"]')) {
    const cs = getComputedStyle(el);
    if (cs.display === "none" || cs.visibility === "hidden") continue;
    const name = (el.getAttribute("aria-label") || el.innerText || el.getAttribute("title") ||
      el.getAttribute("aria-labelledby") || "").trim();
    if (!name) {
      add("no-accessible-name", { el: desc(el) });
      if (issues.filter(i => i.kind === "no-accessible-name").length > 6) break;
    }
  }

  // 8. Inputs without a label
  for (const el of document.querySelectorAll("input:not([type=hidden]), textarea, select")) {
    const cs = getComputedStyle(el);
    if (cs.display === "none") continue;
    const labelled =
      el.getAttribute("aria-label") ||
      el.getAttribute("aria-labelledby") ||
      (el.id && document.querySelector(`label[for="${CSS.escape(el.id)}"]`)) ||
      el.closest("label");
    if (!labelled) {
      add("input-no-label", { el: desc(el) });
      if (issues.filter(i => i.kind === "input-no-label").length > 6) break;
    }
  }

  return issues;
};
