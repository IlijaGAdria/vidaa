import { getChannels, getInternetChannelFilters, getMovies, getUser, fetchNewsCountries, fetchNewsFeed, getVideoTutorialCategories, getVideoTutorials } from "../api.js";
import Remote from "../remote.js";
import { fetchWeather } from "../weather_api.js";
import state from "./state.js";
import { handler, loadInternetCountries, loadMovieCategories, loadNewsCountries, loadVideoTutorialCategories } from "./navigation.js";

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
    <img class="thumbnail" src="${thumbnail}" alt="${name} thumbnail" onerror="this.style.display='none'">
    <div class="info">
      <img class="logo" src="${logo}" alt="${name} logo" onerror="this.style.display='none'">
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

    const response = await fetch("src/templates/home.html");
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

    // Setup radio sub-menu
    state.radioSubMenu = document.getElementById("radio-sub-menu");
    state.radioSubItems = Array.from(state.radioSubMenu.querySelectorAll(".sub-item"));
    state.radioSubWrapper = document.createElement("div");
    state.radioSubWrapper.style.cssText = "position: relative; transition: transform 0.25s ease;";
    while (state.radioSubMenu.firstChild) state.radioSubWrapper.appendChild(state.radioSubMenu.firstChild);
    state.radioSubMenu.appendChild(state.radioSubWrapper);

    // Setup favorites sub-menu
    state.favSubMenu = document.getElementById("favorites-sub-menu");
    state.favSubItems = Array.from(state.favSubMenu.querySelectorAll(".sub-item"));
    state.favSubWrapper = document.createElement("div");
    state.favSubWrapper.style.cssText = "position: relative; transition: transform 0.25s ease;";
    while (state.favSubMenu.firstChild) state.favSubWrapper.appendChild(state.favSubMenu.firstChild);
    state.favSubMenu.appendChild(state.favSubWrapper);

    // Setup movies sub-menu
    state.moviesSubMenu = document.getElementById("movies-sub-menu");
    state.moviesSubWrapper = document.createElement("div");
    state.moviesSubWrapper.style.cssText = "position: relative; transition: transform 0.25s ease;";
    while (state.moviesSubMenu.firstChild) state.moviesSubWrapper.appendChild(state.moviesSubMenu.firstChild);
    state.moviesSubMenu.appendChild(state.moviesSubWrapper);
    state.moviesSubItems = [];

    // Setup video tutorials sub-menu
    state.tutorialSubMenu = document.getElementById("tutorial-sub-menu");
    state.tutorialSubWrapper = document.createElement("div");
    state.tutorialSubWrapper.style.cssText = "position: relative; transition: transform 0.25s ease;";
    while (state.tutorialSubMenu.firstChild) state.tutorialSubWrapper.appendChild(state.tutorialSubMenu.firstChild);
    state.tutorialSubMenu.appendChild(state.tutorialSubWrapper);
    state.tutorialSubItems = [];

    // Setup tutorial video list
    state.tutorialList = document.getElementById("tutorial-list");
    state.tutorialListWrapper = document.createElement("div");
    state.tutorialListWrapper.style.cssText = "position: relative; transition: transform 0.25s ease;";
    state.tutorialList.appendChild(state.tutorialListWrapper);
    state.tutorialListItems = [];
    state.tutorialListIndex = 0;

    // Setup settings sub-menu
    state.settingsSubMenu = document.getElementById("settings-sub-menu");
    state.settingsSubItems = Array.from(state.settingsSubMenu.querySelectorAll(".sub-item"));
    state.settingsSubIndex = 0;

    // Setup account info panel
    state.accountPanel = document.getElementById("account-panel");
    state.accountRows = document.getElementById("account-rows");

    // Setup parental control panel
    state.parentalPanel = document.getElementById("parental-panel");
    state.parentalRows = document.getElementById("parental-rows");

    // Setup news section
    state.newsSection = document.getElementById("news-section");
    state.newsGrid = document.getElementById("news-grid");
    state.newsCountryBtn = document.getElementById("news-country-btn");
    state.newsFilterBtn = document.getElementById("news-filter-btn");
    state.newsCountryList = document.getElementById("news-country-list");
    state.newsCountryListWrapper = document.createElement("div");
    state.newsCountryListWrapper.style.cssText = "position: relative; transition: transform 0.25s ease;";
    state.newsCountryList.appendChild(state.newsCountryListWrapper);
    state.newsFilterList = document.getElementById("news-filter-list");
    state.newsFilterListWrapper = document.createElement("div");
    state.newsFilterListWrapper.style.cssText = "position: relative; transition: transform 0.25s ease;";
    state.newsFilterList.appendChild(state.newsFilterListWrapper);

    // Setup search section
    state.searchSection = document.getElementById("search-section");
    state.searchInputBox = document.getElementById("search-input-box");
    state.searchResultsList = document.getElementById("search-results-list");
    state.searchResultItems = [];
    state.searchResultIndex = 0;
    state.searchQuery = "";

    // Setup PIN dialog
    state.pinDialog = document.getElementById("pin-dialog");
    state.pinDots = [
      document.getElementById("pin-dot-0"),
      document.getElementById("pin-dot-1"),
      document.getElementById("pin-dot-2"),
      document.getElementById("pin-dot-3")
    ];
    state.pinError = document.getElementById("pin-error");
    state.pinCode = "";
    state.pinPendingCategoryId = null;

    // Load news countries
    fetchNewsCountries().then(function(countries) {
      var list = Array.isArray(countries) ? countries : (countries && countries.data ? countries.data : []);
      if (list.length > 0) {
        state.newsCountries = list;
        loadNewsCountries(list);
      }
    }).catch(function(err) {
      console.error("Failed to load news countries:", err);
    });

    // Load movie categories from API
    getMovies().then(function(data) {
      console.log("[Movies] Raw API response:", data);
      var categories = Array.isArray(data) ? data : (data && data.data ? data.data : []);
      console.log("[Movies] Parsed categories:", categories.length);
      state.moviesCategories = categories;
      loadMovieCategories(categories);
    }).catch(function(err) {
      console.error("Failed to load movie categories:", err);
      state.moviesCategories = [];
      loadMovieCategories([]);
    });

    // Load video tutorial categories and videos from API
    Promise.all([getVideoTutorialCategories(), getVideoTutorials()]).then(function(results) {
      var catData = results[0];
      var vidData = results[1];
      var categories = Array.isArray(catData) ? catData : (catData && catData.data ? catData.data : []);
      var videos = Array.isArray(vidData) ? vidData : (vidData && vidData.data ? vidData.data : []);
      state.tutorialCategories = categories;
      state.tutorialVideos = videos;
      loadVideoTutorialCategories(categories);
      console.log("[Tutorials] Loaded", categories.length, "categories,", videos.length, "videos");
    }).catch(function(err) {
      console.error("Failed to load video tutorials:", err);
      state.tutorialCategories = [];
      state.tutorialVideos = [];
      loadVideoTutorialCategories([]);
    });

    // Load user account data (before channel rendering so locked_categories is available)
    try {
      state.userData = await getUser();
      console.log("[Settings] User data loaded");
      // Mark locked categories with lock icon
      var lockedCats = Array.isArray(state.userData.locked_categories) ? state.userData.locked_categories : [];
      if (lockedCats.length > 0 && state.subItems) {
        var catMap = {
          "sub-adria-telekom": 25, "sub-music": 2, "sub-news": 8, "sub-sports": 3,
          "sub-movies": 4, "sub-children": 5, "sub-documentaries": 6, "sub-entertainment": 1,
          "sub-reality": 19, "sub-general": 1, "sub-4k-uhd": 21, "sub-local": 16,
          "sub-international-fta": 17, "sub-camera": 18, "sub-adult": 9
        };
        state.subItems.forEach(function(item) {
          var catId = catMap[item.id];
          if (catId && lockedCats.indexOf(catId) !== -1) {
            var lock = document.createElement("span");
            lock.className = "sub-item-lock";
            lock.innerHTML = '<i class="fa-solid fa-lock"></i>';
            item.appendChild(lock);
          }
        });
      }
    } catch (err) {
      console.error("Failed to load user data:", err);
    }

    // Setup radio now-playing panel
    state.radioPanel = document.getElementById("radio-panel");
    state.radioPanelBtns = [
      document.getElementById("radio-btn-stop"),
      document.getElementById("radio-btn-fav")
    ];
    state.radioAudio = new Audio();

    // Load Internet TV countries from API
    getInternetChannelFilters().then(function(data) {
      if (data && data.countries) {
        state.internetCountries = data.countries;
        loadInternetCountries(data.countries);
      }
    }).catch(function(err) {
      console.error("Failed to load internet channel filters:", err);
    });

    // Setup channel list
    state.channelList = document.getElementById("channel-list");
    state.channelListWrapper = document.createElement("div");
    state.channelListWrapper.style.cssText = "position: relative; transition: transform 0.25s ease;";
    while (state.channelList.firstChild) state.channelListWrapper.appendChild(state.channelList.firstChild);
    state.channelList.appendChild(state.channelListWrapper);

    // Store raw channel data for filtering
    state.channelsData = channelsData || [];

    // Populate channels from API (exclude locked categories)
    if (channelsData && Array.isArray(channelsData)) {
      var lockedCats = (state.userData && Array.isArray(state.userData.locked_categories)) ? state.userData.locked_categories : [];
      channelsData.forEach(function(ch) {
        if (ch.category_ids && lockedCats.length > 0) {
          for (var i = 0; i < ch.category_ids.length; i++) {
            if (lockedCats.indexOf(ch.category_ids[i]) !== -1) return;
          }
        }
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

    // Set background image from user preference
    getUser().then(function(userData) {
      if (userData && userData.background_image && userData.background_image.url) {
        var content = document.querySelector('.content');
        if (content) {
          content.style.backgroundImage = 'url(' + userData.background_image.url + ')';
        }
      }
    }).catch(function(err) {
      console.error("Failed to load user background:", err);
    });

  }

}

export default HomeScreen;