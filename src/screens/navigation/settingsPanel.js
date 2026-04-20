import state from "../state.js";
import { lockCategory, unlockCategory, changePincode } from "../../api.js";
import { parentalCategories } from "./constants.js";
import { moveFocus } from "./focusUtils.js";
import { PARENTAL_SCROLL_OFFSET } from "./constants.js";
import { getLanguage } from "../../language.js";

function getTranslations() {
  if (!state.homeLanguages || !state.homeLanguages.length) return {};
  var currentLangId = parseInt(getLanguage(), 10);
  for (var i = 0; i < state.homeLanguages.length; i++) {
    if (state.homeLanguages[i].id === currentLangId) return state.homeLanguages[i];
  }
  return {};
}

// ================================================
// PIN Code Dialog
// ================================================

export function isCategoryLocked(categoryId) {
  var locked =
    state.userData && Array.isArray(state.userData.locked_categories)
      ? state.userData.locked_categories
      : [];
  return locked.indexOf(categoryId) !== -1;
}

export function showPinDialog(categoryId) {
  state.pinPendingCategoryId = categoryId;
  state.pinCode = "";
  updatePinDots();
  if (state.pinError) state.pinError.textContent = "";
  if (state.pinDialog) state.pinDialog.classList.add("visible");
  state.focusMode = "pindialog";
}

export function hidePinDialog() {
  if (state.pinDialog) state.pinDialog.classList.remove("visible");
  state.pinCode = "";
  state.pinPendingCategoryId = null;
  state.pinChangeStep = 0;
  state.pinChangeNew = "";
  updatePinDots();
  var t = (getTranslations().settings || {}).parental || {};
  if (state.pinTitle) state.pinTitle.textContent = t.pin_title || "PIN Code";
  if (state.pinHint) state.pinHint.textContent = t.pin_hint || "Default PIN code is 0000";
}

function updatePinDots() {
  for (var i = 0; i < 4; i++) {
    if (state.pinDots[i]) {
      if (i < state.pinCode.length) {
        state.pinDots[i].classList.add("filled");
      } else {
        state.pinDots[i].classList.remove("filled");
      }
    }
  }
}

export function showChangePinDialog() {
  state.pinChangeStep = 1;
  state.pinChangeNew = "";
  state.pinCode = "";
  updatePinDots();
  if (state.pinError) state.pinError.textContent = "";
  var t = (getTranslations().settings || {}).parental || {};
  if (state.pinTitle) state.pinTitle.textContent = t.enter_current_pin || "Enter Current PIN";
  if (state.pinHint) state.pinHint.textContent = t.enter_current_pin_hint || "Enter your current PIN code";
  if (state.pinDialog) state.pinDialog.classList.add("visible");
  state.focusMode = "pindialog";
}

