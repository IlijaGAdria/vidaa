import state from "../state.js";
import { fetchNewsFeed, fetchNewsFilters } from "../../api.js";
import { SCROLL_OFFSET } from "./constants.js";
import { moveFocus } from "./focusUtils.js";
import { minimizeMenu, expandMenu, hideChannelsSection, showChannelsSection, scrollMenuToSelected } from "./uiHelpers.js";

// ================================================
// News section
// ================================================

export function showNewsSection() {
  if (state.newsSection) state.newsSection.classList.add("visible");
}

export function hideNewsSection() {
  if (state.newsSection) state.newsSection.classList.remove("visible");
  hideNewsCountryList();
  hideNewsFilterList();
}

// ---- Card grid navigation (2 columns) ----

function getNewsCardAt(row, col) {
  var idx = row * 2 + col;
  return state.newsCards[idx] || null;
}

export function clearNewsCardFocus() {
  var card = getNewsCardAt(state.newsRowIndex, state.newsColIndex);
  if (card) card.classList.remove("active");
}

export function setNewsCardFocus() {
  var card = getNewsCardAt(state.newsRowIndex, state.newsColIndex);
  if (card) card.classList.add("active");
  scrollNewsGrid();
}

function scrollNewsGrid() {
  var topRow = Math.max(0, state.newsRowIndex - 1);
  var firstCard = getNewsCardAt(topRow, 0);
  if (firstCard && state.newsGrid) {
    state.newsGrid.style.transform = "translateY(" + (-firstCard.offsetTop) + "px)";
  }
}

export function moveNewsCardCol(direction) {
  var newCol = state.newsColIndex + direction;
  if (newCol < 0 || newCol > 1) return false;
  if (!getNewsCardAt(state.newsRowIndex, newCol)) return false;
  clearNewsCardFocus();
  state.newsColIndex = newCol;
  setNewsCardFocus();
  return true;
}

export function moveNewsCardRow(direction) {
  var totalRows = Math.ceil(state.newsCards.length / 2);
  var newRow = state.newsRowIndex + direction;
  if (newRow < 0 || newRow >= totalRows) return;
  if (!getNewsCardAt(newRow, state.newsColIndex)) {
    if (getNewsCardAt(newRow, 0)) {
      clearNewsCardFocus();
      state.newsRowIndex = newRow;
      state.newsColIndex = 0;
      setNewsCardFocus();
      return;
    }
    return;
  }
  clearNewsCardFocus();
  state.newsRowIndex = newRow;
  setNewsCardFocus();
}

// ---- Render cards ----

export function renderNewsCards(articles) {
  while (state.newsGrid.firstChild) {
    state.newsGrid.removeChild(state.newsGrid.firstChild);
  }
  state.newsCards = [];
  state.newsArticles = articles || [];

  if (!articles || articles.length === 0) {
    var empty = document.createElement("div");
    empty.style.cssText =
      "color: rgba(255,255,255,0.6); font-size: 2vw; padding: 2vw; text-align: center; grid-column: 1 / -1; display: flex; align-items: center; justify-content: center; height: 30vh;";
    empty.textContent = "No news available";
    state.newsGrid.appendChild(empty);
    return;
  }

  articles.forEach(function (article, idx) {
    var card = document.createElement("div");
    card.className = "news-card";
    if (idx === 0) card.classList.add("active");
    card.innerHTML =
      '<img class="news-card-img" src="' + (article.icon || "") + '" onerror="this.style.display=\'none\'">' +
      '<div class="news-card-overlay">' +
        '<div class="news-card-title">' + (article.title || "") + "</div>" +
        '<div class="news-card-footer">' +
          '<span class="news-card-date">' + (article.date || "") + "</span>" +
          (article.logo ? '<img class="news-card-logo" src="' + article.logo + '">' : "") +
        "</div>" +
      "</div>";
    state.newsGrid.appendChild(card);
    state.newsCards.push(card);
  });

  state.newsRowIndex = 0;
  state.newsColIndex = 0;
}

// ---- Dropdowns ----

export function showNewsCountryList() {
  if (!state.newsCountryList) return;
  var rect = state.newsCountryBtn.getBoundingClientRect();
  state.newsCountryList.style.top = (rect.bottom + 5) + "px";
  state.newsCountryList.style.left = rect.left + "px";
  state.newsCountryList.style.minWidth = rect.width + "px";
  state.newsCountryList.classList.add("visible");
  state.newsCountryItems.forEach(function (item, idx) {
    item.classList.remove("active");
    if (idx === state.newsCountryIndex) item.classList.add("active");
  });
}

export function hideNewsCountryList() {
  if (state.newsCountryList) state.newsCountryList.classList.remove("visible");
}

export function moveNewsCountryFocus(direction) {
  moveFocus({
    items: state.newsCountryItems,
    indexKey: "newsCountryIndex",
    wrapper: state.newsCountryListWrapper,
    direction: direction,
  });
}

export function showNewsFilterList() {
  if (!state.newsFilterList) return;
  var rect = state.newsFilterBtn.getBoundingClientRect();
  state.newsFilterList.style.top = (rect.bottom + 5) + "px";
  state.newsFilterList.style.left = rect.left + "px";
  state.newsFilterList.style.minWidth = rect.width + "px";
  state.newsFilterList.classList.add("visible");
  state.newsFilterItems.forEach(function (item, idx) {
    item.classList.remove("active");
    if (idx === state.newsFilterIndex) item.classList.add("active");
  });
}

export function hideNewsFilterList() {
  if (state.newsFilterList) state.newsFilterList.classList.remove("visible");
}

