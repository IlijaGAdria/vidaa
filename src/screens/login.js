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

  async handleLogin() {

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const result = await login(username, password);

    if(result.success) {
      this.app.showHome();
    }

  }

}

export default LoginScreen;