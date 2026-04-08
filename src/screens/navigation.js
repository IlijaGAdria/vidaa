import state from "./state.js";
import { playChannel, switchChannel, stopPlayer, togglePause, getCurrentChannel } from "./player.js";
import { fetchFavorites, addFavoriteChannel, removeFavoriteChannel, getM3uChannels, getRadios, getMovies, fetchNewsFeed, fetchNewsFilters, getVideoTutorials } from "../api.js";

// ================================================
// DOM Helpers
// ================================================

function hideChannelsSection() {
  var section = document.querySelector('.channels-section');
  if (section) section.classList.add('hidden');
}

function showChannelsSection() {
  var section = document.querySelector('.channels-section');
  if (section) section.classList.remove('hidden');
}

function minimizeMenu() {
  var menu = document.getElementById("menu");
  var channelsSection = document.querySelector(".channels-section");
  if (menu) menu.classList.add("minimized");
  if (channelsSection) channelsSection.classList.add("expanded");
}

function expandMenu() {
  var menu = document.getElementById("menu");
  var channelsSection = document.querySelector(".channels-section");
  if (menu) menu.classList.remove("minimized");
  if (channelsSection) channelsSection.classList.remove("expanded");
}

// ================================================
// Sub-menu
// ================================================

function showSubMenu() {
  if (state.subMenu) state.subMenu.classList.add("visible");
  state.subItems.forEach(function(item) {
    item.classList.remove("active");
    item.tabIndex = -1;
  });
  if (state.subItems[state.subIndex]) {
    state.subItems[state.subIndex].classList.add("active");
    state.subItems[state.subIndex].tabIndex = 0;
    var topIdx = Math.max(0, state.subIndex - 3);
    setTimeout(function() {
      state.subWrapper.style.transform = "translateY(" + (-state.subItems[topIdx].offsetTop) + "px)";
    }, 0);
  }
}

function hideSubMenu() {
  if (state.subMenu) state.subMenu.classList.remove("visible");
}

function moveSubFocus(direction) {
  if (state.subIndex + direction < 0 || state.subIndex + direction >= state.subItems.length) return;
  state.subItems[state.subIndex].tabIndex = -1;
  state.subItems[state.subIndex].classList.remove("active");
  state.subIndex += direction;
  state.subItems[state.subIndex].tabIndex = 0;
  state.subItems[state.subIndex].classList.add("active");
  var topIdx = Math.max(0, state.subIndex - 3);
  state.subWrapper.style.transform = "translateY(" + (-state.subItems[topIdx].offsetTop) + "px)";
}

// ================================================
// Radio sub-menu
// ================================================

function showRadioSubMenu() {
  if (state.radioSubMenu) state.radioSubMenu.classList.add("visible");
  state.radioSubItems.forEach(function(item) {
    item.classList.remove("active");
    item.tabIndex = -1;
  });
  if (state.radioSubItems[state.radioSubIndex]) {
    state.radioSubItems[state.radioSubIndex].classList.add("active");
    state.radioSubItems[state.radioSubIndex].tabIndex = 0;
  }
}

function hideRadioSubMenu() {
  if (state.radioSubMenu) state.radioSubMenu.classList.remove("visible");
}

function moveRadioSubFocus(direction) {
  if (state.radioSubIndex + direction < 0 || state.radioSubIndex + direction >= state.radioSubItems.length) return;
  state.radioSubItems[state.radioSubIndex].tabIndex = -1;
  state.radioSubItems[state.radioSubIndex].classList.remove("active");
  state.radioSubIndex += direction;
  state.radioSubItems[state.radioSubIndex].tabIndex = 0;
  state.radioSubItems[state.radioSubIndex].classList.add("active");
}

// ================================================
// Favorites sub-menu
// ================================================

function showFavSubMenu() {
  if (state.favSubMenu) state.favSubMenu.classList.add("visible");
  state.favSubItems.forEach(function(item) {
    item.classList.remove("active");
    item.tabIndex = -1;
  });
  if (state.favSubItems[state.favSubIndex]) {
    state.favSubItems[state.favSubIndex].classList.add("active");
    state.favSubItems[state.favSubIndex].tabIndex = 0;
  }
}

function hideFavSubMenu() {
  if (state.favSubMenu) state.favSubMenu.classList.remove("visible");
}

function moveFavSubFocus(direction) {
  if (state.favSubIndex + direction < 0 || state.favSubIndex + direction >= state.favSubItems.length) return;
  state.favSubItems[state.favSubIndex].tabIndex = -1;
  state.favSubItems[state.favSubIndex].classList.remove("active");
  state.favSubIndex += direction;
  state.favSubItems[state.favSubIndex].tabIndex = 0;
  state.favSubItems[state.favSubIndex].classList.add("active");
}

// ================================================
// Movies sub-menu
// ================================================

function showMoviesSubMenu() {
  if (state.moviesSubMenu) state.moviesSubMenu.classList.add("visible");
  state.moviesSubItems.forEach(function(item) {
    item.classList.remove("active");
    item.tabIndex = -1;
  });
  var idx = state.moviesSubIndex || 0;
  if (idx >= state.moviesSubItems.length) idx = 0;
  state.moviesSubIndex = idx;
  if (state.moviesSubItems[idx]) {
    state.moviesSubItems[idx].classList.add("active");
    state.moviesSubItems[idx].tabIndex = 0;
    var topIdx = Math.max(0, idx - 3);
    state.moviesSubWrapper.style.transform = "translateY(" + (-state.moviesSubItems[topIdx].offsetTop) + "px)";
  }
}

function hideMoviesSubMenu() {
  if (state.moviesSubMenu) state.moviesSubMenu.classList.remove("visible");
}

function moveMoviesSubFocus(direction) {
  if (state.moviesSubIndex + direction < 0 || state.moviesSubIndex + direction >= state.moviesSubItems.length) return;
  state.moviesSubItems[state.moviesSubIndex].tabIndex = -1;
  state.moviesSubItems[state.moviesSubIndex].classList.remove("active");
  state.moviesSubIndex += direction;
  state.moviesSubItems[state.moviesSubIndex].tabIndex = 0;
  state.moviesSubItems[state.moviesSubIndex].classList.add("active");
  var topIdx = Math.max(0, state.moviesSubIndex - 3);
  state.moviesSubWrapper.style.transform = "translateY(" + (-state.moviesSubItems[topIdx].offsetTop) + "px)";
}

// ================================================
// News section
// ================================================

function showNewsSection() {
  if (state.newsSection) state.newsSection.classList.add("visible");
}

function hideNewsSection() {
  if (state.newsSection) state.newsSection.classList.remove("visible");
  hideNewsCountryList();
  hideNewsFilterList();
}

// News card grid navigation (2 columns)
function getNewsCardAt(row, col) {
  var idx = row * 2 + col;
  return state.newsCards[idx] || null;
}

function clearNewsCardFocus() {
  var card = getNewsCardAt(state.newsRowIndex, state.newsColIndex);
  if (card) card.classList.remove("active");
}

function setNewsCardFocus() {
  var card = getNewsCardAt(state.newsRowIndex, state.newsColIndex);
  if (card) card.classList.add("active");
  scrollNewsGrid();
}

function scrollNewsGrid() {
  // Scroll so the current row is visible (show 2 rows at a time)
  var topRow = Math.max(0, state.newsRowIndex - 1);
  var firstCard = getNewsCardAt(topRow, 0);
  if (firstCard && state.newsGrid) {
    state.newsGrid.style.transform = "translateY(" + (-firstCard.offsetTop) + "px)";
  }
}

function moveNewsCardCol(direction) {
  var newCol = state.newsColIndex + direction;
  if (newCol < 0 || newCol > 1) return false;
  if (!getNewsCardAt(state.newsRowIndex, newCol)) return false;
  clearNewsCardFocus();
  state.newsColIndex = newCol;
  setNewsCardFocus();
  return true;
}

