console.log("✅ galerie.js chargé");

const API_BASE = "http://localhost:5678/api";

let works = [];
let categories = [];

/* =========================
   1) MODE ÉDITION
========================= */
function setupEditMode() {
  const token = localStorage.getItem("token");
  if (!token) return;

  // login -> logout
  const loginLink = document.querySelector('nav a[href="login.html"]');
  if (loginLink) {
    loginLink.textContent = "logout";
    loginLink.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("token");
      window.location.href = "index.html";
    });
  }

  const filters = document.querySelector(".filters");
  if (filters) filters.style.display = "none";

  const editBanner = document.querySelector(".edit-banner");
  if (editBanner) editBanner.style.display = "flex";

  const editBtn = document.querySelector(".edit-btn");
  if (editBtn) editBtn.style.display = "inline-flex";
}

/* =========================
   2) WORKS + GALLERIE
========================= */
async function fetchWorks() {
  const response = await fetch(`${API_BASE}/works`);
  if (!response.ok) throw new Error("Impossible de récupérer les projets.");
  works = await response.json();
  renderGallery(works);
}

function renderGallery(list) {
  const gallery = document.querySelector(".gallery");
  if (!gallery) return;

  gallery.innerHTML = "";
  list.forEach((work) => {
    const figure = document.createElement("figure");

    const img = document.createElement("img");
    img.src = work.imageUrl;
    img.alt = work.title;

    const figcaption = document.createElement("figcaption");
    figcaption.textContent = work.title;

    figure.appendChild(img);
    figure.appendChild(figcaption);
    gallery.appendChild(figure);
  });
}

/* =========================
   3) CATEGORIES + FILTRES
========================= */
async function fetchCategories() {
  const response = await fetch(`${API_BASE}/categories`);
  if (!response.ok) throw new Error("Impossible de récupérer les catégories.");
  categories = await response.json();
  createFilterButtons();
}

function createFilterButtons() {
  const filtersContainer = document.querySelector(".filters");
  if (!filtersContainer) return;

  filtersContainer.innerHTML = "";

  const allBtn = document.createElement("button");
  allBtn.textContent = "Tous";
  allBtn.classList.add("filter-btn", "active");
  allBtn.addEventListener("click", () => {
    setActiveFilterButton(allBtn);
    renderGallery(works);
  });
  filtersContainer.appendChild(allBtn);

  categories.forEach((cat) => {
    const btn = document.createElement("button");
    btn.textContent = cat.name;
    btn.classList.add("filter-btn");
    btn.addEventListener("click", () => {
      setActiveFilterButton(btn);
      const filtered = works.filter((w) => w.categoryId === cat.id);
      renderGallery(filtered);
    });
    filtersContainer.appendChild(btn);
  });
}

function setActiveFilterButton(activeBtn) {
  document.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
  activeBtn.classList.add("active");
}

/* =========================
   4) MODALE (OUVRIR/FERMER)
========================= */
function openModal() {
  const overlay = document.querySelector(".modal-overlay");
  if (!overlay) return;

  overlay.style.display = "flex";

  renderModalGallery();
  fillCategorySelect();
  bindAddWorkForm(); // ✅ on branche le submit ici (au bon moment)
}

function closeModal() {
  const overlay = document.querySelector(".modal-overlay");
  if (!overlay) return;
  overlay.style.display = "none";
}

/* =========================
   5) MODALE - GALLERIE
========================= */
async function renderModalGallery() {
  const modalGallery = document.querySelector(".modal-gallery");
  if (!modalGallery) return;

  modalGallery.innerHTML = "";

  works.forEach((work) => {
    const item = document.createElement("div");
    item.classList.add("modal-item");

    const img = document.createElement("img");
    img.src = work.imageUrl;
    img.alt = work.title;

    const trash = document.createElement("button");
    trash.classList.add("modal-trash");
    trash.type = "button";
    trash.textContent = "🗑";

    trash.addEventListener("click", async () => {
      await deleteWork(work.id);
    });

    item.appendChild(img);
    item.appendChild(trash);
    modalGallery.appendChild(item);
  });
}

async function deleteWork(id) {
  if (!confirm("Tu es sûr de vouloir supprimer ce projet ?")) return;

  const token = localStorage.getItem("token");
  if (!token) {
    alert("Tu dois être connecté pour supprimer.");
    return;
  }

  const response = await fetch(`${API_BASE}/works/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    alert("Suppression impossible.");
    return;
  }

  // refresh data + UI
  await fetchWorks();
  await renderModalGallery();
}

/* =========================
   6) AJOUT - CATEGORIES SELECT
========================= */
function fillCategorySelect() {
  const select = document.querySelector("#category");
  if (!select) return;

  select.innerHTML = "";
  categories.forEach((cat) => {
    const option = document.createElement("option");
    option.value = cat.id;
    option.textContent = cat.name;
    select.appendChild(option);
  });
}

/* =========================
   7) AJOUT - SUBMIT FORM
========================= */
function bindAddWorkForm() {
  const form = document.querySelector("#add-work-form");
  if (!form) return;

  // évite de rebrancher à chaque ouverture
  if (form.dataset.bound === "1") return;
  form.dataset.bound = "1";

  form.addEventListener("submit", handleAddWorkSubmit);
}

async function handleAddWorkSubmit(e) {
  e.preventDefault();

  const token = localStorage.getItem("token");
  if (!token) {
    alert("Tu dois être connecté.");
    return;
  }

  const form = e.target;
  const imageFile = form.querySelector("#image").files[0];
  const title = form.querySelector("#title").value.trim();
  const category = form.querySelector("#category").value;

  if (!imageFile || !title || !category) {
    alert("Merci de remplir tous les champs.");
    return;
  }

  const formData = new FormData();
  formData.append("image", imageFile);
  formData.append("title", title);
  formData.append("category", Number(category));

  const response = await fetch(`${API_BASE}/works`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  console.log("POST /works status =", response.status);

  if (!response.ok) {
    console.log("Erreur serveur =", await response.text());
    alert("Ajout échoué.");
    return;
  }

  // ✅ refresh data + UI
  await fetchWorks();         // recharge works depuis l'API (source de vérité)
  await renderModalGallery(); // met à jour la modale
  form.reset();
  closeModal();
}

/* =========================
   8) EVENTS INIT
========================= */
document.addEventListener("DOMContentLoaded", async () => {
  try {
    setupEditMode();
    await fetchCategories();
    await fetchWorks();

    const editBtn = document.querySelector(".edit-btn");
    const overlay = document.querySelector(".modal-overlay");
    const closeBtn = document.querySelector(".modal-close");

    if (editBtn) editBtn.addEventListener("click", openModal);
    if (closeBtn) closeBtn.addEventListener("click", closeModal);

    if (overlay) {
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) closeModal();
      });
    }

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeModal();
    });
  } catch (err) {
    console.error(err);
  }
});
