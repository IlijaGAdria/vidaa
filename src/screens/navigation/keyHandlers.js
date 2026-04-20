import state from "../state.js";
import { playChannel, switchChannel, stopPlayer, togglePause, getCurrentChannel } from "../player.js";
import { addFavoriteChannel, removeFavoriteChannel, getM3uChannels } from "../../api.js";
import { FOCUS, categoryMap } from "./constants.js";

// Menu manager
import {
  moveMenuFocus, showSubMenu, showRadioSubMenu, showFavSubMenu,
  showMoviesSubMenu, showTutorialSubMenu, showSettingsSubMenu,
  showCountrySubMenu, hideSubMenu, hideRadioSubMenu, hideFavSubMenu,
  hideMoviesSubMenu, hideTutorialSubMenu, hideSettingsSubMenu,
  hideCountrySubMenu, moveSubFocus, moveRadioSubFocus, moveFavSubFocus,
  moveMoviesSubFocus, moveTutorialSubFocus, moveSettingsSubFocus,
  moveCountryFocus,
} from "./menuManager.js";

// UI
import {
  minimizeMenu, expandMenu, hideChannelsSection, showChannelsSection,
  scrollMenuToSelected,
} from "./uiHelpers.js";

// Channel grid
import {
  getCardAt, clearChannelFocus, setChannelFocus,
  moveChannelCol, moveChannelRow,
} from "./channelGrid.js";

// Channel / tutorial lists
import {
  showChannelList, showFavoritesList, showFavTvChannels,
  showFavRadioStations, showRadioAllChannels, showRadioFavoritesList,
  showTutorialList, hideChannelList, hideTutorialList,
  moveChannelListFocus, moveTutorialListFocus, renderChannelList,
} from "./channelList.js";

// Player
import {
  enterPlayer, exitPlayer, showPlayerOverlay, hidePlayerOverlay,
  moveOverlayFocus,
} from "./playerController.js";

// Radio
import {
  playRadio, stopRadio, toggleRadioFavorite,
  updateRadioPanelFocus, moveRadioPanelFocus,
} from "./radioManager.js";

// News
import {
  enterNews, exitNews, showNewsPreview, hideNewsPreview,
  slideNewsPreview, showNewsCountryList, hideNewsCountryList,
  showNewsFilterList, hideNewsFilterList, moveNewsCountryFocus,
  moveNewsFilterFocus, moveNewsCardCol, moveNewsCardRow,
  clearNewsCardFocus, setNewsCardFocus, loadNewsFeedForCurrentSelection,
  loadNewsFilterOptions,
} from "./newsManager.js";

// Search
import {
  enterSearch, exitSearch, showSearchKeyboard, hideSearchKeyboard,
  searchKBPressKey, setSearchKeyFocus, moveSearchResultFocus,
  handleSearchKeyInput, searchKB,
} from "./searchManager.js";

// Settings / PIN
import {
  isCategoryLocked, showPinDialog, hidePinDialog, showChangePinDialog,
  handlePinDigit, handlePinBackspace, showParentalPanel, hideParentalPanel,
  moveParentalFocus, toggleParentalLock, showAccountPanel, hideAccountPanel,
  populateParentalPanel,
} from "./settingsPanel.js";

// ================================================
// Section entry helpers
// ================================================

function enterTVChannels() {
  minimizeMenu();
  scrollMenuToSelected();
  showSubMenu();
  hideChannelsSection();
  state.focusMode = FOCUS.SUBMENU;
}

function enterRadio() {
  minimizeMenu();
  scrollMenuToSelected();
  showRadioSubMenu();
  hideChannelsSection();
  state.focusMode = FOCUS.RADIO_SUBMENU;
}

function enterFavorites() {
  minimizeMenu();
  scrollMenuToSelected();
  showFavSubMenu();
  hideChannelsSection();
  state.focusMode = FOCUS.FAV_SUBMENU;
}

function enterMovies() {
  minimizeMenu();
  scrollMenuToSelected();
  showMoviesSubMenu();
  hideChannelsSection();
  state.focusMode = FOCUS.MOVIES_SUBMENU;
}

