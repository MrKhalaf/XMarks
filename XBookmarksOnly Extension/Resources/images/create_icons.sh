#!/bin/bash
# Create simple placeholder icons using sips (built into macOS)
# You can replace these with custom icons later

# Create a simple colored square as base
for size in 48 96 128; do
  # Create a simple PNG using Python (available on macOS)
  python3 << PYEOF
from PIL import Image
img = Image.new('RGB', ($size, $size), color='#1DA1F2')
img.save('icon-$size.png')
PYEOF
done
