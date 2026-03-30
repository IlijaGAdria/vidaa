import { getChannels } from "../api.js";
import Remote from "../remote.js";
import { fetchWeather } from "../weather_api.js";
import state from "./state.js";
import { handler, addCountry } from "./navigation.js";

// Format EPG datetime string to HH:MM
function formatEpgTime(datetimeStr) {
  var parts = datetimeStr.split(" ");
  if (parts.length < 2) return datetimeStr;
  var timeParts = parts[1].split(":");
  return timeParts[0] + ":" + timeParts[1];
}

// Dynamically add channels
function addChannel(name, time, thumbnail, logo, streamUrl) {
  var card = document.createElement("div");
  card.className = "channel-card";
  card.dataset.stream = streamUrl || "";
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
  state.channelWrapper.appendChild(card);
  state.allCards.push(card);
}

class HomeScreen {

  constructor(app) {
    this.app = app;
  }

  async render() {

    const channelsData = await getChannels();

    const root = document.getElementById("app");

    const response = await fetch("../src/templates/home.html");
    const html = await response.text();
    root.innerHTML = html;

    state.container = document.getElementById("menu");
    state.items = Array.from(state.container.querySelectorAll(".item"));

    state.wrapper = document.createElement("div");
    state.wrapper.style.cssText = "position: relative; transition: transform 0.25s ease;";
    while (state.container.firstChild) state.wrapper.appendChild(state.container.firstChild);
    state.container.appendChild(state.wrapper);

    // Setup channel grid with wrapper for horizontal scrolling
    state.channelGrid = document.getElementById("channels-grid");
    state.allCards = Array.from(state.channelGrid.querySelectorAll(".channel-card"));
    state.channelWrapper = document.createElement("div");
    state.channelWrapper.style.cssText = "display: grid; grid-template-rows: auto auto; grid-auto-flow: column; grid-auto-columns: 16vw; gap: 1.2vw; position: relative; transition: transform 0.25s ease;";
    while (state.channelGrid.firstChild) state.channelWrapper.appendChild(state.channelGrid.firstChild);
    state.channelGrid.appendChild(state.channelWrapper);

    // Setup sub-menu
    state.subMenu = document.getElementById("sub-menu");
    state.subItems = Array.from(state.subMenu.querySelectorAll(".sub-item"));
    state.subWrapper = document.createElement("div");
    state.subWrapper.style.cssText = "position: relative; transition: transform 0.25s ease;";
    while (state.subMenu.firstChild) state.subWrapper.appendChild(state.subMenu.firstChild);
    state.subMenu.appendChild(state.subWrapper);

    // Setup country sub-menu
    state.countrySubMenu = document.getElementById("country-sub-menu");
    state.countryWrapper = document.createElement("div");
    state.countryWrapper.style.cssText = "position: relative; transition: transform 0.25s ease;";
    while (state.countrySubMenu.firstChild) state.countryWrapper.appendChild(state.countrySubMenu.firstChild);
    state.countrySubMenu.appendChild(state.countryWrapper);
    state.countryItems = Array.from(state.countrySubMenu.querySelectorAll(".country-item"));

    addCountry("Serbia");
    addCountry("Croatia");

    // Setup channel list
    state.channelList = document.getElementById("channel-list");
    state.channelListWrapper = document.createElement("div");
    state.channelListWrapper.style.cssText = "position: relative; transition: transform 0.25s ease;";
    while (state.channelList.firstChild) state.channelListWrapper.appendChild(state.channelList.firstChild);
    state.channelList.appendChild(state.channelListWrapper);

    // Store raw channel data for filtering
    state.channelsData = channelsData || [];

    // Populate channels from API
    if (channelsData && Array.isArray(channelsData)) {
      channelsData.forEach(function(ch) {
        var epg = ch.current_epg;
        var name = ch.name || "Unknown";
        var logo = ch.stream_icon || "";
        var thumbnail = (epg && epg.epg_img) ? epg.epg_img : "";
        var time = "";
        if (epg && epg.start && epg.end) {
          time = formatEpgTime(epg.start) + " - " + formatEpgTime(epg.end);
        }
        addChannel(name, time, thumbnail, logo, ch.src || (epg && epg.src) || "");
      });
    }

    const remote = new Remote(handler);
    remote.init();

    fetchWeather();
    setInterval(fetchWeather, 60000);

  }

}

export default HomeScreen;