function enterVideoTutorials() {
  minimizeMenu();
  scrollMenuToSelected();
  showTutorialSubMenu();
  hideChannelsSection();
  state.focusMode = FOCUS.TUTORIAL_SUBMENU;
}

function enterSettings() {
  minimizeMenu();
  scrollMenuToSelected();
  showSettingsSubMenu();
  hideChannelsSection();
  state.focusMode = FOCUS.SETTINGS_SUBMENU;
}

// ================================================
// Menu → section dispatch table
// ================================================

var menuEntryMap = {
  "menu-tv-channels": enterTVChannels,
  "menu-radio": enterRadio,
  "menu-favorites": enterFavorites,
  "menu-movies": enterMovies,
  "menu-news": enterNews,
  "menu-search": enterSearch,
  "menu-video-tutorials": enterVideoTutorials,
  "menu-settings": enterSettings,
};

// ================================================
// handleEnter — dispatch by focus mode
// ================================================

function handleEnter() {
  if (state.focusMode === FOCUS.PLAYER_OVERLAY) {
    var btn = state.playerOverlayBtns[state.playerOverlayIndex];
    if (btn && btn.id === "po-pause") {
      togglePause();
    } else if (btn && btn.id === "po-favorite") {
      var ch = getCurrentChannel();
      if (ch && ch.id) {
        if (btn.dataset.favorited === "true") {
          removeFavoriteChannel(ch.id).then(function () {
            btn.innerHTML = '<i class="fa-regular fa-heart"></i> Add to Favorites';
            btn.classList.remove("active");
            btn.dataset.favorited = "false";
            ch.favorite = false;
          }).catch(function (err) { console.error("Failed to remove favorite:", err); });
        } else {
          addFavoriteChannel(ch.id).then(function () {
            btn.innerHTML = '<i class="fa-solid fa-heart"></i> Added!';
            btn.classList.add("active");
            btn.dataset.favorited = "true";
            ch.favorite = true;
          }).catch(function (err) { console.error("Failed to add favorite:", err); });
        }
      }
    }
    return;
  }

  if (state.focusMode === FOCUS.MENU) {
    var selectedItem = state.items[state.selectedIndex];
    if (selectedItem && selectedItem.id !== "menu-radio" && state.radioPlaying) {
      stopRadio();
    }
    var entryFn = selectedItem ? menuEntryMap[selectedItem.id] : null;
    if (entryFn) entryFn();
    return;
  }

  if (state.focusMode === FOCUS.CHANNELS) {
    var card = getCardAt(state.rowIndex, state.colIndex);
    if (card && card.dataset.stream) {
      var gridStreams = state.allCards.map(function (c) { return c.dataset.stream; }).filter(Boolean);
      var gridIndex = state.colIndex * 2 + state.rowIndex;
      enterPlayer(card.dataset.stream, gridStreams, gridIndex);
    }
    return;
  }

  if (state.focusMode === FOCUS.SUBMENU) {
    var itemId = state.subItems[state.subIndex].id;
    if (itemId === "sub-internet-tv") {
      showCountrySubMenu();
      state.focusMode = FOCUS.COUNTRY_SUBMENU;
    } else if (itemId === "sub-all") {
      showChannelList(null);
      state.focusMode = FOCUS.CHANNEL_LIST;
    } else if (itemId === "sub-favorites") {
      showFavoritesList();
      state.focusMode = FOCUS.CHANNEL_LIST;
    } else if (categoryMap[itemId]) {
      var catId = categoryMap[itemId];
      if (isCategoryLocked(catId)) {
        showPinDialog(catId);
      } else {
        showChannelList(catId);
        state.focusMode = FOCUS.CHANNEL_LIST;
      }
    }
    return;
  }

  if (state.focusMode === FOCUS.RADIO_SUBMENU) {
    var radioItemId = state.radioSubItems[state.radioSubIndex].id;
    if (radioItemId === "radio-all") {
      showRadioAllChannels();
      state.focusMode = FOCUS.CHANNEL_LIST;
    } else if (radioItemId === "radio-favorites") {
      showRadioFavoritesList();
      state.focusMode = FOCUS.CHANNEL_LIST;
    }
    return;
  }

  if (state.focusMode === FOCUS.FAV_SUBMENU) {
    var favItemId = state.favSubItems[state.favSubIndex].id;
    if (favItemId === "fav-tv-channels") {
      showFavTvChannels();
      state.focusMode = FOCUS.CHANNEL_LIST;
    } else if (favItemId === "fav-radio-stations") {
      showFavRadioStations();
      state.focusMode = FOCUS.CHANNEL_LIST;
    }
    return;
  }

  if (state.focusMode === FOCUS.NEWS_DROPDOWN) {
    if (state.newsDropdownIndex === 0) {
      showNewsCountryList();
      state.focusMode = FOCUS.NEWS_COUNTRY_DROPDOWN;
    } else {
      showNewsFilterList();
      state.focusMode = FOCUS.NEWS_FILTER_DROPDOWN;
    }
    return;
  }

  if (state.focusMode === FOCUS.NEWS_GRID) {
    var articleIdx = state.newsRowIndex * 2 + state.newsColIndex;
    if (state.newsArticles[articleIdx]) showNewsPreview(articleIdx);
    return;
  }

  if (state.focusMode === FOCUS.NEWS_COUNTRY_DROPDOWN) {
    var countryItem = state.newsCountryItems[state.newsCountryIndex];
    if (countryItem) {
      var cId = countryItem.dataset.countryId;
      state.newsSelectedCountryId = cId;
      state.newsSelectedFilterId = "";
      state.newsCountryBtn.querySelector("span").textContent = countryItem.textContent.trim();
      hideNewsCountryList();
      loadNewsFilterOptions(cId);
      loadNewsFeedForCurrentSelection();
      state.focusMode = FOCUS.NEWS_DROPDOWN;
    }
    return;
  }

  if (state.focusMode === FOCUS.NEWS_FILTER_DROPDOWN) {
    var filterItem = state.newsFilterItems[state.newsFilterIndex];
    if (filterItem) {
      state.newsSelectedFilterId = filterItem.dataset.filterId || "";
      state.newsFilterBtn.querySelector("span").textContent = filterItem.textContent.trim();
      hideNewsFilterList();
      loadNewsFeedForCurrentSelection();
      state.focusMode = FOCUS.NEWS_DROPDOWN;
    }
    return;
  }

  if (state.focusMode === FOCUS.SEARCH_KEYBOARD) {
    var row = searchKB.rows[searchKB.rowIndex];
    if (row && row[searchKB.colIndex]) {
      searchKBPressKey(row[searchKB.colIndex].dataset.key);
    }
    return;
  }

  if (state.focusMode === FOCUS.SEARCH_INPUT) {
    showSearchKeyboard();
    state.focusMode = FOCUS.SEARCH_KEYBOARD;
    return;
  }

  if (state.focusMode === FOCUS.SEARCH_RESULTS) {
    var srItem = state.searchResultItems[state.searchResultIndex];
    if (srItem && srItem.dataset.stream) {
      var srStreams = state.searchResultItems.map(function (i) { return i.dataset.stream; }).filter(Boolean);
      enterPlayer(srItem.dataset.stream, srStreams, state.searchResultIndex);
    }
    return;
  }

  if (state.focusMode === FOCUS.MOVIES_SUBMENU) {
    var movieItem = state.moviesSubItems[state.moviesSubIndex];
    if (movieItem && movieItem.dataset.categoryId) {
      console.log("[Movies] Selected category:", parseInt(movieItem.dataset.categoryId, 10), movieItem.textContent.trim());
    }
    return;
  }

  if (state.focusMode === FOCUS.SETTINGS_SUBMENU) {
    var settItem = state.settingsSubItems[state.settingsSubIndex];
    if (settItem && settItem.id === "settings-account") {
      hideParentalPanel();
      showAccountPanel();
    } else if (settItem && settItem.id === "settings-parental") {
      hideAccountPanel();
      showParentalPanel();
    } else if (settItem && settItem.id === "settings-changepin") {
      hideAccountPanel();
      hideParentalPanel();
      showChangePinDialog();
    }
    return;
  }

  if (state.focusMode === FOCUS.PARENTAL_CONTROL) {
    toggleParentalLock();
    return;
  }

  if (state.focusMode === FOCUS.TUTORIAL_SUBMENU) {
    var tutItem = state.tutorialSubItems[state.tutorialSubIndex];
    if (tutItem && tutItem.dataset.categoryId) {
      showTutorialList(parseInt(tutItem.dataset.categoryId, 10));
      state.focusMode = FOCUS.TUTORIAL_LIST;
    }
    return;
  }

  if (state.focusMode === FOCUS.TUTORIAL_LIST) {
    var tutVid = state.tutorialListItems[state.tutorialListIndex];
    if (tutVid && tutVid.dataset.stream) {
      var tutStreams = state.tutorialListItems.map(function (i) { return i.dataset.stream; }).filter(Boolean);
      enterPlayer(tutVid.dataset.stream, tutStreams, state.tutorialListIndex);
    }
    return;
  }

  if (state.focusMode === FOCUS.COUNTRY_SUBMENU) {
    var cItem = state.countryItems[state.countryIndex];
    if (cItem && cItem.dataset.countryId) {
      var countryId = parseInt(cItem.dataset.countryId, 10);
      state.channelListType = "internet";
      getM3uChannels(countryId).then(function (data) {
        var channels = data && data.channels ? data.channels : Array.isArray(data) ? data : [];
        if (channels.length === 0) {
          while (state.channelListWrapper.firstChild) state.channelListWrapper.removeChild(state.channelListWrapper.firstChild);
          state.channelListItems = [];
          var msg = document.createElement("div");
          msg.style.cssText = "color: rgba(255,255,255,0.6); font-size: 2vw; padding: 2vw; text-align: center; width: 100%; display: flex; align-items: center; justify-content: center; height: 40vh;";
          msg.textContent = "No available channels";
          state.channelListWrapper.appendChild(msg);
          if (state.channelList) { state.channelList.classList.add("visible"); state.channelList.classList.add("shifted"); }
          return;
        }
        state.internetChannelsData = channels;
        while (state.channelListWrapper.firstChild) state.channelListWrapper.removeChild(state.channelListWrapper.firstChild);
        state.channelListItems = [];
        if (state.channelList) { state.channelList.classList.add("visible"); state.channelList.classList.add("shifted"); }
        renderChannelList(channels);
        state.focusMode = FOCUS.CHANNEL_LIST;
      }).catch(function (err) { console.error("Failed to load m3u channels:", err); });
    }
    return;
  }

  if (state.focusMode === FOCUS.CHANNEL_LIST) {
    var item = state.channelListItems[state.channelListIndex];
    if (item && item.dataset.stream) {
      if (state.channelListType === "radio" || state.channelListType === "radio-favorites" || state.channelListType === "fav-radio") {
        var radioIdx = state.channelListIndex;
        var radioObj = state.radiosData[radioIdx] || null;
        if (state.channelListType === "radio-favorites" || state.channelListType === "fav-radio") {
          var favRadios = state.radiosData.filter(function (r) { return r.favorite === true; });
          radioObj = favRadios[radioIdx] || null;
        }
        playRadio(item.dataset.stream, radioObj);
        return;
      }
      var listStreams = state.channelListItems.map(function (i) { return i.dataset.stream; }).filter(Boolean);
      enterPlayer(item.dataset.stream, listStreams, state.channelListIndex);
    }
    return;
  }

  if (state.focusMode === FOCUS.RADIO_PANEL) {
    var rBtn = state.radioPanelBtns[state.radioPanelIndex];
    if (rBtn && rBtn.id === "radio-btn-stop") stopRadio();
    else if (rBtn && rBtn.id === "radio-btn-fav") toggleRadioFavorite();
    return;
  }
}

