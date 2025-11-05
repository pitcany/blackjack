# Poetry Guide - Blackjack Card Counter

Complete guide for managing, building, and distributing your blackjack package with Poetry.

---

## 📦 Quick Reference

```bash
# Install
poetry install              # Install dependencies
poetry install --extras dev # With dev tools

# Run
poetry run blackjack        # Run game
poetry shell                # Activate environment

# Build
poetry build                # Build wheel + source
poetry check                # Verify configuration

# Version
poetry version patch        # Bump version
```

---

## 🚀 Installation

### Install Poetry
```bash
curl -sSL https://install.python-poetry.org | python3 -

# Add to PATH
export PATH="$HOME/.local/bin:$PATH"

# Verify
poetry --version
```

### Install Project Dependencies
```bash
# Basic installation
poetry install

# With development tools (black, flake8, pytest, mypy, isort)
poetry install --extras dev

# Without development dependencies
poetry install --no-dev
```

---

## 🏃 Running the Game

```bash
# Method 1: Using Poetry
poetry run blackjack

# Method 2: Activate virtual environment
poetry shell
blackjack
exit  # When done

# Method 3: Direct Python
poetry run python -m blackjack_card_counter
```

---

## 🔨 Building

### Quick Build
```bash
poetry build
```

**Output:**
```
dist/
├── blackjack_card_counter-0.1.0-py3-none-any.whl
└── blackjack_card_counter-0.1.0.tar.gz
```

### Build Workflows

**Standard Build:**
```bash
poetry check      # Verify config
poetry build      # Build packages
```

**Clean Build:**
```bash
rm -rf dist/      # Remove old builds
poetry build      # Build fresh
```

**Build Specific Format:**
```bash
poetry build --format wheel  # Wheel only
poetry build --format sdist  # Source only
```

### Pre-Build Checklist
```bash
# Format code
poetry run black blackjack_card_counter/
poetry run isort blackjack_card_counter/

# Lint
poetry run flake8 blackjack_card_counter/

# Verify
poetry check

# Build
poetry build
```

### Verify Build
```bash
# Check files
ls -lh dist/

# Inspect wheel
unzip -l dist/blackjack_card_counter-*.whl

# Test install
pip install dist/blackjack_card_counter-*.whl
blackjack
```

---

## 📊 Version Management

```bash
# Show current version
poetry version

# Bump version
poetry version patch   # 0.1.0 → 0.1.1
poetry version minor   # 0.1.0 → 0.2.0
poetry version major   # 0.1.0 → 1.0.0

# Set specific version
poetry version 1.2.3

# Build with new version
poetry build
```

---

## 🔧 Dependency Management

### Add Dependencies
```bash
# Add runtime dependency
poetry add pygame

# Add dev dependency
poetry add --group dev pytest

# Add optional dependency
poetry add --optional sphinx
```

### Update Dependencies
```bash
# Update specific package
poetry update pygame

# Update all packages
poetry update

# Show outdated packages
poetry show --outdated
```

### Remove Dependencies
```bash
poetry remove package-name
```

### View Dependencies
```bash
# List all packages
poetry show

# Show dependency tree
poetry show --tree

# Show specific package
poetry show pygame
```

---

## 🧪 Development Tools

### Code Formatting
```bash
# Format with Black
poetry run black blackjack_card_counter/
poetry run black .

# Sort imports with isort
poetry run isort blackjack_card_counter/
```

### Linting
```bash
# Lint with flake8
poetry run flake8 blackjack_card_counter/

# Type check with mypy
poetry run mypy blackjack_card_counter/
```

### Testing
```bash
# Run tests
poetry run pytest

# With coverage
poetry run pytest --cov

# Specific test file
poetry run pytest tests/test_card.py
```

---

## 🌐 Virtual Environment

### Environment Management
```bash
# Show environment info
poetry env info

# List environments
poetry env list

# Activate shell
poetry shell

# Remove environment
poetry env remove python3.10
```

### Environment Configuration
```bash
# Create venv in project directory
poetry config virtualenvs.in-project true

# Use specific Python version
poetry env use python3.11

# Use system Python
poetry env use system
```

