import state from "./state.js";

var hlsInstance = null;
var currentPlayerIndex = 0;

function formatEpgTime(datetimeStr) {
  if (!datetimeStr) return "";
  var parts = datetimeStr.split(" ");
  if (parts.length < 2) return datetimeStr;
  var timeParts = parts[1].split(":");
  return timeParts[0] + ":" + timeParts[1];
}

function updatePlayerOverlay(streamUrl) {
  var ch = null;
  for (var i = 0; i < state.channelsData.length; i++) {
    if (state.channelsData[i].src === streamUrl) {
      ch = state.channelsData[i];
      break;
    }
  }
  var numEl = document.getElementById("po-channel-num");
  var logoEl = document.getElementById("po-channel-logo");
  var nameEl = document.getElementById("po-channel-name");
  var programEl = document.getElementById("po-program-name");
  var timeEl = document.getElementById("po-time-range");
  var progressFill = document.getElementById("po-progress-fill");
  var progressTime = document.getElementById("po-progress-time");

  if (numEl) numEl.textContent = ch && ch.num ? ch.num : "";
  if (logoEl) logoEl.src = ch && ch.stream_icon ? ch.stream_icon : "";
  if (nameEl) nameEl.textContent = ch && ch.name ? ch.name : "Unknown";

  // Use embedded current_epg from channel data
  var epg = ch && ch.current_epg ? ch.current_epg : null;

  if (programEl) programEl.textContent = epg && (epg.title || epg.name) ? (epg.title || epg.name) : "";

  var startStr = epg ? formatEpgTime(epg.start || "") : "";
  var endStr = epg ? formatEpgTime(epg.end || "") : "";
  if (timeEl) timeEl.textContent = startStr && endStr ? startStr + " - " + endStr : "";

  // Calculate progress percentage
  if (epg && epg.start && epg.end) {
    var startMs = new Date(epg.start.replace(" ", "T")).getTime();
    var endMs = new Date(epg.end.replace(" ", "T")).getTime();
    var nowMs = Date.now();
    var total = endMs - startMs;
    var elapsed = nowMs - startMs;
    if (total > 0) {
      var pct = Math.max(0, Math.min(100, (elapsed / total) * 100));
      if (progressFill) progressFill.style.width = pct.toFixed(1) + "%";
      var remainSec = Math.max(0, Math.floor((endMs - nowMs) / 1000));
      var mins = Math.floor(remainSec / 60);
      var secs = remainSec % 60;
      if (progressTime) progressTime.textContent = (mins < 10 ? "0" : "") + mins + ":" + (secs < 10 ? "0" : "") + secs;
    }
  } else {
    if (progressFill) progressFill.style.width = "0%";
    if (progressTime) progressTime.textContent = "";
  }
}

export function playChannel(streamUrl) {
  var playerDiv = document.getElementById("video-player");
  var videoEl = document.getElementById("video-el");
  if (!playerDiv || !videoEl || !streamUrl) return;

  // Hide UI
  document.querySelector("header").style.display = "none";
  document.getElementById("menu").style.display = "none";
  document.querySelector(".channels-section").style.display = "none";
  if (state.subMenu) state.subMenu.style.display = "none";
  if (state.countrySubMenu) state.countrySubMenu.style.display = "none";
  if (state.channelList) state.channelList.style.display = "none";

  playerDiv.classList.add("active");
  updatePlayerOverlay(streamUrl);

  if (window.Hls && Hls.isSupported()) {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
    hlsInstance = new Hls();
    hlsInstance.loadSource(streamUrl);
    hlsInstance.attachMedia(videoEl);
    hlsInstance.on(Hls.Events.MANIFEST_PARSED, function() {
      videoEl.play();
    });
  } else if (videoEl.canPlayType("application/vnd.apple.mpegurl")) {
    videoEl.src = streamUrl;
    videoEl.play();
  }

  state.focusMode = "player";
}

export function switchChannel(direction) {
  var newIndex = currentPlayerIndex + direction;
  if (newIndex < 0) newIndex = state.allCards.length - 1;
  else if (newIndex >= state.allCards.length) newIndex = 0;
  var card = state.allCards[newIndex];
  if (card && card.dataset.stream) {
    currentPlayerIndex = newIndex;
    playChannel(card.dataset.stream);
  }
}

export function stopPlayer() {
  var playerDiv = document.getElementById("video-player");
  var videoEl = document.getElementById("video-el");

  if (hlsInstance) {
    hlsInstance.destroy();
    hlsInstance = null;
  }
  if (videoEl) {
    videoEl.pause();
    videoEl.removeAttribute("src");
  }
  if (playerDiv) playerDiv.classList.remove("active");

  // Restore UI
  document.querySelector("header").style.display = "";
  document.getElementById("menu").style.display = "";
  document.querySelector(".channels-section").style.display = "";
  if (state.subMenu) state.subMenu.style.display = "";
  if (state.countrySubMenu) state.countrySubMenu.style.display = "";
  if (state.channelList) state.channelList.style.display = "";

  state.focusMode = "channels";
}

export function setCurrentPlayerIndex(idx) {
  currentPlayerIndex = idx;
}

export function togglePause() {
  var videoEl = document.getElementById("video-el");
  var pauseBtn = document.getElementById("po-pause");
  if (!videoEl) return;
  if (videoEl.paused) {
    videoEl.play();
    if (pauseBtn) pauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
  } else {
    videoEl.pause();
    if (pauseBtn) pauseBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
  }
}
