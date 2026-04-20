import state from "../state.js";
import { showMenu, hideMenu, moveFocus } from "./focusUtils.js";
import { SCROLL_OFFSET } from "./constants.js";

// ================================================
// Generic sub-menu operations
// Uses the generic focusUtils so each menu type
// doesn't need its own show/hide/move functions.
// ================================================

export function showSubMenu() {
  showMenu({
    menu: state.subMenu,
    items: state.subItems,
    indexKey: "subIndex",
    wrapper: state.subWrapper,
  });
}
export function hideSubMenu() { hideMenu(state.subMenu); }
export function moveSubFocus(dir) {
  moveFocus({ items: state.subItems, indexKey: "subIndex", wrapper: state.subWrapper, direction: dir });
}

export function showRadioSubMenu() {
  showMenu({ menu: state.radioSubMenu, items: state.radioSubItems, indexKey: "radioSubIndex" });
}
export function hideRadioSubMenu() { hideMenu(state.radioSubMenu); }
export function moveRadioSubFocus(dir) {
  moveFocus({ items: state.radioSubItems, indexKey: "radioSubIndex", direction: dir });
}

export function showFavSubMenu() {
  showMenu({ menu: state.favSubMenu, items: state.favSubItems, indexKey: "favSubIndex" });
}
export function hideFavSubMenu() { hideMenu(state.favSubMenu); }
export function moveFavSubFocus(dir) {
  moveFocus({ items: state.favSubItems, indexKey: "favSubIndex", direction: dir });
}

export function showMoviesSubMenu() {
  showMenu({
    menu: state.moviesSubMenu,
    items: state.moviesSubItems,
    indexKey: "moviesSubIndex",
    wrapper: state.moviesSubWrapper,
  });
}
export function hideMoviesSubMenu() { hideMenu(state.moviesSubMenu); }
export function moveMoviesSubFocus(dir) {
  moveFocus({ items: state.moviesSubItems, indexKey: "moviesSubIndex", wrapper: state.moviesSubWrapper, direction: dir });
}

export function showTutorialSubMenu() {
  showMenu({
    menu: state.tutorialSubMenu,
    items: state.tutorialSubItems,
    indexKey: "tutorialSubIndex",
    wrapper: state.tutorialSubWrapper,
  });
}
export function hideTutorialSubMenu() { hideMenu(state.tutorialSubMenu); }
export function moveTutorialSubFocus(dir) {
  moveFocus({ items: state.tutorialSubItems, indexKey: "tutorialSubIndex", wrapper: state.tutorialSubWrapper, direction: dir });
}

export function showSettingsSubMenu() {
  showMenu({ menu: state.settingsSubMenu, items: state.settingsSubItems, indexKey: "settingsSubIndex" });
}
export function hideSettingsSubMenu() { hideMenu(state.settingsSubMenu); }
export function moveSettingsSubFocus(dir) {
  moveFocus({ items: state.settingsSubItems, indexKey: "settingsSubIndex", direction: dir });
}

export function showCountrySubMenu() {
  showMenu({
    menu: state.countrySubMenu,
    items: state.countryItems,
    indexKey: "countryIndex",
    wrapper: state.countryWrapper,
  });
}
export function hideCountrySubMenu() { hideMenu(state.countrySubMenu); }
export function moveCountryFocus(dir) {
  moveFocus({ items: state.countryItems, indexKey: "countryIndex", wrapper: state.countryWrapper, direction: dir });
}

// Main menu focus
export function moveMenuFocus(direction) {
  moveFocus({ items: state.items, indexKey: "selectedIndex", wrapper: state.wrapper, direction: direction });
}