---

## 📤 Publishing

### Configure Credentials
```bash
# Set PyPI token
poetry config pypi-token.pypi your-api-token

# Configure test PyPI
poetry config repositories.testpypi https://test.pypi.org/legacy/
```

### Publish to PyPI
```bash
# Build and publish
poetry publish --build

# Or separately
poetry build
poetry publish

# Publish to test PyPI
poetry publish -r testpypi
```

---

## 🚀 Distribution

### Local Distribution
```bash
# Share wheel file
cp dist/blackjack_card_counter-*.whl ~/Downloads/

# Create archive
zip -r blackjack-v0.1.0.zip dist/
```

### GitHub Release
1. Create release (e.g., v0.1.0)
2. Upload files from `dist/`:
   - `blackjack_card_counter-0.1.0-py3-none-any.whl`
   - `blackjack_card_counter-0.1.0.tar.gz`

### Users Install
```bash
# From wheel
pip install blackjack_card_counter-0.1.0-py3-none-any.whl

# From PyPI (after publishing)
pip install blackjack-card-counter

# From GitHub
pip install git+https://github.com/pitcany/blackjack.git
```

---

## 🔍 Configuration

### View Configuration
```bash
# List all settings
poetry config --list

# Show specific setting
poetry config virtualenvs.in-project
```

### Common Settings
```bash
# Virtual environment in project
poetry config virtualenvs.in-project true

# Disable parallel installers
poetry config installer.parallel false

# Set cache directory
poetry config cache-dir /path/to/cache
```

---

## 🐛 Troubleshooting

### Poetry Not Found
```bash
# Add to PATH (in ~/.bashrc or ~/.zshrc)
export PATH="$HOME/.local/bin:$PATH"
source ~/.bashrc
```

### Lock File Issues
```bash
# Regenerate lock file
rm poetry.lock
poetry lock

# Update lock file
poetry lock --no-update
```

### Dependency Conflicts
```bash
# Clear cache
poetry cache clear pypi --all

# Reinstall
poetry install --no-cache
```

### Build Fails
```bash
# Clean everything
rm -rf dist/ build/ *.egg-info/

# Verify config
poetry check

# Try again
poetry build
```

### Environment Issues
```bash
# Remove and recreate
poetry env remove python3.10
poetry install
```

---

## 📋 Common Workflows

### Daily Development
```bash
# 1. Activate environment
poetry shell

# 2. Make changes
vim blackjack_card_counter/game.py

# 3. Format and lint
black .
flake8 .

# 4. Test
pytest

# 5. Run
blackjack
```

### Release Workflow
```bash
# 1. Ensure tests pass
poetry run pytest

# 2. Format and lint
poetry run black .
poetry run flake8 .

# 3. Bump version
poetry version patch

# 4. Build
poetry build

# 5. Test wheel
pip install --force-reinstall dist/*.whl
blackjack

# 6. Tag release
git tag v$(poetry version -s)
git push --tags

# 7. Publish (optional)
poetry publish
```

---

## 📚 Additional Resources

- [Poetry Documentation](https://python-poetry.org/docs/)
- [Poetry Commands](https://python-poetry.org/docs/cli/)
- [pyproject.toml Spec](https://python-poetry.org/docs/pyproject/)
- [PEP 621](https://peps.python.org/pep-0621/)

---

## 💡 Tips & Best Practices

### Version Control
- ✅ Commit `poetry.lock` (ensures reproducible builds)
- ✅ Add `.gitignore` for `dist/`, `__pycache__/`, etc.
- ✅ Tag releases: `git tag v0.1.0`

### Dependency Management
- ✅ Use `poetry add` (don't edit `pyproject.toml` manually)
- ✅ Run `poetry lock` after manual changes
- ✅ Keep dependencies updated: `poetry update`

### Building
- ✅ Run tests before building
- ✅ Verify wheel contents: `unzip -l dist/*.whl`
- ✅ Test installation before publishing

### Publishing
- ✅ Test on TestPyPI first
- ✅ Use semantic versioning
- ✅ Create GitHub releases with build artifacts

---

**Your complete Poetry reference!** 🎉
