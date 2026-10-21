import { CELL_SIZE } from './config.js';

export function makeRipple(color, col, row, canvas, rippleLayer) {
  const bounds = canvas.getBoundingClientRect();
  const x = (col + 0.5) * CELL_SIZE;
  const y = (row + 0.5) * CELL_SIZE;
  const centerX = bounds.left + (x / canvas.width) * bounds.width;
  const centerY = bounds.top + (y / canvas.height) * bounds.height;

  const ripple = document.createElement('div');
  ripple.className = 'ripple';
  ripple.style.left = `${centerX}px`;
  ripple.style.top = `${centerY}px`;
  ripple.style.setProperty('--ripple', color);
  rippleLayer.appendChild(ripple);
  ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
}

export function createParticles(enemy) {
  const x = (enemy.col + 0.5) * CELL_SIZE;
  const y = (enemy.row + 0.5) * CELL_SIZE;
  return Array.from({ length: 10 }, (_, i) => {
    const angle = (i * Math.PI * 2) / 10;
    return { x, y, vx: Math.cos(angle) * 100, vy: Math.sin(angle) * 100, life: 0.32, color: enemy.color };
  });
}