export function handlePinDigit(digit) {
  if (state.pinCode.length >= 4) return;
  state.pinCode += String(digit);
  updatePinDots();
  if (state.pinError) state.pinError.textContent = "";

  if (state.pinCode.length === 4) {
    if (state.pinChangeStep > 0) {
      handleChangePinStep();
      return;
    }

    var correctPin =
      state.userData && state.userData.pincode ? state.userData.pincode : "0000";
    if (state.pinCode === correctPin) {
      if (state.pinPendingAction) {
        var action = state.pinPendingAction;
        var pinStr = state.pinCode;
        hidePinDialog();
        if (action.type === "lock") {
          lockCategory(pinStr, action.categoryId)
            .then(function () {
              if (!state.userData.locked_categories) state.userData.locked_categories = [];
              if (state.userData.locked_categories.indexOf(action.categoryId) === -1) {
                state.userData.locked_categories.push(action.categoryId);
              }
              populateParentalPanel();
              state.parentalRowItems = Array.from(state.parentalRows.querySelectorAll(".parental-row"));
              if (state.parentalRowItems[state.parentalRowIndex]) {
                state.parentalRowItems[state.parentalRowIndex].classList.add("active");
              }
              updateSubMenuLockIcons();
            })
            .catch(function (err) { console.error("Failed to lock category:", err); });
        } else {
          unlockCategory(pinStr, action.categoryId)
            .then(function () {
              var idx = state.userData.locked_categories
                ? state.userData.locked_categories.indexOf(action.categoryId)
                : -1;
              if (idx !== -1) state.userData.locked_categories.splice(idx, 1);
              populateParentalPanel();
              state.parentalRowItems = Array.from(state.parentalRows.querySelectorAll(".parental-row"));
              if (state.parentalRowItems[state.parentalRowIndex]) {
                state.parentalRowItems[state.parentalRowIndex].classList.add("active");
              }
              updateSubMenuLockIcons();
            })
            .catch(function (err) { console.error("Failed to unlock category:", err); });
        }
        state.pinPendingAction = null;
        state.focusMode = "parentalcontrol";
      } else {
        var catId = state.pinPendingCategoryId;
        hidePinDialog();
        // Import dynamically to avoid circular dependency
        import("./channelList.js").then(function (mod) {
          mod.showChannelList(catId);
        });
        state.focusMode = "channellist";
      }
    } else {
      var t = (getTranslations().settings || {}).parental || {};
      if (state.pinError) state.pinError.textContent = t.wrong_pin || "Wrong PIN code";
      state.pinCode = "";
      updatePinDots();
    }
  }
}

function handleChangePinStep() {
  var correctPin =
    state.userData && state.userData.pincode ? state.userData.pincode : "0000";
  var t = (getTranslations().settings || {}).parental || {};

  if (state.pinChangeStep === 1) {
    if (state.pinCode === correctPin) {
      state.pinChangeStep = 2;
      state.pinCode = "";
      updatePinDots();
      if (state.pinTitle) state.pinTitle.textContent = t.enter_new_pin || "Enter New PIN";
      if (state.pinHint) state.pinHint.textContent = t.enter_new_pin_hint || "Enter your new 4-digit PIN code";
    } else {
      if (state.pinError) state.pinError.textContent = t.wrong_pin || "Wrong PIN code";
      state.pinCode = "";
      updatePinDots();
    }
  } else if (state.pinChangeStep === 2) {
    state.pinChangeNew = state.pinCode;
    state.pinChangeStep = 3;
    state.pinCode = "";
    updatePinDots();
    if (state.pinTitle) state.pinTitle.textContent = t.confirm_new_pin || "Confirm New PIN";
    if (state.pinHint) state.pinHint.textContent = t.confirm_new_pin_hint || "Re-enter your new PIN code";
  } else if (state.pinChangeStep === 3) {
    if (state.pinCode === state.pinChangeNew) {
      var currentPin = correctPin;
      var newPin = state.pinCode;
      hidePinDialog();
      state.focusMode = "settingssubmenu";
      changePincode(currentPin, newPin)
        .then(function () {
          if (state.userData) state.userData.pincode = newPin;
          console.log("[Settings] PIN code changed successfully");
        })
        .catch(function (err) {
          console.error("[Settings] Failed to change PIN code:", err);
        });
    } else {
      if (state.pinError) state.pinError.textContent = t.pins_no_match || "PINs do not match";
      state.pinChangeStep = 2;
      state.pinChangeNew = "";
      state.pinCode = "";
      updatePinDots();
      if (state.pinTitle) state.pinTitle.textContent = t.enter_new_pin || "Enter New PIN";
      if (state.pinHint) state.pinHint.textContent = t.enter_new_pin_hint || "Enter your new 4-digit PIN code";
    }
  }
}

export function handlePinBackspace() {
  if (state.pinCode.length > 0) {
    state.pinCode = state.pinCode.slice(0, -1);
    updatePinDots();
    if (state.pinError) state.pinError.textContent = "";
  }
}

// ================================================
// Parental Control Panel
// ================================================

