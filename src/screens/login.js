import { login } from "../api.js";

class LoginScreen {

  constructor(app) {
    this.app = app;
  }

  async render() {

    const root = document.getElementById("app");

    const response = await fetch("../src/templates/login.html");

    const html = await response.text();

    root.innerHTML = html;

    // root.innerHTML = `
    //   <div class="login">
    //     <input id="username" placeholder="Username">
    //     <input id="password" type="password" placeholder="Password">
    //     <button id="loginBtn">Login</button>
    //   </div>
    // `;

    document.getElementById("loginBtn")
      .addEventListener("click", this.handleLogin.bind(this));

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