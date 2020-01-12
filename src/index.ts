import { draw as drawRaycaster } from "./display/raycaster";
import { PositionInfo } from "./world/positionInfo";
import { TextureProvider } from "./display/textureProvider";

let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D;

let positionInfo: PositionInfo = {
  posX: 4,
  posY: 4,
  dirX: -1,
  dirY: 0,
  planeX: 0,
  planeY: 0.66
}

const setup = () => {
  canvas = document.getElementById("canvas") as HTMLCanvasElement;

  canvas.width = 640;
  canvas.height = 480;

  ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

  setInterval(() => {
    const rotSpeed = 0.01
    const oldDirX = positionInfo.dirX;
    positionInfo.dirX = positionInfo.dirX * Math.cos(rotSpeed) - positionInfo.dirY * Math.sin(rotSpeed);
    positionInfo.dirY = oldDirX * Math.sin(rotSpeed) + positionInfo.dirY * Math.cos(rotSpeed);
    const oldPlaneX = positionInfo.planeX;
    positionInfo.planeX = positionInfo.planeX * Math.cos(rotSpeed) - positionInfo.planeY * Math.sin(rotSpeed);
    positionInfo.planeY = oldPlaneX * Math.sin(rotSpeed) + positionInfo.planeY * Math.cos(rotSpeed);
  }, 50)

  requestAnimationFrame(draw);
};

const textureProvider = new TextureProvider();

const draw = (now: number) => {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  drawRaycaster(textureProvider, canvas, ctx, positionInfo);

  requestAnimationFrame(draw);
};

document.addEventListener('DOMContentLoaded', function () {
  setup();
}, false);
