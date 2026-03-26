import { getChannels } from "../api.js";

import Remote from "../remote.js";

import { fetchWeather } from "../weather_api.js";

// Focus mode: "menu", "channels", "submenu", or "countrysubmenu"
var focusMode = "menu";

// Menu state
var selectedIndex = 0;
var items = [];
var container = null;
var wrapper = null;

// Channel grid state
var allCards = [];          // flat list of all .channel-card elements
var colsPerRow = 4;         // how many columns before wrapping to row 2
var channelGrid = null;     // the grid container
var channelWrapper = null;  // inner wrapper for translateX
// Sub-menu state
var subMenu = null;
var subItems = [];
var subWrapper = null;
var subIndex = 0;

// Country sub-menu state
var countrySubMenu = null;
var countryItems = [];
var countryWrapper = null;
var countryIndex = 0;
var rowIndex = 0;
var colIndex = 0;

const handler = {
  onUp: () => handleUp(),
  onDown: () => handleDown(),
  onLeft: () => handleLeft(),
  onRight: () => handleRight(),
  onEnter: () => handleEnter(),
  onBack: () => {
    if (focusMode === "channels") {
      clearChannelFocus();
      focusMode = "menu";
    } else if (focusMode === "countrysubmenu") {
      hideCountrySubMenu();
      focusMode = "submenu";
    } else if (focusMode === "submenu") {
      hideSubMenu();
      expandMenu();
      showChannelsSection();
      focusMode = "menu";
    }
  },
};

function hideChannelsSection() {
  var section = document.querySelector('.channels-section');
  if (section) section.classList.add('hidden');
}

function showChannelsSection() {
  var section = document.querySelector('.channels-section');
  if (section) section.classList.remove('hidden');
}

