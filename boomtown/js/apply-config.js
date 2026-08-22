/* =========================================================
   APPLY CONFIG — reads RESTAURANT_CONFIG and fills in every
   page automatically. Runs before other page scripts.

   Usage in HTML:
     <span data-cfg="name"></span>              -> text content
     <a data-cfg-href="phoneHref"></a>           -> href attribute
     <div data-cfg-list="tickerItems"></div>     -> repeated items
   ========================================================= */
(function applyConfig(){
  const cfg = window.RESTAURANT_CONFIG;
  if (!cfg){
    console.error("RESTAURANT_CONFIG not found — make sure restaurant-config.js loads before apply-config.js");
    return;
  }

  // ---- Brand colors as CSS custom properties ----
  const root = document.documentElement;
  Object.entries(cfg.colors || {}).forEach(([key, hex]) => {
    const cssVar = "--" + key.replace(/([A-Z])/g, "-$1").toLowerCase();
    root.style.setProperty(cssVar, hex);
  });

  // ---- Plain text fields: <tag data-cfg="fieldName"> ----
  document.querySelectorAll("[data-cfg]").forEach(el => {
    const key = el.dataset.cfg;
    if (cfg[key] !== undefined) el.textContent = cfg[key];
  });

  // ---- href fields: <a data-cfg-href="fieldName"> ----
  document.querySelectorAll("[data-cfg-href]").forEach(el => {
    const key = el.dataset.cfgHref;
    if (cfg[key] !== undefined) el.setAttribute("href", cfg[key]);
  });

  // ---- WhatsApp link shortcut: <a data-cfg-whatsapp> ----
  document.querySelectorAll("[data-cfg-whatsapp]").forEach(el => {
    el.setAttribute("href", `https://wa.me/${cfg.whatsappNumber}`);
  });

  // ---- Page <title> ----
  const titleEl = document.querySelector("title[data-cfg-title]");
  if (titleEl){
    const suffix = titleEl.dataset.cfgTitle; // e.g. "Menu — " or ""
    titleEl.textContent = `${suffix}${cfg.name}`;
  }

  // ---- Hero stat cards: container with data-cfg-list="stats" ----
  document.querySelectorAll('[data-cfg-list="stats"]').forEach(container => {
    container.innerHTML = (cfg.stats || []).map(s => `
      <div class="hero-stat"><b>${s.value}</b><span>${s.label}</span></div>
    `).join("");
  });

  // ---- Ticker: container with data-cfg-list="ticker" ----
  document.querySelectorAll('[data-cfg-list="ticker"]').forEach(container => {
    const items = cfg.tickerItems || [];
    const doubled = [...items, ...items]; // duplicate for seamless scroll
    container.innerHTML = doubled.map(t => `<span>★ ${t}</span>`).join("");
  });

  // ---- Footer year ----
  document.querySelectorAll("[data-cfg-year]").forEach(el => {
    el.textContent = cfg.copyrightYear;
  });
})();
