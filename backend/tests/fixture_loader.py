"""Shared loader utilities for sanitized GitHub API JSON fixtures."""

import json
from pathlib import Path
from typing import Any

FIXTURES_DIR = (Path(__file__).resolve().parent.parent.parent / "fixtures").resolve()


def load_fixture(relative_path: str) -> Any:
    """Load and parse a sanitized JSON fixture relative to the root fixtures directory."""
    fixture_path = (FIXTURES_DIR / relative_path).resolve()
    if not fixture_path.is_relative_to(FIXTURES_DIR):
        raise ValueError(f"Fixture path escapes fixtures directory: {relative_path}")
    if not fixture_path.is_file():
        raise FileNotFoundError(f"Fixture not found: {fixture_path}")
    with fixture_path.open("r", encoding="utf-8") as fh:
        return json.load(fh)