function enterTVChannels() {
  console.log("Entering TV Channels");
  minimizeMenu();
  showSubMenu();
  hideChannelsSection();
  focusMode = "submenu";
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

function showSubMenu() {
  if (subMenu) subMenu.classList.add("visible");
  subIndex = 0;
  subItems.forEach(function(item, i) {
    item.classList.remove("active");
    item.tabIndex = -1;
  });
  if (subItems[0]) {
    subItems[0].classList.add("active");
    subItems[0].tabIndex = 0;
  }
}

function hideSubMenu() {
  if (subMenu) subMenu.classList.remove("visible");
}

function showCountrySubMenu() {
  if (countrySubMenu) countrySubMenu.classList.add("visible");
  countryIndex = 0;
  countryItems.forEach(function(item) {
    item.classList.remove("active");
    item.tabIndex = -1;
  });
  if (countryItems[0]) {
    countryItems[0].classList.add("active");
    countryItems[0].tabIndex = 0;
  }
}

function hideCountrySubMenu() {
  if (countrySubMenu) countrySubMenu.classList.remove("visible");
}

function moveCountryFocus(direction) {
  if (countryIndex + direction < 0 || countryIndex + direction >= countryItems.length) return;

  countryItems[countryIndex].tabIndex = -1;
  countryItems[countryIndex].classList.remove("active");

  countryIndex += direction;

  countryItems[countryIndex].tabIndex = 0;
  countryItems[countryIndex].classList.add("active");

  var topIdx = Math.max(0, countryIndex - 3);
  countryWrapper.style.transform = "translateY(" + (-countryItems[topIdx].offsetTop) + "px)";
}

function addCountry(name, iconSrc) {
  var item = document.createElement("div");
  item.className = "country-item";
  item.tabIndex = -1;
  item.innerHTML = '<span class="country-icon">' +
    (iconSrc ? '<img src="' + iconSrc + '" style="width:100%;height:100%;object-fit:cover;border-radius:3px;">' : '') +
    '</span>' + name;
  countryWrapper.appendChild(item);
  countryItems = Array.from(countrySubMenu.querySelectorAll(".country-item"));
}

function moveSubFocus(direction) {
  if (subIndex + direction < 0 || subIndex + direction >= subItems.length) return;

  subItems[subIndex].tabIndex = -1;
  subItems[subIndex].classList.remove("active");

  subIndex += direction;

  subItems[subIndex].tabIndex = 0;
  subItems[subIndex].classList.add("active");

  var topIdx = Math.max(0, subIndex - 3);
  subWrapper.style.transform = "translateY(" + (-subItems[topIdx].offsetTop) + "px)";
}



function handleEnter() {
  if (focusMode === "menu") {
    const selectedItem = items[selectedIndex];
    console.log(selectedItem.textContent);
    if (selectedItem.textContent == " TV Channels") {
      enterTVChannels();
    }
  } else if (focusMode === "submenu") {
    const label = subItems[subIndex].textContent.trim();
    if (label === "Internet TV") {
      showCountrySubMenu();
      focusMode = "countrysubmenu";
    }
  }
}


function handleUp() {
  if (focusMode === "menu") {
    moveMenuFocus(-1);
  } else if (focusMode === "submenu") {
    moveSubFocus(-1);
  } else if (focusMode === "countrysubmenu") {
    moveCountryFocus(-1);
  } else {
    moveChannelRow(-1);
  }
}

function handleDown() {
  if (focusMode === "menu") {
    moveMenuFocus(1);
  } else if (focusMode === "submenu") {
    moveSubFocus(1);
  } else if (focusMode === "countrysubmenu") {
    moveCountryFocus(1);
  } else {
    moveChannelRow(1);
  }
}

function handleLeft() {
  if (focusMode === "channels") {
    if (colIndex === 0) {
      clearChannelFocus();
      focusMode = "menu";
    } else {
      moveChannelCol(-1);
    }
  } else if (focusMode === "countrysubmenu") {
    hideCountrySubMenu();
    focusMode = "submenu";
  } else if (focusMode === "submenu") {
    hideSubMenu();
    expandMenu();
    showChannelsSection();
    focusMode = "menu";
  }
}

function handleRight() {
  if (focusMode === "menu") {
    if (allCards.length > 0) {
      focusMode = "channels";
      setChannelFocus();
    }
  } else if (focusMode === "submenu") {
    // no-op in submenu, can't enter channels grid from here
  } else {
    moveChannelCol(1);
  }
}

// --- Menu navigation ---

function moveMenuFocus(direction) {
  if (selectedIndex + direction < 0 || selectedIndex + direction >= items.length) return;

  items[selectedIndex].tabIndex = -1;
  items[selectedIndex].classList.remove("active");

  selectedIndex += direction;

  items[selectedIndex].tabIndex = 0;
  items[selectedIndex].classList.add("active");

  const topIndex = Math.max(0, selectedIndex - 3);
  wrapper.style.transform = `translateY(${-items[topIndex].offsetTop}px)`;
}

// --- Channel grid navigation ---
// Cards are laid out in CSS grid with grid-auto-flow: column and 2 rows.
// So card index for (row, col) = col * 2 + row

function getCardAt(row, col) {
  var idx = col * 2 + row;
  return allCards[idx] || null;
}

function getTotalCols() {
  return Math.ceil(allCards.length / 2);
}

function clearChannelFocus() {
  var card = getCardAt(rowIndex, colIndex);
  if (card) card.classList.remove("active");
}

function setChannelFocus() {
  var card = getCardAt(rowIndex, colIndex);
  if (card) card.classList.add("active");
  scrollGrid();
}

function scrollGrid() {
  // Scroll so 1 card is visible to the left of the focused one
  var leftCol = Math.max(0, colIndex - 1);
  var refCard = getCardAt(0, leftCol);
  if (refCard && channelWrapper) {
    channelWrapper.style.transform = "translateX(" + (-refCard.offsetLeft) + "px)";
  }
}

function moveChannelCol(direction) {
  var totalCols = getTotalCols();
  var newCol = colIndex + direction;
  if (newCol < 0 || newCol >= totalCols) return;
  // Check if card exists at new position
  if (!getCardAt(rowIndex, newCol)) return;

  clearChannelFocus();
  colIndex = newCol;
  setChannelFocus();
}

function moveChannelRow(direction) {
  var newRow = rowIndex + direction;
  if (newRow < 0 || newRow > 1) return;
  if (!getCardAt(newRow, colIndex)) return;

  clearChannelFocus();
  rowIndex = newRow;
  setChannelFocus();
}

// Dynamically add channels
function addChannel(name, time, thumbnail, logo) {
  var card = document.createElement("div");
  card.className = "channel-card";
  card.innerHTML = `
    <img class="thumbnail" src="${thumbnail}" alt="${name} thumbnail">
    <div class="info">
      <img class="logo" src="${logo}" alt="${name} logo">
      <div class="details">
        <div class="name">${name}</div>
        <div class="time">${time}</div>
      </div>
    </div>
  `;
  channelWrapper.appendChild(card);
  allCards.push(card);
}

class HomeScreen {

  constructor(app) {
    this.app = app;
  }

  async render() {

    //const channels = await getChannels();

    const root = document.getElementById("app");

    // root.innerHTML = `
    //   <div class="channels">
    //     ${channels.map(c => `
    //       <div class="channel" data-url="${c.stream}">
    //         ${c.name}
    //       </div>
    //     `).join("")}
    //   </div>
    // `;

    const response = await fetch("../src/templates/home.html");
    const html = await response.text();
    root.innerHTML = html;

    container = document.getElementById("menu");
    items = Array.from(container.querySelectorAll(".item"));

    wrapper = document.createElement("div");
    wrapper.style.cssText = "position: relative; transition: transform 0.25s ease;";
    while (container.firstChild) wrapper.appendChild(container.firstChild);
    container.appendChild(wrapper);

    // Setup channel grid with wrapper for horizontal scrolling
    channelGrid = document.getElementById("channels-grid");
    allCards = Array.from(channelGrid.querySelectorAll(".channel-card"));
    channelWrapper = document.createElement("div");
    channelWrapper.style.cssText = "display: grid; grid-template-rows: auto auto; grid-auto-flow: column; grid-auto-columns: 16vw; gap: 1.2vw; position: relative; transition: transform 0.25s ease;";
    while (channelGrid.firstChild) channelWrapper.appendChild(channelGrid.firstChild);
    channelGrid.appendChild(channelWrapper);

    // Setup sub-menu
    subMenu = document.getElementById("sub-menu");
    subItems = Array.from(subMenu.querySelectorAll(".sub-item"));
    subWrapper = document.createElement("div");
    subWrapper.style.cssText = "position: relative; transition: transform 0.25s ease;";
    while (subMenu.firstChild) subWrapper.appendChild(subMenu.firstChild);
    subMenu.appendChild(subWrapper);

    // Setup country sub-menu
    countrySubMenu = document.getElementById("country-sub-menu");
    countryWrapper = document.createElement("div");
    countryWrapper.style.cssText = "position: relative; transition: transform 0.25s ease;";
    while (countrySubMenu.firstChild) countryWrapper.appendChild(countrySubMenu.firstChild);
    countrySubMenu.appendChild(countryWrapper);
    countryItems = Array.from(countrySubMenu.querySelectorAll(".country-item"));

    addCountry("Serbia");
    addCountry("Croatia");
    addCountry("Germany", "path/to/flag.png");

    const remote = new Remote(handler);
    remote.init();

    fetchWeather();
    setInterval(fetchWeather, 60000);

    addChannel("Channel 1", "12:00 - 14:00", "https://via.placeholder.com/300x150?text=Thumbnail+1", "https://via.placeholder.com/80x40?text=Logo+1");

  }

}

export default HomeScreen;