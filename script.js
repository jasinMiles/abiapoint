// Abiapoint Week 2 (photographic redesign): component-style rendering + asynchronous JSON data.
// Components are small vanilla JS functions that receive data and return markup.
const DATA_URL = "./data/businesses.json";
const KNOWN_TOWNS = ["Aba", "Umuahia", "Ohafia", "Arochukwu", "Isiala Ngwa"];
// Approximate town-centre coordinates, used only by the "Near me" button.
const TOWN_COORDS = { "Aba": [5.1167, 7.3667], "Umuahia": [5.5249, 7.4943], "Ohafia": [5.6167, 7.8333], "Arochukwu": [5.3833, 7.9167], "Isiala Ngwa": [5.2300, 7.4200] };
// Fallback stock photos (Pexels) for community entries that have no photo of their own.
const PX = "https://images.pexels.com/photos/";
const CATEGORY_PHOTOS = {
  "Food & Drink": { image: `${PX}23490764/pexels-photo-23490764/free-photo-of-street-food-market-stand-with-vegetables-and-fruit-next-to-busy-street.jpeg`, imageAlt: "A street food market stand with vegetables and fruit", imagePage: "https://www.pexels.com/photo/23490764/" },
  "Fashion": { image: `${PX}33078826/pexels-photo-33078826/free-photo-of-tailor-meticulously-crafting-garments-in-workshop.jpeg`, imageAlt: "A tailor crafting garments in a workshop", imagePage: "https://www.pexels.com/photo/33078826/" },
  "Home Services": { image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e", imageAlt: "A man in a hard hat and safety goggles at a building site in Nigeria", imagePage: "https://unsplash.com/photos/_2AlIm-F6pw", imageCredit: "Emmanuel Ikwuegbu / Unsplash" },
  "Tech & Repairs": { image: `${PX}6755135/pexels-photo-6755135.jpeg`, imageAlt: "Hands repairing a circuit board", imagePage: "https://www.pexels.com/photo/6755135/" },
  "Health & Beauty": { image: `${PX}7697642/pexels-photo-7697642.jpeg`, imageAlt: "A barber giving a haircut", imagePage: "https://www.pexels.com/photo/7697642/" },
  "Professional Services": { image: "https://images.unsplash.com/photo-1544813813-2c73bec209ca", imageAlt: "A smiling man working on a laptop at a desk in an office in Lagos, Nigeria", imagePage: "https://unsplash.com/photos/wT-xJyLHcNA", imageCredit: "David Olubaji / Unsplash" },
  "Shopping": { image: `${PX}13583431/pexels-photo-13583431.jpeg`, imageAlt: "A colourful market stall with a vendor", imagePage: "https://www.pexels.com/photo/13583431/" }
};

const state = { businesses: [], userBusinesses: loadSavedBusinesses(), favourites: loadFavourites(), category: "All", loading: true, error: "", retryCount: 0, detailsId: null };
const $ = selector => document.querySelector(selector);
const els = {
  grid: $("#business-grid"), search: $("#search-input"), location: $("#location-filter"), sort: $("#sort-select"),
  count: $("#results-count"), empty: $("#empty-state"), loading: $("#loading-state"), error: $("#error-state"),
  dialog: $("#listing-dialog"), form: $("#listing-form"), toast: $("#toast"),
  details: $("#details-dialog"), credits: $("#credits-list")
};
let toastTimeout;

/* ---------- Storage helpers: blocked or malformed localStorage must never crash the app ---------- */
function readStorage(key) { try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; } }
function loadSavedBusinesses() { const v = readStorage("abiapoint-user-listings"); return Array.isArray(v) ? v.filter(i => i && i.id && i.name) : []; }
function loadFavourites() { const v = readStorage("abiapoint-favourites"); return Array.isArray(v) ? v : []; }
function saveStorage(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; } }

