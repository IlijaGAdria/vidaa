import state from "../state.js";
import { SCROLL_OFFSET } from "./constants.js";

// ================================================
// Generic focus utilities
// ================================================

/**
 * Move focus within a list of items with scrolling.
 * @param {Object} opts
 * @param {HTMLElement[]} opts.items - Array of DOM elements
 * @param {string} opts.indexKey - Key on state for current index
 * @param {HTMLElement} [opts.wrapper] - Scroll wrapper element
 * @param {number} opts.direction - +1 or -1
 * @param {number} [opts.scrollOffset] - How many items visible above (default 3)
 */
export function moveFocus({ items, indexKey, wrapper, direction, scrollOffset }) {
  var offset = scrollOffset != null ? scrollOffset : SCROLL_OFFSET;
  var idx = state[indexKey];
  var newIdx = idx + direction;
  if (newIdx < 0 || newIdx >= items.length) return;
  items[idx].tabIndex = -1;
  items[idx].classList.remove("active");
  state[indexKey] = newIdx;
  items[newIdx].tabIndex = 0;
  items[newIdx].classList.add("active");
  if (wrapper) {
    var topIdx = Math.max(0, newIdx - offset);
    wrapper.style.transform = "translateY(" + (-items[topIdx].offsetTop) + "px)";
  }
}

/**
 * Show a sub-menu: make visible, clear all active, set active on current index.
 * @param {Object} opts
 * @param {HTMLElement} opts.menu - The menu container element
 * @param {HTMLElement[]} opts.items - Array of sub-item elements
 * @param {string} opts.indexKey - Key on state for current index
 * @param {HTMLElement} [opts.wrapper] - Scroll wrapper for transform
 */
export function showMenu({ menu, items, indexKey, wrapper }) {
  if (menu) menu.classList.add("visible");
  items.forEach(function (item) {
    item.classList.remove("active");
    item.tabIndex = -1;
  });
  var idx = state[indexKey] || 0;
  if (idx >= items.length) idx = 0;
  state[indexKey] = idx;
  if (items[idx]) {
    items[idx].classList.add("active");
    items[idx].tabIndex = 0;
    if (wrapper) {
      var topIdx = Math.max(0, idx - SCROLL_OFFSET);
      wrapper.style.transform = "translateY(" + (-items[topIdx].offsetTop) + "px)";
    }
  }
}

/**
 * Hide a menu element.
 */
export function hideMenu(menu) {
  if (menu) menu.classList.remove("visible");
}
