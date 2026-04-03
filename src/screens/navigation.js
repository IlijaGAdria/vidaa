import state from "./state.js";
import { playChannel, switchChannel, stopPlayer, togglePause, getCurrentChannel } from "./player.js";
import { fetchFavorites, addFavoriteChannel, removeFavoriteChannel, getM3uChannels, getRadios } from "../api.js";

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
  if (state.countrySubMenu) state.countrySubMenu.style.display = "none";
  if (state.channelList) state.channelList.style.display = "none";
  if (state.radioPanel) state.radioPanel.style.display = "none";
}

// Restore all app UI elements (clear inline display overrides, let CSS classes decide)
function restoreAllUI() {
  document.querySelector("header").style.display = "";
  document.getElementById("menu").style.display = "";
  document.querySelector(".channels-section").style.display = "";
  if (state.subMenu) state.subMenu.style.display = "";
  if (state.radioSubMenu) state.radioSubMenu.style.display = "";
  if (state.countrySubMenu) state.countrySubMenu.style.display = "";
  if (state.channelList) state.channelList.style.display = "";
  if (state.radioPanel) state.radioPanel.style.display = "";
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
    if (state.channelListType === "radio-favorites") {
      showRadioFavoritesList();
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
      if (state.channelListType === "radio" || state.channelListType === "radio-favorites") {
        var radioIdx = state.channelListIndex;
        var radioObj = state.radiosData[radioIdx] || null;
        // For radio-favorites, find the right object
        if (state.channelListType === "radio-favorites") {
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
  } else if (state.focusMode === "countrysubmenu") {
    moveCountryFocus(-1);
  } else if (state.focusMode === "channellist") {
    moveChannelListFocus(-1);
  } else if (state.focusMode === "channels") {
    moveChannelRow(-1);
  } else if (state.focusMode === "radiopanel") {
    // Do nothing — only left/right navigation in panel
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
  } else if (state.focusMode === "countrysubmenu") {
    moveCountryFocus(1);
  } else if (state.focusMode === "channellist") {
    moveChannelListFocus(1);
  } else if (state.focusMode === "channels") {
    moveChannelRow(1);
  } else if (state.focusMode === "radiopanel") {
    // Do nothing — only left/right navigation in panel
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
    } else {
      state.focusMode = "submenu";
    }
  } else if (state.focusMode === "countrysubmenu") {
    hideCountrySubMenu();
    state.focusMode = "submenu";
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
  }
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
    } else {
      state.focusMode = "submenu";
    }
  } else if (state.focusMode === "countrysubmenu") {
    hideCountrySubMenu();
    state.focusMode = "submenu";
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
