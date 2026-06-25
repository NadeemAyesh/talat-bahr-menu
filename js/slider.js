/**
 * منزلق الصفحات — تنقل أفقي مع حركة slide
 */

(function () {
  "use strict";

  const track = document.getElementById("page-track");
  const slider = document.getElementById("page-slider");
  const dotsContainer = document.getElementById("page-dots");
  const pageControls = document.getElementById("page-controls");
  const prevBtn = document.getElementById("page-prev");
  const nextBtn = document.getElementById("page-next");

  let pages = [];
  let currentIndex = 0;
  let isAnimating = false;
  let touchStartX = 0;
  let touchStartY = 0;

  function collectPages() {
    if (!track) return [];
    return Array.from(track.querySelectorAll(":scope > .page-slide"));
  }

  function getPageIndex(pageId) {
    return pages.findIndex((p) => p.dataset.pageId === pageId);
  }

  function setSliding(active) {
    document.body.classList.toggle("is-sliding", active);
  }

  function updateUI() {
    prevBtn?.classList.toggle("is-hidden", currentIndex === 0);
    nextBtn?.classList.toggle("is-hidden", currentIndex >= pages.length - 1);

    pageControls?.classList.toggle("is-hidden", currentIndex === 0);

    dotsContainer?.querySelectorAll(".page-dot").forEach((dot, i) => {
      dot.classList.toggle("page-dot--active", i === currentIndex);
    });
  }

  function revealCurrentPage() {
    const page = pages[currentIndex];
    if (!page) return;

    page.querySelectorAll(".reveal:not(.visible)").forEach((el) => {
      el.classList.add("visible");
    });

    const scrollEl = page.querySelector(".page-slide__scroll");
    if (scrollEl) scrollEl.scrollTop = 0;
  }

  function goTo(index, animate = true) {
    if (!track || !pages.length) return;
    if (index < 0 || index >= pages.length) return;
    if (isAnimating && animate) return;
    if (index === currentIndex && animate) return;

    const direction = index > currentIndex ? "forward" : "backward";
    currentIndex = index;

    track.classList.remove("page-track--forward", "page-track--backward");
    if (animate) {
      track.classList.add(
        direction === "forward" ? "page-track--forward" : "page-track--backward"
      );
      isAnimating = true;
    }

    track.style.transform = `translate3d(-${currentIndex * 100}%, 0, 0)`;

    pages.forEach((page, i) => {
      page.classList.toggle("is-current", i === currentIndex);
    });

    if (animate) {
      setSliding(true);
      const onEnd = () => {
        track.classList.remove("page-track--forward", "page-track--backward");
        isAnimating = false;
        setSliding(false);
        track.removeEventListener("transitionend", onEnd);
      };
      track.addEventListener("transitionend", onEnd);
    }

    updateUI();
    revealCurrentPage();
  }

  function goToPageId(pageId) {
    const index = getPageIndex(pageId);
    if (index !== -1) goTo(index);
  }

  function next() {
    goTo(currentIndex + 1);
  }

  function prev() {
    goTo(currentIndex - 1);
  }

  function renderDots() {
    if (!dotsContainer) return;

    dotsContainer.innerHTML = pages
      .map(
        (_, i) =>
          `<button type="button" class="page-dot${i === 0 ? " page-dot--active" : ""}" data-index="${i}" aria-label="صفحة ${i + 1}"></button>`
      )
      .join("");

    dotsContainer.querySelectorAll(".page-dot").forEach((dot) => {
      dot.addEventListener("click", () => {
        goTo(parseInt(dot.dataset.index, 10));
      });
    });
  }

  function bindSwipe() {
    if (!slider) return;

    slider.addEventListener(
      "touchstart",
      (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        setSliding(true);
      },
      { passive: true }
    );

    slider.addEventListener(
      "touchmove",
      (e) => {
        const diffX = Math.abs(e.touches[0].clientX - touchStartX);
        const diffY = Math.abs(e.touches[0].clientY - touchStartY);
        if (diffX > diffY && diffX > 10) setSliding(true);
      },
      { passive: true }
    );

    const endTouch = () => {
      window.setTimeout(() => {
        if (!isAnimating) setSliding(false);
      }, 50);
    };

    slider.addEventListener("touchend", endTouch, { passive: true });
    slider.addEventListener("touchcancel", endTouch, { passive: true });

    slider.addEventListener(
      "touchend",
      (e) => {
        const diffX = e.changedTouches[0].clientX - touchStartX;
        const diffY = e.changedTouches[0].clientY - touchStartY;

        if (Math.abs(diffX) < 50 || Math.abs(diffX) < Math.abs(diffY)) return;

        if (diffX < 0) next();
        else prev();
      },
      { passive: true }
    );

    let mouseDown = false;
    let mouseStartX = 0;

    slider.addEventListener("mousedown", (e) => {
      mouseDown = true;
      mouseStartX = e.clientX;
      setSliding(true);
    });

    window.addEventListener("mouseup", (e) => {
      if (!mouseDown) return;
      mouseDown = false;

      const diffX = e.clientX - mouseStartX;
      if (Math.abs(diffX) >= 60) {
        if (diffX < 0) next();
        else prev();
      }

      if (!isAnimating) setSliding(false);
    });

    slider.addEventListener("selectstart", (e) => {
      if (document.body.classList.contains("is-sliding")) e.preventDefault();
    });

    slider.addEventListener("dragstart", (e) => {
      if (document.body.classList.contains("is-sliding")) e.preventDefault();
    });
  }

  function bindNavigation() {
    document.addEventListener("click", (e) => {
      const target = e.target.closest("[data-page-target]");
      if (!target) return;
      e.preventDefault();
      goToPageId(target.dataset.pageTarget);
    });

    prevBtn?.addEventListener("click", prev);
    nextBtn?.addEventListener("click", next);

    document.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") next();
      if (e.key === "ArrowRight") prev();
    });
  }

  function refresh() {
    pages = collectPages();
    renderDots();
    if (currentIndex >= pages.length) currentIndex = pages.length - 1;
    goTo(currentIndex, false);
  }

  function init() {
    pages = collectPages();
    renderDots();
    bindSwipe();
    bindNavigation();
    goTo(0, false);
    revealCurrentPage();
  }

  window.PageSlider = { init, refresh, goTo, goToPageId, next, prev };
})();
