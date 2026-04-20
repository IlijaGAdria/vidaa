import state from "../state.js";
import { fetchFavorites, getRadios } from "../../api.js";
import { SCROLL_OFFSET } from "./constants.js";
import { moveFocus } from "./focusUtils.js";

// ================================================
// Channel list (categories, favorites, radio, tutorials)
// ================================================

export function renderChannelList(channels) {
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

  channels.forEach(function (ch, idx) {
    var item = document.createElement("div");
    item.className = "channel-list-item";
    item.tabIndex = -1;
    item.dataset.stream = ch.src || ch.stream_path || "";
    item.innerHTML =
      '<span class="cl-number">' + (ch.num || idx + 1) + ".</span>" +
      '<img class="cl-icon" src="' + (ch.stream_icon || "") + '" alt="" onerror="this.style.display=\'none\'">' +
      '<span class="cl-name">' + (ch.name || "") + "</span>" +
      '<i class="fa-solid fa-circle-play cl-play"></i>';
    state.channelListWrapper.appendChild(item);
  });

  state.channelListItems = Array.from(state.channelList.querySelectorAll(".channel-list-item"));
  if (state.channelList) state.channelList.classList.add("visible");
  state.channelListIndex = 0;

  state.channelListItems.forEach(function (item) {
    item.classList.remove("active");
    item.tabIndex = -1;
  });
  if (state.channelListItems[0]) {
    state.channelListItems[0].classList.add("active");
    state.channelListItems[0].tabIndex = 0;
  }
}

export function renderRadioList(radios) {
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

  radios.forEach(function (r, idx) {
    var item = document.createElement("div");
    item.className = "channel-list-item";
    item.tabIndex = -1;
    item.dataset.stream = r.stream_source || "";
    item.innerHTML =
      '<span class="cl-number">' + (idx + 1) + ".</span>" +
      '<img class="cl-icon" src="' + (r.stream_icon || "") + '" alt="" onerror="this.style.display=\'none\'">' +
      '<span class="cl-name">' + (r.name || "") + "</span>" +
      '<i class="fa-solid fa-circle-play cl-play"></i>';
    state.channelListWrapper.appendChild(item);
  });

  state.channelListItems = Array.from(state.channelList.querySelectorAll(".channel-list-item"));
  if (state.channelList) state.channelList.classList.add("visible");
  state.channelListIndex = 0;

  state.channelListItems.forEach(function (item) {
    item.classList.remove("active");
    item.tabIndex = -1;
  });
  if (state.channelListItems[0]) {
    state.channelListItems[0].classList.add("active");
    state.channelListItems[0].tabIndex = 0;
  }
}

export function renderTutorialList(videos) {
  while (state.tutorialListWrapper.firstChild) {
    state.tutorialListWrapper.removeChild(state.tutorialListWrapper.firstChild);
  }
  state.tutorialListItems = [];

  if (!videos || videos.length === 0) {
    var empty = document.createElement("div");
    empty.className = "channel-list-empty";
    empty.innerHTML = '<i class="fa-solid fa-video"></i><span>No tutorials available</span>';
    state.tutorialListWrapper.appendChild(empty);
    if (state.tutorialList) {
      state.tutorialList.classList.add("visible");
      state.tutorialList.classList.add("shifted");
    }
    return;
  }

  videos.forEach(function (vid, idx) {
    var item = document.createElement("div");
    item.className = "channel-list-item";
    item.tabIndex = -1;
    item.dataset.stream = vid.src || "";
    var displayName = (vid.name || "").replace(/\.mp4$/i, "").replace(/_/g, " ");
    item.innerHTML =
      '<span class="cl-number">' + (idx + 1) + ".</span>" +
      '<i class="fa-solid fa-circle-play" style="font-size:2vw;opacity:0.7;"></i>' +
      '<span class="cl-name">' + displayName + "</span>" +
      '<i class="fa-solid fa-circle-play cl-play"></i>';
    state.tutorialListWrapper.appendChild(item);
  });

  state.tutorialListItems = Array.from(state.tutorialList.querySelectorAll(".channel-list-item"));
  if (state.tutorialList) {
    state.tutorialList.classList.add("visible");
    state.tutorialList.classList.add("shifted");
  }
  state.tutorialListIndex = 0;

  state.tutorialListItems.forEach(function (item) {
    item.classList.remove("active");
    item.tabIndex = -1;
  });
  if (state.tutorialListItems[0]) {
    state.tutorialListItems[0].classList.add("active");
    state.tutorialListItems[0].tabIndex = 0;
  }
}

// ================================================
// Show / hide / focus helpers
// ================================================

