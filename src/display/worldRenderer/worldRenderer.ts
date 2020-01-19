import { Renderer } from "../renderer";
import { GameState } from "../../gameState";
import { TextureProvider, TEXTURE_HEIGHT, TEXTURE_WIDTH } from "./textureProvider";
import { map } from "../../world/map";
import { numberToInteger } from "../../numberToInteger";

const setImageDataPixel = (imageData: ImageData, x: number, y: number, color: number) => {
  const red = (color >> 16) & 0xFF;
  const green = (color >> 8) & 0xFF;
  const blue = color & 0xFF;
  const alpha = 0xFF;

  const redIndex = y * (imageData.width * 4) + x * 4;

  imageData.data[redIndex] = red;
  imageData.data[redIndex + 1] = green;
  imageData.data[redIndex + 2] = blue;
  imageData.data[redIndex + 3] = alpha;
};

export class WorldRenderer implements Renderer<GameState> {
  constructor(
    private textureProvider: TextureProvider,
    private canvas: HTMLCanvasElement,
    private ctx: CanvasRenderingContext2D
  ) {

  }

  render(gameState: GameState): void {
    const { ctx, textureProvider } = this;
    const { position } = gameState;

    const { width, height } = ctx.canvas;

    const { posX, posY, dirX, dirY, planeX, planeY } = position;

    const imageData = ctx.createImageData(width, height);

    this.drawFloors(imageData, gameState);

    this.drawWalls(imageData, gameState);

    ctx.putImageData(imageData, 0, 0);

    ctx.font = "16px Arial";
    ctx.fillStyle = "#FFFF00";
    ctx.fillText("posX: " + posX.toFixed(2), 10, 16);
    ctx.fillText("posY: " + posY.toFixed(2), 10, 32);
  }

  private drawWalls(imageData: ImageData, gameState: GameState) {
    const { ctx, textureProvider } = this;
    const { position } = gameState;

    const { width, height } = ctx.canvas;

    const { posX, posY, dirX, dirY, planeX, planeY } = position;
    
    for (let x = 0; x < width; x++) {
      //calculate ray position and direction
      const cameraX = 2 * x / width - 1; //x-coordinate in camera space
      const rayDirX = dirX + planeX * cameraX;
      const rayDirY = dirY + planeY * cameraX;

      //which box of the map we're in
      let mapX = numberToInteger(posX);
      let mapY = numberToInteger(posY);

      //length of ray from one x or y-side to next x or y-side
      const deltaDistX = Math.sqrt(1 + (rayDirY * rayDirY) / (rayDirX * rayDirX));
      const deltaDistY = Math.sqrt(1 + (rayDirX * rayDirX) / (rayDirY * rayDirY));
      let perpWallDist: number;

      //length of ray from current position to next x or y-side
      let sideDistX: number;
      let sideDistY: number;

      //which direction to step in x or y-direction (either +1 or -1)
      let stepX: 1 | -1;
      let stepY: 1 | -1;

      let hit = 0; //was there a wall hit?
      let side = 0; //was a NS or a EW wall hit?

      //calculate step and initial sideDist
      if (rayDirX < 0) {
        stepX = -1;
        sideDistX = (posX - mapX) * deltaDistX;
      }
      else {
        stepX = 1;
        sideDistX = (mapX + 1.0 - posX) * deltaDistX;
      }
      if (rayDirY < 0) {
        stepY = -1;
        sideDistY = (posY - mapY) * deltaDistY;
      }
      else {
        stepY = 1;
        sideDistY = (mapY + 1.0 - posY) * deltaDistY;
      }

      //perform DDA
      while (hit == 0) {
        //jump to next map square, OR in x-direction, OR in y-direction
        if (sideDistX < sideDistY) {
          sideDistX += deltaDistX;
          mapX += stepX;
          side = 0;
        }
        else {
          sideDistY += deltaDistY;
          mapY += stepY;
          side = 1;
        }
        //Check if ray has hit a wall
        if (map[mapX][mapY] > 0) hit = 1;
      }

      //Calculate distance of perpendicular ray (Euclidean distance will give fisheye effect!)
      if (side == 0) perpWallDist = (mapX - posX + (1 - stepX) / 2) / rayDirX;
      else perpWallDist = (mapY - posY + (1 - stepY) / 2) / rayDirY;

      //Calculate height of line to draw on screen
      const lineHeight = numberToInteger(height / perpWallDist);

      //calculate lowest and highest pixel to fill in current stripe
      let drawStart = -lineHeight / 2 + height / 2;
      if (drawStart < 0) drawStart = 0;
      let drawEnd = lineHeight / 2 + height / 2;
      if (drawEnd >= height) drawEnd = height - 1;

      const texNum = map[mapX][mapY] - 1; //1 subtracted from it so that texture 0 can be used!

      if (texNum === -1) {
        continue;
      }

      //calculate value of wallX
      let wallX; //where exactly the wall was hit
      if (side == 0) wallX = posY + perpWallDist * rayDirY;
      else wallX = posX + perpWallDist * rayDirX;
      wallX -= Math.floor(wallX);

      //x coordinate on the texture
      let texX = numberToInteger(wallX * TEXTURE_WIDTH);
      if (side == 0 && rayDirX > 0) texX = TEXTURE_WIDTH - texX - 1;
      if (side == 1 && rayDirY < 0) texX = TEXTURE_WIDTH - texX - 1;

      // How much to increase the texture coordinate per screen pixel
      const step = 1.0 * TEXTURE_HEIGHT / lineHeight;
      // Starting texture coordinate
      let texPos = (drawStart - height / 2 + lineHeight / 2) * step;
      for (let y = numberToInteger(drawStart); y < numberToInteger(drawEnd); y++) {
        // Cast the texture coordinate to integer, and mask with (texHeight - 1) in case of overflow
        const texY = numberToInteger(texPos) & (TEXTURE_HEIGHT - 1);
        texPos += step;
        let color = textureProvider.getColor(texNum, texX, texY);
        //make color darker for y-sides: R, G and B byte each divided through two with a "shift" and an "and"
        if (side == 1) color = (color >> 1) & 0x7F7F7F;

        setImageDataPixel(imageData, x, y, color);
      }
    }
  }

