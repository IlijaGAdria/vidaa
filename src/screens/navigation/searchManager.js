import state from "../state.js";
import { minimizeMenu, expandMenu, hideChannelsSection, showChannelsSection, scrollMenuToSelected } from "./uiHelpers.js";
import { isCategoryLocked } from "./settingsPanel.js";

// ================================================
// Search section — virtual keyboard + results
// ================================================

var searchKB = {
  container: null,
  rows: [],
  rowIndex: 0,
  colIndex: 0,
  capsLock: false,
  layouts: {
    lower: [
      ["1","2","3","4","5","6","7","8","9","0"],
      ["q","w","e","r","t","y","u","i","o","p"],
      ["a","s","d","f","g","h","j","k","l","@"],
      ["z","x","c","v","b","n","m",".","-","_"],
      ["⇧","SPACE","⌫","CLEAR","DONE"],
    ],
    upper: [
      ["1","2","3","4","5","6","7","8","9","0"],
      ["Q","W","E","R","T","Y","U","I","O","P"],
      ["A","S","D","F","G","H","J","K","L","@"],
      ["Z","X","C","V","B","N","M",".","-","_"],
      ["⇧","SPACE","⌫","CLEAR","DONE"],
    ],
  },
};

function injectSearchKBStyles() {
  if (document.getElementById("vk-styles")) return;
  var style = document.createElement("style");
  style.id = "vk-styles";
  style.textContent =
    ".vk-overlay { position: fixed; bottom: 0; left: 0; width: 100vw; display: none; justify-content: center; z-index: 500; background: linear-gradient(to top, rgba(10,15,25,0.98) 60%, rgba(10,15,25,0.85)); padding: 1.5vw 0 2vw; transition: opacity 0.2s; }" +
    ".vk-overlay.visible { display: flex; }" +
    ".vk-board { display: flex; flex-direction: column; align-items: center; gap: 0.6vw; }" +
    ".vk-row { display: flex; gap: 0.5vw; }" +
    ".vk-key { min-width: 4vw; height: 4vw; display: flex; align-items: center; justify-content: center; border-radius: 0.5vw; font-size: 1.4vw; color: #fff; background: rgba(255,255,255,0.1); cursor: pointer; transition: background 0.15s, transform 0.1s; user-select: none; }" +
    ".vk-key.active { background: #00b9be; transform: scale(1.1); }" +
    ".vk-key.wide { min-width: 8vw; font-size: 1.1vw; }" +
    ".vk-key.space { min-width: 16vw; }" +
    ".vk-input-preview { color: #fff; font-size: 1.3vw; margin-bottom: 0.8vw; text-align: center; background: rgba(255,255,255,0.08); padding: 0.7vw 2vw; border-radius: 0.4vw; min-width: 30vw; min-height: 2.4vw; letter-spacing: 0.05vw; }";
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

  var preview = document.createElement("div");
  preview.className = "vk-input-preview";
  preview.id = "search-kb-preview";
  preview.textContent = "";
  board.appendChild(preview);

  var layout = searchKB.capsLock ? searchKB.layouts.upper : searchKB.layouts.lower;
  searchKB.rows = [];

  layout.forEach(function (rowKeys) {
    var row = document.createElement("div");
    row.className = "vk-row";
    rowKeys.forEach(function (key) {
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

export function showSearchKeyboard() {
  if (!searchKB.container) buildSearchKeyboard();
  searchKB.container.classList.add("visible");
  searchKB.rowIndex = 0;
  searchKB.colIndex = 0;
  searchKB.capsLock = false;
  setSearchKeyFocus();
  updateSearchKBPreview();
}

export function hideSearchKeyboard() {
  if (searchKB.container) searchKB.container.classList.remove("visible");
}

export function setSearchKeyFocus() {
  searchKB.rows.forEach(function (row) {
    row.forEach(function (k) { k.classList.remove("active"); });
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

export function searchKBPressKey(key) {
  if (key === "⇧") {
    searchKB.capsLock = !searchKB.capsLock;
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

// ---- Search display & execution ----

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
  if (query.length === 0) { renderSearchResults([]); return; }
  var results = (state.channelsData || []).filter(function (ch) {
    if (ch.category_ids && Array.isArray(ch.category_ids)) {
      for (var i = 0; i < ch.category_ids.length; i++) {
        if (isCategoryLocked(ch.category_ids[i])) return false;
      }
    }
    return (ch.name || "").toLowerCase().indexOf(query) !== -1;
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

  channels.forEach(function (ch) {
    var item = document.createElement("div");
    item.className = "search-result-item";
    item.tabIndex = -1;
    item.dataset.stream = ch.src || ch.stream_path || "";
    item.innerHTML =
      '<img class="sr-icon" src="' + (ch.stream_icon || "") + '" alt="" onerror="this.style.display=\'none\'">' +
      '<span class="sr-name">' + (ch.name || "") + "</span>" +
      '<i class="fa-solid fa-circle-play sr-play"></i>';
    list.appendChild(item);
  });

  state.searchResultItems = Array.from(list.querySelectorAll(".search-result-item"));
  if (state.searchResultItems[0]) {
    state.searchResultItems[0].classList.add("active");
    state.searchResultItems[0].tabIndex = 0;
  }
}

export function moveSearchResultFocus(direction) {
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

export function handleSearchKeyInput(key) {
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

// ---- Entry / exit ----

function showSearchSection() {
  if (state.searchSection) state.searchSection.classList.add("visible");
}

function hideSearchSection() {
  if (state.searchSection) state.searchSection.classList.remove("visible");
}

export function enterSearch() {
  minimizeMenu();
  scrollMenuToSelected();
  hideChannelsSection();
  showSearchSection();

  state.searchQuery = "";
  state.searchResultIndex = 0;
  updateSearchDisplay();
  renderSearchResults([]);

  if (state.searchInputBox) state.searchInputBox.classList.add("active");
  showSearchKeyboard();
  state.focusMode = "searchkeyboard";
}

export function exitSearch() {
  hideSearchKeyboard();
  hideSearchSection();
  if (state.searchInputBox) state.searchInputBox.classList.remove("active");
  state.searchQuery = "";
  updateSearchDisplay();
  expandMenu();
  showChannelsSection();
  state.focusMode = "menu";
}

// Expose searchKB for keyboard navigation in keyHandlers
export { searchKB };
