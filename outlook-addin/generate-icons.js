/**
 * Script to generate Task Manager add-in icons
 *
 * This script creates SVG icons that need to be converted to PNG.
 *
 * Usage:
 * node generate-icons.js
 *
 * Then convert SVG to PNG using:
 * - Online: https://cloudconvert.com/svg-to-png
 * - CLI: npm install -g svgexport && svgexport icon.svg icon-16.png 16:16
 */

const fs = require('fs');
const path = require('path');

// Icon sizes required by Microsoft
const sizes = [16, 32, 64, 128];

// SVG template with task/checklist icon
const generateSVG = (size) => `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="${size}" height="${size}" fill="#0f172a" rx="${size * 0.15}"/>

  <!-- Checklist icon -->
  <g transform="translate(${size * 0.2}, ${size * 0.2})">
    <!-- Paper/Document -->
    <rect x="0" y="0" width="${size * 0.6}" height="${size * 0.65}" fill="white" rx="${size * 0.05}"/>

    <!-- Check marks -->
    <g stroke="#10b981" stroke-width="${size * 0.08}" stroke-linecap="round" fill="none">
      <!-- First check -->
      <polyline points="${size * 0.1},${size * 0.15} ${size * 0.15},${size * 0.2} ${size * 0.25},${size * 0.08}" />
      <!-- Second check -->
      <polyline points="${size * 0.1},${size * 0.3} ${size * 0.15},${size * 0.35} ${size * 0.25},${size * 0.23}" />
      <!-- Third check (partial) -->
      <line x1="${size * 0.1}" y1="${size * 0.45}" x2="${size * 0.2}" y2="${size * 0.45}" stroke="#94a3b8" />
    </g>

    <!-- Lines for tasks -->
    <g stroke="#cbd5e1" stroke-width="${size * 0.02}">
      <line x1="${size * 0.3}" y1="${size * 0.15}" x2="${size * 0.55}" y2="${size * 0.15}" />
      <line x1="${size * 0.3}" y1="${size * 0.3}" x2="${size * 0.55}" y2="${size * 0.3}" />
      <line x1="${size * 0.3}" y1="${size * 0.45}" x2="${size * 0.55}" y2="${size * 0.45}" />
    </g>
  </g>

  <!-- Small envelope indicator (bottom right) -->
  <g transform="translate(${size * 0.55}, ${size * 0.6})">
    <rect x="0" y="0" width="${size * 0.35}" height="${size * 0.25}" fill="#3b82f6" rx="${size * 0.03}"/>
    <polyline points="0,0 ${size * 0.175},${size * 0.12} ${size * 0.35},0"
              fill="none" stroke="white" stroke-width="${size * 0.03}" stroke-linecap="round"/>
  </g>
</svg>`;

// Alternative simple "T" icon
const generateSimpleSVG = (size) => `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <!-- Gradient background -->
  <defs>
    <linearGradient id="grad${size}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1e40af;stop-opacity:1" />
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="${size}" height="${size}" fill="url(#grad${size})" rx="${size * 0.15}"/>

  <!-- Letter "T" for Tasks -->
  <text x="50%" y="50%"
        font-family="Arial, sans-serif"
        font-size="${size * 0.7}"
        font-weight="bold"
        fill="white"
        text-anchor="middle"
        dominant-baseline="central">T</text>
</svg>`;

// Generate icons
console.log('🎨 Generating Task Manager icons...\n');

sizes.forEach(size => {
  const filename = `icon-${size}.svg`;
  const filepath = path.join(__dirname, filename);

  // Use the checklist design
  const svgContent = generateSVG(size);

  fs.writeFileSync(filepath, svgContent);
  console.log(`✅ Created ${filename}`);
});

console.log('\n📋 SVG icons created successfully!');
console.log('\n🔄 Next steps:');
console.log('1. Convert SVG to PNG using one of these methods:');
console.log('   • Online: https://cloudconvert.com/svg-to-png');
console.log('   • CLI: npm install -g svgexport');
console.log('   • Then run: npm run convert-icons (if you install svgexport)');
console.log('\n2. Or use this online tool: https://www.aconvert.com/image/svg-to-png/');
console.log('\n3. Make sure PNG files are saved as:');
sizes.forEach(size => {
  console.log(`   • icon-${size}.png (${size}x${size}px)`);
});

// Create conversion script for svgexport
const conversionScript = `#!/bin/bash
# Convert SVG icons to PNG
# Requires: npm install -g svgexport

echo "Converting SVG icons to PNG..."

${sizes.map(size =>
  `svgexport icon-${size}.svg icon-${size}.png ${size}:${size}`
).join('\n')}

echo "✅ All icons converted successfully!"
echo "🗑️  You can now delete the .svg files if you want"
`;

fs.writeFileSync(path.join(__dirname, 'convert-icons.sh'), conversionScript);
fs.chmodSync(path.join(__dirname, 'convert-icons.sh'), '755');

console.log('\n💡 Conversion script created: convert-icons.sh');
console.log('   Run: cd outlook-addin && ./convert-icons.sh');
