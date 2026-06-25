/**
 * تخزين وتحميل بيانات المنيو
 */
const MenuStore = (function () {
  "use strict";

  const STORAGE_KEY = "talat-bahr-menu";

  async function load() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn("فشل قراءة التخزين المحلي", e);
    }

    try {
      const res = await fetch("data/menu.json");
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("فشل تحميل menu.json", e);
    }

    if (typeof MENU_DATA !== "undefined") return structuredClone(MENU_DATA);
    return null;
  }

  function save(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function clear() {
    localStorage.removeItem(STORAGE_KEY);
  }

  function downloadJson(data) {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "menu.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  /** للوحة التحكم — تحويل الأقسام الفرعية لقائمة واحدة */
  function flattenCategory(category) {
    const copy = structuredClone(category);
    if (!copy.sections) return copy;

    copy.items = copy.sections.flatMap((section) =>
      (section.items || []).map((item) => ({
        ...item,
        _section: section.title || "",
      }))
    );
    delete copy.sections;
    return copy;
  }

  /** إعادة بناء sections عند الحفظ */
  function packCategory(category) {
    const copy = structuredClone(category);
    if (!copy.items?.some((i) => "_section" in i)) {
      return copy;
    }

    const plain = copy.items.filter((i) => !i._section);
    const grouped = {};

    copy.items
      .filter((i) => i._section)
      .forEach((item) => {
        const key = item._section;
        if (!grouped[key]) grouped[key] = [];
        const { _section, ...rest } = item;
        grouped[key].push(rest);
      });

    copy.sections = [];
    if (plain.length) {
      copy.sections.push({
        items: plain.map(({ _section, ...rest }) => rest),
      });
    }
    Object.entries(grouped).forEach(([title, items]) => {
      copy.sections.push({ title, items });
    });
    delete copy.items;
    return copy;
  }

  function packMenu(data) {
    return {
      ...data,
      categories: data.categories.map(packCategory),
    };
  }

  function flattenMenu(data) {
    return {
      ...data,
      categories: data.categories.map(flattenCategory),
    };
  }

  return {
    load,
    save,
    clear,
    downloadJson,
    flattenMenu,
    packMenu,
  };
})();
