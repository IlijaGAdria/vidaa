import { getChannels } from "../api.js";

import Remote from "../remote.js";

import { fetchWeather } from "../weather_api.js";

const handler = {
  onUp: () => console.log("UP pressed"),
  onDown: () => console.log("DOWN pressed"),
  onLeft: () => console.log("LEFT pressed"),
  onRight: () => console.log("RIGHT pressed"),
  onEnter: () => console.log("ENTER pressed"),
  onBack: () => console.log("BACK pressed"),

  onDown: () => moveFocus(1),
  onUp: () => moveFocus(-1),
};

var selectedIndex = 0;
var items = [];
var container = null;
var wrapper = null;

function moveFocus(direction) {

  if (selectedIndex + direction < 0 || selectedIndex + direction >= items.length) return;

  items[selectedIndex].tabIndex = -1;
  items[selectedIndex].classList.remove("active");
  
  selectedIndex += direction;

  items[selectedIndex].tabIndex = 0;
  items[selectedIndex].classList.add("active");

  const topIndex = Math.max(0, selectedIndex - 3);
  wrapper.style.transform = `translateY(${-items[topIndex].offsetTop}px)`;

}



class HomeScreen {

  constructor(app) {
    this.app = app;
  }

  async render() {

    //const channels = await getChannels();

    const root = document.getElementById("app");

    // root.innerHTML = `
    //   <div class="channels">
    //     ${channels.map(c => `
    //       <div class="channel" data-url="${c.stream}">
    //         ${c.name}
    //       </div>
    //     `).join("")}
    //   </div>
    // `;

    const response = await fetch("../src/templates/home.html");
    const html = await response.text();
    root.innerHTML = html;

    container = document.getElementById("menu");
    items = Array.from(container.querySelectorAll(".item"));

    wrapper = document.createElement("div");
    wrapper.style.cssText = "position: relative; transition: transform 0.25s ease;";
    while (container.firstChild) wrapper.appendChild(container.firstChild);
    container.appendChild(wrapper);

    const remote = new Remote(handler);
    remote.init();

    fetchWeather();
    
    setInterval(fetchWeather, 60000);

  }

}

export default HomeScreen;