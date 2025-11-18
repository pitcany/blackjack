# Packaging Guide - Blackjack Pro

This document explains the packaging structure and how to build distribution packages.

## Package Structure

```
blackjack/
├── setup.py              # Python package setup (legacy)
├── pyproject.toml        # Modern Python package config
├── MANIFEST.in           # Package file inclusions
├── PKG-INFO             # Package metadata
├── build-wheel.sh       # Build Python wheel
├── build-deb.sh         # Build Debian package
├── debian/              # Debian packaging files
│   ├── control          # Package metadata
│   ├── rules            # Build rules
│   ├── changelog        # Version history
│   ├── compat           # Debhelper version
│   ├── install          # Installation paths
│   ├── copyright        # License info
│   ├── blackjack.desktop
│   └── blackjack-pro.desktop
├── src/                 # Source code
├── tests/               # Test suite
└── docs/                # Documentation
```

## Python Package

### Building

```bash
# Using build script
./build-wheel.sh

# Or manually
python3 -m build
```

Creates:
- `dist/blackjack_pro-2.0.0-py3-none-any.whl` - Wheel package
- `dist/blackjack-pro-2.0.0.tar.gz` - Source distribution

### Installing

```bash
# From wheel
pip install dist/blackjack_pro-*.whl

# From source
pip install .

# Development mode
pip install -e .
```

### Entry Points

The package creates these commands:
- `blackjack` - Standard version
- `blackjack-pro` - Pro version
- `blackjack-standard` - Explicit standard version

Defined in `setup.py`:
```python
entry_points={
    "console_scripts": [
        "blackjack=src.gui:main",
        "blackjack-pro=src.gui_enhanced:main",
        "blackjack-standard=src.gui:main",
    ],
}
```

## Debian Package

### Building

```bash
# Using build script
./build-deb.sh

# Or manually
dpkg-buildpackage -us -uc -b
```

Creates:
- `../blackjack-pro_2.0.1_all.deb` - Installable package
- Build logs and metadata files

### Package Contents

**Installed files:**
```
/usr/bin/blackjack                  # Standard version launcher
/usr/bin/blackjack-pro              # Pro version launcher
/usr/lib/python3/dist-packages/blackjack-pro/  # Python modules
/usr/share/applications/            # Desktop entries
/usr/share/doc/blackjack-pro/       # Documentation
```

**Desktop Integration:**
- Application menu entries for both versions
- Icons and metadata
- MIME type associations (if configured)

### Dependencies

Defined in `debian/control`:
```
Depends: python3 (>= 3.7), python3-tk
```

Automatically resolved during installation.

## File Inclusions

### Python Package (MANIFEST.in)

```
include README.md README_PRO.md LICENSE
include CHANGELOG_UI.md requirements.txt
recursive-include src *.py
recursive-include tests *.py
recursive-exclude * __pycache__
```

### Debian Package (debian/install)

```
src/* usr/lib/python3/dist-packages/blackjack-pro/src/
tests/* usr/lib/python3/dist-packages/blackjack-pro/tests/
debian/*.desktop usr/share/applications/
```

## Version Management

Version defined in multiple places (keep in sync):
1. `src/__init__.py` - `__version__ = "2.0.0"`
2. `setup.py` - `version=` parameter
3. `pyproject.toml` - `version =` field
4. `debian/changelog` - Top entry

**Update script:**
```bash
# Update version everywhere
NEW_VERSION="2.0.1"
sed -i "s/__version__ = .*/__version__ = \"$NEW_VERSION\"/" src/__init__.py
sed -i "s/version = .*/version = \"$NEW_VERSION\"/" pyproject.toml
# Manually update setup.py and debian/changelog
```

## Publishing

### PyPI (Python Package Index)

```bash
# Build packages
python3 -m build

# Upload to PyPI (requires account)
python3 -m twine upload dist/*

# Install from PyPI
pip install blackjack-pro
```

### Debian Repository

```bash
# Build package
./build-deb.sh

# Upload to PPA or repository
# (Requires GPG key and repository access)
dput ppa:yourname/blackjack ../blackjack-pro_*.changes
```

### GitHub Releases

```bash
# Tag version
git tag -a v2.0.0 -m "Release v2.0.0"
git push origin v2.0.0

# Upload artifacts to GitHub Releases:
# - blackjack_pro-2.0.0-py3-none-any.whl
# - blackjack-pro-2.0.0.tar.gz
# - blackjack-pro_2.0.0_all.deb
```

## Testing Packages

### Python Package

```bash
# Create virtual environment
python3 -m venv test-env
source test-env/bin/activate

# Install package
pip install dist/blackjack_pro-*.whl

# Test commands
blackjack-pro

# Cleanup
deactivate
rm -rf test-env
```

### Debian Package

```bash
# Install in container (safe testing)
docker run -it ubuntu:22.04
apt-get update
apt-get install -y python3 python3-tk
dpkg -i blackjack-pro_*.deb
blackjack-pro

# Or install locally
sudo dpkg -i ../blackjack-pro_*.deb
sudo apt-get install -f  # Fix dependencies
```

## Package Verification

### Python Package

```bash
# Check package contents
unzip -l dist/blackjack_pro-*.whl

# Verify metadata
pip show blackjack-pro

# Run tests
python -m pytest tests/
```

### Debian Package

```bash
# Check package contents
dpkg-deb -c ../blackjack-pro_*.deb

# Verify package info
dpkg-deb -I ../blackjack-pro_*.deb

# Lint the package
lintian ../blackjack-pro_*.deb
```

## Continuous Integration

### GitHub Actions Example

```yaml
name: Build Packages

on: [push, pull_request]

jobs:
  build-wheel:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-python@v2
        with:
          python-version: '3.9'
      - run: pip install build
      - run: python -m build
      - uses: actions/upload-artifact@v2
        with:
          name: wheel
          path: dist/*.whl

  build-deb:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: sudo apt-get install -y dpkg-dev debhelper dh-python
      - run: ./build-deb.sh
      - uses: actions/upload-artifact@v2
        with:
          name: deb
          path: ../*.deb
```

## Troubleshooting

### "Module not found" after install

Check entry points are correct:
```bash
pip show -f blackjack-pro | grep bin
```

### Desktop entries not showing

Update desktop database:
```bash
sudo update-desktop-database
```

### Version mismatch

Ensure all version strings match:
```bash
grep -r "2.0.0" setup.py pyproject.toml src/__init__.py debian/changelog
```

## Best Practices

1. **Version Consistency** - Keep all version strings in sync
2. **Test Before Release** - Test packages in clean environments
3. **Changelog Updates** - Document all changes in debian/changelog
4. **Semantic Versioning** - Follow semver (MAJOR.MINOR.PATCH)
5. **Clean Builds** - Always clean before building
6. **Sign Packages** - Sign .deb packages with GPG for production

## Resources

- [Python Packaging Guide](https://packaging.python.org/)
- [Debian New Maintainer's Guide](https://www.debian.org/doc/manuals/maint-guide/)
- [setuptools documentation](https://setuptools.pypa.io/)
- [PyPI Publishing](https://pypi.org/)
