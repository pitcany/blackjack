# 🎯 Poetry Packaging - Complete Setup Guide

## ✅ What Has Been Done

Your blackjack card counting trainer is now fully packaged with Poetry! Here's what was set up:

### 1. **Project Structure Created**
```
blackjack/
├── blackjack_card_counter/     # Python package
│   ├── __init__.py            # Main game code
│   └── __main__.py            # Entry point for python -m
├── game.py                     # Original standalone script (still works!)
├── dist/                       # Built distributions
│   ├── blackjack_card_counter-0.1.0-py3-none-any.whl
│   └── blackjack_card_counter-0.1.0.tar.gz
├── pyproject.toml             # Poetry configuration
├── poetry.lock                 # Locked dependencies
├── LICENSE                     # MIT License
├── README.md                   # Project documentation
└── requirements.txt            # For pip users (legacy)
```

### 2. **Modern PEP 621 Format**
- Uses the latest Poetry 2.2+ standard
- PEP 621 compliant `pyproject.toml`
- Clean, modern configuration

### 3. **Entry Point Configured**
Users can run your game three ways:
```bash
# Method 1: Command line entry point
blackjack

# Method 2: Python module
python -m blackjack_card_counter

# Method 3: Direct script (still works!)
python game.py
```

### 4. **Development Tools Added**
- **black** - Code formatter
- **flake8** - Linter
- **mypy** - Type checker
- **pytest** - Testing framework
- **pytest-cov** - Code coverage
- **isort** - Import sorter

### 5. **MIT License**
- Permissive open-source license
- Allows commercial use, modification, distribution
- Minimal restrictions

### 6. **Build Artifacts Created**
- Wheel distribution (`.whl`) - For fast installation
- Source distribution (`.tar.gz`) - For source inspection

---

## 🚀 How to Use Your Package

### For Development (Local)

```bash
# 1. Install Poetry (if not installed)
curl -sSL https://install.python-poetry.org | python3 -

# 2. Add Poetry to PATH
export PATH="$HOME/.local/bin:$PATH"

# 3. Install dependencies
poetry install

# 4. Run the game
poetry run blackjack

# 5. Activate virtual environment (optional)
poetry shell
blackjack  # Now you can run directly
```

### For Users (Distribution)

**Option A: Install from wheel**
```bash
pip install dist/blackjack_card_counter-0.1.0-py3-none-any.whl
blackjack  # Run the game
```

**Option B: Install from source**
```bash
pip install dist/blackjack_card_counter-0.1.0.tar.gz
blackjack
```

**Option C: Install from GitHub**
```bash
# After pushing to GitHub
pip install git+https://github.com/pitcany/blackjack.git
blackjack
```

---

## 📦 Essential Poetry Commands

### Dependency Management
```bash
# Install all dependencies
poetry install

# Install with dev dependencies
poetry install --extras dev

# Add a new dependency
poetry add package-name

# Add a dev dependency
poetry add --group dev package-name

# Update dependencies
poetry update

# Show installed packages
poetry show

# Show dependency tree
poetry show --tree
```

### Running & Testing
```bash
# Run the game
poetry run blackjack

# Run Python scripts
poetry run python script.py

# Format code
poetry run black blackjack_card_counter/

# Lint code
poetry run flake8 blackjack_card_counter/

# Run tests (when you add them)
poetry run pytest
```

### Building & Publishing
```bash
# Build distributions
poetry build

# Check configuration
poetry check

# Bump version
poetry version patch  # 0.1.0 → 0.1.1
poetry version minor  # 0.1.0 → 0.2.0
poetry version major  # 0.1.0 → 1.0.0

# Publish to PyPI (when ready)
poetry config pypi-token.pypi your-token-here
poetry publish
```

### Virtual Environment
```bash
# Activate shell
poetry shell

# Show environment info
poetry env info

# List environments
poetry env list

# Remove environment
poetry env remove python3.10
```

---

## 🔧 Configuration Explained

### pyproject.toml Sections

**`[project]`** - Package metadata (PEP 621 standard)
- name, version, description
- authors, license, keywords
- Python version requirements
- Dependencies

**`[project.scripts]`** - Entry points
- `blackjack = "blackjack_card_counter:main"` creates the `blackjack` command

**`[project.optional-dependencies]`** - Dev tools
- Install with `--extras dev`

**`[tool.poetry]`** - Poetry settings
- `package-mode = true` enables building

**`[build-system]`** - Build backend
- Uses `poetry-core` for building

**`[tool.black]`, `[tool.isort]`, etc.** - Tool configurations
- Settings for development tools

---

## 📤 Distribution Options

### 1. Share Built Files
Zip and share the `dist/` directory:
```bash
zip -r blackjack-dist.zip dist/
# Users: unzip and run `pip install *.whl`
```

### 2. GitHub Releases
1. Push code to GitHub
2. Create a release (v0.1.0)
3. Upload wheel and tar.gz files
4. Users install via: `pip install <download-url>`

### 3. PyPI (Python Package Index)
```bash
# Test on TestPyPI first
poetry config repositories.testpypi https://test.pypi.org/legacy/
poetry publish -r testpypi --build

# Then publish to real PyPI
poetry publish --build

# Users install via:
# pip install blackjack-card-counter
```

---

## 🎨 Development Workflow

### Making Changes
```bash
# 1. Activate environment
poetry shell

# 2. Make your changes
vim blackjack_card_counter/__init__.py

# 3. Format code
black blackjack_card_counter/
isort blackjack_card_counter/

# 4. Lint
flake8 blackjack_card_counter/

# 5. Test locally
python -m blackjack_card_counter

# 6. Build
poetry build

# 7. Test installation
pip install --force-reinstall dist/*.whl
blackjack
```

### Version Bumping
```bash
# Update version
poetry version patch  # or minor/major

# Rebuild
poetry build

# Tag in git
git tag v$(poetry version -s)
git push --tags
```

---

## 🐛 Troubleshooting

### Poetry not found
```bash
# Add to ~/.bashrc or ~/.zshrc
export PATH="$HOME/.local/bin:$PATH"
source ~/.bashrc
```

### Virtual environment issues
```bash
poetry env remove python3.10
poetry install
```

### Build fails
```bash
# Check configuration
poetry check

# Regenerate lock file
poetry lock --no-update
```

### Module not found after installation
```bash
# Reinstall in editable mode
poetry install
```

---

## 📚 Additional Resources

- [Poetry Documentation](https://python-poetry.org/docs/)
- [PEP 621 - Storing project metadata](https://peps.python.org/pep-0621/)
- [PyPI - Python Package Index](https://pypi.org/)
- [Semantic Versioning](https://semver.org/)

---

## 🎮 About Your Game

**Blackjack Card Counter** is a Pygame-based trainer for:
- ✨ Learning Hi-Lo card counting
- 🎯 Practicing basic blackjack strategy
- 💰 Understanding bet sizing
- 🎲 Full blackjack gameplay

**Features:**
- Multiple deck support (1-8 decks)
- Real-time count tracking
- Strategy recommendations
- Split, double, hit, stand
- Bankroll management

**Run it:** `blackjack` or `python game.py`

---

## 🎯 Quick Reference Card

```bash
# Install
poetry install

# Run
poetry run blackjack

# Build
poetry build

# Format
poetry run black .

# Test (when tests exist)
poetry run pytest

# Update version
poetry version patch

# Publish (when ready)
poetry publish
```

---

**Your project is now fully packaged and ready to share! 🚀🎉**

Enjoy your professionally packaged blackjack trainer!
