import { login, getInfo } from "../api.js";

import { fetchWeather } from "../weather_api.js";

import VirtualKeyboard from "../virtual_keyboard.js";

class LoginScreen {

  constructor(app) {
    this.app = app;
  }

  async render() {

    const root = document.getElementById("app");

    const response = await fetch("../src/templates/login.html");

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
    });

  }

  showRegistration() {

    const loginSection = document.getElementById("login-section");
    loginSection.style.display = "none";

    const registrationSection = document.getElementById("registration-section");
    registrationSection.style.display = "flex";

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
      if (!data || !data.call_center_phones) return;

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