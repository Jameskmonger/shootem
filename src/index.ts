import { WorldRenderer } from "./display/worldRenderer/worldRenderer";
import { GameState } from "./gameState";
import { TextureProvider } from "./display/worldRenderer/textureProvider";

let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D;

const gameState: GameState = {
  position: {
    posX: 4,
    posY: 4,
    dirX: -1,
    dirY: 0,
    planeX: 0,
    planeY: 0.66
  }
}

let worldRenderer: WorldRenderer

const setup = () => {
  canvas = document.getElementById("canvas") as HTMLCanvasElement;

  canvas.width = 640;
  canvas.height = 480;

  ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

  const textureProvider = new TextureProvider();
  worldRenderer = new WorldRenderer(textureProvider, canvas, ctx);

  setInterval(() => {
    const positionInfo = gameState.position
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

const draw = () => {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  worldRenderer.render(gameState);

  requestAnimationFrame(draw);
};

document.addEventListener('DOMContentLoaded', function () {
  setup();
}, false);
