import { COLS, ROWS, CELL_SIZE, POINTS_PER_ENEMY, SPEEDUP_EVERY, MOVE_INTERVAL_MS, BULLET_SPEED, COLORS } from './config.js';
import { Ship } from './Ship.js';
import { Renderer } from './renderer.js';
import { makeRipple, createParticles } from './effects.js';

// Ігрові правила, рахунок, зіткнення та анімаційний цикл.
export class Game {
  constructor(elements) {
    this.el = elements;
    this.renderer = new Renderer(elements.canvas);
    this.pressed = new Set();
    this.running = false;
    this.animationId = 0;
    this.reset(false);
  }

  reset(isStarting) {
    cancelAnimationFrame(this.animationId);
    this.player = new Ship(3, ROWS - 1, '#bbc8f8', true);
    this.enemies = [];
    this.bullets = [];
    this.particles = [];
    this.score = 0;
    this.speed = Number(this.el.speedSelect.value);
    this.descentElapsed = 0;
    this.shotCooldown = 0;
    this.running = isStarting;
    this.pressed.clear();
    this.makeWave();
    this.updateUI();
    this.render();
  }

  makeWave() {
    const widths = [8, 8, 6, 4, 2];
    this.enemies = [];
    widths.forEach((width, row) => {
      const start = (COLS - width) / 2;
      for (let i = 0; i < width; i++) {
        this.enemies.push(new Ship(start + i, row, COLORS[(i + row * 2) % COLORS.length]));
      }
    });
  }

  updateUI() {
    this.el.score.textContent = this.score.toLocaleString('en-US');
    this.el.speedLabel.textContent = `${this.speed}×`;
  }

  render() {
    this.renderer.draw(this.player, this.enemies, this.bullets, this.particles);
  }

  hit(enemy) {
    enemy.destroy();
    this.score += POINTS_PER_ENEMY;
    this.speed = Math.min(10, Number(this.el.speedSelect.value) + Math.floor(this.score / SPEEDUP_EVERY));
    this.updateUI();
    makeRipple(enemy.color, enemy.col, enemy.row, this.el.canvas, this.el.rippleLayer);
    this.particles.push(...createParticles(enemy));
    if (this.enemies.every(e => !e.alive)) {
      this.makeWave();
      this.el.status.textContent = 'Нова хвиля!';
    }
  }

  shoot() {
    if (!this.running || this.shotCooldown > 0) return;
    this.bullets.push({ x: (this.player.col + 0.5) * CELL_SIZE, y: this.player.row * CELL_SIZE + 4 });
    this.shotCooldown = 0.21;
  }

  endGame() {
    this.running = false;
    this.pressed.clear();
    this.el.overlayText.textContent = `GAME OVER — ${this.score} очок`;
    this.el.overlay.classList.remove('hidden');
    this.el.startBtn.textContent = '↻ RESTART';
    this.el.status.textContent = 'Кубики дійшли донизу.';
  }

  step(dt) {
    this.shotCooldown = Math.max(0, this.shotCooldown - dt);
    if (this.pressed.has('ArrowLeft') || this.pressed.has('a')) {
      this.player.move(-1);
      this.pressed.delete('ArrowLeft'); this.pressed.delete('a');
    }
    if (this.pressed.has('ArrowRight') || this.pressed.has('d')) {
      this.player.move(1);
      this.pressed.delete('ArrowRight'); this.pressed.delete('d');
    }
    if (this.pressed.has(' ')) this.shoot();

    this.descentElapsed += dt * 1000;
    if (this.descentElapsed >= MOVE_INTERVAL_MS / this.speed) {
      this.descentElapsed = 0;
      this.enemies.filter(e => e.alive).forEach(e => e.move(0, 1));
      if (this.enemies.some(e => e.alive && e.row >= ROWS - 1)) this.endGame();
    }
    for (const bullet of this.bullets) {
      bullet.y -= BULLET_SPEED * dt;
      const target = this.enemies.find(e => e.alive && bullet.x > e.col * CELL_SIZE && bullet.x < (e.col + 1) * CELL_SIZE && bullet.y < (e.row + 1) * CELL_SIZE && bullet.y > e.row * CELL_SIZE);
      if (target) { bullet.used = true; this.hit(target); }
      if (bullet.y < 0) bullet.used = true;
    }
    this.bullets = this.bullets.filter(b => !b.used);
    this.particles.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; });
    this.particles = this.particles.filter(p => p.life > 0);
  }

  loop(now) {
    const dt = Math.min((now - this.lastTime) / 1000, 0.05);
    this.lastTime = now;
    if (this.running) this.step(dt);
    this.render();
    if (this.running) this.animationId = requestAnimationFrame(time => this.loop(time));
  }

  start() {
    try {
      const speed = Number(this.el.speedSelect.value);
      if (!Number.isFinite(speed) || speed < 1 || speed > 5) throw new Error('Некоректна швидкість гри');
      this.reset(true);
      this.el.overlay.classList.add('hidden');
      this.el.startBtn.textContent = '↻ RESTART';
      this.el.status.textContent = '← → або A/D — рух · Space — постріл';
      this.lastTime = performance.now();
      this.animationId = requestAnimationFrame(time => this.loop(time));
    } catch (error) {
      this.running = false;
      this.el.status.textContent = `Помилка: ${error.message}`;
      console.error(error);
    }
  }
}
