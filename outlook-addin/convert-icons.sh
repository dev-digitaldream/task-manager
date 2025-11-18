#!/bin/bash
# Convert SVG icons to PNG
# Requires: npm install -g svgexport

echo "Converting SVG icons to PNG..."

svgexport icon-16.svg icon-16.png 16:16
svgexport icon-32.svg icon-32.png 32:32
svgexport icon-64.svg icon-64.png 64:64
svgexport icon-128.svg icon-128.png 128:128

echo "✅ All icons converted successfully!"
echo "🗑️  You can now delete the .svg files if you want"
