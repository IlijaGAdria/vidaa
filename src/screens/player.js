import state from "./state.js";

var hlsInstance = null;
var currentPlayerIndex = 0;

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
