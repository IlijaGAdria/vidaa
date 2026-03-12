import { getChannels } from "../api.js";

class HomeScreen {

  constructor(app) {
    this.app = app;
  }

  async render() {

    const channels = await getChannels();

    const root = document.getElementById("app");

    root.innerHTML = `
      <div class="channels">
        ${channels.map(c => `
          <div class="channel" data-url="${c.stream}">
            ${c.name}
          </div>
        `).join("")}
      </div>
    `;

  }

}

export default HomeScreen;