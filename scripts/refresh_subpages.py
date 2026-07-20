#!/usr/bin/env python3
"""Light refresh of subpage markup for dc/hig classes."""
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
SUBPAGES = [
    "manager.html", "staff.html", "dayservice.html", "small-facility.html",
    "sample-app.html", "business-improvement.html", "subsidy-app.html",
    "company.html", "privacy.html", "terms.html", "conflict-of-interest.html",
]

REPLACEMENTS = [
    ('<p class="card__eyebrow" style="color:var(--accent);">', '<p class="card__eyebrow accent">'),
    ('class="card card--tint card--flat"', 'class="card card--elevated"'),
    (' style="scroll-margin-top: 70px;"', ''),
]


def refresh(path: Path) -> None:
    text = path.read_text(encoding="utf-8")
    original = text
    for old, new in REPLACEMENTS:
        text = text.replace(old, new)
    if text != original:
        path.write_text(text, encoding="utf-8")
        print(f"refreshed {path.name}")


def main() -> None:
    for name in SUBPAGES:
        refresh(ROOT / name)


if __name__ == "__main__":
    main()
