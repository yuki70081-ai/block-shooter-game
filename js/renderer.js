import { COLS, ROWS, CELL_SIZE } from './config.js';

// Усі операції малювання на canvas.
export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    if (!this.ctx) throw new Error('Canvas не підтримується браузером');
    canvas.width = COLS * CELL_SIZE;
    canvas.height = ROWS * CELL_SIZE;
  }

  roundedRect(x, y, width, height, radius) {
    this.ctx.beginPath();
    this.ctx.roundRect(x, y, width, height, radius);
  }

  drawShip(ship) {
    if (!ship.alive) return;
    const ctx = this.ctx;
    const x = ship.col * CELL_SIZE + 5;
    const y = ship.row * CELL_SIZE + 5;
    const size = CELL_SIZE - 10;
    ctx.save();
    ctx.shadowBlur = ship.isPlayer ? 17 : 6;
    ctx.shadowColor = ship.color;
    ctx.fillStyle = ship.color;
    this.roundedRect(x, y, size, size, 6);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffffff28';
    this.roundedRect(x + 4, y + 3, size - 8, 6, 3);
    ctx.fill();
    ctx.restore();
  }

  draw(player, enemies, bullets, particles) {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.fillStyle = '#12192c';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#35405b99';
    for (let i = 0; i <= COLS; i++) {
      ctx.beginPath(); ctx.moveTo(i * CELL_SIZE + 0.5, 0);
      ctx.lineTo(i * CELL_SIZE + 0.5, this.canvas.height); ctx.stroke();
    }
    for (let j = 0; j <= ROWS; j++) {
      ctx.beginPath(); ctx.moveTo(0, j * CELL_SIZE + 0.5);
      ctx.lineTo(this.canvas.width, j * CELL_SIZE + 0.5); ctx.stroke();
    }
    enemies.forEach(enemy => this.drawShip(enemy));
    this.drawShip(player);
    bullets.forEach(bullet => {
      ctx.save();
      ctx.shadowBlur = 6;
      ctx.shadowColor = '#c9cbd0';
      ctx.fillStyle = '#c9cbd0';
      this.roundedRect(bullet.x - 3, bullet.y - 10, 6, 14, 3);
      ctx.fill(); ctx.restore();
    });
    particles.forEach(particle => {
      ctx.globalAlpha = Math.max(0, particle.life / 0.32);
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, Math.max(0.3, particle.life * 8), 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  }
}
