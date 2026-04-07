// Virtual Keyboard for TV remote navigation
// Usage: import VirtualKeyboard and call init() after login page renders

var VirtualKeyboard = (function () {
  var state = {
    visible: false,
    activeInput: null,
    rowIndex: 0,
    colIndex: 0,
    focusMode: "form", // "form" | "keyboard"
    formIndex: 0, // 0=username, 1=password, 2=loginBtn, 3=registerBtn
    capsLock: false,
    container: null,
    rows: [],
    keys: [],
    formItems: [],
    onLogin: null,
    onRegister: null,
  };

  // Keyboard layout
  var layouts = {
    lower: [
      ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
      ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
      ["a", "s", "d", "f", "g", "h", "j", "k", "l", "@"],
      ["z", "x", "c", "v", "b", "n", "m", ".", "-", "_"],
      ["⇧", "SPACE", "⌫", "CLEAR", "DONE"],
    ],
    upper: [
      ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
      ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
      ["A", "S", "D", "F", "G", "H", "J", "K", "L", "@"],
      ["Z", "X", "C", "V", "B", "N", "M", ".", "-", "_"],
      ["⇧", "SPACE", "⌫", "CLEAR", "DONE"],
    ],
  };

  function getLayout() {
    return state.capsLock ? layouts.upper : layouts.lower;
  }

  function injectStyles() {
    if (document.getElementById("vk-styles")) return;
    var style = document.createElement("style");
    style.id = "vk-styles";
    style.textContent =
      ".vk-overlay {" +
      "  position: fixed; bottom: 0; left: 0; width: 100vw;" +
      "  display: none; justify-content: center; z-index: 500;" +
      "  background: linear-gradient(to top, rgba(10,15,25,0.98) 60%, rgba(10,15,25,0.85));" +
      "  padding: 1.5vw 0 2vw; transition: opacity 0.2s;" +
      "}" +
      ".vk-overlay.visible { display: flex; }" +
      ".vk-board {" +
      "  display: flex; flex-direction: column; align-items: center; gap: 0.6vw;" +
      "}" +
      ".vk-row { display: flex; gap: 0.5vw; }" +
      ".vk-key {" +
      "  min-width: 4vw; height: 4vw; display: flex; align-items: center;" +
      "  justify-content: center; border-radius: 0.5vw; font-size: 1.4vw;" +
      "  color: #fff; background: rgba(255,255,255,0.1); cursor: pointer;" +
      "  transition: background 0.15s, transform 0.1s; user-select: none;" +
      "}" +
      ".vk-key.active { background: #00b9be; transform: scale(1.1); }" +
      ".vk-key.wide { min-width: 8vw; font-size: 1.1vw; }" +
      ".vk-key.space { min-width: 16vw; }" +
      ".vk-input-preview {" +
      "  color: #fff; font-size: 1.3vw; margin-bottom: 0.8vw; text-align: center;" +
      "  background: rgba(255,255,255,0.08); padding: 0.7vw 2vw; border-radius: 0.4vw;" +
      "  min-width: 30vw; min-height: 2.4vw; letter-spacing: 0.05vw;" +
      "}" +
      // Form field focus styling
      ".vk-form-active {" +
      "  outline: 3px solid #00b9be !important; box-shadow: 0 0 12px rgba(0,185,190,0.5) !important;" +
      "}" +
      ".vk-btn-active {" +
      "  background-color: #00b9be !important; transform: scale(1.05);" +
      "  transition: background-color 0.15s, transform 0.1s;" +
      "}";
    document.head.appendChild(style);
  }

  function buildKeyboard() {
    if (state.container) return;
    var overlay = document.createElement("div");
    overlay.className = "vk-overlay";
    overlay.id = "vk-overlay";

    var board = document.createElement("div");
    board.className = "vk-board";

    // Input preview
    var preview = document.createElement("div");
    preview.className = "vk-input-preview";
    preview.id = "vk-preview";
    board.appendChild(preview);

    var layout = getLayout();
    layout.forEach(function (rowKeys, rIdx) {
      var row = document.createElement("div");
      row.className = "vk-row";
      rowKeys.forEach(function (key) {
        var el = document.createElement("div");
        el.className = "vk-key";
        el.dataset.key = key;
        if (key === "SPACE") el.classList.add("space");
        else if (key.length > 1) el.classList.add("wide");
        el.textContent = key === "SPACE" ? "␣" : key;
        row.appendChild(el);
      });
      board.appendChild(row);
    });

    overlay.appendChild(board);
    document.body.appendChild(overlay);
    state.container = overlay;
    rebuildKeyRefs();
  }

  function rebuildKeyRefs() {
    state.rows = [];
    state.keys = [];
    var rowEls = state.container.querySelectorAll(".vk-row");
    rowEls.forEach(function (row) {
      var keyEls = Array.from(row.querySelectorAll(".vk-key"));
      state.rows.push(keyEls);
      keyEls.forEach(function (k) {
        state.keys.push(k);
      });
    });
  }

  function updateKeyLabels() {
    var layout = getLayout();
    state.rows.forEach(function (rowKeys, rIdx) {
      rowKeys.forEach(function (keyEl, cIdx) {
        var label = layout[rIdx][cIdx];
        keyEl.dataset.key = label;
        keyEl.textContent = label === "SPACE" ? "␣" : label;
      });
    });
  }

  function clearKeyFocus() {
    state.keys.forEach(function (k) {
      k.classList.remove("active");
    });
  }

  function setKeyFocus() {
    clearKeyFocus();
    var row = state.rows[state.rowIndex];
    if (row && row[state.colIndex]) {
      row[state.colIndex].classList.add("active");
    }
  }

  function updatePreview() {
    var preview = document.getElementById("vk-preview");
    if (!preview || !state.activeInput) return;
    var isPassword = state.activeInput.type === "password";
    var val = state.activeInput.value;
    preview.textContent = isPassword ? "•".repeat(val.length) : val;
    if (!val) {
      preview.textContent = state.activeInput.placeholder || "";
      preview.style.opacity = "0.4";
    } else {
      preview.style.opacity = "1";
    }
  }

  function show(inputEl) {
    if (!state.container) buildKeyboard();
    state.activeInput = inputEl;
    state.rowIndex = 0;
    state.colIndex = 0;
    state.capsLock = false;
    updateKeyLabels();
    state.container.classList.add("visible");
    state.visible = true;
    state.focusMode = "keyboard";
    setKeyFocus();
    updatePreview();
  }

  function hide() {
    if (state.container) state.container.classList.remove("visible");
    state.visible = false;
    clearKeyFocus();
    state.focusMode = "form";
    setFormFocus();
  }

  function pressKey(key) {
    if (!state.activeInput) return;
    if (key === "⇧") {
      state.capsLock = !state.capsLock;
      updateKeyLabels();
      setKeyFocus();
      return;
    }
    if (key === "SPACE") {
      state.activeInput.value += " ";
    } else if (key === "⌫") {
      state.activeInput.value = state.activeInput.value.slice(0, -1);
    } else if (key === "CLEAR") {
      state.activeInput.value = "";
    } else if (key === "DONE") {
      hide();
      return;
    } else {
      state.activeInput.value += key;
    }
    updatePreview();
  }

  // Form navigation
  function collectFormItems() {
    state.formItems = [];
    var u = document.getElementById("username");
    var p = document.getElementById("password");
    var l = document.getElementById("loginBtn");
    var r = document.getElementById("registerBtn");
    if (u) state.formItems.push(u);
    if (p) state.formItems.push(p);
    if (l) state.formItems.push(l);
    if (r) state.formItems.push(r);
  }

  function clearFormFocus() {
    state.formItems.forEach(function (el) {
      el.classList.remove("vk-form-active");
      el.classList.remove("vk-btn-active");
    });
  }

  function setFormFocus() {
    clearFormFocus();
    var el = state.formItems[state.formIndex];
    if (!el) return;
    if (el.tagName === "INPUT") {
      el.classList.add("vk-form-active");
    } else {
      el.classList.add("vk-btn-active");
    }
  }

  function moveFormFocus(dir) {
    var next = state.formIndex + dir;
    if (next < 0 || next >= state.formItems.length) return;
    state.formIndex = next;
    setFormFocus();
  }

  // Key handler bound to remote
  function handleKeyDown(e) {
    if (state.focusMode === "keyboard" && state.visible) {
      handleKeyboardNav(e);
    } else if (state.focusMode === "form") {
      handleFormNav(e);
    }
  }

  function handleFormNav(e) {
    switch (e.keyCode) {
      case 38: // Up
        e.preventDefault();
        moveFormFocus(-1);
        break;
      case 40: // Down
        e.preventDefault();
        moveFormFocus(1);
        break;
      case 13: // Enter
        e.preventDefault();
        var el = state.formItems[state.formIndex];
        if (!el) return;
        if (el.tagName === "INPUT") {
          show(el);
        } else if (el.id === "loginBtn" && state.onLogin) {
          state.onLogin();
        } else if (el.id === "registerBtn" && state.onRegister) {
          state.onRegister();
        }
        break;
      case 27: // Back — do nothing on login
        e.preventDefault();
        break;
    }
  }

  function handleKeyboardNav(e) {
    e.preventDefault();
    switch (e.keyCode) {
      case 38: // Up
        if (state.rowIndex > 0) {
          state.rowIndex--;
          if (state.colIndex >= state.rows[state.rowIndex].length) {
            state.colIndex = state.rows[state.rowIndex].length - 1;
          }
          setKeyFocus();
        }
        break;
      case 40: // Down
        if (state.rowIndex < state.rows.length - 1) {
          state.rowIndex++;
          if (state.colIndex >= state.rows[state.rowIndex].length) {
            state.colIndex = state.rows[state.rowIndex].length - 1;
          }
          setKeyFocus();
        }
        break;
      case 37: // Left
        if (state.colIndex > 0) {
          state.colIndex--;
          setKeyFocus();
        }
        break;
      case 39: // Right
        if (state.colIndex < state.rows[state.rowIndex].length - 1) {
          state.colIndex++;
          setKeyFocus();
        }
        break;
      case 13: // Enter
        var row = state.rows[state.rowIndex];
        if (row && row[state.colIndex]) {
          pressKey(row[state.colIndex].dataset.key);
        }
        break;
      case 27: // Back — close keyboard
        hide();
        break;
    }
  }

  // Public init — call after login HTML is rendered
  function init(options) {
    options = options || {};
    state.onLogin = options.onLogin || null;
    state.onRegister = options.onRegister || null;

    injectStyles();
    buildKeyboard();
    collectFormItems();
    state.formIndex = 0;
    state.focusMode = "form";
    setFormFocus();

    // Attach keydown handler directly (before remote.js, which only runs on home)
    document.addEventListener("keydown", handleKeyDown);
  }

  function destroy() {
    document.removeEventListener("keydown", handleKeyDown);
    if (state.container && state.container.parentNode) {
      state.container.parentNode.removeChild(state.container);
    }
    state.container = null;
    state.keys = [];
    state.rows = [];
    state.formItems = [];
    clearFormFocus();
  }

  return {
    init: init,
    destroy: destroy,
  };
})();

export default VirtualKeyboard;
