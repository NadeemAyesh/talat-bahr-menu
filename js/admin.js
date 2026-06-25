/**
 * لوحة تحكم بسيطة — أصناف المنيو
 */
(function () {
  "use strict";

  const ADMIN_PIN = "talat2026";
  const AUTH_KEY = "talat-admin-auth";

  const loginScreen = document.getElementById("login-screen");
  const adminApp = document.getElementById("admin-app");
  const loginForm = document.getElementById("login-form");
  const loginError = document.getElementById("login-error");
  const categorySelect = document.getElementById("category-select");
  const itemsList = document.getElementById("items-list");
  const itemForm = document.getElementById("item-form");
  const editItemId = document.getElementById("edit-item-id");
  const formTitle = document.getElementById("form-title");
  const btnSubmit = document.getElementById("btn-submit");
  const btnCancelEdit = document.getElementById("btn-cancel-edit");
  const toast = document.getElementById("toast");

  let menuData = null;
  let flatMenu = null;
  let selectedCatIndex = 0;

  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.remove("hidden");
    setTimeout(() => toast.classList.add("hidden"), 2500);
  }

  function uid() {
    return "i" + Date.now().toString(36);
  }

  function isAuthed() {
    return sessionStorage.getItem(AUTH_KEY) === "1";
  }

  function showApp() {
    loginScreen.classList.add("hidden");
    adminApp.classList.remove("hidden");
  }

  async function initData() {
    menuData = await MenuStore.load();
    if (!menuData) {
      alert("تعذّر تحميل المنيو");
      return;
    }
    flatMenu = MenuStore.flattenMenu(menuData);
    renderCategories();
    renderItems();
  }

  function getCurrentCategory() {
    return flatMenu.categories[selectedCatIndex];
  }

  function renderCategories() {
    categorySelect.innerHTML = flatMenu.categories
      .map(
        (cat, i) =>
          `<option value="${i}">${cat.icon || "📋"} ${cat.name}</option>`
      )
      .join("");
    categorySelect.value = String(selectedCatIndex);
  }

  function renderItems() {
    const cat = getCurrentCategory();
    if (!cat?.items?.length) {
      itemsList.innerHTML = `<p class="admin-empty">لا توجد أصناف — أضف صنفاً جديداً</p>`;
      return;
    }

    itemsList.innerHTML = cat.items
      .map((item) => {
        const section = item._section
          ? `<span class="admin-item__tag">${item._section}</span>`
          : "";
        const desc = item.description
          ? `<span class="admin-item__desc">${item.description}</span>`
          : "";
        return `
        <div class="admin-item" data-id="${item.id}">
          <div class="admin-item__info">
            <span class="admin-item__name">${item.name}</span>
            ${desc}
            ${section}
          </div>
          <span class="admin-item__price">${item.price} ش</span>
          <div class="admin-item__actions">
            <button type="button" class="admin-btn admin-btn--ghost admin-btn--sm" data-edit="${item.id}">تعديل</button>
            <button type="button" class="admin-btn admin-btn--danger admin-btn--sm" data-delete="${item.id}">حذف</button>
          </div>
        </div>`;
      })
      .join("");
  }

  function resetForm() {
    itemForm.reset();
    editItemId.value = "";
    formTitle.textContent = "إضافة صنف";
    btnSubmit.textContent = "إضافة";
    btnCancelEdit.classList.add("hidden");
  }

  function startEdit(id) {
    const item = getCurrentCategory().items.find((i) => i.id === id);
    if (!item) return;
    editItemId.value = id;
    document.getElementById("item-name").value = item.name;
    document.getElementById("item-price").value = item.price;
    document.getElementById("item-desc").value = item.description || "";
    document.getElementById("item-section").value = item._section || "";
    formTitle.textContent = "تعديل صنف";
    btnSubmit.textContent = "حفظ التعديل";
    btnCancelEdit.classList.remove("hidden");
    document.getElementById("item-name").focus();
  }

  function persist() {
    menuData = MenuStore.packMenu(flatMenu);
    MenuStore.save(menuData);
    showToast("تم الحفظ ✓");
  }

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const pin = document.getElementById("admin-pin").value;
    if (pin !== ADMIN_PIN) {
      loginError.classList.remove("hidden");
      return;
    }
    loginError.classList.add("hidden");
    sessionStorage.setItem(AUTH_KEY, "1");
    showApp();
    initData();
  });

  categorySelect.addEventListener("change", () => {
    selectedCatIndex = parseInt(categorySelect.value, 10);
    resetForm();
    renderItems();
  });

  document.getElementById("btn-add-category").addEventListener("click", () => {
    const name = prompt("اسم القسم الجديد:");
    if (!name?.trim()) return;
    const icon = prompt("أيقونة (إيموجي):", "📋") || "📋";
    const id =
      "cat-" +
      name
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^\w\u0600-\u06FF-]/g, "")
        .toLowerCase() +
      "-" +
      Date.now().toString(36).slice(-4);

    flatMenu.categories.push({
      id,
      name: name.trim(),
      icon,
      items: [],
    });
    selectedCatIndex = flatMenu.categories.length - 1;
    renderCategories();
    renderItems();
    persist();
  });

  itemForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const cat = getCurrentCategory();
    const name = document.getElementById("item-name").value.trim();
    const price = parseInt(document.getElementById("item-price").value, 10);
    const description = document.getElementById("item-desc").value.trim();
    const section = document.getElementById("item-section").value.trim();

    if (!name || Number.isNaN(price)) return;

    const payload = {
      id: editItemId.value || uid(),
      name,
      price,
    };
    if (description) payload.description = description;
    if (section) payload._section = section;

    if (editItemId.value) {
      const idx = cat.items.findIndex((i) => i.id === editItemId.value);
      if (idx !== -1) cat.items[idx] = payload;
    } else {
      cat.items.push(payload);
    }

    resetForm();
    renderItems();
    persist();
  });

  btnCancelEdit.addEventListener("click", resetForm);

  itemsList.addEventListener("click", (e) => {
    const editId = e.target.dataset.edit;
    const deleteId = e.target.dataset.delete;
    if (editId) startEdit(editId);
    if (deleteId) {
      if (!confirm("حذف هذا الصنف؟")) return;
      const cat = getCurrentCategory();
      cat.items = cat.items.filter((i) => i.id !== deleteId);
      renderItems();
      persist();
    }
  });

  document.getElementById("btn-save").addEventListener("click", persist);

  document.getElementById("btn-export").addEventListener("click", () => {
    MenuStore.downloadJson(MenuStore.packMenu(flatMenu));
    showToast("تم تنزيل menu.json");
  });

  document.getElementById("btn-import").addEventListener("change", (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        menuData = JSON.parse(reader.result);
        flatMenu = MenuStore.flattenMenu(menuData);
        selectedCatIndex = 0;
        renderCategories();
        renderItems();
        persist();
        showToast("تم الاستيراد ✓");
      } catch {
        alert("ملف غير صالح");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  });

  document.getElementById("btn-reset").addEventListener("click", () => {
    if (!confirm("إعادة المنيو الأصلي؟ سيتم حذف التعديلات المحفوظة محلياً.")) return;
    MenuStore.clear();
    location.reload();
  });

  if (isAuthed()) {
    showApp();
    initData();
  }
})();
