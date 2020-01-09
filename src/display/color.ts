export class Color {
  constructor(private r: number, private g: number, private b: number) {

  }

  public darken(multiplier: number) {
    return new Color(this.r / multiplier, this.g / multiplier, this.b / multiplier);
  }

  public toStrokeString() {
    return `rgb(${this.r}, ${this.g}, ${this.b})`
  }
}
