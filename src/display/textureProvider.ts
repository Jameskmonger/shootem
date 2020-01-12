export const TEXTURE_WIDTH = 64;
export const TEXTURE_HEIGHT = 64;

export class TextureProvider {
  private textureData: number[][];

  constructor() {
    this.textureData = [];
    for (let i = 0; i < 8; i++) {
      this.textureData[i] = [];
    }

    for (let x = 0; x < TEXTURE_WIDTH; x++) {
      for (let y = 0; y < TEXTURE_HEIGHT; y++) {
        const xorcolor = (x * 256 / TEXTURE_WIDTH) ^ (y * 256 / TEXTURE_HEIGHT);
        //int xcolor = x * 256 / TEXTURE_WIDTH;
        const ycolor = y * 256 / TEXTURE_HEIGHT;
        const xycolor = y * 128 / TEXTURE_HEIGHT + x * 128 / TEXTURE_WIDTH;
        this.textureData[0][TEXTURE_WIDTH * y + x] = 65536 * 254 * ((x != y && x != TEXTURE_WIDTH - y) ? 1 : 0); //flat red texture with black cross
        this.textureData[1][TEXTURE_WIDTH * y + x] = xycolor + 256 * xycolor + 65536 * xycolor; //sloped greyscale
        this.textureData[2][TEXTURE_WIDTH * y + x] = 256 * xycolor + 65536 * xycolor; //sloped yellow gradient
        this.textureData[3][TEXTURE_WIDTH * y + x] = xorcolor + 256 * xorcolor + 65536 * xorcolor; //xor greyscale
        this.textureData[4][TEXTURE_WIDTH * y + x] = 256 * xorcolor; //xor green
        this.textureData[5][TEXTURE_WIDTH * y + x] = 65536 * 192 * (x % 16 && y % 16); //red bricks
        this.textureData[6][TEXTURE_WIDTH * y + x] = 65536 * ycolor; //red gradient
        this.textureData[7][TEXTURE_WIDTH * y + x] = 128 + 256 * 128 + 65536 * 128; //flat grey texture
      }
    }
  }

  public getColor(textureId: number, texX: number, texY: number) {
    if (texX >= TEXTURE_WIDTH || texX < 0 || texY >= TEXTURE_HEIGHT || texY < 0) {
      return 0xffc0cb;
    }

    return this.textureData[textureId][TEXTURE_HEIGHT * texY + texX];
  }
}