/* ---------- Small helpers ---------- */
function allBusinesses() { return [...state.businesses, ...state.userBusinesses]; }
function escapeHTML(value) { return String(value ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]); }
function photoFor(business) { return business.image ? business : { ...business, ...(CATEGORY_PHOTOS[business.category] || {}) }; }
function imageSrc(url, width = 800) { if (!url) return ""; const sep = url.includes("?") ? "&" : "?"; return url.includes("images.unsplash.com") ? `${url}${sep}auto=format&fit=crop&w=${width}&q=70` : `${url}${sep}auto=compress&cs=tinysrgb&w=${width}`; }
const sourceName = page => (page || "").includes("unsplash.com") ? "Unsplash" : "Pexels";
function showToast(message) { els.toast.textContent = message; els.toast.hidden = false; clearTimeout(toastTimeout); toastTimeout = setTimeout(() => { els.toast.hidden = true; }, 3600); }
const HEART = filled => `<svg viewBox="0 0 24 24" aria-hidden="true" fill="${filled ? "currentColor" : "none"}" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 21s-7.500-4.700-9.500-9.300C1.200 8.500 3 5 6.500 5c2 0 3.700 1.100 5.500 3.200C13.800 6.100 15.500 5 17.500 5 21 5 22.800 8.500 21.500 11.700 19.500 16.300 12 21 12 21z"/></svg>`;

