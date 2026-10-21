import { COLS } from './config.js';

export class Ship {
  constructor(col, row, color, isPlayer = false) {
    this.col = col;
    this.row = row;
    this.color = color;
    this.isPlayer = isPlayer;
    this.alive = true;
  }

  move(dc, dr = 0) {
    this.col = Math.max(0, Math.min(COLS - 1, this.col + dc));
    this.row += dr;
  }

  destroy() {
    this.alive = false;
  }
}