export function moveNewsFilterFocus(direction) {
  moveFocus({
    items: state.newsFilterItems,
    indexKey: "newsFilterIndex",
    wrapper: state.newsFilterListWrapper,
    direction: direction,
  });
}

export function loadNewsFilterOptions(countryId) {
  while (state.newsFilterListWrapper.firstChild) {
    state.newsFilterListWrapper.removeChild(state.newsFilterListWrapper.firstChild);
  }
  state.newsFilterItems = [];
  state.newsFilterIndex = 0;

  var allItem = document.createElement("div");
  allItem.className = "dropdown-item active";
  allItem.dataset.filterId = "";
  allItem.innerHTML = '<i class="fa-solid fa-globe" style="width:1.8vw;text-align:center;"></i> All';
  state.newsFilterListWrapper.appendChild(allItem);

  fetchNewsFilters({ country_id: countryId })
    .then(function (filters) {
      var list = Array.isArray(filters) ? filters : filters && filters.data ? filters.data : [];
      state.newsFilters = list;
      list.forEach(function (f) {
        var item = document.createElement("div");
        item.className = "dropdown-item";
        item.dataset.filterId = f.id;
        item.innerHTML =
          (f.icon
            ? '<img class="pub-icon" src="' + f.icon + '">'
            : '<i class="fa-solid fa-newspaper" style="width:1.8vw;text-align:center;"></i>') +
          " " + f.name;
        state.newsFilterListWrapper.appendChild(item);
      });
      state.newsFilterItems = Array.from(state.newsFilterListWrapper.querySelectorAll(".dropdown-item"));
      state.newsFilterBtn.querySelector("span").textContent = "Select Newspaper";
    })
    .catch(function (err) {
      console.error("[News] Failed to load filters:", err);
      state.newsFilterItems = Array.from(state.newsFilterListWrapper.querySelectorAll(".dropdown-item"));
    });
}

export function loadNewsFeedForCurrentSelection() {
  var countryId = state.newsSelectedCountryId;
  var filterId = state.newsSelectedFilterId;
  fetchNewsFeed({ country_id: countryId, filter_id: filterId })
    .then(function (response) {
      var articles = Array.isArray(response) ? response : response && response.data ? response.data : [];
      console.log("[News] Loaded", articles.length, "articles");
      renderNewsCards(articles);
    })
    .catch(function (err) {
      console.error("[News] Failed to load feed:", err);
      renderNewsCards([]);
    });
}

// ---- Preview (article detail) ----

export function showNewsPreview(index) {
  if (!state.newsArticles || state.newsArticles.length === 0) return;
  if (index < 0 || index >= state.newsArticles.length) return;
  state.newsPreviewIndex = index;
  var article = state.newsArticles[index];

  var preview = state.newsPreview || document.getElementById("news-preview");
  state.newsPreview = preview;

  var img = document.getElementById("news-preview-img");
  var title = document.getElementById("news-preview-title");
  var date = document.getElementById("news-preview-date");
  var logo = document.getElementById("news-preview-logo");
  var desc = document.getElementById("news-preview-desc");
  var counter = document.getElementById("news-preview-counter");
  var prevBtn = document.getElementById("news-prev-btn");
  var nextBtn = document.getElementById("news-next-btn");

  if (article.icon) { img.src = article.icon; img.style.display = ""; } else { img.style.display = "none"; }
  title.textContent = article.title || "";
  date.textContent = article.date || "";
  if (article.logo) { logo.src = article.logo; logo.style.display = ""; } else { logo.style.display = "none"; }
  desc.textContent = article.description || "";
  counter.textContent = (index + 1) + " / " + state.newsArticles.length;
  prevBtn.classList.toggle("active", index > 0);
  nextBtn.classList.toggle("active", index < state.newsArticles.length - 1);

  preview.classList.add("visible");
  state.focusMode = "newspreview";
}

export function hideNewsPreview() {
  var preview = state.newsPreview || document.getElementById("news-preview");
  if (preview) preview.classList.remove("visible");
}

export function slideNewsPreview(direction) {
  var newIdx = state.newsPreviewIndex + direction;
  if (newIdx < 0 || newIdx >= state.newsArticles.length) return;
  showNewsPreview(newIdx);
}

// ---- Entry / exit ----

export function enterNews() {
  minimizeMenu();
  scrollMenuToSelected();
  hideChannelsSection();
  showNewsSection();

  if (state.newsCountries.length > 0 && !state.newsSelectedCountryId) {
    var defaultCountry =
      state.newsCountries.find(function (c) { return c.name && c.name.toLowerCase() === "serbia"; }) ||
      state.newsCountries[0];
    state.newsSelectedCountryId = defaultCountry.id;
    state.newsCountryBtn.querySelector("span").textContent = defaultCountry.name;
    state.newsCountryIndex = state.newsCountries.indexOf(defaultCountry);
    if (state.newsCountryIndex < 0) state.newsCountryIndex = 0;
    loadNewsFilterOptions(defaultCountry.id);
    state.newsSelectedFilterId = "";
    loadNewsFeedForCurrentSelection();
  } else if (state.newsSelectedCountryId && state.newsCards.length === 0) {
    loadNewsFeedForCurrentSelection();
  }

  state.newsCountryBtn.classList.add("active");
  state.newsFilterBtn.classList.remove("active");
  state.focusMode = "newsdropdown";
  state.newsDropdownIndex = 0;
}

export function exitNews() {
  hideNewsSection();
  hideNewsPreview();
  expandMenu();
  showChannelsSection();
  state.newsCountryBtn.classList.remove("active");
  state.newsFilterBtn.classList.remove("active");
  clearNewsCardFocus();
  state.focusMode = "menu";
}
