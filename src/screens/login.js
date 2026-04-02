import { login } from "../api.js";

import { fetchWeather } from "../weather_api.js";

class LoginScreen {

  constructor(app) {
    this.app = app;
  }

  async render() {

    const root = document.getElementById("app");

    const response = await fetch("../src/templates/login-2.html");

    const html = await response.text();

    root.innerHTML = html;

    fetchWeather();

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