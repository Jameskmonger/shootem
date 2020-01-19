import { WorldRenderer } from "./display/worldRenderer/worldRenderer";
import { GameState } from "./gameState";
import { TextureProvider } from "./display/worldRenderer/textureProvider";
import { KeyListener } from "./keyListener";
import { MovementHandler } from "./world/movementHandler";

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
};

let worldRenderer: WorldRenderer;
let movementHandler: MovementHandler;

const setup = () => {
  canvas = document.getElementById("canvas") as HTMLCanvasElement;

  canvas.width = 640;
  canvas.height = 480;

  ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

  const textureProvider = new TextureProvider();
  worldRenderer = new WorldRenderer(textureProvider, canvas, ctx);

  const keyListener = new KeyListener();
  movementHandler = new MovementHandler(keyListener, gameState.position);

  requestAnimationFrame(gameLoop);
};

const draw = () => {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  worldRenderer.render(gameState);
};

let lastGameLoopTime: number = Number.POSITIVE_INFINITY;
const gameLoop = (now: number) => {
  const delta = (now - lastGameLoopTime) / 1000;
  lastGameLoopTime = now;
  movementHandler.adjustMovement(delta);

  draw();

  requestAnimationFrame(gameLoop);
};

document.addEventListener('DOMContentLoaded', function () {
  setup();
}, false);
