const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

// Ensure the public/games directory exists
const gamesDir = path.join(__dirname, '../public/games');
if (!fs.existsSync(gamesDir)) {
  fs.mkdirSync(gamesDir, { recursive: true });
}

// Game data
const games = [
  { name: 'card-clash', title: 'SIGN CARD CLASH' },
  { name: 'orange-game', title: 'SIGN ORANGE GAME' },
  { name: '2048', title: '2048 ON SIGN' },
  { name: 'sign-it', title: 'SIGN IT' }
];

// Colors for the placeholders
const bgColors = ['#1a1a1a', '#0f172a', '#1e1b4b', '#1e3a8a'];
const textColor = '#f97316';

// Generate an image for each game
games.forEach((game, index) => {
  const width = 600;
  const height = 400;
  const canvas = createCanvas(width, height);
  const context = canvas.getContext('2d');
  
  // Background
  context.fillStyle = bgColors[index % bgColors.length];
  context.fillRect(0, 0, width, height);
  
  // Add some decoration
  context.strokeStyle = `${textColor}33`;
  context.lineWidth = 2;
  context.strokeRect(20, 20, width - 40, height - 40);
  
  // Add game title
  context.fillStyle = textColor;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  
  // Split title into words and wrap text
  const words = game.title.split(' ');
  const lineHeight = 40;
  let y = height / 2 - ((words.length - 1) * lineHeight) / 2;
  
  context.font = 'bold 32px Arial';
  words.forEach(word => {
    context.fillText(word, width / 2, y);
    y += lineHeight;
  });
  
  // Add creator credit
  context.font = '16px Arial';
  context.fillText('by @muzecaka', width / 2, height - 50);
  
  // Save the image
  const buffer = canvas.toBuffer('image/jpeg');
  fs.writeFileSync(path.join(gamesDir, `${game.name}.jpg`), buffer);
});

console.log('Generated placeholder images for games');
