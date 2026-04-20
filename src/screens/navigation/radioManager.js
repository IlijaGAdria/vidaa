import state from "../state.js";
import { addFavoriteChannel, removeFavoriteChannel } from "../../api.js";

// ================================================
// Radio inline playback & favorites
// ================================================

export function playRadio(streamUrl, radioObj) {
  if (!streamUrl) return;
  if (state.radioAudio) {
    state.radioAudio.pause();
    state.radioAudio.removeAttribute("src");
  }

  state.radioPlaying = radioObj;

  var nameEl = document.getElementById("radio-panel-name");
  if (nameEl) nameEl.textContent = radioObj ? (radioObj.name || "Radio") : "Radio";

  var statusEl = document.getElementById("radio-panel-status");
  if (statusEl) {
    statusEl.textContent = "Connecting...";
    statusEl.className = "radio-panel-status loading";
  }
  var bars = document.getElementById("radio-panel-bars");
  if (bars) bars.classList.add("paused");

  state.radioAudio.onplaying = null;
  state.radioAudio.onerror = null;

  state.radioAudio.onplaying = function () {
    if (statusEl) { statusEl.textContent = ""; statusEl.className = "radio-panel-status"; }
    if (bars) bars.classList.remove("paused");
  };

  state.radioAudio.onerror = function () {
    if (statusEl) { statusEl.textContent = "Stream not available"; statusEl.className = "radio-panel-status error"; }
    if (bars) bars.classList.add("paused");
  };

  state.radioAudio.src = streamUrl;
  state.radioAudio.play().catch(function () {
    if (statusEl) { statusEl.textContent = "Stream not available"; statusEl.className = "radio-panel-status error"; }
    if (bars) bars.classList.add("paused");
  });

  var favBtn = document.getElementById("radio-btn-fav");
  if (favBtn && radioObj) {
    if (radioObj.favorite) {
      favBtn.innerHTML = '<i class="fa-solid fa-heart"></i> Favorited';
      favBtn.classList.add("fav-active");
    } else {
      favBtn.innerHTML = '<i class="fa-regular fa-heart"></i> Favorite';
      favBtn.classList.remove("fav-active");
    }
  }

  state.radioPanelIndex = 0;
  state.radioPanelBtns.forEach(function (btn) { if (btn) btn.classList.remove("active"); });
  showRadioPanel();
}

export function stopRadio() {
  if (state.radioAudio) {
    state.radioAudio.pause();
    state.radioAudio.removeAttribute("src");
  }
  state.radioPlaying = null;
  var bars = document.getElementById("radio-panel-bars");
  if (bars) bars.classList.add("paused");
  state.radioPanelIndex = 0;
  state.radioPanelBtns.forEach(function (btn) { if (btn) btn.classList.remove("active"); });
  hideRadioPanel();
  state.focusMode = "channellist";
}

export function toggleRadioFavorite() {
  var radio = state.radioPlaying;
  if (!radio || !radio.id) return;
  var favBtn = document.getElementById("radio-btn-fav");
  if (!favBtn) return;

  if (radio.favorite) {
    removeFavoriteChannel(radio.id).then(function () {
      radio.favorite = false;
      favBtn.innerHTML = '<i class="fa-regular fa-heart"></i> Favorite';
      favBtn.classList.remove("fav-active");
    }).catch(function (err) { console.error("Failed to remove radio favorite:", err); });
  } else {
    addFavoriteChannel(radio.id).then(function () {
      radio.favorite = true;
      favBtn.innerHTML = '<i class="fa-solid fa-heart"></i> Favorited';
      favBtn.classList.add("fav-active");
    }).catch(function (err) { console.error("Failed to add radio favorite:", err); });
  }
}

export function showRadioPanel() {
  if (state.radioPanel) state.radioPanel.classList.add("visible");
  var bars = document.getElementById("radio-panel-bars");
  if (bars) bars.classList.remove("paused");
}

export function hideRadioPanel() {
  if (state.radioPanel) state.radioPanel.classList.remove("visible");
}

export function updateRadioPanelFocus() {
  state.radioPanelBtns.forEach(function (btn) { if (btn) btn.classList.remove("active"); });
  if (state.radioPanelBtns[state.radioPanelIndex]) {
    state.radioPanelBtns[state.radioPanelIndex].classList.add("active");
  }
}

export function moveRadioPanelFocus(direction) {
  var newIdx = state.radioPanelIndex + direction;
  if (newIdx < 0 || newIdx >= state.radioPanelBtns.length) return;
  state.radioPanelIndex = newIdx;
  updateRadioPanelFocus();
}
