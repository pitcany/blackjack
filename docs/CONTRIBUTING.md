# Contributing to Blackjack Card Counter

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

---

## 🚀 Getting Started

### 1. Fork and Clone
```bash
git clone https://github.com/YOUR_USERNAME/blackjack.git
cd blackjack
```

### 2. Install Dependencies
```bash
# Install Poetry if needed
curl -sSL https://install.python-poetry.org | python3 -

# Install project dependencies
poetry install --extras dev
```

### 3. Create a Branch
```bash
git checkout -b feature/your-feature-name
```

---

## 📝 Development Workflow

### Making Changes

1. **Make your changes**
   ```bash
   vim blackjack_card_counter/strategy.py
   ```

2. **Format code**
   ```bash
   poetry run black .
   poetry run isort .
   ```

3. **Lint**
   ```bash
   poetry run flake8 blackjack_card_counter/
   ```

4. **Test**
   ```bash
   poetry run pytest
   poetry run blackjack  # Manual test
   ```

5. **Commit**
   ```bash
   git add .
   git commit -m "feat: add new strategy calculation"
   ```

---

## 🎨 Code Style

### Python Style Guide
- Follow [PEP 8](https://peps.python.org/pep-0008/)
- Use [Black](https://black.readthedocs.io/) for formatting
- Use [isort](https://pycqa.github.io/isort/) for imports
- Line length: 100 characters

### Type Hints
Add type hints to all new functions:
```python
def calculate_hand_value(hand: List[Card]) -> int:
    """Calculate the blackjack value of a hand."""
    # Implementation
```

### Docstrings
Use Google-style docstrings:
```python
def get_true_count(running_count: int, cards_dealt: int, num_decks: int) -> int:
    """Calculate the true count.

    Args:
        running_count: Current running count
        cards_dealt: Number of cards dealt
        num_decks: Total decks in shoe

    Returns:
        The true count (running count / decks remaining)
    """
    # Implementation
```

---

## 🧪 Module Guidelines

### Where to Add Code

- **constants.py** - New colors, fonts, or configuration
- **card.py** - Card logic, deck operations
- **ui.py** - New UI widgets or components
- **strategy.py** - Strategy calculations, recommendations
- **game.py** - Game flow, state management
- **New module** - If feature doesn't fit existing modules

### Creating New Modules

If adding a new module:
1. Create file in `blackjack_card_counter/`
2. Add docstring at top
3. Import in `__init__.py` if public API
4. Update documentation

---

## ✅ Testing

### Writing Tests

Create tests in `tests/` directory:

```python
# tests/test_card.py
from blackjack_card_counter.card import Card, calculate_hand_value

def test_blackjack():
    """Test blackjack hand (21)."""
    hand = [Card('A', '♠'), Card('K', '♥')]
    assert calculate_hand_value(hand) == 21

def test_soft_hand():
    """Test soft hand with Ace."""
    hand = [Card('A', '♠'), Card('6', '♥')]
    assert calculate_hand_value(hand) == 17
```

### Running Tests
```bash
# All tests
poetry run pytest

# With coverage
poetry run pytest --cov

# Specific test
poetry run pytest tests/test_card.py::test_blackjack
```

---

## 📝 Commit Messages

### Format
Use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>: <description>

[optional body]

[optional footer]
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style (formatting, missing semicolons, etc.)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

### Examples
```bash
feat: add true count display to UI
fix: correct soft hand calculation
docs: update installation instructions
refactor: extract button creation to separate method
test: add tests for split hand logic
```

---

## 🔄 Pull Request Process

### Before Submitting

1. **Update documentation**
   - Update README.md if needed
   - Add docstrings to new functions
   - Update CHANGELOG.md

2. **Run full check**
   ```bash
   poetry run black .
   poetry run isort .
   poetry run flake8 .
   poetry run pytest
   poetry build
   ```

3. **Test manually**
   ```bash
   poetry run blackjack
   # Test your feature thoroughly
   ```

### Submitting PR

1. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create Pull Request**
   - Go to GitHub
   - Click "New Pull Request"
   - Fill in description template

3. **PR Description**
   ```markdown
   ## Description
   Brief description of changes

   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update

   ## Testing
   - [ ] Tests added/updated
   - [ ] Manual testing completed
   - [ ] All tests passing

   ## Checklist
   - [ ] Code formatted (black, isort)
   - [ ] Linting passed (flake8)
   - [ ] Documentation updated
   - [ ] CHANGELOG.md updated
   ```

---

## 🐛 Reporting Bugs

### Bug Report Template

```markdown
**Describe the Bug**
Clear description of the bug

**To Reproduce**
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior**
What you expected to happen

**Screenshots**
If applicable

**Environment:**
 - OS: [e.g. macOS 13.0]
 - Python: [e.g. 3.11]
 - Version: [e.g. 0.1.0]

**Additional Context**
Any other information
```

---

## 💡 Feature Requests

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
Description of the problem

**Describe the solution you'd like**
Clear description of what you want

**Describe alternatives you've considered**
Other solutions you've thought about

**Additional context**
Any other information
```

---

## 📚 Code Review Guidelines

### For Reviewers

- Be kind and constructive
- Focus on code quality and maintainability
- Check for test coverage
- Verify documentation is updated
- Test the changes locally

### For Contributors

- Respond to feedback promptly
- Ask questions if unclear
- Make requested changes
- Keep PR scope focused

---

## 🏆 Recognition

Contributors will be:
- Listed in CHANGELOG.md
- Mentioned in release notes
- Added to contributors list (if significant contribution)

---

## 💬 Questions?

If you have questions:
1. Check existing documentation
2. Search existing issues
3. Open a new issue with "Question" label

---

## 📜 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing!** 🎉
