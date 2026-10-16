const seedBusinesses = [
  {id:"demo-1",name:"Ada's Kitchen",category:"Food & Drink",location:"Umuahia",description:"A sample listing for home-style meals, soups and lunch packs.",contact:"",icon:"🍲",visual:"visual-food",featured:true,sample:true},
  {id:"demo-2",name:"Thread & Needle Studio",category:"Fashion",location:"Aba",description:"A sample tailoring studio for alterations and made-to-measure outfits.",contact:"",icon:"🧵",visual:"visual-fashion",featured:true,sample:true},
  {id:"demo-3",name:"BrightFix Home Care",category:"Home Services",location:"Umuahia",description:"A sample home-services listing for basic maintenance and repairs.",contact:"",icon:"🪴",visual:"visual-home",featured:true,sample:true},
  {id:"demo-4",name:"CircuitCare Repairs",category:"Tech & Repairs",location:"Aba",description:"A sample device-support listing for phones and everyday electronics.",contact:"",icon:"🔧",visual:"visual-tech",featured:true,sample:true},
  {id:"demo-5",name:"Glow Corner Studio",category:"Health & Beauty",location:"Ohafia",description:"A sample beauty listing for grooming, styling and self-care services.",contact:"",icon:"✿",visual:"visual-beauty",featured:false,sample:true},
  {id:"demo-6",name:"Umuahia Creative Desk",category:"Professional Services",location:"Umuahia",description:"A sample creative service listing for flyers, branding and design.",contact:"",icon:"✦",visual:"visual-pro",featured:false,sample:true},
  {id:"demo-7",name:"Market Basket Supplies",category:"Shopping",location:"Isiala Ngwa",description:"A sample local shopping listing for household and everyday essentials.",contact:"",icon:"🧺",visual:"visual-home",featured:false,sample:true},
  {id:"demo-8",name:"Fresh Pot Express",category:"Food & Drink",location:"Aba",description:"A sample food listing for quick meals and take-away orders.",contact:"",icon:"🥘",visual:"visual-food",featured:false,sample:true},
  {id:"demo-9",name:"Ohafia Style House",category:"Fashion",location:"Ohafia",description:"A sample fashion listing for clothing, accessories and alterations.",contact:"",icon:"👗",visual:"visual-fashion",featured:false,sample:true}
];

const grid = document.querySelector("#business-grid");
const searchInput = document.querySelector("#search-input");
const locationFilter = document.querySelector("#location-filter");
const sortSelect = document.querySelector("#sort-select");
const countLabel = document.querySelector("#results-count");
const emptyState = document.querySelector("#empty-state");
const listingDialog = document.querySelector("#listing-dialog");
const listingForm = document.querySelector("#listing-form");
const toast = document.querySelector("#toast");
let activeCategory = "All";
let toastTimeout;