  private drawFloors(imageData: ImageData, gameState: GameState) {
    const { ctx, textureProvider } = this;
    const { position } = gameState;

    const { width, height } = ctx.canvas;

    const { posX, posY, dirX, dirY, planeX, planeY } = position;

    //FLOOR CASTING
    for (let y = 0; y < height; y++) {
      // rayDir for leftmost ray (x = 0) and rightmost ray (x = w)
      const rayDirX0 = dirX - planeX;
      const rayDirY0 = dirY - planeY;
      const rayDirX1 = dirX + planeX;
      const rayDirY1 = dirY + planeY;

      // Current y position compared to the center of the screen (the horizon)
      const p = y - height / 2;

      // Vertical position of the camera.
      const posZ = 0.5 * height;

      // Horizontal distance from the camera to the floor for the current row.
      // 0.5 is the z position exactly in the middle between floor and ceiling.
      const rowDistance = posZ / p;

      // calculate the real world step vector we have to add for each x (parallel to camera plane)
      // adding step by step avoids multiplications with a weight in the inner loop
      const floorStepX = rowDistance * (rayDirX1 - rayDirX0) / width;
      const floorStepY = rowDistance * (rayDirY1 - rayDirY0) / width;

      // real world coordinates of the leftmost column. This will be updated as we step to the right.
      let floorX = posX + rowDistance * rayDirX0;
      let floorY = posY + rowDistance * rayDirY0;

      for (let x = 0; x < width; ++x) {
        // the cell coord is simply got from the integer parts of floorX and floorY
        const cellX = numberToInteger(floorX);
        const cellY = numberToInteger(floorY);

        // get the texture coordinate from the fractional part
        const tx = numberToInteger(TEXTURE_WIDTH * (floorX - cellX)) & (TEXTURE_WIDTH - 1);
        const ty = numberToInteger(TEXTURE_HEIGHT * (floorY - cellY)) & (TEXTURE_HEIGHT - 1);

        floorX += floorStepX;
        floorY += floorStepY;

        // choose texture and draw the pixel
        const floorTexture = 4;
        const ceilingTexture = 4;
        let color: number;

        // floor
        color = textureProvider.getColor(floorTexture, tx, ty);
        color = (color >> 1) & 0x7F7F7F; // make a bit darker
        setImageDataPixel(imageData, x, y, color);

        //ceiling (symmetrical, at screenHeight - y - 1 instead of y)
        color = textureProvider.getColor(ceilingTexture, tx, ty);
        color = (color >> 1) & 0x7F7F7F; // make a bit darker
        setImageDataPixel(imageData, x, height - y - 1, color);
      }
    }
  }

}
