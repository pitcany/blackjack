# Installation Guide - Blackjack Pro

Multiple installation methods are available depending on your preference and system.

## Table of Contents
- [Quick Start (Run Without Installing)](#quick-start-run-without-installing)
- [Python Package Installation (pip)](#python-package-installation-pip)
- [Debian Package Installation (.deb)](#debian-package-installation-deb)
- [Development Installation](#development-installation)
- [Uninstallation](#uninstallation)

---

## Quick Start (Run Without Installing)

**No installation required - just run directly:**

```bash
# Clone the repository
git clone https://github.com/pitcany/blackjack.git
cd blackjack

# Run standard version
python3 main.py

# Run pro version
python3 main_pro.py
```

**Requirements:**
- Python 3.7+
- Tkinter (usually pre-installed)

---

## Python Package Installation (pip)

### Install from Source

```bash
# Clone the repository
git clone https://github.com/pitcany/blackjack.git
cd blackjack

# Install the package
pip install .

# Or install in editable mode for development
pip install -e .
```

### Build and Install Wheel

```bash
# Build the wheel package
./build-wheel.sh

# Install the wheel
pip install dist/blackjack_pro-*.whl
```

### After Installation

Once installed via pip, you can run from anywhere:

```bash
# Standard version
blackjack

# Pro version (recommended)
blackjack-pro

# Or explicitly
blackjack-standard
```

### Installing for All Users

```bash
# Install system-wide (requires sudo)
sudo pip install .

# Or using pipx (recommended for command-line tools)
pipx install .
```

---

## Debian Package Installation (.deb)

Perfect for Debian, Ubuntu, Linux Mint, and derivatives.

### Build the .deb Package

```bash
# Install build dependencies
sudo apt-get install dpkg-dev debhelper dh-python python3-all python3-tk

# Build the package
./build-deb.sh
```

### Install the Package

```bash
# Install the .deb package
sudo dpkg -i ../blackjack-pro_*.deb

# Fix any missing dependencies
sudo apt-get install -f
```

### After Installation

The package installs:
- **Command-line tools:** `blackjack` and `blackjack-pro`
- **Desktop entries:** Available in your applications menu
- **Documentation:** `/usr/share/doc/blackjack-pro/`

Launch from:
- Terminal: `blackjack-pro`
- Applications menu: "Blackjack Pro" or "Blackjack Card Counter"

---

## Development Installation

For contributors and developers:

```bash
# Clone the repository
git clone https://github.com/pitcany/blackjack.git
cd blackjack

# Install in editable mode with dev dependencies
pip install -e ".[dev]"

# Run tests
python -m pytest tests/

# Run the game
blackjack-pro
```

### Development Dependencies

Optional tools for development:
```bash
pip install pytest      # Testing framework
pip install black       # Code formatting
pip install mypy        # Type checking
```

---

## System Requirements

### Minimum Requirements
- **OS:** Linux, macOS, or Windows
- **Python:** 3.7 or higher
- **GUI:** Tkinter (python3-tk on Linux)
- **RAM:** 100 MB
- **Disk:** 10 MB

### Installing Python and Tkinter

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install python3 python3-tk python3-pip
```

**Fedora:**
```bash
sudo dnf install python3 python3-tkinter
```

**Arch Linux:**
```bash
sudo pacman -S python tk
```

**macOS:**
```bash
brew install python-tk
```

**Windows:**
- Download Python from [python.org](https://www.python.org/downloads/)
- Tkinter is included by default

---

## Verifying Installation

After installation, verify it works:

```bash
# Check version
blackjack-pro --version  # (if implemented)

# Or just run it
blackjack-pro
```

You should see the Blackjack Pro GUI window open.

---

## Uninstallation

### Uninstall pip Package

```bash
pip uninstall blackjack-pro
```

### Uninstall Debian Package

```bash
sudo apt-get remove blackjack-pro

# Or completely remove including config
sudo apt-get purge blackjack-pro
```

---

## Troubleshooting

### "tkinter module not found"

**Linux:**
```bash
sudo apt-get install python3-tk
```

**macOS:**
```bash
brew install python-tk
```

### "Permission denied" when building

Make build scripts executable:
```bash
chmod +x build-deb.sh build-wheel.sh
```

### "Command not found" after pip install

Add pip's bin directory to PATH:
```bash
# Add to ~/.bashrc or ~/.zshrc
export PATH="$HOME/.local/bin:$PATH"
```

### Desktop entry not showing

Update desktop database:
```bash
sudo update-desktop-database
```

---

## Building from Source

### Python Wheel

```bash
# Install build tools
pip install build

# Build
python3 -m build

# Output: dist/blackjack_pro-*.whl
```

### Debian Package

```bash
# Install dependencies
sudo apt-get install dpkg-dev debhelper dh-python

# Build
dpkg-buildpackage -us -uc -b

# Output: ../blackjack-pro_*.deb
```

---

## Installation Comparison

| Method | Pros | Cons | Best For |
|--------|------|------|----------|
| **Direct Run** | No installation needed | Must be in project directory | Quick testing |
| **pip install** | Easy, cross-platform | Requires Python/pip | Most users |
| **pip install -e** | Live code updates | Requires source | Developers |
| **.deb package** | System integration, desktop entries | Debian/Ubuntu only | Linux desktop users |
| **pipx** | Isolated environment | Extra tool needed | CLI tool users |

---

## Recommended Installation

**For casual users:**
```bash
pip install /path/to/blackjack
blackjack-pro
```

**For Linux desktop users:**
```bash
./build-deb.sh
sudo dpkg -i ../blackjack-pro_*.deb
# Launch from applications menu
```

**For developers:**
```bash
pip install -e ".[dev]"
```

---

## Getting Help

- **Documentation:** See README.md and README_PRO.md
- **Issues:** Report at GitHub Issues
- **Tests:** Run `python -m pytest tests/`

---

## License

MIT License - See LICENSE file for details.