export function showParentalPanel() {
  if (!state.parentalPanel) return;
  populateParentalPanel();
  state.parentalPanel.classList.add("visible");
  state.parentalRowIndex = 0;
  state.parentalRowItems = Array.from(state.parentalRows.querySelectorAll(".parental-row"));
  if (state.parentalRowItems.length > 0) {
    state.parentalRowItems[0].classList.add("active");
  }
  state.focusMode = "parentalcontrol";
}

export function hideParentalPanel() {
  if (state.parentalPanel) state.parentalPanel.classList.remove("visible");
  state.parentalRowItems.forEach(function (r) { r.classList.remove("active"); });
}

export function moveParentalFocus(direction) {
  moveFocus({
    items: state.parentalRowItems,
    indexKey: "parentalRowIndex",
    wrapper: state.parentalRows,
    direction: direction,
    scrollOffset: PARENTAL_SCROLL_OFFSET,
  });
}

export function populateParentalPanel() {
  while (state.parentalRows.firstChild) {
    state.parentalRows.removeChild(state.parentalRows.firstChild);
  }
  var lockedCats =
    state.userData && Array.isArray(state.userData.locked_categories)
      ? state.userData.locked_categories
      : [];
  var t = (getTranslations().settings || {}).parental || {};
  parentalCategories.forEach(function (cat) {
    var isLocked = lockedCats.indexOf(cat.id) !== -1;
    var row = document.createElement("div");
    row.className = "parental-row";
    row.dataset.categoryId = cat.id;
    row.dataset.locked = isLocked ? "true" : "false";
    row.innerHTML =
      '<div class="parental-row-icon"><i class="fa-solid ' + cat.icon + '"></i></div>' +
      '<div class="parental-row-name">' + cat.name + "</div>" +
      '<div class="parental-row-status ' + (isLocked ? "locked" : "unlocked") + '">' +
        '<i class="fa-solid ' + (isLocked ? "fa-lock" : "fa-lock-open") + '"></i> ' +
        (isLocked ? (t.locked || "Locked") : (t.unlocked || "Unlocked")) +
      "</div>";
    state.parentalRows.appendChild(row);
  });
}

export function toggleParentalLock() {
  var row = state.parentalRowItems[state.parentalRowIndex];
  if (!row) return;
  var catId = parseInt(row.dataset.categoryId, 10);
  var isLocked = row.dataset.locked === "true";
  state.pinPendingAction = {
    type: isLocked ? "unlock" : "lock",
    categoryId: catId,
    row: row,
  };
  state.pinCode = "";
  updatePinDots();
  if (state.pinError) state.pinError.textContent = "";
  if (state.pinDialog) state.pinDialog.classList.add("visible");
  state.focusMode = "pindialog";
}

export function updateSubMenuLockIcons() {
  var lockedCats =
    state.userData && Array.isArray(state.userData.locked_categories)
      ? state.userData.locked_categories
      : [];
  var catMap = {
    "sub-adria-telekom": 25, "sub-music": 2, "sub-news": 8, "sub-sports": 3,
    "sub-movies": 4, "sub-children": 5, "sub-documentaries": 6, "sub-entertainment": 1,
    "sub-reality": 19, "sub-general": 1, "sub-4k-uhd": 21, "sub-local": 16,
    "sub-international-fta": 17, "sub-camera": 18, "sub-adult": 9,
  };
  if (!state.subItems) return;
  state.subItems.forEach(function (item) {
    var existing = item.querySelector(".sub-item-lock");
    if (existing) existing.remove();
    var catId = catMap[item.id];
    if (catId && lockedCats.indexOf(catId) !== -1) {
      var lock = document.createElement("span");
      lock.className = "sub-item-lock";
      lock.innerHTML = '<i class="fa-solid fa-lock"></i>';
      item.appendChild(lock);
    }
  });
}

// ================================================
// Account Panel
// ================================================

export function showAccountPanel() {
  if (!state.accountPanel) return;
  populateAccountPanel();
  state.accountPanel.classList.add("visible");
}

