console.log("✅ script.js est bien chargé");

// 1) Adresse de base de l’API (ton back-end)
const API_BASE = "http://localhost:5678/api";
// 2) Variable qui stocke les projets récupérés
let works = [];
/**
* 3) Appeler l’API pour récupérer les projets
* - Requête GET sur /works
* - Transformation en JSON
* - Stockage dans works
* - Affichage avec renderGallery()
*/

function setupEditMode() {
  const token = localStorage.getItem("token");
  if (!token) return;

  // 1) login -> logout
  const loginLink = document.querySelector('nav a[href="login.html"]');
  if (loginLink) {
    loginLink.textContent = "logout";
    loginLink.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("token");
      window.location.href = "index.html";
    });
  }

  // 2) Cacher les filtres en mode édition (souvent demandé)
  const filters = document.querySelector(".filters");
  if (filters) filters.style.display = "none";

  // 3) Afficher un bandeau si tu l’as dans le HTML
  const editBanner = document.querySelector(".edit-banner");
  if (editBanner) editBanner.style.display = "flex";

  // 4) Afficher le bouton modifier si tu l’as dans le HTML
  const editBtn = document.querySelector(".edit-btn");
  if (editBtn) editBtn.style.display = "inline-flex";
} 

async function fetchWorks() {
    const response = await fetch(`${API_BASE}/works`);
    if (!response.ok) {
        throw new Error("Impossible de récupérer les projets (works).");
    }
    works = await response.json();
    renderGallery(works);
}
/**
* 4) Afficher les projets dans la page
* - On vide la galerie
* - On crée figure > img + figcaption pour chaque projet
* - On ajoute tout dans .gallery
*/
function renderGallery(works) {
    const gallery = document.querySelector(".gallery");
    console.log("gallery =", gallery);
    if (!gallery) return;
    gallery.innerHTML = "";
    works.forEach((work) => {
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
/**
* 5) Lancer automatiquement au chargement de la page
*/
document.addEventListener("DOMContentLoaded", async () => {
  try {
    setupEditMode();
    await fetchWorks();        // récupère works + affiche la galerie
    await fetchCategories();   // récupère categories + crée les boutons
  } catch (err) {
    console.error(err);
  }
});

// 6) Variable qui stocke les catégories récupérées
let categories = [];
/**
* Récupérer les catégories depuis l’API
* - GET /categories
* - Stockage dans categories
* - Création des boutons
*/
async function fetchCategories() {
console.log("✅ fetchCategories() appelé");
const response = await fetch(`${API_BASE}/categories`);
if (!response.ok) {
throw new Error("Impossible de récupérer les catégories.");
}
categories = await response.json();
console.log("categories =", categories);
createFilterButtons();
}
console.log("✅ createFilterButtons() appelé");
const filtersContainer = document.querySelector(".filters");
console.log("filtersContainer =", filtersContainer);
/**
* Créer les boutons de filtre dans la div .filters
* - Un bouton "Tous" (affiche tout)
* - Un bouton par catégorie (affiche uniquement cette catégorie)
*/
function createFilterButtons() {
const filtersContainer = document.querySelector(".filters");
if (!filtersContainer) return;
// On vide au cas où (si on réappelle la fonction)
filtersContainer.innerHTML = "";
// 1) Bouton "Tous"
const allBtn = document.createElement("button");
allBtn.textContent = "Tous";
allBtn.classList.add("filter-btn", "active"); // actif par défaut
allBtn.addEventListener("click", () => {
setActiveFilterButton(allBtn);
renderGallery(works); // on affiche tous les projets
});
filtersContainer.appendChild(allBtn);
// 2) Boutons des catégories
categories.forEach((cat) => {
const btn = document.createElement("button");
btn.textContent = cat.name;
btn.classList.add("filter-btn");
btn.addEventListener("click", () => {
setActiveFilterButton(btn);
// On filtre les projets selon la categoryId
const filteredWorks = works.filter((work) => work.categoryId === cat.id);
// On réaffiche uniquement ceux-là
renderGallery(filteredWorks);
});
filtersContainer.appendChild(btn);
});
}
/**
* Mettre à jour le bouton actif (visuel)
* - enlève la classe active de tous les boutons
* - ajoute active au bouton cliqué
*/
function setActiveFilterButton(activeBtn) {
const allButtons = document.querySelectorAll(".filter-btn");
allButtons.forEach((b) => b.classList.remove("active"));
activeBtn.classList.add("active");
}

// --- MODALE ---
function openModal() {
  const overlay = document.querySelector(".modal-overlay");
  if (!overlay) return;

  overlay.style.display = "flex";
  renderModalGallery(); // on remplit
}

function closeModal() {
  const overlay = document.querySelector(".modal-overlay");
  if (!overlay) return;

  overlay.style.display = "none";
}

async function renderModalGallery() {
  const modalGallery = document.querySelector(".modal-gallery");
  if (!modalGallery) return;

  modalGallery.innerHTML = "<p>Chargement...</p>";

  const response = await fetch(`${API_BASE}/works`);
  const worksForModal = await response.json();

  modalGallery.innerHTML = "";

  worksForModal.forEach((work) => {
    const item = document.createElement("div");
    item.classList.add("modal-item");

    const img = document.createElement("img");
    img.src = work.imageUrl;
    img.alt = work.title;

    item.appendChild(img);
    modalGallery.appendChild(item);
  });
}

// --- EVENTS ---
document.addEventListener("DOMContentLoaded", () => {
  const editBtn = document.querySelector(".edit-btn");
  const overlay = document.querySelector(".modal-overlay");
  const closeBtn = document.querySelector(".modal-close");

  console.log("editBtn =", editBtn);
  console.log("overlay =", overlay);
  console.log("closeBtn =", closeBtn);

  if (editBtn) {
    editBtn.addEventListener("click", openModal);
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", closeModal);
  }

  // clic sur le fond gris = ferme
  if (overlay) {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeModal();
    });
  }

  // ESC = ferme
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });
});

