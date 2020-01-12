export const TEXTURE_WIDTH = 64;
export const TEXTURE_HEIGHT = 64;

const loadImageElement = (url: string) => {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = document.createElement("img");

    image.onload = () => {
      resolve(image);
    };

    image.src = url;
  });
}

export class TextureProvider {
  private textureData: number[][];

  constructor() {
    this.textureData = [];
    for (let i = 0; i < 8; i++) {
      this.textureData[i] = [];
    }

    this.loadImage(0, "images/greystone.png");
    this.loadImage(1, "images/mossy.png");
    this.loadImage(2, "images/eagle.png");
  }

  public getColor(textureId: number, texX: number, texY: number) {
    if (texX >= TEXTURE_WIDTH) {
      texX = TEXTURE_WIDTH - 1
    }

    if (texX < 0) {
      texX = 0
    }

    if (texY >= TEXTURE_HEIGHT) {
      texX = TEXTURE_HEIGHT - 1
    }

    if (texY < 0) {
      texY = 0
    }

    return this.textureData[textureId][TEXTURE_HEIGHT * texY + texX];
  }

  private async loadImage(id: number, url: string) {
    const image = await loadImageElement(url);

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    canvas.width = image.width;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0);

    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);

    const imagePixels: number[] = [];

    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const rgbIndex = y * (canvas.width * 4) + x * 4;

        // combine 
        imagePixels.push(
          (data[rgbIndex] << 16)
          + (data[rgbIndex + 1] << 8)
          + (data[rgbIndex + 2])
        );
      }
    }

    this.textureData[id] = imagePixels;
  }
}
