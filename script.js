// Abiapoint Week 2: component-style rendering + asynchronous JSON data.
// Vanilla JS components are small rendering functions that receive data as arguments.
const DATA_URL = "./data/businesses.json";
const state = { businesses: [], userBusinesses: loadSavedBusinesses(), favourites: loadFavourites(), category: "All", loading: true, error: "", retryCount: 0 };
const els = {
  grid: document.querySelector("#business-grid"), search: document.querySelector("#search-input"),
  location: document.querySelector("#location-filter"), sort: document.querySelector("#sort-select"),
  count: document.querySelector("#results-count"), empty: document.querySelector("#empty-state"),
  loading: document.querySelector("#loading-state"), error: document.querySelector("#error-state"),
  dialog: document.querySelector("#listing-dialog"), form: document.querySelector("#listing-form"), toast: document.querySelector("#toast")
};
let toastTimeout;

// Storage helpers are defensive: malformed or blocked localStorage must not crash the app.
function readStorage(key) { try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; } }
function loadSavedBusinesses() { const value = readStorage("abiapoint-user-listings"); return Array.isArray(value) ? value.filter(item => item && item.id && item.name) : []; }
function loadFavourites() { const value = readStorage("abiapoint-favourites"); return Array.isArray(value) ? value : []; }
function saveStorage(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; } }
function allBusinesses() { return [...state.businesses, ...state.userBusinesses]; }
function escapeHTML(value) { return String(value ?? "").replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[char]); }
function categoryStyle(category) {
  const styles = {"Food & Drink":["visual-food","🍲"],"Fashion":["visual-fashion","🧵"],"Home Services":["visual-home","🪴"],"Tech & Repairs":["visual-tech","🔧"],"Health & Beauty":["visual-beauty","✿"],"Professional Services":["visual-pro","✦"],"Shopping":["visual-home","🧺"]};
  return styles[category] || ["visual-pro","✦"];
}

// Component: one business card. Reused for every business record.
function BusinessCard(business) {
  const [visual, defaultIcon] = categoryStyle(business.category);
  const saved = state.favourites.includes(business.id);
  const sourceLabel = business.sample ? "DEMO LISTING" : "COMMUNITY ENTRY";
  return `<article class="business-card">
    <div class="card-visual ${visual}"><span class="card-tag">${escapeHTML(business.category)}</span>
      <div class="visual-shape" aria-hidden="true">${escapeHTML(business.icon || defaultIcon)}</div>
      <button class="save-button" type="button" data-save="${escapeHTML(business.id)}" aria-label="${saved ? "Remove saved status for" : "Save"} ${escapeHTML(business.name)}" aria-pressed="${saved}">${saved ? "♥" : "♡"}</button>
    </div>
    <div class="card-body"><p class="card-category">${escapeHTML(business.category)}</p>
      <div class="card-title-row"><h3 class="card-title">${escapeHTML(business.name)}</h3><span class="sample-label">${sourceLabel}</span></div>
      <p class="card-description">${escapeHTML(business.description)}</p>
      <div class="card-meta"><span class="card-location"><span aria-hidden="true">⌖</span> ${escapeHTML(business.location)}, Abia</span><button class="card-link" type="button" data-details="${escapeHTML(business.id)}">View details ↗</button></div>
    </div></article>`;
}
// Component: shared message panel used for loading, errors, and no matches.
function StatusPanel({ title, message, action = "", actionId = "" }) {
  return `<div class="data-status"><span class="empty-icon" aria-hidden="true">${actionId === "retry-data" ? "↻" : "⌕"}</span><h3>${escapeHTML(title)}</h3><p>${escapeHTML(message)}</p>${action ? `<button class="button button-outline" id="${actionId}" type="button">${escapeHTML(action)}</button>` : ""}</div>`;
}
function showToast(message) { els.toast.textContent = message; els.toast.hidden = false; clearTimeout(toastTimeout); toastTimeout = setTimeout(() => { els.toast.hidden = true; }, 3200); }
function updateStatusUI() {
  els.loading.hidden = !state.loading;
  els.error.hidden = !state.error;
  if (state.error) els.error.innerHTML = StatusPanel({title:"We couldn't load the directory",message:state.error,action:"Try again",actionId:"retry-data"});
  els.grid.hidden = state.loading || Boolean(state.error) || els.grid.children.length === 0;
  els.empty.hidden = state.loading || Boolean(state.error) || els.grid.children.length > 0;
  if (state.loading) els.count.textContent = "Loading local listings…";
  else if (state.error) els.count.textContent = "Directory unavailable";
}

