import { map } from "../world/map";
import { PositionInfo } from "../world/positionInfo";
import { TextureProvider, TEXTURE_HEIGHT, TEXTURE_WIDTH } from "./textureProvider";

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

export const draw = (textureProvider: TextureProvider, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, position: PositionInfo) => {
  const { width, height } = ctx.canvas;

  const { posX, posY, dirX, dirY, planeX, planeY } = position;

  const imageData = ctx.createImageData(width, height);

  for (let x = 0; x < width; x++) {
    //calculate ray position and direction
    const cameraX = 2 * x / width - 1; //x-coordinate in camera space
    const rayDirX = dirX + planeX * cameraX;
    const rayDirY = dirY + planeY * cameraX;

    //which box of the map we're in
    let mapX = Math.round(posX);
    let mapY = Math.round(posY);

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
    const lineHeight = Math.round(height / perpWallDist);

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
    let texX = Math.round(wallX * TEXTURE_WIDTH);
    if (side == 0 && rayDirX > 0) texX = TEXTURE_WIDTH - texX - 1;
    if (side == 1 && rayDirY < 0) texX = TEXTURE_WIDTH - texX - 1;

    // How much to increase the texture coordinate per screen pixel
    const step = 1.0 * TEXTURE_HEIGHT / lineHeight;
    // Starting texture coordinate
    let texPos = (drawStart - height / 2 + lineHeight / 2) * step;
    for (let y = Math.round(drawStart); y < Math.round(drawEnd); y++)
    {
      // Cast the texture coordinate to integer, and mask with (texHeight - 1) in case of overflow
      const texY = Math.round(texPos) & (TEXTURE_HEIGHT - 1);
      texPos += step;
      let color = textureProvider.getColor(texNum, texX, texY);
      //make color darker for y-sides: R, G and B byte each divided through two with a "shift" and an "and"
      if (side == 1) color = (color >> 1) & 0x7F7F7F;

      setImageDataPixel(imageData, x, y, color);
    }
  }

  ctx.putImageData(imageData, 0, 0);
}