// ================================================
// handleUp / handleDown
// ================================================

function handleUp() {
  var fm = state.focusMode;
  if (fm === FOCUS.PLAYER_OVERLAY || fm === FOCUS.PLAYER) { switchChannel(-1); }
  else if (fm === FOCUS.MENU) { moveMenuFocus(-1); }
  else if (fm === FOCUS.SUBMENU) { moveSubFocus(-1); }
  else if (fm === FOCUS.RADIO_SUBMENU) { moveRadioSubFocus(-1); }
  else if (fm === FOCUS.FAV_SUBMENU) { moveFavSubFocus(-1); }
  else if (fm === FOCUS.MOVIES_SUBMENU) { moveMoviesSubFocus(-1); }
  else if (fm === FOCUS.TUTORIAL_SUBMENU) { moveTutorialSubFocus(-1); }
  else if (fm === FOCUS.SETTINGS_SUBMENU) { moveSettingsSubFocus(-1); }
  else if (fm === FOCUS.PARENTAL_CONTROL) { moveParentalFocus(-1); }
  else if (fm === FOCUS.COUNTRY_SUBMENU) { moveCountryFocus(-1); }
  else if (fm === FOCUS.CHANNEL_LIST) { moveChannelListFocus(-1); }
  else if (fm === FOCUS.TUTORIAL_LIST) { moveTutorialListFocus(-1); }
  else if (fm === FOCUS.CHANNELS) { moveChannelRow(-1); }
  else if (fm === FOCUS.NEWS_GRID) {
    if (state.newsRowIndex === 0) {
      clearNewsCardFocus();
      state.newsCountryBtn.classList.add("active");
      state.newsDropdownIndex = 0;
      state.focusMode = FOCUS.NEWS_DROPDOWN;
    } else { moveNewsCardRow(-1); }
  }
  else if (fm === FOCUS.NEWS_COUNTRY_DROPDOWN) { moveNewsCountryFocus(-1); }
  else if (fm === FOCUS.NEWS_FILTER_DROPDOWN) { moveNewsFilterFocus(-1); }
  else if (fm === FOCUS.SEARCH_RESULTS) { moveSearchResultFocus(-1); }
  else if (fm === FOCUS.SEARCH_KEYBOARD) {
    if (searchKB.rowIndex > 0) {
      searchKB.rowIndex--;
      if (searchKB.colIndex >= searchKB.rows[searchKB.rowIndex].length) {
        searchKB.colIndex = searchKB.rows[searchKB.rowIndex].length - 1;
      }
      setSearchKeyFocus();
    }
  }
}

