import state from "../state.js";

// ================================================
// Data loaders — populate sub-menu items from API data
// ================================================

export function loadMovieCategories(categories) {
  while (state.moviesSubWrapper.firstChild) {
    state.moviesSubWrapper.removeChild(state.moviesSubWrapper.firstChild);
  }
  if (!categories || categories.length === 0) {
    var msg = document.createElement("div");
    msg.className = "no-results-msg";
    msg.style.cssText =
      "color: rgba(255,255,255,0.5); font-size: 1.4vw; padding: 3vw 1.5vw; text-align: center; width: 100%;";
    msg.textContent = "No results";
    state.moviesSubWrapper.appendChild(msg);
    state.moviesSubItems = [];
    state.moviesSubIndex = 0;
    console.log("[Movies] No categories available");
    return;
  }
  categories.forEach(function (cat, idx) {
    var item = document.createElement("div");
    item.className = "sub-item";
    if (idx === 0) item.classList.add("active");
    item.tabIndex = idx === 0 ? 0 : -1;
    item.dataset.categoryId = cat.id;
    item.innerHTML =
      '<span class="sub-icon">' +
      (cat.icon_src
        ? '<img src="' + cat.icon_src + '" style="width:100%;height:100%;object-fit:contain;">'
        : '<i class="fa-solid fa-film"></i>') +
      "</span>" + cat.category_name;
    state.moviesSubWrapper.appendChild(item);
  });
  state.moviesSubItems = Array.from(state.moviesSubMenu.querySelectorAll(".sub-item"));
  state.moviesSubIndex = 0;
  console.log("[Movies] Loaded", state.moviesSubItems.length, "category items");
}

export function loadVideoTutorialCategories(categories) {
  while (state.tutorialSubWrapper.firstChild) {
    state.tutorialSubWrapper.removeChild(state.tutorialSubWrapper.firstChild);
  }
  if (!categories || categories.length === 0) {
    var msg = document.createElement("div");
    msg.className = "no-results-msg";
    msg.style.cssText =
      "color: rgba(255,255,255,0.5); font-size: 1.4vw; padding: 3vw 1.5vw; text-align: center; width: 100%;";
    msg.textContent = "No tutorials";
    state.tutorialSubWrapper.appendChild(msg);
    state.tutorialSubItems = [];
    state.tutorialSubIndex = 0;
    return;
  }
  categories.forEach(function (cat, idx) {
    var item = document.createElement("div");
    item.className = "sub-item";
    if (idx === 0) item.classList.add("active");
    item.tabIndex = idx === 0 ? 0 : -1;
    item.dataset.categoryId = cat.id;
    item.innerHTML =
      '<span class="sub-icon">' +
      (cat.icon_src
        ? '<img src="' + cat.icon_src + '" style="width:100%;height:100%;object-fit:contain;">'
        : '<i class="fa-solid fa-video"></i>') +
      "</span>" + cat.category_name;
    state.tutorialSubWrapper.appendChild(item);
  });
  state.tutorialSubItems = Array.from(state.tutorialSubMenu.querySelectorAll(".sub-item"));
  state.tutorialSubIndex = 0;
  console.log("[Tutorials] Loaded", state.tutorialSubItems.length, "category items");
}

export function loadInternetCountries(countries) {
  while (state.countryWrapper.firstChild) {
    state.countryWrapper.removeChild(state.countryWrapper.firstChild);
  }
  countries.forEach(function (c) {
    var item = document.createElement("div");
    item.className = "country-item";
    item.tabIndex = -1;
    item.dataset.countryId = c.id;
    item.innerHTML =
      '<span class="country-icon">' +
      (c.flag
        ? '<img src="' + c.flag + '" style="width:100%;height:100%;object-fit:cover;border-radius:3px;">'
        : "") +
      "</span>" + c.name;
    state.countryWrapper.appendChild(item);
  });
  state.countryItems = Array.from(state.countrySubMenu.querySelectorAll(".country-item"));
}

export function loadNewsCountries(countries) {
  state.newsCountries = countries || [];
  while (state.newsCountryListWrapper.firstChild) {
    state.newsCountryListWrapper.removeChild(state.newsCountryListWrapper.firstChild);
  }
  state.newsCountryItems = [];
  state.newsCountryIndex = 0;

  countries.forEach(function (c) {
    var item = document.createElement("div");
    item.className = "dropdown-item";
    item.dataset.countryId = c.id;
    item.innerHTML =
      (c.flag
        ? '<img class="pub-icon" src="' + c.flag + '">'
        : '<i class="fa-solid fa-flag" style="width:1.8vw;text-align:center;"></i>') +
      " " + c.name;
    state.newsCountryListWrapper.appendChild(item);
  });
  state.newsCountryItems = Array.from(state.newsCountryListWrapper.querySelectorAll(".dropdown-item"));
}