function loadSavedBusinesses() {
  try {
    const stored = JSON.parse(localStorage.getItem("abiapoint-user-listings") || "[]");
    return Array.isArray(stored) ? stored.filter(item => item && item.id && item.name) : [];
  } catch {
    return [];
  }
}
function loadFavourites() {
  try {
    const stored = JSON.parse(localStorage.getItem("abiapoint-favourites") || "[]");
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
}
let userBusinesses = loadSavedBusinesses();
let favourites = loadFavourites();

function allBusinesses() { return [...seedBusinesses, ...userBusinesses]; }
function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
  })[char]);
}
function categoryStyle(category) {
  const styles = {
    "Food & Drink":["visual-food","🍲"], "Fashion":["visual-fashion","🧵"],
    "Home Services":["visual-home","🪴"], "Tech & Repairs":["visual-tech","🔧"],
    "Health & Beauty":["visual-beauty","✿"], "Professional Services":["visual-pro","✦"],
    "Shopping":["visual-home","🧺"]
  };
  return styles[category] || ["visual-pro","✦"];
}
function getFilteredBusinesses() {
  const term = searchInput.value.trim().toLocaleLowerCase();
  let list = allBusinesses().filter(business => {
    const haystack = [business.name,business.category,business.location,business.description].join(" ").toLocaleLowerCase();
    const matchesTerm = !term || haystack.includes(term);
    const matchesLocation = locationFilter.value === "all" || business.location === locationFilter.value ||
      (locationFilter.value === "Other Abia" && !["Aba","Umuahia","Ohafia","Arochukwu","Isiala Ngwa"].includes(business.location));
    const matchesCategory = activeCategory === "All" || business.category === activeCategory;
    return matchesTerm && matchesLocation && matchesCategory;
  });
  if (sortSelect.value === "name") list.sort((a,b) => a.name.localeCompare(b.name));
  else list.sort((a,b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));
  return list;
}
function renderBusinesses() {
  const businesses = getFilteredBusinesses();
  countLabel.innerHTML = `Showing <strong>${businesses.length}</strong> ${businesses.length === 1 ? "business" : "businesses"}`;
  grid.innerHTML = businesses.map(business => {
    const [visual,defaultIcon] = categoryStyle(business.category);
    const isSaved = favourites.includes(business.id);
    const sampleBadge = business.sample ? '<span class="sample-label">DEMO LISTING</span>' : '<span class="sample-label">COMMUNITY ENTRY</span>';
    return `<article class="business-card">
      <div class="card-visual ${visual}">
        <span class="card-tag">${escapeHTML(business.category)}</span>
        <div class="visual-shape" aria-hidden="true">${escapeHTML(business.icon || defaultIcon)}</div>
        <button class="save-button" type="button" data-save="${escapeHTML(business.id)}" aria-label="${isSaved ? "Remove saved status for" : "Save"} ${escapeHTML(business.name)}" aria-pressed="${isSaved}">${isSaved ? "♥" : "♡"}</button>
      </div>
      <div class="card-body">
        <p class="card-category">${escapeHTML(business.category)}</p>
        <div class="card-title-row"><h3 class="card-title">${escapeHTML(business.name)}</h3>${sampleBadge}</div>
        <p class="card-description">${escapeHTML(business.description)}</p>
        <div class="card-meta"><span class="card-location"><span aria-hidden="true">⌖</span>${escapeHTML(business.location)}, Abia</span><button class="card-link" type="button" data-details="${escapeHTML(business.id)}">View details ↗</button></div>
      </div>
    </article>`;
  }).join("");
  emptyState.hidden = businesses.length > 0;
  grid.hidden = businesses.length === 0;
}
function showToast(message) {
  toast.textContent = message;
  toast.hidden = false;
  window.clearTimeout(toastTimeout);
  toastTimeout = window.setTimeout(() => { toast.hidden = true; }, 3200);
}
function setCategory(category) {
  activeCategory = category;
  document.querySelectorAll(".category-chip").forEach(button => {
    const selected = button.dataset.category === category;
    button.classList.toggle("selected", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
  renderBusinesses();
}
function openListingForm() {
  listingForm.reset();
  clearErrors();
  document.querySelector("#form-success").hidden = true;
  if (typeof listingDialog.showModal === "function") listingDialog.showModal();
  else showToast("Your browser does not support the listing dialog. Please try a recent browser.");
  window.setTimeout(() => document.querySelector("#business-name").focus(), 50);
}
function clearErrors() {
  ["name","category","location","description"].forEach(key => {
    const input = document.querySelector(`#business-${key}`);
    const error = document.querySelector(`#${key}-error`);
    if (input) input.classList.remove("invalid-field");
    if (error) error.textContent = "";
  });
}
function setError(inputId, errorId, message) {
  document.querySelector(`#${inputId}`).classList.add("invalid-field");
  document.querySelector(`#${errorId}`).textContent = message;
}
function validateListing() {
  clearErrors();
  let valid = true;
  const name = document.querySelector("#business-name");
  const category = document.querySelector("#business-category");
  const location = document.querySelector("#business-location");
  const description = document.querySelector("#business-description");
  if (name.value.trim().length < 2) { setError("business-name","name-error","Enter a business name with at least 2 characters."); valid = false; }
  if (!category.value) { setError("business-category","category-error","Choose a category."); valid = false; }
  if (!location.value) { setError("business-location","location-error","Choose a location in Abia State."); valid = false; }
  if (description.value.trim().length < 8) { setError("business-description","description-error","Add a short description (at least 8 characters)."); valid = false; }
  if (!valid) {
    const firstInvalid = listingForm.querySelector(".invalid-field");
    if (firstInvalid) firstInvalid.focus();
  }
  return valid;
}

document.querySelector("#search-form").addEventListener("submit", event => {
  event.preventDefault();
  renderBusinesses();
  document.querySelector("#explore").scrollIntoView({behavior:"smooth",block:"start"});
});
searchInput.addEventListener("input", renderBusinesses);
locationFilter.addEventListener("change", renderBusinesses);
sortSelect.addEventListener("change", renderBusinesses);
document.querySelector("#category-filters").addEventListener("click", event => {
  const button = event.target.closest("[data-category]");
  if (button) setCategory(button.dataset.category);
});
document.querySelector("#clear-filters").addEventListener("click", () => {
  searchInput.value = "";
  locationFilter.value = "all";
  sortSelect.value = "featured";
  setCategory("All");
  searchInput.focus();
});
grid.addEventListener("click", event => {
  const saveButton = event.target.closest("[data-save]");
  if (saveButton) {
    const id = saveButton.dataset.save;
    favourites = favourites.includes(id) ? favourites.filter(item => item !== id) : [...favourites,id];
    try { localStorage.setItem("abiapoint-favourites",JSON.stringify(favourites)); } catch {}
    renderBusinesses();
    showToast(favourites.includes(id) ? "Business saved to your favourites." : "Business removed from favourites.");
    return;
  }
  const detailsButton = event.target.closest("[data-details]");
  if (detailsButton) {
    const business = allBusinesses().find(item => item.id === detailsButton.dataset.details);
    if (!business) return;
    const contact = business.contact ? `\nContact: ${business.contact}` : "\nNo contact details have been added.";
    showToast(`${business.name} · ${business.location}, Abia${contact}`);
  }
});
["open-listing-top","open-listing-mid","open-listing-bottom","open-listing-mobile"].forEach(id => {
  const button = document.getElementById(id);
  if (button) button.addEventListener("click", openListingForm);
});
document.querySelector("#close-dialog").addEventListener("click", () => listingDialog.close());
listingDialog.addEventListener("click", event => {
  if (event.target === listingDialog) listingDialog.close();
});
listingForm.addEventListener("submit", event => {
  event.preventDefault();
  document.querySelector("#form-success").hidden = true;
  if (!validateListing()) return;
  const category = document.querySelector("#business-category").value;
  const [visual,icon] = categoryStyle(category);
  const business = {
    id:`user-${Date.now()}`,
    name:document.querySelector("#business-name").value.trim(),
    category,
    location:document.querySelector("#business-location").value,
    description:document.querySelector("#business-description").value.trim(),
    contact:document.querySelector("#business-contact").value.trim(),
    icon,visual,featured:false,sample:false
  };
  userBusinesses = [business,...userBusinesses];
  try { localStorage.setItem("abiapoint-user-listings",JSON.stringify(userBusinesses)); }
  catch { showToast("Added for this session, but browser storage is unavailable."); }
  searchInput.value = "";
  locationFilter.value = "all";
  sortSelect.value = "featured";
  setCategory("All");
  listingDialog.close();
  document.querySelector("#explore").scrollIntoView({behavior:"smooth",block:"start"});
  showToast("Business added to your local demo directory.");
});
const menuToggle = document.querySelector("#menu-toggle");
const mobileNav = document.querySelector("#mobile-nav");
menuToggle.addEventListener("click", () => {
  const willOpen = mobileNav.hidden;
  mobileNav.hidden = !willOpen;
  menuToggle.setAttribute("aria-expanded",String(willOpen));
  menuToggle.setAttribute("aria-label",willOpen ? "Close navigation" : "Open navigation");
  menuToggle.textContent = willOpen ? "×" : "☰";
});
mobileNav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
  mobileNav.hidden = true;
  menuToggle.setAttribute("aria-expanded","false");
  menuToggle.setAttribute("aria-label","Open navigation");
  menuToggle.textContent = "☰";
}));

renderBusinesses();
