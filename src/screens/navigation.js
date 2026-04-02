import state from "./state.js";
import { playChannel, switchChannel, stopPlayer, togglePause, getCurrentChannel } from "./player.js";
import { fetchFavorites, addFavoriteChannel, removeFavoriteChannel } from "../api.js";

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
// Country sub-menu
// ================================================

function showCountrySubMenu() {
  if (state.countrySubMenu) state.countrySubMenu.classList.add("visible");
  state.countryIndex = 0;
  state.countryItems.forEach(function(item) {
    item.classList.remove("active");
    item.tabIndex = -1;
  });
  if (state.countryItems[0]) {
    state.countryItems[0].classList.add("active");
    state.countryItems[0].tabIndex = 0;
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
  "Music": "Muzički",
  "News": "Informativni",
  "Sports": "Sportski",
  "Movies": "Filmski",
  "Children": "Dečiji",
  "Documentaries": "Dokumentarni",
  "Entertainment": "Zabavni",
  "Reality": "Reality",
  "General": "Generalni",
};

function showChannelList(categoryName) {
  state.channelListType = "category";
  var filtered;
  if (categoryName) {
    filtered = state.channelsData.filter(function(ch) {
      return ch.category && ch.category.category_name === categoryName;
    });
  } else {
    filtered = state.channelsData;
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

  channels.forEach(function(ch) {
    var item = document.createElement("div");
    item.className = "channel-list-item";
    item.tabIndex = -1;
    item.dataset.stream = ch.src || "";
    item.innerHTML =
      '<span class="cl-number">' + (ch.num || "") + '.</span>' +
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
  if (state.channelList) state.channelList.classList.remove("visible");
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
  if (state.countrySubMenu) state.countrySubMenu.style.display = "none";
  if (state.channelList) state.channelList.style.display = "none";
}

// Restore all app UI elements (clear inline display overrides, let CSS classes decide)
function restoreAllUI() {
  document.querySelector("header").style.display = "";
  document.getElementById("menu").style.display = "";
  document.querySelector(".channels-section").style.display = "";
  if (state.subMenu) state.subMenu.style.display = "";
  if (state.countrySubMenu) state.countrySubMenu.style.display = "";
  if (state.channelList) state.channelList.style.display = "";
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
    // Came from channel list (favorites or category) — restore that view
    minimizeMenu();
    hideChannelsSection();
    showSubMenu();
    if (state.channelList) state.channelList.classList.add("visible");
    // Refresh the list if it was favorites (may have changed)
    if (state.channelListType === "favorites") {
      showFavoritesList();
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
    if (selectedItem && selectedItem.textContent.trim() === "TV Channels") {
      enterTVChannels();
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
    var label = state.subItems[state.subIndex].textContent.trim();
    if (label === "Internet TV") {
      showCountrySubMenu();
      state.focusMode = "countrysubmenu";
    } else if (label === "All") {
      showChannelList(null);
      state.focusMode = "channellist";
    } else if (label === "Favorites") {
      showFavoritesList();
      state.focusMode = "channellist";
    } else if (categoryMap[label]) {
      showChannelList(categoryMap[label]);
      state.focusMode = "channellist";
    }
    return;
  }

  // Channel list — enter player with filtered list as playlist
  if (state.focusMode === "channellist") {
    var item = state.channelListItems[state.channelListIndex];
    if (item && item.dataset.stream) {
      var listStreams = state.channelListItems.map(function(i) { return i.dataset.stream; }).filter(Boolean);
      enterPlayer(item.dataset.stream, listStreams, state.channelListIndex);
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
  } else if (state.focusMode === "countrysubmenu") {
    moveCountryFocus(-1);
  } else if (state.focusMode === "channellist") {
    moveChannelListFocus(-1);
  } else if (state.focusMode === "channels") {
    moveChannelRow(-1);
  }
}

function handleDown() {
  if (state.focusMode === "playeroverlay" || state.focusMode === "player") {
    switchChannel(1);
  } else if (state.focusMode === "menu") {
    moveMenuFocus(1);
  } else if (state.focusMode === "submenu") {
    moveSubFocus(1);
  } else if (state.focusMode === "countrysubmenu") {
    moveCountryFocus(1);
  } else if (state.focusMode === "channellist") {
    moveChannelListFocus(1);
  } else if (state.focusMode === "channels") {
    moveChannelRow(1);
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
  } else if (state.focusMode === "channellist") {
    hideChannelList();
    state.focusMode = "submenu";
  } else if (state.focusMode === "countrysubmenu") {
    hideCountrySubMenu();
    state.focusMode = "submenu";
  } else if (state.focusMode === "submenu") {
    hideSubMenu();
    expandMenu();
    showChannelsSection();
    state.focusMode = "menu";
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
  }
}

function handleBack() {
  if (state.focusMode === "playeroverlay") {
    hidePlayerOverlay();
    state.focusMode = "player";
  } else if (state.focusMode === "player") {
    exitPlayer();
  } else if (state.focusMode === "channels") {
    clearChannelFocus();
    state.focusMode = "menu";
  } else if (state.focusMode === "channellist") {
    hideChannelList();
    state.focusMode = "submenu";
  } else if (state.focusMode === "countrysubmenu") {
    hideCountrySubMenu();
    state.focusMode = "submenu";
  } else if (state.focusMode === "submenu") {
    hideSubMenu();
    expandMenu();
    showChannelsSection();
    state.focusMode = "menu";
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
};

export function addCountry(name, iconSrc) {
  var item = document.createElement("div");
  item.className = "country-item";
  item.tabIndex = -1;
  item.innerHTML = '<span class="country-icon">' +
    (iconSrc ? '<img src="' + iconSrc + '" style="width:100%;height:100%;object-fit:cover;border-radius:3px;">' : '') +
    '</span>' + name;
  state.countryWrapper.appendChild(item);
  state.countryItems = Array.from(state.countrySubMenu.querySelectorAll(".country-item"));
}
