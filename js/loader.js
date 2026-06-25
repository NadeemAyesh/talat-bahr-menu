/**
 * شاشة تحميل خفيفة — طلة البحر
 */
(function () {
  "use strict";

  const LOADER_ID = "site-loader";
  const MIN_VISIBLE_MS = 280;

  const shownAt = Date.now();

  function hide() {
    const loader = document.getElementById(LOADER_ID);
    if (!loader || loader.classList.contains("site-loader--done")) return;

    const delay = Math.max(0, MIN_VISIBLE_MS - (Date.now() - shownAt));

    setTimeout(() => {
      loader.classList.add("site-loader--done");
      loader.setAttribute("aria-hidden", "true");

      const remove = () => loader.remove();
      loader.addEventListener("transitionend", remove, { once: true });
      setTimeout(remove, 700);
    }, delay);
  }

  window.SiteLoader = { hide };
})();
