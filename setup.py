"""Setup configuration for Blackjack Pro."""
from setuptools import setup, find_packages
import os

# Read long description from README
with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

# Read version from package
version = {}
with open("src/__init__.py", "r") as fp:
    for line in fp:
        if line.startswith("__version__"):
            exec(line, version)

setup(
    name="blackjack-pro",
    version=version.get("__version__", "2.0.0"),
    author="Blackjack Pro Team",
    description="Professional Blackjack card counting training simulator",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/pitcany/blackjack",
    packages=find_packages(),
    classifiers=[
        "Development Status :: 4 - Beta",
        "Intended Audience :: Education",
        "Topic :: Games/Entertainment :: Board Games",
        "Topic :: Education",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.7",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Operating System :: OS Independent",
        "Environment :: X11 Applications",
    ],
    python_requires=">=3.7",
    install_requires=[
        # No external dependencies - uses only Python standard library
    ],
    extras_require={
        "dev": [
            "pytest>=7.0.0",
            "black>=22.0.0",
            "mypy>=0.950",
        ],
    },
    entry_points={
        "console_scripts": [
            "blackjack=src.gui:main",
            "blackjack-pro=src.gui_enhanced:main",
            "blackjack-standard=src.gui:main",
        ],
    },
    include_package_data=True,
    zip_safe=False,
    keywords="blackjack card-counting casino training simulator education",
    project_urls={
        "Documentation": "https://github.com/pitcany/blackjack/blob/main/README_PRO.md",
        "Source": "https://github.com/pitcany/blackjack",
        "Bug Reports": "https://github.com/pitcany/blackjack/issues",
    },
)
