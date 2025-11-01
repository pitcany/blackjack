# 🔨 Building Guide - Blackjack Card Counter

Quick reference for building your blackjack package with Poetry.

---

## ⚡ Quick Build

```bash
poetry build
```

**That's it!** This creates:
- `dist/blackjack_card_counter-0.1.0-py3-none-any.whl` (wheel)
- `dist/blackjack_card_counter-0.1.0.tar.gz` (source)

---

## 📋 Complete Build Workflow

### 1️⃣ First Time Setup
```bash
# Install Poetry (if needed)
curl -sSL https://install.python-poetry.org | python3 -

# Install dependencies
poetry install

# Verify everything works
poetry run python -c "from blackjack_card_counter import main; print('✓ Ready to build!')"
```

### 2️⃣ Build the Package
```bash
# Verify configuration
poetry check

# Build both wheel and source
poetry build
```

### 3️⃣ Test the Build
```bash
# Install the wheel
pip install dist/blackjack_card_counter-*.whl

# Run the game
blackjack

# Verify it works!
```

---

## 🎯 Build Commands

### Basic Commands
```bash
poetry build                    # Build wheel + source
poetry build --format wheel     # Build wheel only
poetry build --format sdist     # Build source only
poetry check                    # Verify config
```

### Clean Build
```bash
rm -rf dist/                    # Remove old builds
poetry build                    # Build fresh
```

### Version Management
```bash
poetry version patch            # 0.1.0 → 0.1.1
poetry version minor            # 0.1.0 → 0.2.0
poetry version major            # 0.1.0 → 1.0.0
poetry build                    # Build with new version
```

---

## 📦 What Gets Built?

### Wheel File: `blackjack_card_counter-0.1.0-py3-none-any.whl`
- **py3** = Python 3 compatible
- **none** = No specific ABI
- **any** = Works on any platform (Windows, Mac, Linux)
- **Fast installation** - No compilation needed

### Source Distribution: `blackjack_card_counter-0.1.0.tar.gz`
- Source code package
- For building from source
- Good for PyPI uploads

---

## ✅ Pre-Build Checklist

### Code Quality
```bash
# Format code
poetry run black blackjack_card_counter/

# Sort imports
poetry run isort blackjack_card_counter/

# Lint code
poetry run flake8 blackjack_card_counter/
```

### Configuration
```bash
# Check pyproject.toml
poetry check

# Lock dependencies
poetry lock --no-update
```

### Testing
```bash
# Run tests (if available)
poetry run pytest

# Manual test
poetry run blackjack
```

---

## 🔍 Verify Your Build

### Check Files
```bash
# List built files
ls -lh dist/

# Expected output:
# blackjack_card_counter-0.1.0-py3-none-any.whl
# blackjack_card_counter-0.1.0.tar.gz
```

### Inspect Wheel Contents
```bash
# View files in wheel
unzip -l dist/blackjack_card_counter-*.whl

# Should include:
# - blackjack_card_counter/*.py
# - metadata files
# - LICENSE
# - README.md
```

### Test Installation
```bash
# Create test environment (optional)
python -m venv test_env
source test_env/bin/activate  # On Windows: test_env\Scripts\activate

# Install wheel
pip install dist/blackjack_card_counter-*.whl

# Test it
blackjack

# Clean up
deactivate
rm -rf test_env/
```

---

## 🚀 Distribution

### Share Locally
```bash
# Copy wheel
cp dist/blackjack_card_counter-*.whl ~/Downloads/

# Users install with:
# pip install blackjack_card_counter-*.whl
```

### Create Release Archive
```bash
# Zip everything
zip -r blackjack-v0.1.0.zip dist/

# Or tar
tar -czf blackjack-v0.1.0.tar.gz dist/
```

### GitHub Release
1. Create release on GitHub (e.g., v0.1.0)
2. Upload files from `dist/`:
   - `blackjack_card_counter-0.1.0-py3-none-any.whl`
   - `blackjack_card_counter-0.1.0.tar.gz`
3. Users download and install

### PyPI (When Ready)
```bash
# Configure PyPI token
poetry config pypi-token.pypi your-token-here

# Publish
poetry publish

# Users install with:
# pip install blackjack-card-counter
```

---

## 🐛 Troubleshooting

### Issue: "pyproject.toml changed significantly"
```bash
poetry lock            # Regenerate lock file
poetry build           # Try again
```

### Issue: "No module named blackjack_card_counter"
```bash
# Check package structure
ls blackjack_card_counter/

# Should have __init__.py
# Reinstall and rebuild
poetry install
poetry build
```

### Issue: Wheel is too large
```bash
# Check contents
unzip -l dist/*.whl

# Exclude unwanted files in pyproject.toml if needed
```

### Issue: Build fails
```bash
# Clean everything
rm -rf dist/ build/ *.egg-info/

# Verify config
poetry check

# Reinstall dependencies
poetry install

# Try again
poetry build
```

---

## 📊 Build Output Explained

```
Building blackjack-card-counter (0.1.0)
  ↑ Your package name and version from pyproject.toml

Building sdist
  - Building sdist
  - Built blackjack_card_counter-0.1.0.tar.gz
  ↑ Source distribution created

Building wheel
  - Building wheel  
  - Built blackjack_card_counter-0.1.0-py3-none-any.whl
  ↑ Wheel file created (ready to install!)
```

---

## 🎓 Best Practices

### Before Building
✅ Run code formatters (black, isort)
✅ Run linters (flake8)
✅ Run tests (pytest)
✅ Verify with `poetry check`
✅ Update version if needed

### After Building
✅ Test wheel installation
✅ Run the installed package
✅ Verify all features work
✅ Check wheel contents

### Version Control
✅ Commit code changes first
✅ Bump version: `poetry version patch`
✅ Build: `poetry build`
✅ Tag release: `git tag v0.1.0`
✅ Push: `git push --tags`

---

## 📚 Related Documentation

- **README.md** - Installation and usage
- **SETUP_COMPLETE.md** - Complete Poetry guide
- **POETRY_GUIDE.md** - All Poetry commands
- **MODULAR_ARCHITECTURE.md** - Code structure

---

## 🎯 Quick Reference Card

```bash
# Build
poetry build                           # Build everything

# Version
poetry version patch                   # Bump version

# Test
pip install dist/*.whl                 # Test install
blackjack                              # Test run

# Share
cp dist/*.whl ~/Downloads/             # Copy wheel

# Publish
poetry publish                         # Upload to PyPI
```

---

**Your package is built and ready to share!** 🎉

Next steps:
1. Test the wheel installation
2. Share with users
3. Consider publishing to PyPI
4. Create GitHub releases

Happy building! 🔨✨
