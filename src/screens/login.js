import { login, getInfo, getLanguages } from "../api.js";
import { setLanguage, getLanguage } from "../language.js";

import { fetchWeather } from "../weather_api.js";

import VirtualKeyboard from "../virtual_keyboard.js";

class LoginScreen {

  constructor(app) {
    this.app = app;
  }

  async render() {

    const root = document.getElementById("app");

    const response = await fetch("src/templates/login.html");

    const html = await response.text();

    root.innerHTML = html;

    fetchWeather();

    this.loadCustomerCenter();

    // root.innerHTML = `
    //   <div class="login">
    //     <input id="username" placeholder="Username">
    //     <input id="password" type="password" placeholder="Password">
    //     <button id="loginBtn">Login</button>
    //   </div>
    // `;

    document.getElementById("loginBtn")
      .addEventListener("click", this.handleLogin.bind(this));

    document.getElementById("registerBtn")
      .addEventListener("click", this.showRegistration.bind(this));

    // Init virtual keyboard for TV remote navigation
    VirtualKeyboard.init({
      onLogin: this.handleLogin.bind(this),
      onRegister: this.showRegistration.bind(this),
      onBackToLogin: this.showLogin.bind(this),
      onShowLanguages: this.showLanguageSelection.bind(this),
      onHideLanguages: this.hideLanguageSelection.bind(this),
      loginScreen: this,
    });

    // Fetch available languages
    var self = this;
    this.languages = [];
    this.languageIndex = 0;
    this.languageOverlay = document.getElementById("language-overlay");
    this.languageList = document.getElementById("language-list");
    getLanguages().then(function(data) {
      if (data && data.languages) {
        self.languages = data.languages;
        self.applyTranslations();
      }
    }).catch(function(err) {
      console.error("Failed to load languages:", err);
    });

  }

  showRegistration() {

    const loginSection = document.getElementById("login-section");
    loginSection.style.display = "none";

    const registrationSection = document.getElementById("registration-section");
    registrationSection.style.display = "flex";

    VirtualKeyboard.switchToRegistration();
  }

  showLogin() {
    const registrationSection = document.getElementById("registration-section");
    registrationSection.style.display = "none";

    const loginSection = document.getElementById("login-section");
    loginSection.style.display = "flex";

    VirtualKeyboard.switchToLogin();
  }

  showStatus(message, type) {
    var el = document.getElementById("login-status");
    if (!el) return;
    el.textContent = message;
    el.style.display = "block";
    el.style.background = type === "error" ? "rgba(220,53,69,0.85)" : type === "success" ? "rgba(0,185,190,0.85)" : "rgba(255,193,7,0.85)";
    el.style.color = "#fff";
  }

  async loadCustomerCenter() {
    try {
      var data = await getInfo();
      if (!data) return;

      // Set background image
      if (data.default_background_image && data.default_background_image.url) {
        var contentEl = document.querySelector(".content");
        if (contentEl) {
          contentEl.style.backgroundImage = "url('" + data.default_background_image.url + "')";
        }
      }

      // Set footer email and website
      if (data.email) {
        var emailEl = document.getElementById("footer-email");
        if (emailEl) emailEl.textContent = data.email;
      }
      if (data.website) {
        var websiteEl = document.getElementById("footer-website");
        if (websiteEl) websiteEl.textContent = data.website;
      }

      // Set QR code image
      if (data.qr_code_img_url) {
        var qrEl = document.getElementById("qr_code");
        if (qrEl) {
          qrEl.style.background = "none";
          qrEl.style.border = "none";
          qrEl.innerHTML = '<img src="' + data.qr_code_img_url + '" style="width:100%;height:100%;object-fit:contain;display:block;">';
        }
      }

      if (!data.call_center_phones) return;

      var container = document.getElementById("customer-center-phones");
      if (!container) return;

      data.call_center_phones.forEach(function(entry) {
        var row = document.createElement("div");
        row.style.cssText = "display: flex; align-items: center; gap: 1vw; height: 3vw;";

        var flag = document.createElement("img");
        flag.src = entry.country.flag;
        flag.alt = entry.country.name;
        flag.style.cssText = "width: 2.4vw; height: 1.6vw; object-fit: cover; border-radius: 3px;";

        var name = document.createElement("p");
        name.textContent = entry.country.name;
        name.style.cssText = "color: white; font-size: 1.1vw; min-width: 7vw;";

        var phone = document.createElement("p");
        phone.textContent = entry.phone_number;
        phone.style.cssText = "color: white; font-size: 1.1vw;";

        row.appendChild(flag);
        row.appendChild(name);
        row.appendChild(phone);
        container.appendChild(row);
      });
    } catch (err) {
      console.error("Failed to load customer center info:", err);
    }
  }

