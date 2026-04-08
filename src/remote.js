class Remote {

  constructor(handler) {
    this.handler = handler;
  }

  init() {

    document.addEventListener("keydown", (e) => {

      // Standard keycodes + Vidaa/Tizen/webOS TV remote keycodes
      var code = e.keyCode || e.which;

      switch(code) {

        case 38:   // Arrow Up
        case 29460: // VK_UP (some Vidaa)
          e.preventDefault();
          this.handler.onUp();
          break;

        case 40:   // Arrow Down
        case 29461: // VK_DOWN (some Vidaa)
          e.preventDefault();
          this.handler.onDown();
          break;

        case 37:   // Arrow Left
        case 29462: // VK_LEFT (some Vidaa)
          e.preventDefault();
          this.handler.onLeft();
          break;

        case 39:   // Arrow Right
        case 29463: // VK_RIGHT (some Vidaa)
          e.preventDefault();
          this.handler.onRight();
          break;

        case 13:   // Enter / OK
        case 29443: // VK_ENTER (some Vidaa)
          e.preventDefault();
          this.handler.onEnter();
          break;

        case 27:    // Escape
        case 8:     // Backspace (used as Back on some TVs)
        case 10009:  // Tizen Back
        case 461:   // LG webOS Back
        case 29444: // VK_BACK (some Vidaa)
          e.preventDefault();
          this.handler.onBack();
          break;

      }

    });

  }

}

export default Remote;