import state from "../state.js";
import { playChannel, stopPlayer, togglePause, switchChannel, getCurrentChannel } from "../player.js";
import { hideAllUI, restoreAllUI, minimizeMenu, hideChannelsSection } from "./uiHelpers.js";
import { showSubMenu, showRadioSubMenu, showFavSubMenu } from "./menuManager.js";
import { setChannelFocus } from "./channelGrid.js";
import { showFavoritesList, showFavTvChannels, showFavRadioStations, showRadioFavoritesList } from "./channelList.js";

// ================================================
// Player entry / exit
// ================================================

export function enterPlayer(streamUrl, playlist, playlistIndex) {
  state.previousFocusMode = state.focusMode;
  state.activePlaylist = playlist;
  state.activePlaylistIndex = playlistIndex;
  hideAllUI();
  playChannel(streamUrl);
  state.focusMode = "player";
}

export function exitPlayer() {
  hidePlayerOverlay();
  stopPlayer();
  restoreAllUI();

  var returnTo = state.previousFocusMode || "channels";

  if (returnTo === "channellist") {
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
    if (state.channelListType === "favorites") showFavoritesList();
    if (state.channelListType === "fav-tv") showFavTvChannels();
    if (state.channelListType === "radio-favorites") showRadioFavoritesList();
    if (state.channelListType === "fav-radio") showFavRadioStations();
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

export function showPlayerOverlay() {
  state.playerOverlay = document.getElementById("player-overlay");
  if (!state.playerOverlay) return;
  state.playerOverlay.classList.add("visible");
  state.playerOverlayBtns = Array.from(state.playerOverlay.querySelectorAll(".po-btn, .po-action"));
  state.playerOverlayIndex = 1;
  updateOverlayFocus();
}

export function hidePlayerOverlay() {
  if (state.playerOverlay) state.playerOverlay.classList.remove("visible");
  clearOverlayFocus();
}

function updateOverlayFocus() {
  state.playerOverlayBtns.forEach(function (btn) { btn.classList.remove("active"); });
  if (state.playerOverlayBtns[state.playerOverlayIndex]) {
    state.playerOverlayBtns[state.playerOverlayIndex].classList.add("active");
  }
}

function clearOverlayFocus() {
  state.playerOverlayBtns.forEach(function (btn) { btn.classList.remove("active"); });
}

export function moveOverlayFocus(direction) {
  var newIdx = state.playerOverlayIndex + direction;
  if (newIdx < 0 || newIdx >= state.playerOverlayBtns.length) return;
  state.playerOverlayIndex = newIdx;
  updateOverlayFocus();
}