function handleDown() {
  var fm = state.focusMode;
  if (fm === FOCUS.PLAYER_OVERLAY || fm === FOCUS.PLAYER) { switchChannel(1); }
  else if (fm === FOCUS.MENU) { moveMenuFocus(1); }
  else if (fm === FOCUS.SUBMENU) { moveSubFocus(1); }
  else if (fm === FOCUS.RADIO_SUBMENU) { moveRadioSubFocus(1); }
  else if (fm === FOCUS.FAV_SUBMENU) { moveFavSubFocus(1); }
  else if (fm === FOCUS.MOVIES_SUBMENU) { moveMoviesSubFocus(1); }
  else if (fm === FOCUS.TUTORIAL_SUBMENU) { moveTutorialSubFocus(1); }
  else if (fm === FOCUS.SETTINGS_SUBMENU) { moveSettingsSubFocus(1); }
  else if (fm === FOCUS.PARENTAL_CONTROL) { moveParentalFocus(1); }
  else if (fm === FOCUS.COUNTRY_SUBMENU) { moveCountryFocus(1); }
  else if (fm === FOCUS.CHANNEL_LIST) { moveChannelListFocus(1); }
  else if (fm === FOCUS.TUTORIAL_LIST) { moveTutorialListFocus(1); }
  else if (fm === FOCUS.CHANNELS) { moveChannelRow(1); }
  else if (fm === FOCUS.NEWS_DROPDOWN) {
    state.newsCountryBtn.classList.remove("active");
    state.newsFilterBtn.classList.remove("active");
    if (state.newsCards.length > 0) { state.focusMode = FOCUS.NEWS_GRID; setNewsCardFocus(); }
  }
  else if (fm === FOCUS.NEWS_GRID) { moveNewsCardRow(1); }
  else if (fm === FOCUS.NEWS_COUNTRY_DROPDOWN) { moveNewsCountryFocus(1); }
  else if (fm === FOCUS.NEWS_FILTER_DROPDOWN) { moveNewsFilterFocus(1); }
  else if (fm === FOCUS.SEARCH_KEYBOARD) {
    if (searchKB.rowIndex < searchKB.rows.length - 1) {
      searchKB.rowIndex++;
      if (searchKB.colIndex >= searchKB.rows[searchKB.rowIndex].length) {
        searchKB.colIndex = searchKB.rows[searchKB.rowIndex].length - 1;
      }
      setSearchKeyFocus();
    }
  }
  else if (fm === FOCUS.SEARCH_INPUT) {
    if (state.searchResultItems && state.searchResultItems.length > 0) {
      state.searchInputBox.classList.remove("active");
      state.focusMode = FOCUS.SEARCH_RESULTS;
    }
  }
  else if (fm === FOCUS.SEARCH_RESULTS) { moveSearchResultFocus(1); }
}

