const fs = require('fs');
const path = require('path');

// Simple SVG to PNG conversion using sharp
// Run this script to generate the OG image

async function convertSvgToPng() {
  try {
    // Check if sharp is available
    const sharp = require('sharp');
    
    const svgPath = path.join(__dirname, '../public/og-image.svg');
    const pngPath = path.join(__dirname, '../public/og-image.png');
    
    const svgBuffer = fs.readFileSync(svgPath);
    
    await sharp(svgBuffer)
      .resize(1200, 630)
      .png()
      .toFile(pngPath);
    
    console.log('✅ OG image converted successfully:', pngPath);
  } catch (error) {
    console.error('❌ Error converting OG image:', error.message);
    console.log('Note: You may need to manually convert the SVG to PNG using an online tool or design software.');
  }
}

convertSvgToPng();
