import { Game } from './game.js';

// Точка входу: знаходимо HTML-елементи та підключаємо події.
const elements = {
  canvas: document.getElementById('game'),
  score: document.getElementById('score'),
  speedLabel: document.getElementById('speedLabel'),
  status: document.getElementById('status'),
  overlay: document.getElementById('overlay'),
  overlayText: document.getElementById('overlayText'),
  startBtn: document.getElementById('startBtn'),
  speedSelect: document.getElementById('speed'),
  rippleLayer: document.getElementById('ripples'),
};

const game = new Game(elements);
elements.startBtn.addEventListener('click', () => game.start());
elements.speedSelect.addEventListener('change', () => {
  if (!game.running) { game.speed = Number(elements.speedSelect.value); game.updateUI(); }
});

function normalizeKey(key) {
  return key.length === 1 ? key.toLowerCase() : key;
}
const controls = new Set(['ArrowLeft', 'ArrowRight', 'a', 'd', ' ']);
window.addEventListener('keydown', event => {
  const key = normalizeKey(event.key);
  if (!controls.has(key)) return;
  if (event.target === document.body || event.target === elements.canvas) event.preventDefault();
  game.pressed.add(key);
});
window.addEventListener('keyup', event => game.pressed.delete(normalizeKey(event.key)));
window.addEventListener('blur', () => game.pressed.clear());
