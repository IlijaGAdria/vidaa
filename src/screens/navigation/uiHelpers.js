import state from "../state.js";

// ================================================
// DOM Helpers
// ================================================

export function hideChannelsSection() {
  var section = document.querySelector(".channels-section");
  if (section) section.classList.add("hidden");
}

export function showChannelsSection() {
  var section = document.querySelector(".channels-section");
  if (section) section.classList.remove("hidden");
}

export function minimizeMenu() {
  var menu = document.getElementById("menu");
  var channelsSection = document.querySelector(".channels-section");
  if (menu) menu.classList.add("minimized");
  if (channelsSection) channelsSection.classList.add("expanded");
}

export function expandMenu() {
  var menu = document.getElementById("menu");
  var channelsSection = document.querySelector(".channels-section");
  if (menu) menu.classList.remove("minimized");
  if (channelsSection) channelsSection.classList.remove("expanded");
}

/**
 * Scroll the main menu so the selected item stays visible.
 */
export function scrollMenuToSelected() {
  setTimeout(function () {
    var topIndex = Math.max(0, state.selectedIndex - 3);
    state.wrapper.style.transform =
      "translateY(" + -state.items[topIndex].offsetTop + "px)";
  }, 0);
}

// ================================================
// Hide / Restore ALL UI (for player fullscreen)
// ================================================

var uiElements = [
  { sel: "header" },
  { sel: "#menu" },
  { sel: ".channels-section" },
];

var stateKeys = [
  "subMenu", "radioSubMenu", "favSubMenu", "moviesSubMenu",
  "tutorialSubMenu", "tutorialList", "settingsSubMenu",
  "accountPanel", "parentalPanel", "countrySubMenu",
  "channelList", "radioPanel", "newsSection",
  "newsCountryList", "newsFilterList",
];

export function hideAllUI() {
  uiElements.forEach(function (e) {
    var el = document.querySelector(e.sel);
    if (el) el.style.display = "none";
  });
  stateKeys.forEach(function (key) {
    if (state[key]) state[key].style.display = "none";
  });
}

export function restoreAllUI() {
  uiElements.forEach(function (e) {
    var el = document.querySelector(e.sel);
    if (el) el.style.display = "";
  });
  stateKeys.forEach(function (key) {
    if (state[key]) state[key].style.display = "";
  });
}
