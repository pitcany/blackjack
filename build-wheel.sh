#!/bin/bash
# Build Python wheel package for Blackjack Pro

set -e

echo "Building Python wheel package for Blackjack Pro..."

# Check if build tools are installed
if ! python3 -c "import build" 2>/dev/null; then
    echo "Installing build tools..."
    pip install --upgrade pip build
fi

# Clean previous builds
echo "Cleaning previous builds..."
rm -rf build/ dist/ *.egg-info

# Build the package
echo "Building wheel..."
python3 -m build

echo ""
echo "Build complete! Packages created:"
ls -lh dist/

echo ""
echo "To install the package, run:"
echo "  pip install dist/blackjack_pro-*.whl"
echo ""
echo "Or to install in development mode:"
echo "  pip install -e ."
