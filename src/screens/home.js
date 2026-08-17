import { getChannels, getInternetChannelFilters, getMovies, getUser, fetchNewsCountries, fetchNewsFeed, getVideoTutorialCategories, getVideoTutorials, getInfo, getLanguages, getCategories } from "../api.js";
import Remote from "../remote.js";
import { fetchWeather, setWeatherDayTranslations } from "../weather_api.js";
import { getLanguage } from "../language.js";
import state from "./state.js";
import { handler, loadInternetCountries, loadMovieCategories, loadNewsCountries, loadVideoTutorialCategories } from "./navigation.js";

function applyHomeTranslations() {
  var currentLangId = parseInt(getLanguage(), 10);
  var languages = state.homeLanguages || [];
  var langObj = null;
  for (var i = 0; i < languages.length; i++) {
    if (languages[i].id === currentLangId) {
      langObj = languages[i];
      break;
    }
  }
  if (!langObj) langObj = {};

  var menu = langObj.menu || {};
  var mobileHeader = menu.mobile_header || {};
  var channels = langObj.channels || {};
  var channelCategories = channels.categories || channels;
  var settings = langObj.settings || {};
  var language = langObj.language || {};
  var home = langObj.home || {};
  var search = langObj.search || {};
  var player = langObj.player || {};
  var favorites = langObj.favorites || {};
  var news = langObj.news || {};
  var filters = langObj.filters || {};
  var radio = filters.radio || {};

  function setText(id, text) {
    var el = document.getElementById(id);
    if (el && text) el.textContent = text;
  }

  function setSubText(subId, text) {
    if (!text) return;
    var sub = document.getElementById(subId);
    if (!sub) return;
    var label = sub.querySelector("span[id^='t-sub-']");
    if (label) label.textContent = text;
  }

  // Main menu items
  setText("t-menu-home", menu.home);
  setText("t-menu-tv", menu.tv_channels);
  setText("t-menu-radio", menu.radio);
  setText("t-menu-favorites", menu.favorites);
  setText("t-menu-movies", menu.movies);
  setText("t-menu-tv-shows", menu.tv_shows);
  setText("t-menu-news", menu.news);
  setText("t-menu-search", menu.search);
  setText("t-menu-tutorials", menu.video_tutorials);
  setText("t-menu-settings", menu.settings);

  // Now On TV section
  setText("t-now-on-tv", home.now_on_tv_slider ? home.now_on_tv_slider.title : null);

  // Player overlay
  var emitterEl = document.getElementById("t-emitter");
  if (emitterEl && player.emiter_label) emitterEl.textContent = player.emiter_label + ":";
  setText("t-add-favorite", favorites.btn);

  // Radio sub-menu
  setText("t-radio-all", radio.all);
  setText("t-radio-favorites", radio.favorites);

  // Favorites sub-menu
  var favSub = favorites.submenu || {};
  setText("t-fav-tv", favSub.tv_channels || favorites.tv_channels || menu.tv_channels);
  setText("t-fav-radio", favSub.radio_stations || favorites.radio_stations || menu.radio);

  // TV categories sub-menu
  setText("t-sub-all", mobileHeader.all_tv_channels || channelCategories.all || filters.all);
  setText("t-sub-favorites", menu.favorites || channelCategories.favorites);
  setText("t-sub-internet-tv", menu.internet_tv || mobileHeader.internet_tv || channelCategories.internet_tv);
  setText("t-sub-adria-telekom", channelCategories.adria_telekom || channelCategories.adria_telekom_channels);
  setText("t-sub-music", channelCategories.music);
  setText("t-sub-reality", channelCategories.reality);
  setText("t-sub-vod", channelCategories.vod);
  setText("t-sub-adult", channelCategories.adult || channelCategories.adult_channels);
  setText("t-sub-news", channelCategories.news || menu.news);
  setText("t-sub-general", channelCategories.general);
  setText("t-sub-documentaries", channelCategories.documentaries);
  setText("t-sub-children", channelCategories.children);
  setText("t-sub-movies", channelCategories.movies || menu.movies);
  setText("t-sub-sports", channelCategories.sports);
  setText("t-sub-entertainment", channelCategories.entertainment);
  setText("t-sub-4k-uhd", channelCategories["4k_uhd"] || channelCategories.uhd_4k || channelCategories.uhd);
  setText("t-sub-local", channelCategories.local || channelCategories.local_channels);
  setText("t-sub-international-fta", channelCategories.international_fta);
  setText("t-sub-camera", channelCategories.camera);
  setText("t-sub-youtube", channelCategories.youtube);

  // Override submenu category labels from /categories response
  var namesById = state.categoryNamesById || {};
  var subCategoryMap = {
    "sub-adria-telekom": 25,
    "sub-music": 2,
    "sub-news": 8,
    "sub-sports": 3,
    "sub-movies": 4,
    "sub-children": 5,
    "sub-documentaries": 6,
    "sub-entertainment": 1,
    "sub-reality": 19,
    "sub-4k-uhd": 21,
    "sub-local": 16,
    "sub-international-fta": 17,
    "sub-camera": 18,
    "sub-adult": 9,
  };
  Object.keys(subCategoryMap).forEach(function (subId) {
    var catId = subCategoryMap[subId];
    if (namesById[catId]) setSubText(subId, namesById[catId]);
  });

  // Settings sub-menu
  var settingsSub = settings.submenu || {};
  setText("t-settings-account", settingsSub.account);
  setText("t-settings-parental", settingsSub.parental);
  setText("t-settings-changepin", settingsSub.change_pin);
  setText("t-settings-language", settingsSub.language || language.choose_language_label);
  setText("t-settings-contact", settingsSub.contact);

  // Panel titles
  setText("t-account-title", settingsSub.account);
  setText("t-parental-title", settingsSub.parental);
  setText("t-language-title", settingsSub.language || language.choose_language_label);
  setText("t-contact-title", settingsSub.contact);

  // Contact panel text
  var contactDesc = settings.contact ? settings.contact.description : null;
  setText("contact-panel-text", contactDesc);

  // Search placeholder
  var searchEl = document.getElementById("search-text");
  if (searchEl && search.placeholder) searchEl.textContent = search.placeholder;

  // News dropdowns
  setText("t-news-country", news.country_filter_label);
  setText("t-news-filter", news.news_filter_label);

  // PIN dialog
  var parental = settings.parental || {};
  setText("pin-title", parental.pin_title);
  setText("pin-hint", parental.pin_hint);

  // Radio panel
  setText("t-radio-now-playing", player.radio_player_text);
  setText("t-radio-stop", player.stop_btn);
  setText("t-radio-fav", favorites.btn);
}

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

    // Setup language panel
    state.languagePanel = document.getElementById("language-panel");
    state.languageRows = document.getElementById("language-rows");
    state.languageRowItems = [];
    state.languageRowIndex = 0;

    // Setup account info panel
    state.accountPanel = document.getElementById("account-panel");
    state.accountRows = document.getElementById("account-rows");

    // Setup parental control panel
    state.parentalPanel = document.getElementById("parental-panel");
    state.parentalRows = document.getElementById("parental-rows");

    // Setup contact panel
    state.contactPanel = document.getElementById("contact-panel");
    state.contactRows = document.getElementById("contact-rows");
    state.contactPanelText = document.getElementById("contact-panel-text");

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
    state.pinTitle = document.getElementById("pin-title");
    state.pinHint = document.getElementById("pin-hint");
    state.pinCode = "";
    state.pinPendingCategoryId = null;
    state.pinChangeStep = 0;
    state.pinChangeNew = "";

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

    // Load contact info
    getInfo().then(function(data) {
      state.infoData = data || {};
    }).catch(function(err) {
      console.error("Failed to load info data:", err);
    });

    // Fetch languages and apply translations
    getLanguages().then(function(data) {
      if (data && data.languages) {
        state.homeLanguages = data.languages;
        var currentLangId = parseInt(getLanguage(), 10);
        for (var i = 0; i < state.homeLanguages.length; i++) {
          if (state.homeLanguages[i].id === currentLangId) {
            setWeatherDayTranslations((state.homeLanguages[i].days || {}));
            fetchWeather();
            break;
          }
        }
        applyHomeTranslations();
      }
    }).catch(function(err) {
      console.error("Failed to load languages:", err);
    });

    // Fetch category names translated by current language-id
    getCategories("").then(function(data) {
      var list = Array.isArray(data) ? data : (data && data.data ? data.data : []);
      state.categoriesData = list;
      state.categoryNamesById = {};
      list.forEach(function(cat) {
        if (cat && cat.id != null && cat.category_name) {
          state.categoryNamesById[cat.id] = cat.category_name;
        }
      });
      applyHomeTranslations();
    }).catch(function(err) {
      console.error("Failed to load categories:", err);
      state.categoriesData = [];
      state.categoryNamesById = {};
    });

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

    // Set background image: user's favorite if set, otherwise the site default (same as login screen)
    var content = document.querySelector('.content');
    if (state.userData && state.userData.background_image && state.userData.background_image.url) {
      if (content) content.style.backgroundImage = 'url(' + state.userData.background_image.url + ')';
    } else {
      getInfo().then(function(data) {
        if (data && data.default_background_image && data.default_background_image.url && content) {
          content.style.backgroundImage = "url('" + data.default_background_image.url + "')";
        }
      }).catch(function(err) {
        console.error("Failed to load default background:", err);
      });
    }

  }

}

export default HomeScreen;