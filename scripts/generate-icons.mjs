import sharp from 'sharp';
import { mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const iconsDir = join(rootDir, 'public', 'icons');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const appleIconSize = 180;

const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#1a1a2e"/>
  <g fill="#d4940c">
    <!-- Shield outline -->
    <path d="M256 64 L128 128 L128 288 L256 448 L384 288 L384 128 Z" fill="none" stroke="#d4940c" stroke-width="24"/>
    <!-- Crossed swords -->
    <rect x="180" y="200" width="152" height="16" transform="rotate(45 256 256)"/>
    <rect x="180" y="200" width="152" height="16" transform="rotate(-45 256 256)"/>
    <!-- Sword handles -->
    <rect x="140" y="248" width="32" height="16" transform="rotate(45 156 256)"/>
    <rect x="340" y="248" width="32" height="16" transform="rotate(-45 356 256)"/>
  </g>
  <!-- G letter -->
  <text x="256" y="320" font-family="monospace" font-size="120" font-weight="bold" fill="#f5cc47" text-anchor="middle">G</text>
</svg>`;

async function generateIcons() {
    console.log('Generating PWA icons...');

    // Ensure icons directory exists
    await mkdir(iconsDir, { recursive: true });

    const svgBuffer = Buffer.from(svgContent);

    // Generate standard icons
    for (const size of sizes) {
        const outputPath = join(iconsDir, `icon-${size}.png`);
        await sharp(svgBuffer)
            .resize(size, size)
            .png()
            .toFile(outputPath);
        console.log(`Created: icon-${size}.png`);
    }

    // Generate Apple touch icon (180x180)
    const appleIconPath = join(iconsDir, 'apple-touch-icon.png');
    await sharp(svgBuffer)
        .resize(appleIconSize, appleIconSize)
        .png()
        .toFile(appleIconPath);
    console.log('Created: apple-touch-icon.png');

    console.log('All icons generated successfully!');
}

generateIcons().catch(console.error);
