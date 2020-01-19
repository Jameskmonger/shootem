import { KeyListener } from "../keyListener";
import { PositionInfo } from "./positionInfo";
import { map } from "./map";
import { numberToInteger } from '../numberToInteger'

const KEY_CODES = {
  UP: 38,
  DOWN: 40,
  LEFT: 37,
  RIGHT: 39
}

export class MovementHandler {
  constructor(private keyListener: KeyListener, private positionInfo: PositionInfo) {

  }

  public adjustMovement(delta: number) {
    if (delta < 0) {
      return;
    }

    //speed modifiers
    const moveSpeed = delta * 5.0; //the constant value is in squares/second
    const rotSpeed = delta * 3.0; //the constant value is in radians/second

    //move forward if no wall in front of you
    if(this.keyListener.isPressed(KEY_CODES.UP))
    {
      if(map[numberToInteger(this.positionInfo.posX + this.positionInfo.dirX * moveSpeed)][numberToInteger(this.positionInfo.posY)] === 0) {
        this.positionInfo.posX += this.positionInfo.dirX * moveSpeed;
      }

      if(map[numberToInteger(this.positionInfo.posX)][numberToInteger(this.positionInfo.posY + this.positionInfo.dirY * moveSpeed)] === 0) {
        this.positionInfo.posY += this.positionInfo.dirY * moveSpeed;
      }
    }
    
    //move backwards if no wall behind you
    if(this.keyListener.isPressed(KEY_CODES.DOWN))
    {
      if(map[numberToInteger(this.positionInfo.posX - this.positionInfo.dirX * moveSpeed)][numberToInteger(this.positionInfo.posY)] === 0) {
        this.positionInfo.posX -= this.positionInfo.dirX * moveSpeed;
      }

      if(map[numberToInteger(this.positionInfo.posX)][numberToInteger(this.positionInfo.posY - this.positionInfo.dirY * moveSpeed)] === 0) {
        this.positionInfo.posY -= this.positionInfo.dirY * moveSpeed;
      }
    }

    //rotate to the right
    if(this.keyListener.isPressed(KEY_CODES.RIGHT))
    {
      //both camera direction and camera plane must be rotated
      const oldDirX = this.positionInfo.dirX;
      this.positionInfo.dirX = this.positionInfo.dirX * Math.cos(-rotSpeed) - this.positionInfo.dirY * Math.sin(-rotSpeed);
      this.positionInfo.dirY = oldDirX * Math.sin(-rotSpeed) + this.positionInfo.dirY * Math.cos(-rotSpeed);
      const oldPlaneX = this.positionInfo.planeX;
      this.positionInfo.planeX = this.positionInfo.planeX * Math.cos(-rotSpeed) - this.positionInfo.planeY * Math.sin(-rotSpeed);
      this.positionInfo.planeY = oldPlaneX * Math.sin(-rotSpeed) + this.positionInfo.planeY * Math.cos(-rotSpeed);
    }

    //rotate to the left
    if(this.keyListener.isPressed(KEY_CODES.LEFT))
    {
      //both camera direction and camera plane must be rotated
      const oldDirX = this.positionInfo.dirX;
      this.positionInfo.dirX = this.positionInfo.dirX * Math.cos(rotSpeed) - this.positionInfo.dirY * Math.sin(rotSpeed);
      this.positionInfo.dirY = oldDirX * Math.sin(rotSpeed) + this.positionInfo.dirY * Math.cos(rotSpeed);
      const oldPlaneX = this.positionInfo.planeX;
      this.positionInfo.planeX = this.positionInfo.planeX * Math.cos(rotSpeed) - this.positionInfo.planeY * Math.sin(rotSpeed);
      this.positionInfo.planeY = oldPlaneX * Math.sin(rotSpeed) + this.positionInfo.planeY * Math.cos(rotSpeed);
    }
  }
}