// Task 2.2: fetch JSON asynchronously, validate its shape, and expose retryable errors.
async function loadBusinesses() {
  state.loading = true; state.error = ""; updateStatusUI();
  els.loading.innerHTML = StatusPanel({title:"Finding local businesses…",message:"Please wait while Abiapoint loads the directory."});
  try {
    const response = await fetch(`${DATA_URL}?attempt=${state.retryCount}`, { headers: { "Accept": "application/json" } });
    if (!response.ok) throw new Error(`The directory returned status ${response.status}.`);
    const payload = await response.json();
    if (!payload || !Array.isArray(payload.businesses)) throw new Error("The directory data format was not recognised.");
    state.businesses = payload.businesses.filter(item => item && typeof item.id === "string" && typeof item.name === "string" && typeof item.category === "string" && typeof item.location === "string" && typeof item.description === "string").map(item => ({...item, sample: true}));
    if (payload.businesses.length && !state.businesses.length) throw new Error("No usable business records were found in the data file.");
    state.loading = false; state.error = ""; renderBusinesses();
  } catch (error) {
    state.loading = false;
    state.error = "Check your connection or run the project through a local web server, then retry. " + (error instanceof TypeError ? "The data file may be unavailable." : (error.message || "Unexpected error."));
    updateStatusUI();
  }
}
function getFilteredBusinesses() {
  const term = els.search.value.trim().toLocaleLowerCase();
  const list = allBusinesses().filter(b => {
    const haystack = [b.name,b.category,b.location,b.description].join(" ").toLocaleLowerCase();
    const locationMatch = els.location.value === "all" || b.location === els.location.value || (els.location.value === "Other Abia" && !["Aba","Umuahia","Ohafia","Arochukwu","Isiala Ngwa"].includes(b.location));
    return (!term || haystack.includes(term)) && locationMatch && (state.category === "All" || b.category === state.category);
  });
  if (els.sort.value === "name") list.sort((a,b) => a.name.localeCompare(b.name));
  else list.sort((a,b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || a.name.localeCompare(b.name));
  return list;
}
// Component: directory list. It owns only the markup; filters live in shared state/controls.
function BusinessList(items) { return items.map(BusinessCard).join(""); }
function renderBusinesses() {
  if (state.loading || state.error) { updateStatusUI(); return; }
  const businesses = getFilteredBusinesses();
  els.grid.innerHTML = BusinessList(businesses);
  els.count.innerHTML = `Showing <strong>${businesses.length}</strong> ${businesses.length === 1 ? "business" : "businesses"}`;
  els.grid.hidden = businesses.length === 0;
  els.empty.hidden = businesses.length > 0;
  updateStatusUI();
}
function setCategory(category) {
  state.category = category;
  document.querySelectorAll(".category-chip").forEach(button => {
    const selected = button.dataset.category === category;
    button.classList.toggle("selected", selected); button.setAttribute("aria-pressed", String(selected));
  });
  renderBusinesses();
}
function clearFilters() { els.search.value = ""; els.location.value = "all"; els.sort.value = "featured"; setCategory("All"); els.search.focus(); }

const listingDialog = els.dialog, listingForm = els.form;
function openListingForm() { listingForm.reset(); clearErrors(); document.querySelector("#form-success").hidden = true; if (typeof listingDialog.showModal === "function") listingDialog.showModal(); else showToast("This browser does not support the listing dialog. Try a recent browser."); setTimeout(() => document.querySelector("#business-name").focus(), 50); }
function clearErrors() { ["name","category","location","description"].forEach(key => { const input=document.querySelector(`#business-${key}`), error=document.querySelector(`#${key}-error`); if(input) input.classList.remove("invalid-field"); if(error) error.textContent=""; }); }
function setError(inputId,errorId,message) { document.querySelector(`#${inputId}`).classList.add("invalid-field"); document.querySelector(`#${errorId}`).textContent=message; }
function validateListing() {
  clearErrors(); let valid=true;
  const name=document.querySelector("#business-name"), category=document.querySelector("#business-category"), location=document.querySelector("#business-location"), description=document.querySelector("#business-description");
  if(name.value.trim().length<2){setError("business-name","name-error","Enter a business name with at least 2 characters.");valid=false;}
  if(!category.value){setError("business-category","category-error","Choose a category.");valid=false;}
  if(!location.value){setError("business-location","location-error","Choose a location in Abia State.");valid=false;}
  if(description.value.trim().length<8){setError("business-description","description-error","Add a short description (at least 8 characters).");valid=false;}
  if(!valid) listingForm.querySelector(".invalid-field")?.focus(); return valid;
}

document.querySelector("#search-form").addEventListener("submit", event => { event.preventDefault(); renderBusinesses(); document.querySelector("#explore").scrollIntoView({behavior:"smooth",block:"start"}); });
els.search.addEventListener("input",renderBusinesses); els.location.addEventListener("change",renderBusinesses); els.sort.addEventListener("change",renderBusinesses);
document.querySelector("#category-filters").addEventListener("click",event=>{const button=event.target.closest("[data-category]");if(button)setCategory(button.dataset.category);});
document.querySelector("#clear-filters").addEventListener("click",clearFilters);
els.grid.addEventListener("click",event=>{
  const saveButton=event.target.closest("[data-save]");
  if(saveButton){const id=saveButton.dataset.save;state.favourites=state.favourites.includes(id)?state.favourites.filter(item=>item!==id):[...state.favourites,id];const stored=saveStorage("abiapoint-favourites",state.favourites);renderBusinesses();showToast(stored?(state.favourites.includes(id)?"Business saved to your favourites.":"Business removed from favourites."):"Changed for this session, but browser storage is unavailable.");return;}
  const detailsButton=event.target.closest("[data-details]");
  if(detailsButton){const business=allBusinesses().find(item=>item.id===detailsButton.dataset.details);if(!business)return;showToast(`${business.name} · ${business.location}, Abia${business.contact?" · Contact: "+business.contact:" · No contact details have been added."}`);}
});
document.addEventListener("click",event=>{if(event.target.closest("#retry-data")){state.retryCount++;loadBusinesses();}});
["open-listing-top","open-listing-mid","open-listing-bottom","open-listing-mobile"].forEach(id=>document.getElementById(id)?.addEventListener("click",openListingForm));
document.querySelector("#close-dialog").addEventListener("click",()=>listingDialog.close()); listingDialog.addEventListener("click",event=>{if(event.target===listingDialog)listingDialog.close();});
listingForm.addEventListener("submit",event=>{
  event.preventDefault();document.querySelector("#form-success").hidden=true;if(!validateListing())return;
  const category=document.querySelector("#business-category").value,[visual,icon]=categoryStyle(category);
  const business={id:`user-${Date.now()}`,name:document.querySelector("#business-name").value.trim(),category,location:document.querySelector("#business-location").value,description:document.querySelector("#business-description").value.trim(),contact:document.querySelector("#business-contact").value.trim(),icon,visual,featured:false,sample:false};
  state.userBusinesses=[business,...state.userBusinesses];const stored=saveStorage("abiapoint-user-listings",state.userBusinesses);
  els.search.value="";els.location.value="all";els.sort.value="featured";setCategory("All");listingDialog.close();document.querySelector("#explore").scrollIntoView({behavior:"smooth",block:"start"});showToast(stored?"Business added to your local demo directory.":"Business added for this session; browser storage is unavailable.");
});
const menuToggle=document.querySelector("#menu-toggle"),mobileNav=document.querySelector("#mobile-nav");
menuToggle.addEventListener("click",()=>{const willOpen=mobileNav.hidden;mobileNav.hidden=!willOpen;menuToggle.setAttribute("aria-expanded",String(willOpen));menuToggle.setAttribute("aria-label",willOpen?"Close navigation":"Open navigation");menuToggle.textContent=willOpen?"×":"☰";});
mobileNav.querySelectorAll("a").forEach(link=>link.addEventListener("click",()=>{mobileNav.hidden=true;menuToggle.setAttribute("aria-expanded","false");menuToggle.setAttribute("aria-label","Open navigation");menuToggle.textContent="☰";}));
loadBusinesses();
