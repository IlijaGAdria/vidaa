class Remote {

  constructor(handler) {
    this.handler = handler;
  }

  init() {

    document.addEventListener("keydown", (e) => {

      switch(e.keyCode) {

        case 38:
          this.handler.onUp();
          break;

        case 40:
          this.handler.onDown();
          break;

        case 37:
          this.handler.onLeft();
          break;

        case 39:
          this.handler.onRight();
          break;

        case 13:
          this.handler.onEnter();
          break;

        case 27:
          this.handler.onBack();
          break;

      }

    });

  }

}

export default Remote;