#!/bin/bash
# Build Debian package for Blackjack Pro

set -e

echo "Building Debian package for Blackjack Pro..."

# Check if required tools are installed
if ! command -v dpkg-buildpackage &> /dev/null; then
    echo "Error: dpkg-buildpackage not found. Install with:"
    echo "  sudo apt-get install dpkg-dev debhelper dh-python"
    exit 1
fi

# Clean previous builds
echo "Cleaning previous builds..."
rm -rf debian/blackjack-pro
rm -f ../blackjack-pro_*.deb ../blackjack-pro_*.build* ../blackjack-pro_*.changes ../blackjack-pro_*.dsc

# Build the package
echo "Building package..."
dpkg-buildpackage -us -uc -b

echo ""
echo "Build complete! Package created:"
ls -lh ../blackjack-pro_*.deb

echo ""
echo "To install the package, run:"
echo "  sudo dpkg -i ../blackjack-pro_*.deb"
echo "  sudo apt-get install -f  # Fix any missing dependencies"
