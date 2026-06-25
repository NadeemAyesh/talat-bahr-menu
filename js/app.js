/**
 * منيو طلة البحر — عرض ديناميكي
 */

(function () {
  "use strict";

  const pageTrack = document.getElementById("page-track");
  const restaurant = MENU_DATA.restaurant;

  const FALLBACK_IMAGES = {
    grilled: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b2a2?w=200&q=80&fit=crop",
    main: "https://images.unsplash.com/photo-1559737558-2db5d388fabf?w=200&q=80&fit=crop",
    appetizers: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=200&q=80&fit=crop",
    salads: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=200&q=80&fit=crop",
    soups: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=200&q=80&fit=crop",
    "seafood-packet": "https://images.unsplash.com/photo-1559737558-2db5d388fabf?w=200&q=80&fit=crop",
    shrimp: "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=200&q=80&fit=crop",
    drinks: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=200&q=80&fit=crop",
    default: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200&q=80&fit=crop",
  };

  function formatPrice(price) {
    return `${price} ${restaurant.currency}`;
  }

  function getItemImage(item, categoryId) {
    return item.image || FALLBACK_IMAGES[categoryId] || FALLBACK_IMAGES.default;
  }

  function renderMenuItem(item, categoryId, index) {
    const imageSrc = getItemImage(item, categoryId);
    const hasDesc = Boolean(item.description);
    const descHtml = hasDesc
      ? `<p class="menu-row__desc">${item.description}</p>`
      : "";

    return `
      <li class="menu-row${hasDesc ? " menu-row--has-desc" : ""} reveal stagger-${Math.min(index + 1, 5)}"
          style="transition-delay: ${index * 80}ms">
        <div class="menu-row__info">
          <span class="menu-row__name">${item.name}</span>
          ${descHtml}
        </div>
        <span class="menu-row__leader" aria-hidden="true">
          <span class="menu-row__dots"></span>
          <span class="menu-row__price">${formatPrice(item.price)}</span>
        </span>
        <div class="menu-row__image">
          <img src="${imageSrc}" alt="" loading="lazy" decoding="async"
               onerror="this.onerror=null;this.src='${FALLBACK_IMAGES.default}';" />
        </div>
      </li>`;
  }

  function renderCategoryContent(category) {
    const tagline = category.tagline
      ? `<p class="category-tagline reveal">${category.tagline}</p>`
      : "";

    const note = category.note
      ? `<p class="category-note reveal">${category.note}</p>`
      : "";

    let listsHtml = "";

    if (category.sections) {
      let itemIndex = 0;
      listsHtml = category.sections
        .map((section) => {
          const title = section.title
            ? `<h3 class="category-subtitle reveal">${section.title}</h3>`
            : "";
          const items = section.items
            .map((item) => {
              const html = renderMenuItem(item, category.id, itemIndex);
              itemIndex += 1;
              return html;
            })
            .join("");
          return `${title}<ul class="menu-list" role="list">${items}</ul>`;
        })
        .join("");
    } else {
      const items = category.items
        .map((item, i) => renderMenuItem(item, category.id, i))
        .join("");
      listsHtml = `<ul class="menu-list" role="list">${items}</ul>`;
    }

    return `
      <section id="${category.id}" class="category-section category-section--page">
        <div class="category-section__header">
          <div class="divider-ornament mb-6 md:mb-8">
            <span class="text-ocean-400 text-xs">${category.icon}</span>
          </div>
          <h2 class="category-title">${category.name}</h2>
          ${tagline}
        </div>
        <div class="max-w-xl sm:max-w-2xl mx-auto w-full">
          ${listsHtml}
          ${note}
        </div>
      </section>`;
  }

  function renderCategorySlide(category) {
    return `
      <div class="page-slide" data-page-id="${category.id}">
        <div class="page-slide__scroll">
          ${renderCategoryContent(category)}
        </div>
      </div>`;
  }

  function renderMenu() {
    if (!pageTrack) return;

    pageTrack.querySelectorAll(".page-slide[data-page-id]:not([data-page-id='hero']):not([data-page-id='catch']):not([data-page-id='footer'])").forEach((el) => el.remove());

    const heroSlide = pageTrack.querySelector('[data-page-id="hero"]');
    const catchSlide = pageTrack.querySelector('[data-page-id="catch"]');
    if (!heroSlide || !catchSlide) return;

    const slidesHtml = MENU_DATA.categories.map(renderCategorySlide).join("");
    catchSlide.insertAdjacentHTML("beforebegin", slidesHtml);
  }

  function init() {
    renderMenu();
    window.PageSlider?.init();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
