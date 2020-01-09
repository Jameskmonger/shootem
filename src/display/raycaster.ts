import { Color } from "./color";
import { map } from "../world/map";
import { PositionInfo } from "../world/positionInfo";
import { WallType } from "../world/wallType";

(window as any).dirX = -1;
(window as any).dirY = 0;
(window as any).planeX = 0;
(window as any).planeY = 0.66;

const COLOR_WALL_BLUE = new Color(0x00, 0x00, 0xFF)
const COLOR_WALL_RED = new Color(0xFF, 0x00, 0x00)

export const draw = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, position: PositionInfo) => {
  const { width, height } = ctx.canvas;

  const { posX, posY, dirX, dirY, planeX, planeY } = position;

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

    let color: Color | null = null;
    switch (map[mapX][mapY]) {
      case WallType.BLUE:
        color = COLOR_WALL_BLUE;
        break;
      case WallType.RED:
        color = COLOR_WALL_RED;
        break;
    }

    if (color) {
      if (side == 1) {
        color = color.darken(2);
      }

      ctx.strokeStyle = color.toStrokeString();
      ctx.save();

      ctx.beginPath();
      ctx.moveTo(x, drawStart);
      ctx.lineTo(x, drawEnd);
      ctx.stroke();
    }
  }
};
