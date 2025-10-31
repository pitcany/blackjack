# Poetry Packaging Guide for Blackjack Card Counter

## 🎯 What Changed?

Your project now uses **Poetry** for modern Python package management!

### Key Improvements:

1. ✅ **Standard Poetry Format** - Converted from PEP 621 to Poetry's native format
2. ✅ **Entry Point Added** - Run `blackjack` command after installation
3. ✅ **MIT License** - Added MIT license (permissive and popular)
4. ✅ **Dev Dependencies** - Added development tools (black, flake8, pytest, mypy, isort)
5. ✅ **Better Metadata** - Enhanced with keywords, classifiers, and repository info

---

## 📦 Poetry Commands Cheatsheet

### Installation & Setup

```bash
# Install Poetry (if not already installed)
curl -sSL https://install.python-poetry.org | python3 -

# Install all dependencies from poetry.lock
poetry install

# Install with dev dependencies (default)
poetry install

# Install without dev dependencies
poetry install --no-dev
```

### Running the Game

```bash
# Option 1: Run using Poetry
poetry run blackjack

# Option 2: Activate virtual environment, then run
poetry shell
blackjack

# Option 3: Traditional way (still works)
poetry run python game.py
```

### Development Tools

```bash
# Format code with Black
poetry run black game.py

# Sort imports with isort
poetry run isort game.py

# Lint code with flake8
poetry run flake8 game.py

# Type check with mypy
poetry run mypy game.py

# Run tests (when you add them)
poetry run pytest

# Run tests with coverage
poetry run pytest --cov
```

### Managing Dependencies

```bash
# Add a new dependency
poetry add package-name

# Add a dev dependency
poetry add --group dev package-name

# Update a specific package
poetry update package-name

# Update all packages
poetry update

# Show installed packages
poetry show

# Show dependency tree
poetry show --tree
```

### Building & Distribution

```bash
# Build package (creates wheel and source distribution)
poetry build

# This creates:
#   - dist/blackjack_card_counter-0.1.0-py3-none-any.whl
#   - dist/blackjack-card-counter-0.1.0.tar.gz

# Check what would be included in the package
poetry build --dry-run
```

### Publishing (When Ready)

```bash
# Configure PyPI credentials (first time only)
poetry config pypi-token.pypi your-api-token

# Publish to PyPI
poetry publish

# Or build and publish in one command
poetry publish --build

# Publish to test PyPI (recommended first)
poetry publish --repository testpypi
```

### Virtual Environment Management

```bash
# Show virtual environment info
poetry env info

# List all virtual environments
poetry env list

# Activate virtual environment (creates new shell)
poetry shell

# Exit virtual environment
exit

# Remove virtual environment
poetry env remove python3.10
```

### Other Useful Commands

```bash
# Check pyproject.toml for errors
poetry check

# View current configuration
poetry config --list

# Export dependencies to requirements.txt
poetry export -f requirements.txt --output requirements.txt

# Export with dev dependencies
poetry export -f requirements.txt --output requirements.txt --with dev

# Lock dependencies without installing
poetry lock

# Update poetry.lock after editing pyproject.toml
poetry lock --no-update
```

---

## 🚀 Quick Start for Users

### Installation from Source

```bash
# Clone your repository
git clone https://github.com/pitcany/blackjack.git
cd blackjack

# Install with Poetry
poetry install

# Run the game
poetry run blackjack
```

### Installation from Built Package

```bash
# After building with 'poetry build'
pip install dist/blackjack_card_counter-0.1.0-py3-none-any.whl

# Run the game
blackjack
```

---

## 📁 Package Structure

```
blackjack/
├── game.py              # Main game file with entry point
├── pyproject.toml       # Poetry configuration
├── poetry.lock          # Locked dependencies
├── LICENSE              # MIT License
├── README.md            # Project documentation
├── POETRY_GUIDE.md      # This file
└── requirements.txt     # For pip users (can be regenerated)
```

---

## 🔧 Configuration Files Explained

### pyproject.toml Sections

- **`[tool.poetry]`** - Package metadata (name, version, description, authors)
- **`[tool.poetry.dependencies]`** - Runtime dependencies (pygame)
- **`[tool.poetry.group.dev.dependencies]`** - Development tools (black, flake8, etc.)
- **`[tool.poetry.scripts]`** - Entry points (the `blackjack` command)
- **`[build-system]`** - Build backend configuration
- **`[tool.black]`** - Black formatter settings
- **`[tool.isort]`** - Import sorter settings
- **`[tool.mypy]`** - Type checker settings
- **`[tool.pytest.ini_options]`** - Test runner settings

---

## 💡 Best Practices

1. **Always commit poetry.lock** - Ensures reproducible builds
2. **Use `poetry add`** - Don't manually edit dependencies
3. **Run `poetry lock`** - After manual pyproject.toml changes
4. **Version bumping** - Use `poetry version patch/minor/major`
5. **Keep dependencies updated** - Run `poetry update` regularly

---

## 🐛 Troubleshooting

### Poetry not found
```bash
# Add Poetry to PATH (add to ~/.bashrc or ~/.zshrc)
export PATH="$HOME/.local/bin:$PATH"
```

### Virtual environment issues
```bash
# Remove and recreate
poetry env remove python3.10
poetry install
```

### Lock file issues
```bash
# Regenerate lock file
rm poetry.lock
poetry lock
```

### Permission errors on Linux/Mac
```bash
# Install in user space
poetry config virtualenvs.in-project true
poetry install
```

---

## 📚 Additional Resources

- [Poetry Official Documentation](https://python-poetry.org/docs/)
- [Poetry Basic Usage](https://python-poetry.org/docs/basic-usage/)
- [Poetry Commands Reference](https://python-poetry.org/docs/cli/)
- [pyproject.toml Specification](https://python-poetry.org/docs/pyproject/)

---

## 🎮 About This Project

Blackjack Card Counter is a Pygame-based training tool for learning card counting and basic blackjack strategy using the Hi-Lo counting system.

**Features:**
- Card counting practice with Hi-Lo system
- Real-time basic strategy recommendations  
- Customizable deck count (1-8 decks)
- Full blackjack rules (hit, stand, double, split)
- Bankroll management
- Betting strategy based on true count

**Enjoy the game and happy counting!** 🃏✨