export function hideAccountPanel() {
  if (state.accountPanel) state.accountPanel.classList.remove("visible");
}

export function populateAccountPanel() {
  while (state.accountRows.firstChild) {
    state.accountRows.removeChild(state.accountRows.firstChild);
  }
  var u = state.userData || {};
  var mac = localStorage.getItem("device_mac") || "N/A";

  // Get translated labels if available
  var labels = (getTranslations().settings || {}).account || {};

  var fields = [
    { icon: "fa-user", label: labels.username || "Username", value: u.username || "N/A" },
    { icon: "fa-envelope", label: labels.email || "Email", value: u.email || "N/A" },
    { icon: "fa-box", label: labels.package_name || "Package Name", value: u.package_name || "N/A" },
    { icon: "fa-calendar", label: labels.expire_date || "Expire Date", value: u.expire_date || "N/A" },
    { icon: "fa-display", label: labels.used_devices || "Used Devices", value: u.max_connections_kozmetika || "N/A" },
    { icon: "fa-code", label: labels.software_version || "Software Version", value: "1.0.0" },
    { icon: "fa-tv", label: labels.device_version || "Device Version", value: "N/A" },
    { icon: "fa-network-wired", label: labels.mac_address || "MAC Address", value: mac },
  ];
  fields.forEach(function (f) {
    var row = document.createElement("div");
    row.className = "account-row";
    row.innerHTML =
      '<div class="account-row-icon"><i class="fa-solid ' + f.icon + '"></i></div>' +
      '<div class="account-row-label">' + f.label + "</div>" +
      '<div class="account-row-value">' + f.value + "</div>";
    state.accountRows.appendChild(row);
  });
}

// ================================================
// Contact Panel
// ================================================

export function showContactPanel() {
  if (!state.contactPanel) return;
  populateContactPanel();
  state.contactPanel.classList.add("visible");
}

export function hideContactPanel() {
  if (state.contactPanel) state.contactPanel.classList.remove("visible");
}

function populateContactPanel() {
  while (state.contactRows.firstChild) {
    state.contactRows.removeChild(state.contactRows.firstChild);
  }
  var info = state.infoData || {};

  if (state.contactPanelText && info.text_message) {
    state.contactPanelText.textContent = info.text_message;
  }

  if (info.website) {
    var webRow = document.createElement("div");
    webRow.className = "contact-row";
    webRow.innerHTML =
      '<div class="contact-row-icon"><i class="fa-solid fa-globe"></i></div>' +
      '<div class="contact-row-label">Website</div>' +
      '<div class="contact-row-value">' + escapeHtml(info.website) + '</div>';
    state.contactRows.appendChild(webRow);
  }

  if (info.email) {
    var emailRow = document.createElement("div");
    emailRow.className = "contact-row";
    emailRow.innerHTML =
      '<div class="contact-row-icon"><i class="fa-solid fa-envelope"></i></div>' +
      '<div class="contact-row-label">Email</div>' +
      '<div class="contact-row-value">' + escapeHtml(info.email) + '</div>';
    state.contactRows.appendChild(emailRow);
  }

  var phones = info.call_center_phones || [];
  phones.forEach(function(entry) {
    var flagUrl = entry.country && entry.country.flag ? entry.country.flag : "";
    var countryName = entry.country && entry.country.name ? entry.country.name : "";
    var flagHtml = flagUrl ? '<img src="' + escapeHtml(flagUrl) + '" alt="' + escapeHtml(countryName) + '" class="contact-flag-img">' : '';
    var row = document.createElement("div");
    row.className = "contact-row";
    row.innerHTML =
      '<div class="contact-row-flag">' + flagHtml + '</div>' +
      '<div class="contact-row-label">' + escapeHtml(countryName) + '</div>' +
      '<div class="contact-row-value">' + escapeHtml(entry.phone_number || "") + '</div>';
    state.contactRows.appendChild(row);
  });
}

function escapeHtml(str) {
  var div = document.createElement("div");
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}