// ================================================
// handleLeft / handleRight
// ================================================

function handleLeft() {
  var fm = state.focusMode;
  if (fm === FOCUS.PLAYER_OVERLAY) {
    if (state.playerOverlayIndex === 0) { hidePlayerOverlay(); state.focusMode = FOCUS.PLAYER; }
    else { moveOverlayFocus(-1); }
  }
  else if (fm === FOCUS.CHANNELS) {
    if (state.colIndex === 0) { clearChannelFocus(); state.focusMode = FOCUS.MENU; }
    else { moveChannelCol(-1); }
  }
  else if (fm === FOCUS.RADIO_PANEL) {
    state.radioPanelBtns.forEach(function (b) { if (b) b.classList.remove("active"); });
    state.focusMode = FOCUS.CHANNEL_LIST;
  }
  else if (fm === FOCUS.CHANNEL_LIST) {
    hideChannelList();
    if (state.channelListType === "internet") state.focusMode = FOCUS.COUNTRY_SUBMENU;
    else if (state.channelListType === "radio" || state.channelListType === "radio-favorites") state.focusMode = FOCUS.RADIO_SUBMENU;
    else if (state.channelListType === "fav-tv" || state.channelListType === "fav-radio") state.focusMode = FOCUS.FAV_SUBMENU;
    else state.focusMode = FOCUS.SUBMENU;
  }
  else if (fm === FOCUS.COUNTRY_SUBMENU) { hideCountrySubMenu(); state.focusMode = FOCUS.SUBMENU; }
  else if (fm === FOCUS.FAV_SUBMENU) { hideFavSubMenu(); expandMenu(); showChannelsSection(); state.focusMode = FOCUS.MENU; }
  else if (fm === FOCUS.MOVIES_SUBMENU) { hideMoviesSubMenu(); expandMenu(); showChannelsSection(); state.focusMode = FOCUS.MENU; }
  else if (fm === FOCUS.TUTORIAL_SUBMENU) { hideTutorialSubMenu(); expandMenu(); showChannelsSection(); state.focusMode = FOCUS.MENU; }
  else if (fm === FOCUS.TUTORIAL_LIST) { hideTutorialList(); state.focusMode = FOCUS.TUTORIAL_SUBMENU; }
  else if (fm === FOCUS.SETTINGS_SUBMENU) { hideSettingsSubMenu(); hideAccountPanel(); hideParentalPanel(); expandMenu(); showChannelsSection(); state.focusMode = FOCUS.MENU; }
  else if (fm === FOCUS.PARENTAL_CONTROL) { hideParentalPanel(); state.focusMode = FOCUS.SETTINGS_SUBMENU; }
  else if (fm === FOCUS.RADIO_SUBMENU) { hideRadioSubMenu(); if (state.radioPlaying) stopRadio(); expandMenu(); showChannelsSection(); state.focusMode = FOCUS.MENU; }
  else if (fm === FOCUS.SUBMENU) { hideSubMenu(); expandMenu(); showChannelsSection(); state.focusMode = FOCUS.MENU; }
  else if (fm === FOCUS.NEWS_DROPDOWN) {
    if (state.newsDropdownIndex === 1) {
      state.newsFilterBtn.classList.remove("active");
      state.newsCountryBtn.classList.add("active");
      state.newsDropdownIndex = 0;
    } else { exitNews(); }
  }
  else if (fm === FOCUS.NEWS_GRID) { if (!moveNewsCardCol(-1)) exitNews(); }
  else if (fm === FOCUS.NEWS_PREVIEW) { slideNewsPreview(-1); }
  else if (fm === FOCUS.NEWS_COUNTRY_DROPDOWN) { hideNewsCountryList(); state.focusMode = FOCUS.NEWS_DROPDOWN; }
  else if (fm === FOCUS.NEWS_FILTER_DROPDOWN) { hideNewsFilterList(); state.focusMode = FOCUS.NEWS_DROPDOWN; }
  else if (fm === FOCUS.SEARCH_KEYBOARD) {
    if (searchKB.colIndex > 0) { searchKB.colIndex--; setSearchKeyFocus(); }
    else { exitSearch(); }
  }
  else if (fm === FOCUS.SEARCH_INPUT) { exitSearch(); }
  else if (fm === FOCUS.SEARCH_RESULTS) { showSearchKeyboard(); state.focusMode = FOCUS.SEARCH_KEYBOARD; }
}

