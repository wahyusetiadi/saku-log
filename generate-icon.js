// Script untuk generate icon PWA sederhana
// Jalankan: node generate-icons.js
const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

function generateIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background hijau
  ctx.fillStyle = '#16a34a';
  ctx.beginPath();
  ctx.roundRect(0, 0, size, size, size * 0.22);
  ctx.fill();

  // Wallet icon (simplified)
  const padding = size * 0.2;
  const w = size - padding * 2;
  const h = size - padding * 2;

  ctx.fillStyle = 'white';
  ctx.strokeStyle = 'white';
  ctx.lineWidth = size * 0.06;
  ctx.lineCap = 'round';

  // Draw wallet shape
  ctx.beginPath();
  ctx.roundRect(padding, padding + h * 0.15, w, h * 0.7, size * 0.06);
  ctx.stroke();

  // Wallet flap
  ctx.beginPath();
  ctx.moveTo(padding, padding + h * 0.35);
  ctx.lineTo(padding + w, padding + h * 0.35);
  ctx.stroke();

  // Coin circle
  ctx.beginPath();
  ctx.arc(padding + w * 0.78, padding + h * 0.62, size * 0.09, 0, Math.PI * 2);
  ctx.fill();

  return canvas.toBuffer('image/png');
}

const dir = path.join(__dirname, 'public', 'icons');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

try {
  fs.writeFileSync(path.join(dir, 'icon-192.png'), generateIcon(192));
  fs.writeFileSync(path.join(dir, 'icon-512.png'), generateIcon(512));
  console.log('Icons generated successfully!');
} catch (e) {
  console.log('canvas not installed, using placeholder icons');
}