/* ---------- Opening status (shown only for verified listings that have hours) ---------- */
function lagosNow() {
  const parts = Object.fromEntries(new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Lagos", weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(new Date()).map(p => [p.type, p.value]));
  return { day: { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[parts.weekday], mins: Number(parts.hour) * 60 + Number(parts.minute) };
}
const toMins = t => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
function formatTime(t) { const [h, m] = t.split(":").map(Number); return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`; }
function openStatus(business) {
  const hours = business.hours;
  if (!business.verified || !hours || !Array.isArray(hours.days) || !hours.open || !hours.close) return null;
  const { day, mins } = lagosNow();
  const open = hours.days.includes(day) && mins >= toMins(hours.open) && mins < toMins(hours.close);
  return open ? { open: true, label: `Open now · closes ${formatTime(hours.close)}` } : { open: false, label: "Closed now" };
}
function hoursText(business) {
  const h = business.hours; if (!h) return "";
  const names = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const days = [...h.days].sort(), range = days.length === 7 ? "Every day" : days.length > 1 && days[days.length - 1] - days[0] === days.length - 1 ? `${names[days[0]]}–${names[days[days.length - 1]]}` : days.map(d => names[d]).join(", ");
  return `${range}, ${formatTime(h.open)} – ${formatTime(h.close)}`;
}

/* ---------- Components ---------- */
// Component: photo area shared by cards and the details dialog.
function Photo(business) {
  const b = photoFor(business);
  return b.image ? `<img src="${escapeHTML(imageSrc(b.image))}" alt="${escapeHTML(b.imageAlt || "")} (stock photo)" loading="lazy" width="800" height="600">` : "";
}
// Component: one business card. Reused for every business record.
function BusinessCard(business) {
  const saved = state.favourites.includes(business.id), status = openStatus(business), hasPhoto = Boolean(photoFor(business).image);
  return `<article class="business-card">
    <div class="card-media ${hasPhoto ? "" : "no-photo"}">${Photo(business)}<span class="card-tag">${escapeHTML(business.category)}</span><span class="sample-label">${business.sample ? "Demo listing" : "Community entry"}</span>
      <button class="save-button" type="button" data-save="${escapeHTML(business.id)}" aria-label="${saved ? "Remove from favourites:" : "Save to favourites:"} ${escapeHTML(business.name)}" aria-pressed="${saved}">${HEART(saved)}</button>
    </div>
    <div class="card-body">
      <div class="card-meta-row">${status ? `<span class="status ${status.open ? "status-open" : "status-closed"}">${escapeHTML(status.label)}</span>` : ""}</div>
      <h3 class="card-title">${escapeHTML(business.name)}${business.verified ? `<span class="verified-badge">Verified</span>` : ""}</h3>
      <p class="card-location"><span aria-hidden="true">⌖</span> ${escapeHTML(business.location)}, Abia</p>
      <p class="card-description">${escapeHTML(business.description)}</p>
      <button class="card-link" type="button" data-details="${escapeHTML(business.id)}" aria-label="View details for ${escapeHTML(business.name)}">View details →</button>
    </div></article>`;
}
// Component: the list, built by reusing BusinessCard.
function BusinessList(items) { return items.map(BusinessCard).join(""); }
// Component: shared message panel used for loading and errors.
function StatusPanel({ title, message, action = "", actionId = "" }) {
  return `<span class="empty-icon" aria-hidden="true">${actionId === "retry-data" ? "↻" : "⌕"}</span><h3>${escapeHTML(title)}</h3><p>${escapeHTML(message)}</p>${action ? `<button class="button button-outline" id="${actionId}" type="button">${escapeHTML(action)}</button>` : ""}`;
}
// Component: skeleton cards shown while the JSON request is pending.
function SkeletonGrid(n = 3) { return `<p class="visually-hidden" style="position:absolute;left:-999px">Finding local businesses…</p><div class="skeleton-grid" aria-hidden="true">${'<div class="skeleton-card"></div>'.repeat(n)}</div>`; }

function updateStatusUI() {
  els.loading.hidden = !state.loading; els.loading.classList.toggle("is-loading", state.loading);
  els.error.hidden = !state.error;
  if (state.error) els.error.innerHTML = StatusPanel({ title: "We couldn't load the directory", message: state.error, action: "Try again", actionId: "retry-data" });
  els.grid.hidden = state.loading || Boolean(state.error) || els.grid.children.length === 0;
  els.empty.hidden = state.loading || Boolean(state.error) || els.grid.children.length > 0;
  if (state.loading) els.count.textContent = "Loading local listings…";
  else if (state.error) els.count.textContent = "Directory unavailable";
}

/* ---------- Data loading: fetch JSON, validate its shape, expose a retryable error ---------- */
async function loadBusinesses() {
  state.loading = true; state.error = ""; els.loading.innerHTML = SkeletonGrid(); updateStatusUI();
  try {
    const response = await fetch(`${DATA_URL}?attempt=${state.retryCount}`, { headers: { "Accept": "application/json" } });
    if (!response.ok) throw new Error(`The directory returned status ${response.status}.`);
    const payload = await response.json();
    if (!payload || !Array.isArray(payload.businesses)) throw new Error("The directory data format was not recognised.");
    state.businesses = payload.businesses.filter(i => i && ["id", "name", "category", "location", "description"].every(k => typeof i[k] === "string")).map(i => ({ ...i, sample: true }));
    if (payload.businesses.length && !state.businesses.length) throw new Error("No usable business records were found in the data file.");
    state.loading = false; renderBusinesses(); renderCredits();
  } catch (error) {
    state.loading = false;
    state.error = "Check your connection or run the project through a local web server, then retry. " + (error instanceof TypeError ? "The data file may be unavailable." : (error.message || "Unexpected error."));
    updateStatusUI();
  }
}

/* ---------- Filtering and rendering ---------- */
function getFilteredBusinesses() {
  const term = els.search.value.trim().toLocaleLowerCase();
  const list = allBusinesses().filter(b => {
    const haystack = [b.name, b.category, b.location, b.description].join(" ").toLocaleLowerCase();
    const loc = els.location.value;
    const locationMatch = loc === "all" || b.location === loc || (loc === "Other Abia" && !KNOWN_TOWNS.includes(b.location));
    return (!term || haystack.includes(term)) && locationMatch && (state.category === "All" || b.category === state.category);
  });
  if (els.sort.value === "name") list.sort((a, b) => a.name.localeCompare(b.name));
  else list.sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || a.name.localeCompare(b.name));
  return list;
}
function renderBusinesses() {
  if (state.loading || state.error) { updateStatusUI(); return; }
  const items = getFilteredBusinesses();
  els.grid.innerHTML = BusinessList(items);
  els.count.innerHTML = `Showing <strong>${items.length}</strong> ${items.length === 1 ? "business" : "businesses"}`;
  els.grid.hidden = items.length === 0; els.empty.hidden = items.length > 0;
  updateStatusUI();
}
function renderCredits() {
  const seen = new Map();
  [...state.businesses, { imageAlt: "Hero photo: market in Jos, Nigeria", imagePage: "https://www.pexels.com/photo/33624055/", imageCredit: "Pexels" }].forEach(b => { if (b.imagePage && !seen.has(b.imagePage)) seen.set(b.imagePage, [b.imageAlt, b.imageCredit || sourceName(b.imagePage)]); });
  els.credits.innerHTML = [...seen].map(([url, [alt, credit]]) => `<li><a href="${escapeHTML(url)}" target="_blank" rel="noopener">${escapeHTML(alt)}</a> · ${escapeHTML(credit)}</li>`).join("");
}
function setCategory(category) {
  state.category = category;
  document.querySelectorAll(".category-chip").forEach(btn => { const on = btn.dataset.category === category; btn.classList.toggle("selected", on); btn.setAttribute("aria-pressed", String(on)); });
  renderBusinesses();
}
function clearFilters() { els.search.value = ""; els.location.value = "all"; els.sort.value = "featured"; setCategory("All"); els.search.focus(); }

/* ---------- Favourites ---------- */
function toggleFavourite(id) {
  state.favourites = state.favourites.includes(id) ? state.favourites.filter(x => x !== id) : [...state.favourites, id];
  const stored = saveStorage("abiapoint-favourites", state.favourites);
  renderBusinesses();
  showToast(stored ? (state.favourites.includes(id) ? "Business saved to your favourites." : "Business removed from favourites.") : "Changed for this session, but browser storage is unavailable.");
}

/* ---------- Details dialog ---------- */
function openDetails(id, opener) {
  const business = allBusinesses().find(b => b.id === id); if (!business || typeof els.details.showModal !== "function") return;
  const b = photoFor(business), status = openStatus(business);
  state.detailsId = id;
  const media = $("#details-media"); media.className = `details-media ${b.image ? "" : "no-photo"}`; media.innerHTML = Photo(business);
  $("#details-category").textContent = business.category;
  $("#details-title").textContent = business.name;
  $("#details-status").textContent = status ? status.label : (business.verified ? "" : "Not yet verified");
  $("#details-description").textContent = business.description;
  const rows = [["Location", `${business.location}, Abia State`]];
  if (business.hours) rows.push(["Hours", hoursText(business)]);
  rows.push(["Contact", business.contact || "No contact details have been added."]);
  $("#details-list").innerHTML = rows.map(([k, v]) => `<dt>${escapeHTML(k)}</dt><dd>${escapeHTML(v)}</dd>`).join("");
  $("#details-credit").innerHTML = b.imagePage ? `Illustrative stock photo${b.imageCredit ? " by " + escapeHTML(b.imageCredit.split(" / ")[0]) : ""}: <a href="${escapeHTML(b.imagePage)}" target="_blank" rel="noopener">view on ${sourceName(b.imagePage)}</a>. It does not show this business.` : "";
  updateDetailsSave(); els.details.showModal();
}
function updateDetailsSave() { const saved = state.favourites.includes(state.detailsId); const btn = $("#details-save"); btn.textContent = saved ? "Saved ✓ (tap to remove)" : "Save to favourites"; btn.setAttribute("aria-pressed", String(saved)); }

/* ---------- Suggest-a-business form (unchanged behaviour) ---------- */
function openListingForm() { els.form.reset(); clearErrors(); $("#form-success").hidden = true; if (typeof els.dialog.showModal === "function") els.dialog.showModal(); else showToast("This browser does not support the listing dialog. Try a recent browser."); setTimeout(() => $("#business-name").focus(), 50); }
function clearErrors() { ["name", "category", "location", "description"].forEach(k => { $(`#business-${k}`)?.classList.remove("invalid-field"); const e = $(`#${k}-error`); if (e) e.textContent = ""; }); }
function setError(inputId, errorId, message) { $(`#${inputId}`).classList.add("invalid-field"); $(`#${errorId}`).textContent = message; }
function validateListing() {
  clearErrors(); let valid = true;
  if ($("#business-name").value.trim().length < 2) { setError("business-name", "name-error", "Enter a business name with at least 2 characters."); valid = false; }
  if (!$("#business-category").value) { setError("business-category", "category-error", "Choose a category."); valid = false; }
  if (!$("#business-location").value) { setError("business-location", "location-error", "Choose a location in Abia State."); valid = false; }
  if ($("#business-description").value.trim().length < 8) { setError("business-description", "description-error", "Add a short description (at least 8 characters)."); valid = false; }
  if (!valid) els.form.querySelector(".invalid-field")?.focus();
  return valid;
}

/* ---------- Location-aware search: pick the nearest Abia town from the device location ---------- */
function distanceKm([lat1, lon1], [lat2, lon2]) {
  const rad = x => x * Math.PI / 180, a = Math.sin(rad(lat2 - lat1) / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(rad(lon2 - lon1) / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(a));
}
function useMyLocation() {
  if (!navigator.geolocation) { showToast("Your browser can't share a location. Choose a town from the list instead."); return; }
  showToast("Finding the nearest Abia town…");
  navigator.geolocation.getCurrentPosition(pos => {
    const here = [pos.coords.latitude, pos.coords.longitude];
    const [town, km] = Object.entries(TOWN_COORDS).map(([name, c]) => [name, distanceKm(here, c)]).sort((a, b) => a[1] - b[1])[0];
    if (km > 80) { showToast("You seem to be outside Abia State. Choose a town from the list instead."); return; }
    els.location.value = town; renderBusinesses(); showToast(`Showing businesses near ${town}.`);
  }, () => showToast("Location permission was not granted. Choose a town from the list instead."), { timeout: 8000, maximumAge: 300000 });
}

/* ---------- Events ---------- */
$("#search-form").addEventListener("submit", e => { e.preventDefault(); renderBusinesses(); $("#explore").scrollIntoView({ behavior: "smooth", block: "start" }); });
els.search.addEventListener("input", renderBusinesses); els.location.addEventListener("change", renderBusinesses); els.sort.addEventListener("change", renderBusinesses);
$("#near-me").addEventListener("click", useMyLocation);
$("#category-filters").addEventListener("click", e => { const btn = e.target.closest("[data-category]"); if (btn) setCategory(btn.dataset.category); });
$("#clear-filters").addEventListener("click", clearFilters);
els.grid.addEventListener("click", e => {
  const save = e.target.closest("[data-save]"); if (save) { toggleFavourite(save.dataset.save); return; }
  const details = e.target.closest("[data-details]"); if (details) openDetails(details.dataset.details, details);
});
// Photos that fail to load (offline, blocked, removed) fall back to a plain green tile instead of a broken image.
document.addEventListener("error", e => { if (e.target.tagName === "IMG" && e.target.closest(".card-media, .details-media")) e.target.closest(".card-media, .details-media").classList.add("no-photo"); }, true);
document.addEventListener("click", e => { if (e.target.closest("#retry-data")) { state.retryCount++; loadBusinesses(); } });
["open-listing-top", "open-listing-hero", "open-listing-mid", "open-listing-bottom", "open-listing-mobile"].forEach(id => document.getElementById(id)?.addEventListener("click", openListingForm));
$("#close-dialog").addEventListener("click", () => els.dialog.close()); els.dialog.addEventListener("click", e => { if (e.target === els.dialog) els.dialog.close(); });
$("#details-close").addEventListener("click", () => els.details.close()); $("#details-done").addEventListener("click", () => els.details.close());
els.details.addEventListener("click", e => { if (e.target === els.details) els.details.close(); });
els.details.addEventListener("close", () => { renderBusinesses(); els.grid.querySelector(`[data-details="${CSS.escape(state.detailsId || "")}"]`)?.focus(); });
$("#details-save").addEventListener("click", () => { toggleFavourite(state.detailsId); updateDetailsSave(); });
els.form.addEventListener("submit", e => {
  e.preventDefault(); $("#form-success").hidden = true; if (!validateListing()) return;
  const category = $("#business-category").value;
  const business = { id: `user-${Date.now()}`, name: $("#business-name").value.trim(), category, location: $("#business-location").value, description: $("#business-description").value.trim(), contact: $("#business-contact").value.trim(), featured: false, sample: false };
  state.userBusinesses = [business, ...state.userBusinesses];
  const stored = saveStorage("abiapoint-user-listings", state.userBusinesses);
  els.search.value = ""; els.location.value = "all"; els.sort.value = "featured"; setCategory("All"); els.dialog.close();
  $("#explore").scrollIntoView({ behavior: "smooth", block: "start" });
  showToast(stored ? "Business added to your local demo directory." : "Business added for this session; browser storage is unavailable.");
});
const menuToggle = $("#menu-toggle"), mobileNav = $("#mobile-nav");
function setMenu(open) { mobileNav.hidden = !open; menuToggle.setAttribute("aria-expanded", String(open)); menuToggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation"); menuToggle.textContent = open ? "×" : "☰"; }
menuToggle.addEventListener("click", () => setMenu(mobileNav.hidden));
mobileNav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => setMenu(false)));
loadBusinesses();