function handleRight() {
  var fm = state.focusMode;
  if (fm === FOCUS.PLAYER) { showPlayerOverlay(); state.focusMode = FOCUS.PLAYER_OVERLAY; }
  else if (fm === FOCUS.PLAYER_OVERLAY) { moveOverlayFocus(1); }
  else if (fm === FOCUS.MENU) {
    if (state.allCards.length > 0) { state.focusMode = FOCUS.CHANNELS; setChannelFocus(); }
  }
  else if (fm === FOCUS.CHANNELS) { moveChannelCol(1); }
  else if (fm === FOCUS.CHANNEL_LIST) {
    if (state.radioPlaying && state.radioPanel) {
      state.radioPanelIndex = 0;
      updateRadioPanelFocus();
      state.focusMode = FOCUS.RADIO_PANEL;
    }
  }
  else if (fm === FOCUS.RADIO_PANEL) { moveRadioPanelFocus(1); }
  else if (fm === FOCUS.NEWS_DROPDOWN) {
    if (state.newsDropdownIndex === 0) {
      state.newsCountryBtn.classList.remove("active");
      state.newsFilterBtn.classList.add("active");
      state.newsDropdownIndex = 1;
    }
  }
  else if (fm === FOCUS.NEWS_GRID) { moveNewsCardCol(1); }
  else if (fm === FOCUS.SEARCH_KEYBOARD) {
    var kbRow = searchKB.rows[searchKB.rowIndex];
    if (searchKB.colIndex < kbRow.length - 1) { searchKB.colIndex++; setSearchKeyFocus(); }
  }
  else if (fm === FOCUS.NEWS_PREVIEW) { slideNewsPreview(1); }
}