  showLanguageSelection() {
    if (!this.languages || this.languages.length === 0) return;
    this.languageOverlay.style.display = "flex";

    while (this.languageList.firstChild) {
      this.languageList.removeChild(this.languageList.firstChild);
    }

    var currentLangId = parseInt(getLanguage(), 10);
    var self = this;

    this.languages.forEach(function(lang, idx) {
      var item = document.createElement("div");
      item.style.cssText = "display: flex; align-items: center; gap: 1.2vw; padding: 1vw 1.5vw; border-radius: 0.5vw; background: rgba(255,255,255,0.05); cursor: pointer; transition: background 0.15s;";
      item.dataset.langId = lang.id;

      var icon = document.createElement("img");
      icon.src = lang.icon;
      icon.alt = lang.name;
      icon.style.cssText = "width: 2.8vw; height: 1.9vw; object-fit: cover; border-radius: 0.2vw;";

      var name = document.createElement("span");
      name.textContent = lang.name;
      name.style.cssText = "color: #fff; font-size: 1.4vw; font-weight: 500; flex: 1;";

      item.appendChild(icon);
      item.appendChild(name);

      if (lang.id === currentLangId) {
        var check = document.createElement("i");
        check.className = "fa-solid fa-check";
        check.style.cssText = "color: #00b9be; font-size: 1.3vw;";
        item.appendChild(check);
        item.style.background = "rgba(0,185,190,0.15)";
        self.languageIndex = idx;
      }

      self.languageList.appendChild(item);
    });

    this.languageItems = Array.from(this.languageList.children);
    this.updateLanguageFocus();
  }

  hideLanguageSelection() {
    this.languageOverlay.style.display = "none";
  }

  selectLanguage() {
    if (!this.languageItems || !this.languageItems[this.languageIndex]) return;
    var langId = parseInt(this.languageItems[this.languageIndex].dataset.langId, 10);
    setLanguage(langId);
    this.hideLanguageSelection();
    // Reload the login page to apply language
    this.render();
  }

  moveLanguageFocus(dir) {
    if (!this.languageItems || this.languageItems.length === 0) return;
    var newIdx = this.languageIndex + dir;
    if (newIdx < 0 || newIdx >= this.languageItems.length) return;
    this.languageIndex = newIdx;
    this.updateLanguageFocus();
  }

  updateLanguageFocus() {
    if (!this.languageItems) return;
    this.languageItems.forEach(function(item) {
      item.style.outline = "none";
    });
    var active = this.languageItems[this.languageIndex];
    if (active) {
      active.style.outline = "2px solid #00b9be";
      active.scrollIntoView({ block: "nearest" });
    }
  }

  applyTranslations() {
    var currentLangId = parseInt(getLanguage(), 10);
    var langObj = null;
    for (var i = 0; i < this.languages.length; i++) {
      if (this.languages[i].id === currentLangId) {
        langObj = this.languages[i];
        break;
      }
    }
    if (!langObj) return;

    var lang = langObj.language || {};
    var login = langObj.login || {};
    var welcome = login.welcome_screen || {};
    var loginScreen = login.login_screen || {};
    var regScreen = login.register_screen || {};
    var callCenter = login.call_center_screen || {};

    function setText(id, text) {
      var el = document.getElementById(id);
      if (el && text) el.textContent = text;
    }
    function setPlaceholder(id, text) {
      var el = document.getElementById(id);
      if (el && text) el.placeholder = text;
    }

    // Language overlay
    var chooseLangEl = document.getElementById("t-choose-language");
    if (chooseLangEl && lang.choose_language_label) {
      chooseLangEl.innerHTML = '<i class="fa-solid fa-globe" style="margin-right: 1vw;"></i>' + lang.choose_language_label;
    }

    // Mobile registration section
    setText("t-mobile-register", welcome.mobile_registration_label);
    setText("t-qr-description", welcome.qr_code_description);

    // Login section
    setText("t-sign-in", loginScreen.heading);
    setPlaceholder("username", loginScreen.username_label);
    setPlaceholder("password", loginScreen.password_label);
    setText("loginBtn", loginScreen.confirm_btn);
    setText("t-no-account", login.user_no_account || login.no_account);
    setText("registerBtn", welcome.try_free_btn || login.sign_up);

    // Registration section
    setText("t-registration", regScreen.heading);
    setPlaceholder("reg-name", regScreen.name_label);
    setPlaceholder("reg-phone", regScreen.phone_label);
    setText("t-agree-label", regScreen.i_agree_label);
    setText("t-terms-btn", regScreen.privacy_policy_btn);
    setText("confirmRegBtn", regScreen.confirm_btn);
    setText("t-mandatory", regScreen.mandatory_data_label);

    // Customer center
    setText("t-customer-center", lang.customer_center_label || callCenter.heading);
    setText("t-help-text", callCenter.description || lang.customer_center_description);

    // Footer
    setText("t-mac-label", login.mac_address_label);
  }

  async handleLogin() {

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if (!username || !password) {
      this.showStatus("Please enter your username and password.", "warn");
      return;
    }

    this.showStatus("Signing in...", "warn");

    try {
      const result = await login(username, password);

      if (result && result.access_token) {
        localStorage.setItem("access_token", result.access_token);
        localStorage.setItem("stream_token", result.stream_token || "");
        this.showStatus("Login successful! Loading...", "success");
        VirtualKeyboard.destroy();
        this.app.showHome();
      } else {
        const msg = result && result.error ? result.error : (result && result.message ? result.message : "Login failed. Please check your credentials.");
        this.showStatus(msg, "error");
      }
    } catch (err) {
      this.showStatus("Connection error: " + err.message, "error");
    }

  }

}

export default LoginScreen;