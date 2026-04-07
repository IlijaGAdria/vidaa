class Remote {

  constructor(handler) {
    this.handler = handler;
  }

  init() {

    document.addEventListener("keydown", (e) => {

      switch(e.keyCode) {

        case 38:
          e.preventDefault();
          this.handler.onUp();
          break;

        case 40:
          e.preventDefault();
          this.handler.onDown();
          break;

        case 37:
          e.preventDefault();
          this.handler.onLeft();
          break;

        case 39:
          e.preventDefault();
          this.handler.onRight();
          break;

        case 13:
          e.preventDefault();
          this.handler.onEnter();
          break;

        case 27:
          e.preventDefault();
          this.handler.onBack();
          break;

      }

    });

  }

}

export default Remote;