function moveNewsCardRow(direction) {
  var totalRows = Math.ceil(state.newsCards.length / 2);
  var newRow = state.newsRowIndex + direction;
  if (newRow < 0 || newRow >= totalRows) return;
  if (!getNewsCardAt(newRow, state.newsColIndex)) {
    // Try col 0 if current col doesn't exist in new row
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

function renderNewsCards(articles) {
  // Clear grid
  while (state.newsGrid.firstChild) {
    state.newsGrid.removeChild(state.newsGrid.firstChild);
  }
  state.newsCards = [];
  state.newsArticles = articles || [];

  if (!articles || articles.length === 0) {
    var empty = document.createElement("div");
    empty.style.cssText = "color: rgba(255,255,255,0.6); font-size: 2vw; padding: 2vw; text-align: center; grid-column: 1 / -1; display: flex; align-items: center; justify-content: center; height: 30vh;";
    empty.textContent = "No news available";
    state.newsGrid.appendChild(empty);
    return;
  }

  articles.forEach(function(article, idx) {
    var card = document.createElement("div");
    card.className = "news-card";
    if (idx === 0) card.classList.add("active");
    card.innerHTML =
      '<img class="news-card-img" src="' + (article.icon || "") + '" onerror="this.style.display=\'none\'">' +
      '<div class="news-card-overlay">' +
        '<div class="news-card-title">' + (article.title || "") + '</div>' +
        '<div class="news-card-footer">' +
          '<span class="news-card-date">' + (article.date || "") + '</span>' +
          (article.logo ? '<img class="news-card-logo" src="' + article.logo + '">' : '') +
        '</div>' +
      '</div>';
    state.newsGrid.appendChild(card);
    state.newsCards.push(card);
  });

  state.newsRowIndex = 0;
  state.newsColIndex = 0;
}

// News dropdown - country
function showNewsCountryList() {
  if (!state.newsCountryList) return;
  // Position below the country button
  var rect = state.newsCountryBtn.getBoundingClientRect();
  state.newsCountryList.style.top = (rect.bottom + 5) + "px";
  state.newsCountryList.style.left = rect.left + "px";
  state.newsCountryList.style.minWidth = rect.width + "px";
  state.newsCountryList.classList.add("visible");
  // Set focus on current item
  state.newsCountryItems.forEach(function(item, idx) {
    item.classList.remove("active");
    if (idx === state.newsCountryIndex) item.classList.add("active");
  });
}

function hideNewsCountryList() {
  if (state.newsCountryList) state.newsCountryList.classList.remove("visible");
}

function moveNewsCountryFocus(direction) {
  if (state.newsCountryIndex + direction < 0 || state.newsCountryIndex + direction >= state.newsCountryItems.length) return;
  state.newsCountryItems[state.newsCountryIndex].classList.remove("active");
  state.newsCountryIndex += direction;
  state.newsCountryItems[state.newsCountryIndex].classList.add("active");
  var topIdx = Math.max(0, state.newsCountryIndex - 3);
  state.newsCountryListWrapper.style.transform = "translateY(" + (-state.newsCountryItems[topIdx].offsetTop) + "px)";
}

// News dropdown - filter/publisher
function showNewsFilterList() {
  if (!state.newsFilterList) return;
  var rect = state.newsFilterBtn.getBoundingClientRect();
  state.newsFilterList.style.top = (rect.bottom + 5) + "px";
  state.newsFilterList.style.left = rect.left + "px";
  state.newsFilterList.style.minWidth = rect.width + "px";
  state.newsFilterList.classList.add("visible");
  state.newsFilterItems.forEach(function(item, idx) {
    item.classList.remove("active");
    if (idx === state.newsFilterIndex) item.classList.add("active");
  });
}

function hideNewsFilterList() {
  if (state.newsFilterList) state.newsFilterList.classList.remove("visible");
}

function moveNewsFilterFocus(direction) {
  if (state.newsFilterIndex + direction < 0 || state.newsFilterIndex + direction >= state.newsFilterItems.length) return;
  state.newsFilterItems[state.newsFilterIndex].classList.remove("active");
  state.newsFilterIndex += direction;
  state.newsFilterItems[state.newsFilterIndex].classList.add("active");
  var topIdx = Math.max(0, state.newsFilterIndex - 3);
  state.newsFilterListWrapper.style.transform = "translateY(" + (-state.newsFilterItems[topIdx].offsetTop) + "px)";
}

function loadNewsFilterOptions(countryId) {
  // Clear existing
  while (state.newsFilterListWrapper.firstChild) {
    state.newsFilterListWrapper.removeChild(state.newsFilterListWrapper.firstChild);
  }
  state.newsFilterItems = [];
  state.newsFilterIndex = 0;

  // Add "All" option
  var allItem = document.createElement("div");
  allItem.className = "dropdown-item active";
  allItem.dataset.filterId = "";
  allItem.innerHTML = '<i class="fa-solid fa-globe" style="width:1.8vw;text-align:center;"></i> All';
  state.newsFilterListWrapper.appendChild(allItem);

  fetchNewsFilters({ country_id: countryId }).then(function(filters) {
    var list = Array.isArray(filters) ? filters : (filters && filters.data ? filters.data : []);
    state.newsFilters = list;
    list.forEach(function(f) {
      var item = document.createElement("div");
      item.className = "dropdown-item";
      item.dataset.filterId = f.id;
      item.innerHTML = (f.icon ? '<img class="pub-icon" src="' + f.icon + '">' : '<i class="fa-solid fa-newspaper" style="width:1.8vw;text-align:center;"></i>') +
        ' ' + f.name;
      state.newsFilterListWrapper.appendChild(item);
    });
    state.newsFilterItems = Array.from(state.newsFilterListWrapper.querySelectorAll(".dropdown-item"));
    // Update dropdown button text
    state.newsFilterBtn.querySelector("span").textContent = "Select Newspaper";
  }).catch(function(err) {
    console.error("[News] Failed to load filters:", err);
    state.newsFilterItems = Array.from(state.newsFilterListWrapper.querySelectorAll(".dropdown-item"));
  });
}

function loadNewsFeedForCurrentSelection() {
  var countryId = state.newsSelectedCountryId;
  var filterId = state.newsSelectedFilterId;
  fetchNewsFeed({ country_id: countryId, filter_id: filterId }).then(function(response) {
    var articles = Array.isArray(response) ? response : (response && response.data ? response.data : []);
    console.log("[News] Loaded", articles.length, "articles");
    renderNewsCards(articles);
  }).catch(function(err) {
    console.error("[News] Failed to load feed:", err);
    renderNewsCards([]);
  });
}

// ================================================
// Search Section
// ================================================

var searchKB = {
  container: null,
  rows: [],
  rowIndex: 0,
  colIndex: 0,
  capsLock: false,
  layouts: {
    lower: [
      ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
      ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
      ["a", "s", "d", "f", "g", "h", "j", "k", "l", "@"],
      ["z", "x", "c", "v", "b", "n", "m", ".", "-", "_"],
      ["⇧", "SPACE", "⌫", "CLEAR", "DONE"],
    ],
    upper: [
      ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
      ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
      ["A", "S", "D", "F", "G", "H", "J", "K", "L", "@"],
      ["Z", "X", "C", "V", "B", "N", "M", ".", "-", "_"],
      ["⇧", "SPACE", "⌫", "CLEAR", "DONE"],
    ],
  },
};

function injectSearchKBStyles() {
  if (document.getElementById("vk-styles")) return;
  var style = document.createElement("style");
  style.id = "vk-styles";
  style.textContent =
    ".vk-overlay {" +
    "  position: fixed; bottom: 0; left: 0; width: 100vw;" +
    "  display: none; justify-content: center; z-index: 500;" +
    "  background: linear-gradient(to top, rgba(10,15,25,0.98) 60%, rgba(10,15,25,0.85));" +
    "  padding: 1.5vw 0 2vw; transition: opacity 0.2s;" +
    "}" +
    ".vk-overlay.visible { display: flex; }" +
    ".vk-board {" +
    "  display: flex; flex-direction: column; align-items: center; gap: 0.6vw;" +
    "}" +
    ".vk-row { display: flex; gap: 0.5vw; }" +
    ".vk-key {" +
    "  min-width: 4vw; height: 4vw; display: flex; align-items: center;" +
    "  justify-content: center; border-radius: 0.5vw; font-size: 1.4vw;" +
    "  color: #fff; background: rgba(255,255,255,0.1); cursor: pointer;" +
    "  transition: background 0.15s, transform 0.1s; user-select: none;" +
    "}" +
    ".vk-key.active { background: #00b9be; transform: scale(1.1); }" +
    ".vk-key.wide { min-width: 8vw; font-size: 1.1vw; }" +
    ".vk-key.space { min-width: 16vw; }" +
    ".vk-input-preview {" +
    "  color: #fff; font-size: 1.3vw; margin-bottom: 0.8vw; text-align: center;" +
    "  background: rgba(255,255,255,0.08); padding: 0.7vw 2vw; border-radius: 0.4vw;" +
    "  min-width: 30vw; min-height: 2.4vw; letter-spacing: 0.05vw;" +
    "}";
  document.head.appendChild(style);
}

function buildSearchKeyboard() {
  injectSearchKBStyles();
  if (searchKB.container) {
    searchKB.container.parentNode.removeChild(searchKB.container);
  }
  var overlay = document.createElement("div");
  overlay.className = "vk-overlay";
  overlay.id = "search-keyboard";

  var board = document.createElement("div");
  board.className = "vk-board";

  // Preview bar showing current query
  var preview = document.createElement("div");
  preview.className = "vk-input-preview";
  preview.id = "search-kb-preview";
  preview.textContent = "";
  board.appendChild(preview);

  var layout = searchKB.capsLock ? searchKB.layouts.upper : searchKB.layouts.lower;
  searchKB.rows = [];

  layout.forEach(function(rowKeys) {
    var row = document.createElement("div");
    row.className = "vk-row";
    rowKeys.forEach(function(key) {
      var el = document.createElement("div");
      el.className = "vk-key";
      el.dataset.key = key;
      if (key === "SPACE") { el.classList.add("wide", "space"); el.textContent = "␣"; }
      else if (key === "⌫") { el.classList.add("wide"); el.textContent = "⌫"; }
      else if (key === "CLEAR") { el.classList.add("wide"); el.textContent = "CLR"; }
      else if (key === "DONE") { el.classList.add("wide"); el.textContent = "DONE"; }
      else if (key === "⇧") { el.classList.add("wide"); el.textContent = "⇧"; }
      else { el.textContent = key; }
      row.appendChild(el);
    });
    board.appendChild(row);
    searchKB.rows.push(Array.from(row.querySelectorAll(".vk-key")));
  });

  overlay.appendChild(board);
  document.body.appendChild(overlay);
  searchKB.container = overlay;
}

function showSearchKeyboard() {
  if (!searchKB.container) buildSearchKeyboard();
  searchKB.container.classList.add("visible");
  searchKB.rowIndex = 0;
  searchKB.colIndex = 0;
  searchKB.capsLock = false;
  setSearchKeyFocus();
  updateSearchKBPreview();
}

function hideSearchKeyboard() {
  if (searchKB.container) searchKB.container.classList.remove("visible");
}

function setSearchKeyFocus() {
  // Clear all
  searchKB.rows.forEach(function(row) {
    row.forEach(function(k) { k.classList.remove("active"); });
  });
  var row = searchKB.rows[searchKB.rowIndex];
  if (row && row[searchKB.colIndex]) {
    row[searchKB.colIndex].classList.add("active");
  }
}

function updateSearchKBPreview() {
  var el = document.getElementById("search-kb-preview");
  if (el) el.textContent = state.searchQuery || "";
}

function searchKBPressKey(key) {
  if (key === "⇧") {
    searchKB.capsLock = !searchKB.capsLock;
    // Rebuild with new layout
    var wasRow = searchKB.rowIndex;
    var wasCol = searchKB.colIndex;
    buildSearchKeyboard();
    searchKB.container.classList.add("visible");
    searchKB.rowIndex = wasRow;
    searchKB.colIndex = wasCol;
    setSearchKeyFocus();
    return;
  }
  if (key === "SPACE") {
    state.searchQuery = (state.searchQuery || "") + " ";
  } else if (key === "⌫") {
    state.searchQuery = (state.searchQuery || "").slice(0, -1);
  } else if (key === "CLEAR") {
    state.searchQuery = "";
  } else if (key === "DONE") {
    hideSearchKeyboard();
    // Move to results if any
    if (state.searchResultItems && state.searchResultItems.length > 0) {
      state.searchInputBox.classList.remove("active");
      state.focusMode = "searchresults";
    } else {
      state.focusMode = "searchinput";
      state.searchInputBox.classList.add("active");
    }
    return;
  } else if (key.length === 1) {
    state.searchQuery = (state.searchQuery || "") + key;
  }
  updateSearchDisplay();
  updateSearchKBPreview();
  performSearch();
}

function showSearchSection() {
  if (state.searchSection) state.searchSection.classList.add("visible");
}

function hideSearchSection() {
  if (state.searchSection) state.searchSection.classList.remove("visible");
}

function enterSearch() {
  minimizeMenu();
  setTimeout(function() {
    var topIndex = Math.max(0, state.selectedIndex - 3);
    state.wrapper.style.transform = "translateY(" + (-state.items[topIndex].offsetTop) + "px)";
  }, 0);
  hideChannelsSection();
  showSearchSection();

  // Reset search state
  state.searchQuery = "";
  state.searchResultIndex = 0;
  updateSearchDisplay();
  renderSearchResults([]);

  // Show virtual keyboard immediately
  if (state.searchInputBox) state.searchInputBox.classList.add("active");
  showSearchKeyboard();
  state.focusMode = "searchkeyboard";
}

function exitSearch() {
  hideSearchKeyboard();
  hideSearchSection();
  if (state.searchInputBox) state.searchInputBox.classList.remove("active");
  state.searchQuery = "";
  updateSearchDisplay();
  expandMenu();
  showChannelsSection();
  state.focusMode = "menu";
}

function updateSearchDisplay() {
  var textEl = document.getElementById("search-text");
  if (!textEl) return;
  if (state.searchQuery && state.searchQuery.length > 0) {
    textEl.textContent = state.searchQuery;
    textEl.classList.remove("placeholder");
  } else {
    textEl.textContent = "Search TV channels...";
    textEl.classList.add("placeholder");
  }
}

function performSearch() {
  var query = (state.searchQuery || "").toLowerCase().trim();
  if (query.length === 0) {
    renderSearchResults([]);
    return;
  }
  var results = (state.channelsData || []).filter(function(ch) {
    if (ch.category_ids && ch.category_ids.indexOf(9) !== -1) return false;
    var name = (ch.name || "").toLowerCase();
    return name.indexOf(query) !== -1;
  });
  renderSearchResults(results);
}

function renderSearchResults(channels) {
  var list = state.searchResultsList;
  if (!list) return;
  while (list.firstChild) list.removeChild(list.firstChild);
  state.searchResultItems = [];
  state.searchResultIndex = 0;

  if (!channels || channels.length === 0) {
    var empty = document.createElement("div");
    empty.className = "search-no-results";
    var query = (state.searchQuery || "").trim();
    if (query.length > 0) {
      empty.innerHTML = '<i class="fa-solid fa-magnifying-glass"></i><span>No results found</span>';
    } else {
      empty.innerHTML = '<i class="fa-solid fa-magnifying-glass"></i><span>Type to search channels</span>';
    }
    list.appendChild(empty);
    return;
  }

  channels.forEach(function(ch, idx) {
    var item = document.createElement("div");
    item.className = "search-result-item";
    item.tabIndex = -1;
    item.dataset.stream = ch.src || ch.stream_path || "";
    item.innerHTML =
      '<img class="sr-icon" src="' + (ch.stream_icon || "") + '" alt="" onerror="this.style.display=\'none\'">' +
      '<span class="sr-name">' + (ch.name || "") + '</span>' +
      '<i class="fa-solid fa-circle-play sr-play"></i>';
    list.appendChild(item);
  });

  state.searchResultItems = Array.from(list.querySelectorAll(".search-result-item"));
  if (state.searchResultItems[0]) {
    state.searchResultItems[0].classList.add("active");
    state.searchResultItems[0].tabIndex = 0;
  }
}

function moveSearchResultFocus(direction) {
  if (!state.searchResultItems || state.searchResultItems.length === 0) return;
  var newIdx = state.searchResultIndex + direction;
  if (newIdx < 0 || newIdx >= state.searchResultItems.length) return;
  state.searchResultItems[state.searchResultIndex].classList.remove("active");
  state.searchResultItems[state.searchResultIndex].tabIndex = -1;
  state.searchResultIndex = newIdx;
  state.searchResultItems[newIdx].classList.add("active");
  state.searchResultItems[newIdx].tabIndex = 0;
  var topIdx = Math.max(0, newIdx - 5);
  state.searchResultsList.style.transform = "translateY(" + (-state.searchResultItems[topIdx].offsetTop) + "px)";
}

function handleSearchKeyInput(key) {
  if (!key) return;
  if (key === "BACKSPACE") {
    state.searchQuery = (state.searchQuery || "").slice(0, -1);
  } else if (key === "SPACE") {
    state.searchQuery = (state.searchQuery || "") + " ";
  } else if (key === "DONE" || key === "ENTER") {
    hideSearchKeyboard();
    if (state.searchResultItems && state.searchResultItems.length > 0) {
      state.searchInputBox.classList.remove("active");
      state.focusMode = "searchresults";
    }
    return;
  } else if (key.length === 1) {
    state.searchQuery = (state.searchQuery || "") + key;
  }
  updateSearchDisplay();
  updateSearchKBPreview();
  performSearch();
}

function enterNews() {
  minimizeMenu();
  setTimeout(function() {
    var topIndex = Math.max(0, state.selectedIndex - 3);
    state.wrapper.style.transform = "translateY(" + (-state.items[topIndex].offsetTop) + "px)";
  }, 0);
  hideChannelsSection();
  showNewsSection();

  // Auto-select default country (Serbia) and load its feed
  if (state.newsCountries.length > 0 && !state.newsSelectedCountryId) {
    var defaultCountry = state.newsCountries.find(function(c) {
      return c.name && c.name.toLowerCase() === "serbia";
    }) || state.newsCountries[0];
    state.newsSelectedCountryId = defaultCountry.id;
    state.newsCountryBtn.querySelector("span").textContent = defaultCountry.name;
    // Also set the dropdown index to match
    state.newsCountryIndex = state.newsCountries.indexOf(defaultCountry);
    if (state.newsCountryIndex < 0) state.newsCountryIndex = 0;
    loadNewsFilterOptions(defaultCountry.id);
    state.newsSelectedFilterId = "";
    loadNewsFeedForCurrentSelection();
  } else if (state.newsSelectedCountryId && state.newsCards.length === 0) {
    loadNewsFeedForCurrentSelection();
  }

  // Focus starts on the country dropdown
  state.newsCountryBtn.classList.add("active");
  state.newsFilterBtn.classList.remove("active");
  state.focusMode = "newsdropdown";
  state.newsDropdownIndex = 0; // 0 = country, 1 = filter
}

function exitNews() {
  hideNewsSection();
  hideNewsPreview();
  expandMenu();
  showChannelsSection();
  state.newsCountryBtn.classList.remove("active");
  state.newsFilterBtn.classList.remove("active");
  clearNewsCardFocus();
  state.focusMode = "menu";
}

// News preview (article detail)
function showNewsPreview(index) {
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

  if (article.icon) {
    img.src = article.icon;
    img.style.display = "";
  } else {
    img.style.display = "none";
  }
  title.textContent = article.title || "";
  date.textContent = article.date || "";
  if (article.logo) {
    logo.src = article.logo;
    logo.style.display = "";
  } else {
    logo.style.display = "none";
  }
  desc.textContent = article.description || "";
  counter.textContent = (index + 1) + " / " + state.newsArticles.length;

  // Arrow highlights
  prevBtn.classList.toggle("active", index > 0);
  nextBtn.classList.toggle("active", index < state.newsArticles.length - 1);

  preview.classList.add("visible");
  state.focusMode = "newspreview";
}

function hideNewsPreview() {
  var preview = state.newsPreview || document.getElementById("news-preview");
  if (preview) preview.classList.remove("visible");
}

function slideNewsPreview(direction) {
  var newIdx = state.newsPreviewIndex + direction;
  if (newIdx < 0 || newIdx >= state.newsArticles.length) return;
  showNewsPreview(newIdx);
}

// ================================================
// Country sub-menu
// ================================================

function showCountrySubMenu() {
  if (state.countrySubMenu) state.countrySubMenu.classList.add("visible");
  state.countryItems.forEach(function(item) {
    item.classList.remove("active");
    item.tabIndex = -1;
  });
  var idx = state.countryIndex || 0;
  if (idx >= state.countryItems.length) idx = 0;
  state.countryIndex = idx;
  if (state.countryItems[idx]) {
    state.countryItems[idx].classList.add("active");
    state.countryItems[idx].tabIndex = 0;
    var topIdx = Math.max(0, idx - 3);
    state.countryWrapper.style.transform = "translateY(" + (-state.countryItems[topIdx].offsetTop) + "px)";
  }
}

function hideCountrySubMenu() {
  if (state.countrySubMenu) state.countrySubMenu.classList.remove("visible");
}

function moveCountryFocus(direction) {
  if (state.countryIndex + direction < 0 || state.countryIndex + direction >= state.countryItems.length) return;
  state.countryItems[state.countryIndex].tabIndex = -1;
  state.countryItems[state.countryIndex].classList.remove("active");
  state.countryIndex += direction;
  state.countryItems[state.countryIndex].tabIndex = 0;
  state.countryItems[state.countryIndex].classList.add("active");
  var topIdx = Math.max(0, state.countryIndex - 3);
  state.countryWrapper.style.transform = "translateY(" + (-state.countryItems[topIdx].offsetTop) + "px)";
}

// ================================================
// Menu navigation
// ================================================

function moveMenuFocus(direction) {
  if (state.selectedIndex + direction < 0 || state.selectedIndex + direction >= state.items.length) return;
  state.items[state.selectedIndex].tabIndex = -1;
  state.items[state.selectedIndex].classList.remove("active");
  state.selectedIndex += direction;
  state.items[state.selectedIndex].tabIndex = 0;
  state.items[state.selectedIndex].classList.add("active");
  var topIndex = Math.max(0, state.selectedIndex - 3);
  state.wrapper.style.transform = "translateY(" + (-state.items[topIndex].offsetTop) + "px)";
}

// ================================================
// Channel grid navigation
// ================================================

function getCardAt(row, col) {
  var idx = col * 2 + row;
  return state.allCards[idx] || null;
}

function getTotalCols() {
  return Math.ceil(state.allCards.length / 2);
}

function clearChannelFocus() {
  var card = getCardAt(state.rowIndex, state.colIndex);
  if (card) card.classList.remove("active");
}

function setChannelFocus() {
  var card = getCardAt(state.rowIndex, state.colIndex);
  if (card) card.classList.add("active");
  scrollGrid();
}

function scrollGrid() {
  var leftCol = Math.max(0, state.colIndex - 1);
  var refCard = getCardAt(0, leftCol);
  if (refCard && state.channelWrapper) {
    state.channelWrapper.style.transform = "translateX(" + (-refCard.offsetLeft) + "px)";
  }
}

function moveChannelCol(direction) {
  var totalCols = getTotalCols();
  var newCol = state.colIndex + direction;
  if (newCol < 0 || newCol >= totalCols) return;
  if (!getCardAt(state.rowIndex, newCol)) return;
  clearChannelFocus();
  state.colIndex = newCol;
  setChannelFocus();
}

function moveChannelRow(direction) {
  var newRow = state.rowIndex + direction;
  if (newRow < 0 || newRow > 1) return;
  if (!getCardAt(newRow, state.colIndex)) return;
  clearChannelFocus();
  state.rowIndex = newRow;
  setChannelFocus();
}

// ================================================
// Channel list (categories & favorites)
// ================================================

var categoryMap = {
  "sub-adria-telekom": 25,
  "sub-music": 2,
  "sub-news": 8,
  "sub-sports": 3,
  "sub-movies": 4,
  "sub-children": 5,
  "sub-documentaries": 6,
  "sub-entertainment": 1,
  "sub-reality": 19,
  "sub-general": 1,
  "sub-4k-uhd": 21,
  "sub-local": 16,
  "sub-international-fta": 17,
  "sub-camera": 18,
  "sub-adult": 9,
  "sub-vod": -1,
  "sub-youtube": -2,
};

function showChannelList(categoryId) {
  state.channelListType = "category";
  var filtered;
  if (categoryId) {
    filtered = state.channelsData.filter(function(ch) {
      return ch.category_ids && ch.category_ids.indexOf(categoryId) !== -1;
    });
  } else {
    filtered = state.channelsData.filter(function(ch) {
      return !ch.category_ids || ch.category_ids.indexOf(9) === -1;
    });
  }
  renderChannelList(filtered);
}

function showFavoritesList() {
  state.channelListType = "favorites";
  // Clear and show loading state
  while (state.channelListWrapper.firstChild) {
    state.channelListWrapper.removeChild(state.channelListWrapper.firstChild);
  }
  state.channelListItems = [];
  if (state.channelList) state.channelList.classList.add("visible");

  fetchFavorites().then(function(favChannels) {
    if (!Array.isArray(favChannels)) favChannels = [];
    console.log("[Favorites] Loaded", favChannels.length, "favorites");

    // Match favorites against full channel data to get complete info
    var channels = favChannels.map(function(fav) {
      var id = fav.id || fav.channel_id;
      for (var i = 0; i < state.channelsData.length; i++) {
        if (state.channelsData[i].id === id) {
          return state.channelsData[i];
        }
      }
      return fav;
    });

    renderChannelList(channels);
  }).catch(function(err) {
    console.error("Failed to load favorites:", err);
  });
}

function renderChannelList(channels) {
  while (state.channelListWrapper.firstChild) {
    state.channelListWrapper.removeChild(state.channelListWrapper.firstChild);
  }
  state.channelListItems = [];

  if (!channels || channels.length === 0) {
    var empty = document.createElement("div");
    empty.className = "channel-list-empty";
    empty.innerHTML = '<i class="fa-solid fa-tv"></i><span>No available channels</span>';
    state.channelListWrapper.appendChild(empty);
    if (state.channelList) state.channelList.classList.add("visible");
    return;
  }

  channels.forEach(function(ch, idx) {
    var item = document.createElement("div");
    item.className = "channel-list-item";
    item.tabIndex = -1;
    item.dataset.stream = ch.src || ch.stream_path || "";
    item.innerHTML =
      '<span class="cl-number">' + (ch.num || (idx + 1)) + '.</span>' +
      '<img class="cl-icon" src="' + (ch.stream_icon || "") + '" alt="" onerror="this.style.display=\'none\'">' +
      '<span class="cl-name">' + (ch.name || "") + '</span>' +
      '<i class="fa-solid fa-circle-play cl-play"></i>';
    state.channelListWrapper.appendChild(item);
  });

  state.channelListItems = Array.from(state.channelList.querySelectorAll(".channel-list-item"));
  if (state.channelList) state.channelList.classList.add("visible");
  state.channelListIndex = 0;

  state.channelListItems.forEach(function(item) {
    item.classList.remove("active");
    item.tabIndex = -1;
  });
  if (state.channelListItems[0]) {
    state.channelListItems[0].classList.add("active");
    state.channelListItems[0].tabIndex = 0;
  }
}

function hideChannelList() {
  if (state.channelList) {
    state.channelList.classList.remove("visible");
    state.channelList.classList.remove("shifted");
  }
}

function moveChannelListFocus(direction) {
  if (state.channelListIndex + direction < 0 || state.channelListIndex + direction >= state.channelListItems.length) return;
  state.channelListItems[state.channelListIndex].tabIndex = -1;
  state.channelListItems[state.channelListIndex].classList.remove("active");
  state.channelListIndex += direction;
  state.channelListItems[state.channelListIndex].tabIndex = 0;
  state.channelListItems[state.channelListIndex].classList.add("active");
  var topIdx = Math.max(0, state.channelListIndex - 3);
  state.channelListWrapper.style.transform = "translateY(" + (-state.channelListItems[topIdx].offsetTop) + "px)";
}

// ================================================
// Player UI management
// ================================================

// Hide all app UI elements so only the video player is visible
function hideAllUI() {
  document.querySelector("header").style.display = "none";
  document.getElementById("menu").style.display = "none";
  document.querySelector(".channels-section").style.display = "none";
  if (state.subMenu) state.subMenu.style.display = "none";
  if (state.radioSubMenu) state.radioSubMenu.style.display = "none";
  if (state.favSubMenu) state.favSubMenu.style.display = "none";
  if (state.moviesSubMenu) state.moviesSubMenu.style.display = "none";
  if (state.tutorialSubMenu) state.tutorialSubMenu.style.display = "none";
  if (state.tutorialList) state.tutorialList.style.display = "none";
  if (state.countrySubMenu) state.countrySubMenu.style.display = "none";
  if (state.channelList) state.channelList.style.display = "none";
  if (state.radioPanel) state.radioPanel.style.display = "none";
  if (state.newsSection) state.newsSection.style.display = "none";
  if (state.newsCountryList) state.newsCountryList.style.display = "none";
  if (state.newsFilterList) state.newsFilterList.style.display = "none";
}

// Restore all app UI elements (clear inline display overrides, let CSS classes decide)
function restoreAllUI() {
  document.querySelector("header").style.display = "";
  document.getElementById("menu").style.display = "";
  document.querySelector(".channels-section").style.display = "";
  if (state.subMenu) state.subMenu.style.display = "";
  if (state.radioSubMenu) state.radioSubMenu.style.display = "";
  if (state.favSubMenu) state.favSubMenu.style.display = "";
  if (state.moviesSubMenu) state.moviesSubMenu.style.display = "";
  if (state.tutorialSubMenu) state.tutorialSubMenu.style.display = "";
  if (state.tutorialList) state.tutorialList.style.display = "";
  if (state.countrySubMenu) state.countrySubMenu.style.display = "";
  if (state.channelList) state.channelList.style.display = "";
  if (state.radioPanel) state.radioPanel.style.display = "";
  if (state.newsSection) state.newsSection.style.display = "";
  if (state.newsCountryList) state.newsCountryList.style.display = "";
  if (state.newsFilterList) state.newsFilterList.style.display = "";
}

// Enter the video player from any context
function enterPlayer(streamUrl, playlist, playlistIndex) {
  state.previousFocusMode = state.focusMode;
  state.activePlaylist = playlist;
  state.activePlaylistIndex = playlistIndex;
  hideAllUI();
  playChannel(streamUrl);
  state.focusMode = "player";
}

// Exit the video player and restore the correct UI state
function exitPlayer() {
  hidePlayerOverlay();
  stopPlayer();
  restoreAllUI();

  var returnTo = state.previousFocusMode || "channels";

  if (returnTo === "channellist") {
    // Came from channel list (favorites, category, or internet) — restore that view
    minimizeMenu();
    hideChannelsSection();
    if (state.channelListType === "radio" || state.channelListType === "radio-favorites") {
      showRadioSubMenu();
    } else if (state.channelListType === "fav-tv" || state.channelListType === "fav-radio") {
      showFavSubMenu();
    } else {
      showSubMenu();
    }
    if (state.channelListType === "internet") {
      if (state.countrySubMenu) state.countrySubMenu.classList.add("visible");
    }
    if (state.channelList) {
      state.channelList.classList.add("visible");
      if (state.channelListType === "internet") {
        state.channelList.classList.add("shifted");
      }
    }
    // Refresh the list if it was favorites (may have changed)
    if (state.channelListType === "favorites") {
      showFavoritesList();
    }
    if (state.channelListType === "fav-tv") {
      showFavTvChannels();
    }
    if (state.channelListType === "radio-favorites") {
      showRadioFavoritesList();
    }
    if (state.channelListType === "fav-radio") {
      showFavRadioStations();
    }
    state.focusMode = "channellist";
  } else if (returnTo === "channels") {
    state.focusMode = "channels";
    setChannelFocus();
  } else {
    state.focusMode = returnTo;
  }

  state.previousFocusMode = null;
}

// ================================================
// Player overlay
// ================================================

function showPlayerOverlay() {
  state.playerOverlay = document.getElementById("player-overlay");
  if (!state.playerOverlay) return;
  state.playerOverlay.classList.add("visible");
  state.playerOverlayBtns = Array.from(state.playerOverlay.querySelectorAll(".po-btn, .po-action"));
  state.playerOverlayIndex = 1; // start on pause button
  updateOverlayFocus();
}

function hidePlayerOverlay() {
  if (state.playerOverlay) state.playerOverlay.classList.remove("visible");
  clearOverlayFocus();
}

function updateOverlayFocus() {
  state.playerOverlayBtns.forEach(function(btn) { btn.classList.remove("active"); });
  if (state.playerOverlayBtns[state.playerOverlayIndex]) {
    state.playerOverlayBtns[state.playerOverlayIndex].classList.add("active");
  }
}

function clearOverlayFocus() {
  state.playerOverlayBtns.forEach(function(btn) { btn.classList.remove("active"); });
}

function moveOverlayFocus(direction) {
  var newIdx = state.playerOverlayIndex + direction;
  if (newIdx < 0 || newIdx >= state.playerOverlayBtns.length) return;
  state.playerOverlayIndex = newIdx;
  updateOverlayFocus();
}

// ================================================
// TV Channels entry
// ================================================

function enterTVChannels() {
  minimizeMenu();
  setTimeout(function() {
    var topIndex = Math.max(0, state.selectedIndex - 3);
    state.wrapper.style.transform = "translateY(" + (-state.items[topIndex].offsetTop) + "px)";
  }, 0);
  showSubMenu();
  hideChannelsSection();
  state.focusMode = "submenu";
}

// ================================================
// Radio Stations entry
// ================================================

function enterRadio() {
  minimizeMenu();
  setTimeout(function() {
    var topIndex = Math.max(0, state.selectedIndex - 3);
    state.wrapper.style.transform = "translateY(" + (-state.items[topIndex].offsetTop) + "px)";
  }, 0);
  showRadioSubMenu();
  hideChannelsSection();
  state.focusMode = "radiosubmenu";
}

// ================================================
// Favorites entry
// ================================================

function enterFavorites() {
  minimizeMenu();
  setTimeout(function() {
    var topIndex = Math.max(0, state.selectedIndex - 3);
    state.wrapper.style.transform = "translateY(" + (-state.items[topIndex].offsetTop) + "px)";
  }, 0);
  showFavSubMenu();
  hideChannelsSection();
  state.focusMode = "favsubmenu";
}

// ================================================
// Movies entry
// ================================================

function enterMovies() {
  minimizeMenu();
  setTimeout(function() {
    var topIndex = Math.max(0, state.selectedIndex - 3);
    state.wrapper.style.transform = "translateY(" + (-state.items[topIndex].offsetTop) + "px)";
  }, 0);
  showMoviesSubMenu();
  hideChannelsSection();
  state.focusMode = "moviessubmenu";
}

// ================================================
// Video Tutorials entry
// ================================================

function enterVideoTutorials() {
  minimizeMenu();
  setTimeout(function() {
    var topIndex = Math.max(0, state.selectedIndex - 3);
    state.wrapper.style.transform = "translateY(" + (-state.items[topIndex].offsetTop) + "px)";
  }, 0);
  showTutorialSubMenu();
  hideChannelsSection();
  state.focusMode = "tutorialsubmenu";
}

function showTutorialSubMenu() {
  if (state.tutorialSubMenu) state.tutorialSubMenu.classList.add("visible");
  state.tutorialSubItems.forEach(function(item) {
    item.classList.remove("active");
    item.tabIndex = -1;
  });
  var idx = state.tutorialSubIndex || 0;
  if (idx >= state.tutorialSubItems.length) idx = 0;
  state.tutorialSubIndex = idx;
  if (state.tutorialSubItems[idx]) {
    state.tutorialSubItems[idx].classList.add("active");
    state.tutorialSubItems[idx].tabIndex = 0;
    var topIdx = Math.max(0, idx - 3);
    state.tutorialSubWrapper.style.transform = "translateY(" + (-state.tutorialSubItems[topIdx].offsetTop) + "px)";
  }
}

function hideTutorialSubMenu() {
  if (state.tutorialSubMenu) state.tutorialSubMenu.classList.remove("visible");
}

function moveTutorialSubFocus(direction) {
  if (state.tutorialSubIndex + direction < 0 || state.tutorialSubIndex + direction >= state.tutorialSubItems.length) return;
  state.tutorialSubItems[state.tutorialSubIndex].tabIndex = -1;
  state.tutorialSubItems[state.tutorialSubIndex].classList.remove("active");
  state.tutorialSubIndex += direction;
  state.tutorialSubItems[state.tutorialSubIndex].tabIndex = 0;
  state.tutorialSubItems[state.tutorialSubIndex].classList.add("active");
  var topIdx = Math.max(0, state.tutorialSubIndex - 3);
  state.tutorialSubWrapper.style.transform = "translateY(" + (-state.tutorialSubItems[topIdx].offsetTop) + "px)";
}

function showTutorialList(categoryId) {
  var videos = (state.tutorialVideos || []).filter(function(v) {
    return v.category_id === categoryId;
  });
  renderTutorialList(videos);
}

function renderTutorialList(videos) {
  while (state.tutorialListWrapper.firstChild) {
    state.tutorialListWrapper.removeChild(state.tutorialListWrapper.firstChild);
  }
  state.tutorialListItems = [];

  if (!videos || videos.length === 0) {
    var empty = document.createElement("div");
    empty.className = "channel-list-empty";
    empty.innerHTML = '<i class="fa-solid fa-video"></i><span>No tutorials available</span>';
    state.tutorialListWrapper.appendChild(empty);
    if (state.tutorialList) {
      state.tutorialList.classList.add("visible");
      state.tutorialList.classList.add("shifted");
    }
    return;
  }

  videos.forEach(function(vid, idx) {
    var item = document.createElement("div");
    item.className = "channel-list-item";
    item.tabIndex = -1;
    item.dataset.stream = vid.src || "";
    // Clean up name: remove extension, replace underscores
    var displayName = (vid.name || "").replace(/\.mp4$/i, "").replace(/_/g, " ");
    item.innerHTML =
      '<span class="cl-number">' + (idx + 1) + '.</span>' +
      '<i class="fa-solid fa-circle-play" style="font-size:2vw;opacity:0.7;"></i>' +
      '<span class="cl-name">' + displayName + '</span>' +
      '<i class="fa-solid fa-circle-play cl-play"></i>';
    state.tutorialListWrapper.appendChild(item);
  });

  state.tutorialListItems = Array.from(state.tutorialList.querySelectorAll(".channel-list-item"));
  if (state.tutorialList) {
    state.tutorialList.classList.add("visible");
    state.tutorialList.classList.add("shifted");
  }
  state.tutorialListIndex = 0;

  state.tutorialListItems.forEach(function(item) {
    item.classList.remove("active");
    item.tabIndex = -1;
  });
  if (state.tutorialListItems[0]) {
    state.tutorialListItems[0].classList.add("active");
    state.tutorialListItems[0].tabIndex = 0;
  }
}

function hideTutorialList() {
  if (state.tutorialList) {
    state.tutorialList.classList.remove("visible");
    state.tutorialList.classList.remove("shifted");
  }
}

function moveTutorialListFocus(direction) {
  if (state.tutorialListIndex + direction < 0 || state.tutorialListIndex + direction >= state.tutorialListItems.length) return;
  state.tutorialListItems[state.tutorialListIndex].tabIndex = -1;
  state.tutorialListItems[state.tutorialListIndex].classList.remove("active");
  state.tutorialListIndex += direction;
  state.tutorialListItems[state.tutorialListIndex].tabIndex = 0;
  state.tutorialListItems[state.tutorialListIndex].classList.add("active");
  var topIdx = Math.max(0, state.tutorialListIndex - 3);
  state.tutorialListWrapper.style.transform = "translateY(" + (-state.tutorialListItems[topIdx].offsetTop) + "px)";
}

function showFavTvChannels() {
  state.channelListType = "fav-tv";
  while (state.channelListWrapper.firstChild) {
    state.channelListWrapper.removeChild(state.channelListWrapper.firstChild);
  }
  state.channelListItems = [];
  if (state.channelList) state.channelList.classList.add("visible");

  fetchFavorites().then(function(favChannels) {
    if (!Array.isArray(favChannels)) favChannels = [];
    var channels = favChannels.map(function(fav) {
      var id = fav.id || fav.channel_id;
      for (var i = 0; i < state.channelsData.length; i++) {
        if (state.channelsData[i].id === id) {
          return state.channelsData[i];
        }
      }
      return fav;
    });
    renderChannelList(channels);
  }).catch(function(err) {
    console.error("Failed to load favorite TV channels:", err);
  });
}

function showFavRadioStations() {
  state.channelListType = "fav-radio";
  while (state.channelListWrapper.firstChild) {
    state.channelListWrapper.removeChild(state.channelListWrapper.firstChild);
  }
  state.channelListItems = [];
  if (state.channelList) state.channelList.classList.add("visible");

  var loadAndFilter = function(radios) {
    var favRadios = radios.filter(function(r) { return r.favorite === true; });
    renderRadioList(favRadios);
  };

  if (state.radiosData && state.radiosData.length > 0) {
    loadAndFilter(state.radiosData);
    return;
  }

  getRadios().then(function(response) {
    var radios = (response && response.data) ? response.data : (Array.isArray(response) ? response : []);
    state.radiosData = radios;
    loadAndFilter(radios);
  }).catch(function(err) {
    console.error("Failed to load favorite radio stations:", err);
  });
}

function showRadioAllChannels() {
  state.channelListType = "radio";
  while (state.channelListWrapper.firstChild) {
    state.channelListWrapper.removeChild(state.channelListWrapper.firstChild);
  }
  state.channelListItems = [];
  if (state.channelList) state.channelList.classList.add("visible");

  if (state.radiosData && state.radiosData.length > 0) {
    renderRadioList(state.radiosData);
    return;
  }

  getRadios().then(function(response) {
    var radios = (response && response.data) ? response.data : (Array.isArray(response) ? response : []);
    state.radiosData = radios;
    renderRadioList(radios);
  }).catch(function(err) {
    console.error("Failed to load radios:", err);
  });
}

function showRadioFavoritesList() {
  state.channelListType = "radio-favorites";
  while (state.channelListWrapper.firstChild) {
    state.channelListWrapper.removeChild(state.channelListWrapper.firstChild);
  }
  state.channelListItems = [];
  if (state.channelList) state.channelList.classList.add("visible");

  var loadAndFilter = function(radios) {
    var favRadios = radios.filter(function(r) { return r.favorite === true; });
    renderRadioList(favRadios);
  };

  if (state.radiosData && state.radiosData.length > 0) {
    loadAndFilter(state.radiosData);
    return;
  }

  getRadios().then(function(response) {
    var radios = (response && response.data) ? response.data : (Array.isArray(response) ? response : []);
    state.radiosData = radios;
    loadAndFilter(radios);
  }).catch(function(err) {
    console.error("Failed to load radio favorites:", err);
  });
}

function renderRadioList(radios) {
  while (state.channelListWrapper.firstChild) {
    state.channelListWrapper.removeChild(state.channelListWrapper.firstChild);
  }
  state.channelListItems = [];

  if (!radios || radios.length === 0) {
    var empty = document.createElement("div");
    empty.className = "channel-list-empty";
    empty.innerHTML = '<i class="fa-solid fa-radio"></i><span>No available radio stations</span>';
    state.channelListWrapper.appendChild(empty);
    if (state.channelList) state.channelList.classList.add("visible");
    return;
  }

  radios.forEach(function(r, idx) {
    var item = document.createElement("div");
    item.className = "channel-list-item";
    item.tabIndex = -1;
    item.dataset.stream = r.stream_source || "";
    item.innerHTML =
      '<span class="cl-number">' + (idx + 1) + '.</span>' +
      '<img class="cl-icon" src="' + (r.stream_icon || "") + '" alt="" onerror="this.style.display=\'none\'">' +
      '<span class="cl-name">' + (r.name || "") + '</span>' +
      '<i class="fa-solid fa-circle-play cl-play"></i>';
    state.channelListWrapper.appendChild(item);
  });

  state.channelListItems = Array.from(state.channelList.querySelectorAll(".channel-list-item"));
  if (state.channelList) state.channelList.classList.add("visible");
  state.channelListIndex = 0;

  state.channelListItems.forEach(function(item) {
    item.classList.remove("active");
    item.tabIndex = -1;
  });
  if (state.channelListItems[0]) {
    state.channelListItems[0].classList.add("active");
    state.channelListItems[0].tabIndex = 0;
  }
}

// ================================================
// Radio inline playback
// ================================================

function playRadio(streamUrl, radioObj) {
  if (!streamUrl) return;
  // Stop any existing radio playback
  if (state.radioAudio) {
    state.radioAudio.pause();
    state.radioAudio.removeAttribute("src");
  }

  state.radioPlaying = radioObj;

  // Update panel info
  var nameEl = document.getElementById("radio-panel-name");
  if (nameEl) nameEl.textContent = radioObj ? (radioObj.name || "Radio") : "Radio";

  // Show loading status
  var statusEl = document.getElementById("radio-panel-status");
  if (statusEl) {
    statusEl.textContent = "Connecting...";
    statusEl.className = "radio-panel-status loading";
  }
  var bars = document.getElementById("radio-panel-bars");
  if (bars) bars.classList.add("paused");

  // Clear previous listeners
  state.radioAudio.onplaying = null;
  state.radioAudio.onerror = null;

  state.radioAudio.onplaying = function() {
    if (statusEl) {
      statusEl.textContent = "";
      statusEl.className = "radio-panel-status";
    }
    if (bars) bars.classList.remove("paused");
  };

  state.radioAudio.onerror = function() {
    if (statusEl) {
      statusEl.textContent = "Stream not available";
      statusEl.className = "radio-panel-status error";
    }
    if (bars) bars.classList.add("paused");
  };

  state.radioAudio.src = streamUrl;
  state.radioAudio.play().catch(function() {
    if (statusEl) {
      statusEl.textContent = "Stream not available";
      statusEl.className = "radio-panel-status error";
    }
    if (bars) bars.classList.add("paused");
  });

  // Update favorite button state
  var favBtn = document.getElementById("radio-btn-fav");
  if (favBtn && radioObj) {
    if (radioObj.favorite) {
      favBtn.innerHTML = '<i class="fa-solid fa-heart"></i> Favorited';
      favBtn.classList.add("fav-active");
    } else {
      favBtn.innerHTML = '<i class="fa-regular fa-heart"></i> Favorite';
      favBtn.classList.remove("fav-active");
    }
  }

  // Show the panel and start animation
  // Reset panel button focus state
  state.radioPanelIndex = 0;
  state.radioPanelBtns.forEach(function(btn) { if (btn) btn.classList.remove("active"); });
  showRadioPanel();
}

function stopRadio() {
  if (state.radioAudio) {
    state.radioAudio.pause();
    state.radioAudio.removeAttribute("src");
  }
  state.radioPlaying = null;
  var bars = document.getElementById("radio-panel-bars");
  if (bars) bars.classList.add("paused");
  // Clear panel button focus
  state.radioPanelIndex = 0;
  state.radioPanelBtns.forEach(function(btn) { if (btn) btn.classList.remove("active"); });
  hideRadioPanel();
  state.focusMode = "channellist";
}

function toggleRadioFavorite() {
  var radio = state.radioPlaying;
  if (!radio || !radio.id) return;
  var favBtn = document.getElementById("radio-btn-fav");
  if (!favBtn) return;

  if (radio.favorite) {
    removeFavoriteChannel(radio.id).then(function() {
      radio.favorite = false;
      favBtn.innerHTML = '<i class="fa-regular fa-heart"></i> Favorite';
      favBtn.classList.remove("fav-active");
    }).catch(function(err) {
      console.error("Failed to remove radio favorite:", err);
    });
  } else {
    addFavoriteChannel(radio.id).then(function() {
      radio.favorite = true;
      favBtn.innerHTML = '<i class="fa-solid fa-heart"></i> Favorited';
      favBtn.classList.add("fav-active");
    }).catch(function(err) {
      console.error("Failed to add radio favorite:", err);
    });
  }
}

function showRadioPanel() {
  if (state.radioPanel) state.radioPanel.classList.add("visible");
  var bars = document.getElementById("radio-panel-bars");
  if (bars) bars.classList.remove("paused");
}

function hideRadioPanel() {
  if (state.radioPanel) state.radioPanel.classList.remove("visible");
}

function updateRadioPanelFocus() {
  state.radioPanelBtns.forEach(function(btn) {
    if (btn) btn.classList.remove("active");
  });
  if (state.radioPanelBtns[state.radioPanelIndex]) {
    state.radioPanelBtns[state.radioPanelIndex].classList.add("active");
  }
}

function moveRadioPanelFocus(direction) {
  var newIdx = state.radioPanelIndex + direction;
  if (newIdx < 0 || newIdx >= state.radioPanelBtns.length) return;
  state.radioPanelIndex = newIdx;
  updateRadioPanelFocus();
}

// ================================================
// Key handlers
// ================================================

function handleEnter() {
  // Player overlay actions
  if (state.focusMode === "playeroverlay") {
    var btn = state.playerOverlayBtns[state.playerOverlayIndex];
    if (btn && btn.id === "po-pause") {
      togglePause();
    } else if (btn && btn.id === "po-favorite") {
      var ch = getCurrentChannel();
      if (ch && ch.id) {
        if (btn.dataset.favorited === "true") {
          removeFavoriteChannel(ch.id).then(function() {
            btn.innerHTML = '<i class="fa-regular fa-heart"></i> Add to Favorites';
            btn.classList.remove("active");
            btn.dataset.favorited = "false";
            ch.favorite = false;
          }).catch(function(err) {
            console.error("Failed to remove favorite:", err);
          });
        } else {
          addFavoriteChannel(ch.id).then(function() {
            btn.innerHTML = '<i class="fa-solid fa-heart"></i> Added!';
            btn.classList.add("active");
            btn.dataset.favorited = "true";
            ch.favorite = true;
          }).catch(function(err) {
            console.error("Failed to add favorite:", err);
          });
        }
      }
    }
    return;
  }

  // Main menu
  if (state.focusMode === "menu") {
    var selectedItem = state.items[state.selectedIndex];
    // Stop radio when entering any section other than radio
    if (selectedItem && selectedItem.id !== "menu-radio" && state.radioPlaying) {
      stopRadio();
    }
    if (selectedItem && selectedItem.id === "menu-tv-channels") {
      enterTVChannels();
    } else if (selectedItem && selectedItem.id === "menu-radio") {
      enterRadio();
    } else if (selectedItem && selectedItem.id === "menu-favorites") {
      enterFavorites();
    } else if (selectedItem && selectedItem.id === "menu-movies") {
      enterMovies();
    } else if (selectedItem && selectedItem.id === "menu-news") {
      enterNews();
    } else if (selectedItem && selectedItem.id === "menu-search") {
      enterSearch();
    } else if (selectedItem && selectedItem.id === "menu-video-tutorials") {
      enterVideoTutorials();
    }
    return;
  }

  // Channel grid — enter player with full grid as playlist
  if (state.focusMode === "channels") {
    var card = getCardAt(state.rowIndex, state.colIndex);
    if (card && card.dataset.stream) {
      var gridStreams = state.allCards.map(function(c) { return c.dataset.stream; }).filter(Boolean);
      var gridIndex = state.colIndex * 2 + state.rowIndex;
      enterPlayer(card.dataset.stream, gridStreams, gridIndex);
    }
    return;
  }

  // Sub-menu — open category, favorites, or country submenu
  if (state.focusMode === "submenu") {
    var itemId = state.subItems[state.subIndex].id;
    if (itemId === "sub-internet-tv") {
      showCountrySubMenu();
      state.focusMode = "countrysubmenu";
    } else if (itemId === "sub-all") {
      showChannelList(null);
      state.focusMode = "channellist";
    } else if (itemId === "sub-favorites") {
      showFavoritesList();
      state.focusMode = "channellist";
    } else if (categoryMap[itemId]) {
      showChannelList(categoryMap[itemId]);
      state.focusMode = "channellist";
    }
    return;
  }

  // Radio sub-menu
  if (state.focusMode === "radiosubmenu") {
    var radioItemId = state.radioSubItems[state.radioSubIndex].id;
    if (radioItemId === "radio-all") {
      showRadioAllChannels();
      state.focusMode = "channellist";
    } else if (radioItemId === "radio-favorites") {
      showRadioFavoritesList();
      state.focusMode = "channellist";
    }
    return;
  }

  // Favorites sub-menu
  if (state.focusMode === "favsubmenu") {
    var favItemId = state.favSubItems[state.favSubIndex].id;
    if (favItemId === "fav-tv-channels") {
      showFavTvChannels();
      state.focusMode = "channellist";
    } else if (favItemId === "fav-radio-stations") {
      showFavRadioStations();
      state.focusMode = "channellist";
    }
    return;
  }

  // News dropdown bar — open dropdown or navigate grid
  if (state.focusMode === "newsdropdown") {
    if (state.newsDropdownIndex === 0) {
      showNewsCountryList();
      state.focusMode = "newscountrydropdown";
    } else {
      showNewsFilterList();
      state.focusMode = "newsfilterdropdown";
    }
    return;
  }

  // News grid — open article preview
  if (state.focusMode === "newsgrid") {
    var articleIdx = state.newsRowIndex * 2 + state.newsColIndex;
    if (state.newsArticles[articleIdx]) {
      showNewsPreview(articleIdx);
    }
    return;
  }

  // News country dropdown
  if (state.focusMode === "newscountrydropdown") {
    var countryItem = state.newsCountryItems[state.newsCountryIndex];
    if (countryItem) {
      var cId = countryItem.dataset.countryId;
      state.newsSelectedCountryId = cId;
      state.newsSelectedFilterId = "";
      state.newsCountryBtn.querySelector("span").textContent = countryItem.textContent.trim();
      hideNewsCountryList();
      loadNewsFilterOptions(cId);
      loadNewsFeedForCurrentSelection();
      state.focusMode = "newsdropdown";
    }
    return;
  }

  // News filter dropdown
  if (state.focusMode === "newsfilterdropdown") {
    var filterItem = state.newsFilterItems[state.newsFilterIndex];
    if (filterItem) {
      state.newsSelectedFilterId = filterItem.dataset.filterId || "";
      state.newsFilterBtn.querySelector("span").textContent = filterItem.textContent.trim();
      hideNewsFilterList();
      loadNewsFeedForCurrentSelection();
      state.focusMode = "newsdropdown";
    }
    return;
  }

  // Search keyboard — press the focused key
  if (state.focusMode === "searchkeyboard") {
    var row = searchKB.rows[searchKB.rowIndex];
    if (row && row[searchKB.colIndex]) {
      var keyVal = row[searchKB.colIndex].dataset.key;
      searchKBPressKey(keyVal);
    }
    return;
  }

  // Search input (keyboard hidden) — reopen keyboard or go to results
  if (state.focusMode === "searchinput") {
    showSearchKeyboard();
    state.focusMode = "searchkeyboard";
    return;
  }

  // Search results — play selected channel
  if (state.focusMode === "searchresults") {
    var srItem = state.searchResultItems[state.searchResultIndex];
    if (srItem && srItem.dataset.stream) {
      var srStreams = state.searchResultItems.map(function(i) { return i.dataset.stream; }).filter(Boolean);
      enterPlayer(srItem.dataset.stream, srStreams, state.searchResultIndex);
    }
    return;
  }

  // Movies sub-menu — select a movie category
  if (state.focusMode === "moviessubmenu") {
    var movieItem = state.moviesSubItems[state.moviesSubIndex];
    if (movieItem && movieItem.dataset.categoryId) {
      var catId = parseInt(movieItem.dataset.categoryId, 10);
      console.log("[Movies] Selected category:", catId, movieItem.textContent.trim());
      // TODO: fetch movies for this category and display them
    }
    return;
  }

  // Tutorial sub-menu — select a category to show videos
  if (state.focusMode === "tutorialsubmenu") {
    var tutItem = state.tutorialSubItems[state.tutorialSubIndex];
    if (tutItem && tutItem.dataset.categoryId) {
      var tutCatId = parseInt(tutItem.dataset.categoryId, 10);
      showTutorialList(tutCatId);
      state.focusMode = "tutoriallist";
    }
    return;
  }

  // Tutorial video list — play selected tutorial
  if (state.focusMode === "tutoriallist") {
    var tutVid = state.tutorialListItems[state.tutorialListIndex];
    if (tutVid && tutVid.dataset.stream) {
      var tutStreams = state.tutorialListItems.map(function(i) { return i.dataset.stream; }).filter(Boolean);
      enterPlayer(tutVid.dataset.stream, tutStreams, state.tutorialListIndex);
    }
    return;
  }

  // Country sub-menu — select country to load m3u channels
  if (state.focusMode === "countrysubmenu") {
    var countryItem = state.countryItems[state.countryIndex];
    if (countryItem && countryItem.dataset.countryId) {
      var countryId = parseInt(countryItem.dataset.countryId, 10);
      state.channelListType = "internet";

      getM3uChannels(countryId).then(function(data) {
        var channels = (data && data.channels) ? data.channels : (Array.isArray(data) ? data : []);
        if (channels.length === 0) {
          console.log("[Internet TV] No channels for country:", countryId);
          // Show empty message
          while (state.channelListWrapper.firstChild) {
            state.channelListWrapper.removeChild(state.channelListWrapper.firstChild);
          }
          state.channelListItems = [];
          var msg = document.createElement("div");
          msg.style.cssText = "color: rgba(255,255,255,0.6); font-size: 2vw; padding: 2vw; text-align: center; width: 100%; display: flex; align-items: center; justify-content: center; height: 40vh;";
          msg.textContent = "No available channels";
          state.channelListWrapper.appendChild(msg);
          if (state.channelList) {
            state.channelList.classList.add("visible");
            state.channelList.classList.add("shifted");
          }
          return;
        }
        state.internetChannelsData = channels;
        // Clear wrapper before rendering
        while (state.channelListWrapper.firstChild) {
          state.channelListWrapper.removeChild(state.channelListWrapper.firstChild);
        }
        state.channelListItems = [];
        if (state.channelList) {
          state.channelList.classList.add("visible");
          state.channelList.classList.add("shifted");
        }
        renderChannelList(channels);
        state.focusMode = "channellist";
      }).catch(function(err) {
        console.error("Failed to load m3u channels:", err);
      });
    }
    return;
  }

  // Channel list — enter player or play radio inline
  if (state.focusMode === "channellist") {
    var item = state.channelListItems[state.channelListIndex];
    if (item && item.dataset.stream) {
      // Radio types play inline without entering the video player
      if (state.channelListType === "radio" || state.channelListType === "radio-favorites" || state.channelListType === "fav-radio") {
        var radioIdx = state.channelListIndex;
        var radioObj = state.radiosData[radioIdx] || null;
        // For radio-favorites or fav-radio, find the right object
        if (state.channelListType === "radio-favorites" || state.channelListType === "fav-radio") {
          var favRadios = state.radiosData.filter(function(r) { return r.favorite === true; });
          radioObj = favRadios[radioIdx] || null;
        }
        playRadio(item.dataset.stream, radioObj);
        return;
      }
      var listStreams = state.channelListItems.map(function(i) { return i.dataset.stream; }).filter(Boolean);
      enterPlayer(item.dataset.stream, listStreams, state.channelListIndex);
    }
    return;
  }

  // Radio panel — handle stop and favorite buttons
  if (state.focusMode === "radiopanel") {
    var btn = state.radioPanelBtns[state.radioPanelIndex];
    if (btn && btn.id === "radio-btn-stop") {
      stopRadio();
    } else if (btn && btn.id === "radio-btn-fav") {
      toggleRadioFavorite();
    }
    return;
  }
}

function handleUp() {
  if (state.focusMode === "playeroverlay" || state.focusMode === "player") {
    switchChannel(-1);
  } else if (state.focusMode === "menu") {
    moveMenuFocus(-1);
  } else if (state.focusMode === "submenu") {
    moveSubFocus(-1);
  } else if (state.focusMode === "radiosubmenu") {
    moveRadioSubFocus(-1);
  } else if (state.focusMode === "favsubmenu") {
    moveFavSubFocus(-1);
  } else if (state.focusMode === "moviessubmenu") {
    moveMoviesSubFocus(-1);
  } else if (state.focusMode === "tutorialsubmenu") {
    moveTutorialSubFocus(-1);
  } else if (state.focusMode === "countrysubmenu") {
    moveCountryFocus(-1);
  } else if (state.focusMode === "channellist") {
    moveChannelListFocus(-1);
  } else if (state.focusMode === "tutoriallist") {
    moveTutorialListFocus(-1);
  } else if (state.focusMode === "channels") {
    moveChannelRow(-1);
  } else if (state.focusMode === "radiopanel") {
    // Do nothing — only left/right navigation in panel
  } else if (state.focusMode === "newsdropdown") {
    // Do nothing on up from dropdown bar
  } else if (state.focusMode === "newsgrid") {
    if (state.newsRowIndex === 0) {
      // Move back to dropdown bar
      clearNewsCardFocus();
      state.newsCountryBtn.classList.add("active");
      state.newsDropdownIndex = 0;
      state.focusMode = "newsdropdown";
    } else {
      moveNewsCardRow(-1);
    }
  } else if (state.focusMode === "newscountrydropdown") {
    moveNewsCountryFocus(-1);
  } else if (state.focusMode === "newsfilterdropdown") {
    moveNewsFilterFocus(-1);
  } else if (state.focusMode === "searchresults") {
    moveSearchResultFocus(-1);
  } else if (state.focusMode === "searchkeyboard") {
    if (searchKB.rowIndex > 0) {
      searchKB.rowIndex--;
      if (searchKB.colIndex >= searchKB.rows[searchKB.rowIndex].length) {
        searchKB.colIndex = searchKB.rows[searchKB.rowIndex].length - 1;
      }
      setSearchKeyFocus();
    }
  } else if (state.focusMode === "searchinput") {
    // Do nothing on up from search input
  }
}

function handleDown() {
  if (state.focusMode === "playeroverlay" || state.focusMode === "player") {
    switchChannel(1);
  } else if (state.focusMode === "menu") {
    moveMenuFocus(1);
  } else if (state.focusMode === "submenu") {
    moveSubFocus(1);
  } else if (state.focusMode === "radiosubmenu") {
    moveRadioSubFocus(1);
  } else if (state.focusMode === "favsubmenu") {
    moveFavSubFocus(1);
  } else if (state.focusMode === "moviessubmenu") {
    moveMoviesSubFocus(1);
  } else if (state.focusMode === "tutorialsubmenu") {
    moveTutorialSubFocus(1);
  } else if (state.focusMode === "countrysubmenu") {
    moveCountryFocus(1);
  } else if (state.focusMode === "channellist") {
    moveChannelListFocus(1);
  } else if (state.focusMode === "tutoriallist") {
    moveTutorialListFocus(1);
  } else if (state.focusMode === "channels") {
    moveChannelRow(1);
  } else if (state.focusMode === "radiopanel") {
    // Do nothing — only left/right navigation in panel
  } else if (state.focusMode === "newsdropdown") {
    // Move to card grid
    state.newsCountryBtn.classList.remove("active");
    state.newsFilterBtn.classList.remove("active");
    if (state.newsCards.length > 0) {
      state.focusMode = "newsgrid";
      setNewsCardFocus();
    }
  } else if (state.focusMode === "newsgrid") {
    moveNewsCardRow(1);
  } else if (state.focusMode === "newscountrydropdown") {
    moveNewsCountryFocus(1);
  } else if (state.focusMode === "newsfilterdropdown") {
    moveNewsFilterFocus(1);
  } else if (state.focusMode === "searchkeyboard") {
    if (searchKB.rowIndex < searchKB.rows.length - 1) {
      searchKB.rowIndex++;
      if (searchKB.colIndex >= searchKB.rows[searchKB.rowIndex].length) {
        searchKB.colIndex = searchKB.rows[searchKB.rowIndex].length - 1;
      }
      setSearchKeyFocus();
    }
  } else if (state.focusMode === "searchinput") {
    // Down from input → move to results
    if (state.searchResultItems && state.searchResultItems.length > 0) {
      state.searchInputBox.classList.remove("active");
      state.focusMode = "searchresults";
    }
  } else if (state.focusMode === "searchresults") {
    moveSearchResultFocus(1);
  }
}

function handleLeft() {
  if (state.focusMode === "playeroverlay") {
    if (state.playerOverlayIndex === 0) {
      hidePlayerOverlay();
      state.focusMode = "player";
    } else {
      moveOverlayFocus(-1);
    }
  } else if (state.focusMode === "channels") {
    if (state.colIndex === 0) {
      clearChannelFocus();
      state.focusMode = "menu";
    } else {
      moveChannelCol(-1);
    }
  } else if (state.focusMode === "radiopanel") {
    // Go back to canal list from radio panel
    state.radioPanelBtns.forEach(function(btn) { if (btn) btn.classList.remove("active"); });
    state.focusMode = "channellist";
  } else if (state.focusMode === "channellist") {
    hideChannelList();
    if (state.channelListType === "internet") {
      state.focusMode = "countrysubmenu";
    } else if (state.channelListType === "radio" || state.channelListType === "radio-favorites") {
      state.focusMode = "radiosubmenu";
    } else if (state.channelListType === "fav-tv" || state.channelListType === "fav-radio") {
      state.focusMode = "favsubmenu";
    } else {
      state.focusMode = "submenu";
    }
  } else if (state.focusMode === "countrysubmenu") {
    hideCountrySubMenu();
    state.focusMode = "submenu";
  } else if (state.focusMode === "favsubmenu") {
    hideFavSubMenu();
    expandMenu();
    showChannelsSection();
    state.focusMode = "menu";
  } else if (state.focusMode === "moviessubmenu") {
    hideMoviesSubMenu();
    expandMenu();
    showChannelsSection();
    state.focusMode = "menu";
  } else if (state.focusMode === "tutorialsubmenu") {
    hideTutorialSubMenu();
    expandMenu();
    showChannelsSection();
    state.focusMode = "menu";
  } else if (state.focusMode === "tutoriallist") {
    hideTutorialList();
    state.focusMode = "tutorialsubmenu";
  } else if (state.focusMode === "radiosubmenu") {
    hideRadioSubMenu();
    if (state.radioPlaying) stopRadio();
    expandMenu();
    showChannelsSection();
    state.focusMode = "menu";
  } else if (state.focusMode === "submenu") {
    hideSubMenu();
    expandMenu();
    showChannelsSection();
    state.focusMode = "menu";
  } else if (state.focusMode === "newsdropdown") {
    if (state.newsDropdownIndex === 1) {
      state.newsFilterBtn.classList.remove("active");
      state.newsCountryBtn.classList.add("active");
      state.newsDropdownIndex = 0;
    } else {
      exitNews();
    }
  } else if (state.focusMode === "newsgrid") {
    if (!moveNewsCardCol(-1)) {
      exitNews();
    }
  } else if (state.focusMode === "newspreview") {
    slideNewsPreview(-1);
  } else if (state.focusMode === "newscountrydropdown") {
    hideNewsCountryList();
    state.focusMode = "newsdropdown";
  } else if (state.focusMode === "newsfilterdropdown") {
    hideNewsFilterList();
    state.focusMode = "newsdropdown";
  } else if (state.focusMode === "newspreview") {
    hideNewsPreview();
    state.focusMode = "newsgrid";
  } else if (state.focusMode === "searchkeyboard") {
    if (searchKB.colIndex > 0) {
      searchKB.colIndex--;
      setSearchKeyFocus();
    } else {
      // At leftmost col — exit search
      exitSearch();
    }
  } else if (state.focusMode === "searchinput") {
    exitSearch();
  } else if (state.focusMode === "searchresults") {
    // Back to keyboard
    showSearchKeyboard();
    state.focusMode = "searchkeyboard";
  }
}

function handleRight() {
  if (state.focusMode === "player") {
    showPlayerOverlay();
    state.focusMode = "playeroverlay";
  } else if (state.focusMode === "playeroverlay") {
    moveOverlayFocus(1);
  } else if (state.focusMode === "menu") {
    if (state.allCards.length > 0) {
      state.focusMode = "channels";
      setChannelFocus();
    }
  } else if (state.focusMode === "channels") {
    moveChannelCol(1);
  } else if (state.focusMode === "channellist") {
    // If radio is playing, move focus to the radio panel
    if (state.radioPlaying && state.radioPanel) {
      state.radioPanelIndex = 0;
      updateRadioPanelFocus();
      state.focusMode = "radiopanel";
    }
  } else if (state.focusMode === "radiopanel") {
    moveRadioPanelFocus(1);
  } else if (state.focusMode === "newsdropdown") {
    // Left/Right to switch between country and filter dropdowns
    if (state.newsDropdownIndex === 0) {
      state.newsCountryBtn.classList.remove("active");
      state.newsFilterBtn.classList.add("active");
      state.newsDropdownIndex = 1;
    }
  } else if (state.focusMode === "newsgrid") {
    moveNewsCardCol(1);
  } else if (state.focusMode === "searchkeyboard") {
    var kbRow = searchKB.rows[searchKB.rowIndex];
    if (searchKB.colIndex < kbRow.length - 1) {
      searchKB.colIndex++;
      setSearchKeyFocus();
    }
  } else if (state.focusMode === "newspreview") {
    slideNewsPreview(1);
  }
}

// Search: handle alphanumeric key input (desktop fallback)
function handleSearchKeyPress(e) {
  if (state.focusMode !== "searchinput" && state.focusMode !== "searchkeyboard") return false;
  var key = e.key;
  if (key === "Backspace") {
    handleSearchKeyInput("BACKSPACE");
    return true;
  } else if (key === " ") {
    handleSearchKeyInput("SPACE");
    return true;
  } else if (key && key.length === 1 && /[a-zA-Z0-9]/.test(key)) {
    handleSearchKeyInput(key);
    return true;
  }
  return false;
}

function handleBack() {
  if (state.focusMode === "playeroverlay") {
    hidePlayerOverlay();
    state.focusMode = "player";
  } else if (state.focusMode === "player") {
    exitPlayer();
  } else if (state.focusMode === "radiopanel") {
    state.radioPanelBtns.forEach(function(btn) { if (btn) btn.classList.remove("active"); });
    state.focusMode = "channellist";
  } else if (state.focusMode === "channels") {
    clearChannelFocus();
    state.focusMode = "menu";
  } else if (state.focusMode === "channellist") {
    hideChannelList();
    if (state.channelListType === "internet") {
      state.focusMode = "countrysubmenu";
    } else if (state.channelListType === "radio" || state.channelListType === "radio-favorites") {
      state.focusMode = "radiosubmenu";
    } else if (state.channelListType === "fav-tv" || state.channelListType === "fav-radio") {
      state.focusMode = "favsubmenu";
    } else {
      state.focusMode = "submenu";
    }
  } else if (state.focusMode === "countrysubmenu") {
    hideCountrySubMenu();
    state.focusMode = "submenu";
  } else if (state.focusMode === "favsubmenu") {
    hideFavSubMenu();
    expandMenu();
    showChannelsSection();
    state.focusMode = "menu";
  } else if (state.focusMode === "moviessubmenu") {
    hideMoviesSubMenu();
    expandMenu();
    showChannelsSection();
    state.focusMode = "menu";
  } else if (state.focusMode === "tutorialsubmenu") {
    hideTutorialSubMenu();
    expandMenu();
    showChannelsSection();
    state.focusMode = "menu";
  } else if (state.focusMode === "tutoriallist") {
    hideTutorialList();
    state.focusMode = "tutorialsubmenu";
  } else if (state.focusMode === "radiosubmenu") {
    hideRadioSubMenu();
    if (state.radioPlaying) stopRadio();
    expandMenu();
    showChannelsSection();
    state.focusMode = "menu";
  } else if (state.focusMode === "submenu") {
    hideSubMenu();
    expandMenu();
    showChannelsSection();
    state.focusMode = "menu";
  } else if (state.focusMode === "newsdropdown" || state.focusMode === "newsgrid") {
    exitNews();
  } else if (state.focusMode === "newscountrydropdown") {
    hideNewsCountryList();
    state.focusMode = "newsdropdown";
  } else if (state.focusMode === "newsfilterdropdown") {
    hideNewsFilterList();
    state.focusMode = "newsdropdown";
  } else if (state.focusMode === "newspreview") {
    hideNewsPreview();
    state.focusMode = "newsgrid";
  } else if (state.focusMode === "searchresults") {
    // Back to keyboard
    showSearchKeyboard();
    state.focusMode = "searchkeyboard";
  } else if (state.focusMode === "searchkeyboard") {
    hideSearchKeyboard();
    exitSearch();
  } else if (state.focusMode === "searchinput") {
    exitSearch();
  }
}

// ================================================
// Exports
// ================================================

export const handler = {
  onUp: () => handleUp(),
  onDown: () => handleDown(),
  onLeft: () => handleLeft(),
  onRight: () => handleRight(),
  onEnter: () => handleEnter(),
  onBack: () => handleBack(),
  onKeyPress: (e) => handleSearchKeyPress(e),
};

export function loadMovieCategories(categories) {
  while (state.moviesSubWrapper.firstChild) {
    state.moviesSubWrapper.removeChild(state.moviesSubWrapper.firstChild);
  }
  if (!categories || categories.length === 0) {
    var msg = document.createElement("div");
    msg.className = "no-results-msg";
    msg.style.cssText = "color: rgba(255,255,255,0.5); font-size: 1.4vw; padding: 3vw 1.5vw; text-align: center; width: 100%;";
    msg.textContent = "No results";
    state.moviesSubWrapper.appendChild(msg);
    state.moviesSubItems = [];
    state.moviesSubIndex = 0;
    console.log("[Movies] No categories available");
    return;
  }
  categories.forEach(function(cat, idx) {
    var item = document.createElement("div");
    item.className = "sub-item";
    if (idx === 0) item.classList.add("active");
    item.tabIndex = idx === 0 ? 0 : -1;
    item.dataset.categoryId = cat.id;
    item.innerHTML = '<span class="sub-icon">' +
      (cat.icon_src ? '<img src="' + cat.icon_src + '" style="width:100%;height:100%;object-fit:contain;">' : '<i class="fa-solid fa-film"></i>') +
      '</span>' + cat.category_name;
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
    msg.style.cssText = "color: rgba(255,255,255,0.5); font-size: 1.4vw; padding: 3vw 1.5vw; text-align: center; width: 100%;";
    msg.textContent = "No tutorials";
    state.tutorialSubWrapper.appendChild(msg);
    state.tutorialSubItems = [];
    state.tutorialSubIndex = 0;
    return;
  }
  categories.forEach(function(cat, idx) {
    var item = document.createElement("div");
    item.className = "sub-item";
    if (idx === 0) item.classList.add("active");
    item.tabIndex = idx === 0 ? 0 : -1;
    item.dataset.categoryId = cat.id;
    item.innerHTML = '<span class="sub-icon">' +
      (cat.icon_src ? '<img src="' + cat.icon_src + '" style="width:100%;height:100%;object-fit:contain;">' : '<i class="fa-solid fa-video"></i>') +
      '</span>' + cat.category_name;
    state.tutorialSubWrapper.appendChild(item);
  });
  state.tutorialSubItems = Array.from(state.tutorialSubMenu.querySelectorAll(".sub-item"));
  state.tutorialSubIndex = 0;
  console.log("[Tutorials] Loaded", state.tutorialSubItems.length, "category items");
}

export function loadInternetCountries(countries) {
  // Clear existing country items
  while (state.countryWrapper.firstChild) {
    state.countryWrapper.removeChild(state.countryWrapper.firstChild);
  }
  countries.forEach(function(c) {
    var item = document.createElement("div");
    item.className = "country-item";
    item.tabIndex = -1;
    item.dataset.countryId = c.id;
    item.innerHTML = '<span class="country-icon">' +
      (c.flag ? '<img src="' + c.flag + '" style="width:100%;height:100%;object-fit:cover;border-radius:3px;">' : '') +
      '</span>' + c.name;
    state.countryWrapper.appendChild(item);
  });
  state.countryItems = Array.from(state.countrySubMenu.querySelectorAll(".country-item"));
}

export function loadNewsCountries(countries) {
  state.newsCountries = countries || [];
  // Populate country dropdown list
  while (state.newsCountryListWrapper.firstChild) {
    state.newsCountryListWrapper.removeChild(state.newsCountryListWrapper.firstChild);
  }
  state.newsCountryItems = [];
  state.newsCountryIndex = 0;

  countries.forEach(function(c) {
    var item = document.createElement("div");
    item.className = "dropdown-item";
    item.dataset.countryId = c.id;
    item.innerHTML = (c.flag ? '<img class="pub-icon" src="' + c.flag + '">' : '<i class="fa-solid fa-flag" style="width:1.8vw;text-align:center;"></i>') +
      ' ' + c.name;
    state.newsCountryListWrapper.appendChild(item);
  });
  state.newsCountryItems = Array.from(state.newsCountryListWrapper.querySelectorAll(".dropdown-item"));
}
