import state from "../state.js";
import { lockCategory, unlockCategory, changePincode } from "../../api.js";
import { parentalCategories } from "./constants.js";
import { moveFocus } from "./focusUtils.js";
import { PARENTAL_SCROLL_OFFSET } from "./constants.js";

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
  if (state.pinTitle) state.pinTitle.textContent = "PIN Code";
  if (state.pinHint) state.pinHint.textContent = "Default PIN code is 0000";
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
  if (state.pinTitle) state.pinTitle.textContent = "Enter Current PIN";
  if (state.pinHint) state.pinHint.textContent = "Enter your current PIN code";
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
      if (state.pinError) state.pinError.textContent = "Wrong PIN code";
      state.pinCode = "";
      updatePinDots();
    }
  }
}

function handleChangePinStep() {
  var correctPin =
    state.userData && state.userData.pincode ? state.userData.pincode : "0000";

  if (state.pinChangeStep === 1) {
    if (state.pinCode === correctPin) {
      state.pinChangeStep = 2;
      state.pinCode = "";
      updatePinDots();
      if (state.pinTitle) state.pinTitle.textContent = "Enter New PIN";
      if (state.pinHint) state.pinHint.textContent = "Enter your new 4-digit PIN code";
    } else {
      if (state.pinError) state.pinError.textContent = "Wrong PIN code";
      state.pinCode = "";
      updatePinDots();
    }
  } else if (state.pinChangeStep === 2) {
    state.pinChangeNew = state.pinCode;
    state.pinChangeStep = 3;
    state.pinCode = "";
    updatePinDots();
    if (state.pinTitle) state.pinTitle.textContent = "Confirm New PIN";
    if (state.pinHint) state.pinHint.textContent = "Re-enter your new PIN code";
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
      if (state.pinError) state.pinError.textContent = "PINs do not match";
      state.pinChangeStep = 2;
      state.pinChangeNew = "";
      state.pinCode = "";
      updatePinDots();
      if (state.pinTitle) state.pinTitle.textContent = "Enter New PIN";
      if (state.pinHint) state.pinHint.textContent = "Enter your new 4-digit PIN code";
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
        (isLocked ? "Locked" : "Unlocked") +
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
  var fields = [
    { icon: "fa-user", label: "Username", value: u.username || "N/A" },
    { icon: "fa-envelope", label: "Email", value: u.email || "N/A" },
    { icon: "fa-box", label: "Package Name", value: u.package_name || "N/A" },
    { icon: "fa-calendar", label: "Expire Date", value: u.expire_date || "N/A" },
    { icon: "fa-display", label: "Used Devices", value: u.max_connections_kozmetika || "N/A" },
    { icon: "fa-code", label: "Software Version", value: "1.0.0" },
    { icon: "fa-tv", label: "Device Version", value: "N/A" },
    { icon: "fa-network-wired", label: "MAC Address", value: mac },
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