export function showChannelList(categoryId) {
  state.channelListType = "category";
  var filtered;
  if (categoryId) {
    filtered = state.channelsData.filter(function (ch) {
      return ch.category_ids && ch.category_ids.indexOf(categoryId) !== -1;
    });
  } else {
    var lockedCats =
      state.userData && Array.isArray(state.userData.locked_categories)
        ? state.userData.locked_categories
        : [];
    filtered = state.channelsData.filter(function (ch) {
      if (!ch.category_ids || lockedCats.length === 0) return true;
      for (var i = 0; i < ch.category_ids.length; i++) {
        if (lockedCats.indexOf(ch.category_ids[i]) !== -1) return false;
      }
      return true;
    });
  }
  renderChannelList(filtered);
}

export function showFavoritesList() {
  state.channelListType = "favorites";
  while (state.channelListWrapper.firstChild) {
    state.channelListWrapper.removeChild(state.channelListWrapper.firstChild);
  }
  state.channelListItems = [];
  if (state.channelList) state.channelList.classList.add("visible");

  fetchFavorites()
    .then(function (favChannels) {
      if (!Array.isArray(favChannels)) favChannels = [];
      var channels = favChannels.map(function (fav) {
        var id = fav.id || fav.channel_id;
        for (var i = 0; i < state.channelsData.length; i++) {
          if (state.channelsData[i].id === id) return state.channelsData[i];
        }
        return fav;
      });
      renderChannelList(channels);
    })
    .catch(function (err) {
      console.error("Failed to load favorites:", err);
    });
}

export function showFavTvChannels() {
  state.channelListType = "fav-tv";
  while (state.channelListWrapper.firstChild) {
    state.channelListWrapper.removeChild(state.channelListWrapper.firstChild);
  }
  state.channelListItems = [];
  if (state.channelList) state.channelList.classList.add("visible");

  fetchFavorites()
    .then(function (favChannels) {
      if (!Array.isArray(favChannels)) favChannels = [];
      var channels = favChannels.map(function (fav) {
        var id = fav.id || fav.channel_id;
        for (var i = 0; i < state.channelsData.length; i++) {
          if (state.channelsData[i].id === id) return state.channelsData[i];
        }
        return fav;
      });
      renderChannelList(channels);
    })
    .catch(function (err) {
      console.error("Failed to load favorite TV channels:", err);
    });
}

export function showFavRadioStations() {
  state.channelListType = "fav-radio";
  while (state.channelListWrapper.firstChild) {
    state.channelListWrapper.removeChild(state.channelListWrapper.firstChild);
  }
  state.channelListItems = [];
  if (state.channelList) state.channelList.classList.add("visible");

  var loadAndFilter = function (radios) {
    var favRadios = radios.filter(function (r) { return r.favorite === true; });
    renderRadioList(favRadios);
  };

  if (state.radiosData && state.radiosData.length > 0) {
    loadAndFilter(state.radiosData);
    return;
  }

  getRadios()
    .then(function (response) {
      var radios = response && response.data ? response.data : Array.isArray(response) ? response : [];
      state.radiosData = radios;
      loadAndFilter(radios);
    })
    .catch(function (err) {
      console.error("Failed to load favorite radio stations:", err);
    });
}

export function showRadioAllChannels() {
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

  getRadios()
    .then(function (response) {
      var radios = response && response.data ? response.data : Array.isArray(response) ? response : [];
      state.radiosData = radios;
      renderRadioList(radios);
    })
    .catch(function (err) {
      console.error("Failed to load radios:", err);
    });
}

export function showRadioFavoritesList() {
  state.channelListType = "radio-favorites";
  while (state.channelListWrapper.firstChild) {
    state.channelListWrapper.removeChild(state.channelListWrapper.firstChild);
  }
  state.channelListItems = [];
  if (state.channelList) state.channelList.classList.add("visible");

  var loadAndFilter = function (radios) {
    var favRadios = radios.filter(function (r) { return r.favorite === true; });
    renderRadioList(favRadios);
  };

  if (state.radiosData && state.radiosData.length > 0) {
    loadAndFilter(state.radiosData);
    return;
  }

  getRadios()
    .then(function (response) {
      var radios = response && response.data ? response.data : Array.isArray(response) ? response : [];
      state.radiosData = radios;
      loadAndFilter(radios);
    })
    .catch(function (err) {
      console.error("Failed to load radio favorites:", err);
    });
}

export function showTutorialList(categoryId) {
  var videos = (state.tutorialVideos || []).filter(function (v) {
    return v.category_id === categoryId;
  });
  renderTutorialList(videos);
}

export function hideChannelList() {
  if (state.channelList) {
    state.channelList.classList.remove("visible");
    state.channelList.classList.remove("shifted");
  }
}

export function hideTutorialList() {
  if (state.tutorialList) {
    state.tutorialList.classList.remove("visible");
    state.tutorialList.classList.remove("shifted");
  }
}

export function moveChannelListFocus(direction) {
  moveFocus({
    items: state.channelListItems,
    indexKey: "channelListIndex",
    wrapper: state.channelListWrapper,
    direction: direction,
  });
}

export function moveTutorialListFocus(direction) {
  moveFocus({
    items: state.tutorialListItems,
    indexKey: "tutorialListIndex",
    wrapper: state.tutorialListWrapper,
    direction: direction,
  });
}