// ================================================
// handleSearchKeyPress (desktop key fallback + PIN input)
// ================================================

function handleSearchKeyPress(e) {
  if (state.focusMode === FOCUS.PIN_DIALOG) {
    var key = e.key;
    if (key === "Backspace") { handlePinBackspace(); return true; }
    else if (key && key.length === 1 && /[0-9]/.test(key)) { handlePinDigit(key); return true; }
    return true;
  }
  if (state.focusMode !== FOCUS.SEARCH_INPUT && state.focusMode !== FOCUS.SEARCH_KEYBOARD) return false;
  var key = e.key;
  if (key === "Backspace") { handleSearchKeyInput("BACKSPACE"); return true; }
  else if (key === " ") { handleSearchKeyInput("SPACE"); return true; }
  else if (key && key.length === 1 && /[a-zA-Z0-9]/.test(key)) { handleSearchKeyInput(key); return true; }
  return false;
}

// ================================================
// handleBack
// ================================================

function handleBack() {
  var fm = state.focusMode;
  if (fm === FOCUS.PIN_DIALOG) {
    var wasChangePin = state.pinChangeStep > 0;
    hidePinDialog();
    state.pinPendingAction = null;
    if (wasChangePin) state.focusMode = FOCUS.SETTINGS_SUBMENU;
    else if (state.pinPendingCategoryId !== null) state.focusMode = FOCUS.SUBMENU;
    else state.focusMode = FOCUS.PARENTAL_CONTROL;
    state.pinPendingCategoryId = null;
  }
  else if (fm === FOCUS.PLAYER_OVERLAY) { hidePlayerOverlay(); state.focusMode = FOCUS.PLAYER; }
  else if (fm === FOCUS.PLAYER) { exitPlayer(); }
  else if (fm === FOCUS.RADIO_PANEL) {
    state.radioPanelBtns.forEach(function (b) { if (b) b.classList.remove("active"); });
    state.focusMode = FOCUS.CHANNEL_LIST;
  }
  else if (fm === FOCUS.CHANNELS) { clearChannelFocus(); state.focusMode = FOCUS.MENU; }
  else if (fm === FOCUS.CHANNEL_LIST) {
    hideChannelList();
    if (state.channelListType === "internet") state.focusMode = FOCUS.COUNTRY_SUBMENU;
    else if (state.channelListType === "radio" || state.channelListType === "radio-favorites") state.focusMode = FOCUS.RADIO_SUBMENU;
    else if (state.channelListType === "fav-tv" || state.channelListType === "fav-radio") state.focusMode = FOCUS.FAV_SUBMENU;
    else state.focusMode = FOCUS.SUBMENU;
  }
  else if (fm === FOCUS.COUNTRY_SUBMENU) { hideCountrySubMenu(); state.focusMode = FOCUS.SUBMENU; }
  else if (fm === FOCUS.FAV_SUBMENU) { hideFavSubMenu(); expandMenu(); showChannelsSection(); state.focusMode = FOCUS.MENU; }
  else if (fm === FOCUS.MOVIES_SUBMENU) { hideMoviesSubMenu(); expandMenu(); showChannelsSection(); state.focusMode = FOCUS.MENU; }
  else if (fm === FOCUS.TUTORIAL_SUBMENU) { hideTutorialSubMenu(); expandMenu(); showChannelsSection(); state.focusMode = FOCUS.MENU; }
  else if (fm === FOCUS.TUTORIAL_LIST) { hideTutorialList(); state.focusMode = FOCUS.TUTORIAL_SUBMENU; }
  else if (fm === FOCUS.SETTINGS_SUBMENU) { hideSettingsSubMenu(); hideAccountPanel(); hideParentalPanel(); expandMenu(); showChannelsSection(); state.focusMode = FOCUS.MENU; }
  else if (fm === FOCUS.PARENTAL_CONTROL) { hideParentalPanel(); state.focusMode = FOCUS.SETTINGS_SUBMENU; }
  else if (fm === FOCUS.RADIO_SUBMENU) { hideRadioSubMenu(); if (state.radioPlaying) stopRadio(); expandMenu(); showChannelsSection(); state.focusMode = FOCUS.MENU; }
  else if (fm === FOCUS.SUBMENU) { hideSubMenu(); expandMenu(); showChannelsSection(); state.focusMode = FOCUS.MENU; }
  else if (fm === FOCUS.NEWS_DROPDOWN || fm === FOCUS.NEWS_GRID) { exitNews(); }
  else if (fm === FOCUS.NEWS_COUNTRY_DROPDOWN) { hideNewsCountryList(); state.focusMode = FOCUS.NEWS_DROPDOWN; }
  else if (fm === FOCUS.NEWS_FILTER_DROPDOWN) { hideNewsFilterList(); state.focusMode = FOCUS.NEWS_DROPDOWN; }
  else if (fm === FOCUS.NEWS_PREVIEW) { hideNewsPreview(); state.focusMode = FOCUS.NEWS_GRID; }
  else if (fm === FOCUS.SEARCH_RESULTS) { showSearchKeyboard(); state.focusMode = FOCUS.SEARCH_KEYBOARD; }
  else if (fm === FOCUS.SEARCH_KEYBOARD) { hideSearchKeyboard(); exitSearch(); }
  else if (fm === FOCUS.SEARCH_INPUT) { exitSearch(); }
}

// ================================================
// Exports
// ================================================

export const handler = {
  onUp: function () { handleUp(); },
  onDown: function () { handleDown(); },
  onLeft: function () { handleLeft(); },
  onRight: function () { handleRight(); },
  onEnter: function () { handleEnter(); },
  onBack: function () { handleBack(); },
  onKeyPress: function (e) { return handleSearchKeyPress(e); },
};
