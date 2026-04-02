import state from "./state.js";

var hlsInstance = null;

function formatEpgTime(datetimeStr) {
  if (!datetimeStr) return "";
  var parts = datetimeStr.split(" ");
  if (parts.length < 2) return datetimeStr;
  var timeParts = parts[1].split(":");
  return timeParts[0] + ":" + timeParts[1];
}

function updatePlayerOverlay(streamUrl) {
  var ch = null;
  // Search regular channels
  for (var i = 0; i < state.channelsData.length; i++) {
    if (state.channelsData[i].src === streamUrl) {
      ch = state.channelsData[i];
      break;
    }
  }
  // Search internet/m3u channels if not found
  if (!ch && state.internetChannelsData) {
    for (var j = 0; j < state.internetChannelsData.length; j++) {
      if (state.internetChannelsData[j].stream_path === streamUrl) {
        ch = state.internetChannelsData[j];
        break;
      }
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
  if (logoEl) {
    logoEl.src = ch && ch.stream_icon ? ch.stream_icon : "";
    logoEl.onerror = function() { this.style.display = 'none'; };
    logoEl.style.display = '';
  }
  if (nameEl) nameEl.textContent = ch && ch.name ? ch.name : "Unknown";

  // Reset favorite button for the new channel
  var favBtn = document.getElementById("po-favorite");
  if (favBtn) {
    var isFav = ch && ch.favorite;
    if (isFav) {
      favBtn.innerHTML = '<i class="fa-solid fa-heart"></i> Added!';
      favBtn.classList.add("active");
      favBtn.dataset.favorited = "true";
    } else {
      favBtn.innerHTML = '<i class="fa-regular fa-heart"></i> Add to Favorites';
      favBtn.classList.remove("active");
      favBtn.dataset.favorited = "false";
    }
  }

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

// Start playing a stream (video only — no UI management)
export function playChannel(streamUrl) {
  var playerDiv = document.getElementById("video-player");
  var videoEl = document.getElementById("video-el");
  if (!playerDiv || !videoEl || !streamUrl) return;

  playerDiv.classList.add("active");
  updatePlayerOverlay(streamUrl);

  if (window.Hls && Hls.isSupported()) {
    if (hlsInstance) hlsInstance.destroy();
    hlsInstance = new Hls();
    hlsInstance.loadSource(streamUrl);
    hlsInstance.attachMedia(videoEl);
    hlsInstance.on(Hls.Events.MANIFEST_PARSED, function() {
      videoEl.play();
    });
    hlsInstance.on(Hls.Events.ERROR, function(event, data) {
      if (data.fatal) {
        console.warn("[Player] HLS fatal error, falling back to direct playback:", data.type);
        hlsInstance.destroy();
        hlsInstance = null;
        videoEl.src = streamUrl;
        videoEl.play();
      }
    });
  } else if (videoEl.canPlayType("application/vnd.apple.mpegurl")) {
    videoEl.src = streamUrl;
    videoEl.play();
  }
}

// Switch channel using the active playlist
export function switchChannel(direction) {
  if (!state.activePlaylist || state.activePlaylist.length === 0) return;
  var newIndex = state.activePlaylistIndex + direction;
  if (newIndex < 0) newIndex = state.activePlaylist.length - 1;
  else if (newIndex >= state.activePlaylist.length) newIndex = 0;
  state.activePlaylistIndex = newIndex;
  playChannel(state.activePlaylist[newIndex]);
}

// Stop playback (video only — no UI management)
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

// Get the currently playing channel data
export function getCurrentChannel() {
  var streamUrl = state.activePlaylist[state.activePlaylistIndex];
  if (!streamUrl) return null;
  for (var i = 0; i < state.channelsData.length; i++) {
    if (state.channelsData[i].src === streamUrl) {
      return state.channelsData[i];
    }
  }
  // Search internet/m3u channels
  if (state.internetChannelsData) {
    for (var j = 0; j < state.internetChannelsData.length; j++) {
      if (state.internetChannelsData[j].stream_path === streamUrl) {
        return state.internetChannelsData[j];
      }
    }
  }
  return null;
}
