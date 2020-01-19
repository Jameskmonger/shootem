export class KeyListener {
  private keys: boolean[];

  constructor() {
    this.keys = [];

    window.addEventListener("keydown", (e) => {
      this.keys[e.keyCode] = true;
    });

    window.addEventListener("keyup", (e) => {
      this.keys[e.keyCode] = false;
    });
  }

  public isPressed(keyCode: number) {
    return this.keys[keyCode] === true;
  }
}
