import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

async function generate() {
  const svgPath = path.resolve('public/icon.svg');
  const svgBuffer = fs.readFileSync(svgPath);

  const targets = [
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'apple-touch-icon-precomposed.png', size: 180 },
    { name: 'icon-192.png', size: 192 },
    { name: 'icon-512.png', size: 512 },
    { name: 'icon-maskable-512.png', size: 512 },
    { name: 'favicon-32x32.png', size: 32 },
    { name: 'favicon.png', size: 64 }
  ];

  for (const t of targets) {
    const dest = path.resolve('public', t.name);
    await sharp(svgBuffer)
      .resize(t.size, t.size)
      .png()
      .toFile(dest);
    console.log(`Generated: ${t.name} (${t.size}x${t.size})`);
  }
}

generate().catch(console.error);
