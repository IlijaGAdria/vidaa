import LoginScreen from "./screens/login.js";
import HomeScreen from "./screens/home.js";

class App {

  constructor() {
    this.currentScreen = null;
  }

  init() {
    this.showLogin();
  }

  showLogin() {
    this.currentScreen = new LoginScreen(this);
    this.currentScreen.render();
  }

  showHome() {
    this.currentScreen = new HomeScreen(this);
    this.currentScreen.render();
  }

}

export default App;