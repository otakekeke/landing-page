#!/usr/bin/env python3
"""HIG/a11y checklist validation for LP HTML pages."""
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
PAGES = [
    "index.html", "manager.html", "staff.html", "dayservice.html",
    "small-facility.html", "sample-app.html", "business-improvement.html",
    "subsidy-app.html", "company.html", "privacy.html", "terms.html",
    "conflict-of-interest.html",
]

CHECKS = [
    ("lang=ja", lambda t: '<html lang="ja">' in t),
    ("viewport", lambda t: 'name="viewport"' in t),
    ("skip-link", lambda t: 'class="skip-link"' in t),
    ("main landmark", lambda t: 'id="main"' in t and "<main" in t),
    ("nav landmark", lambda t: '<nav class="nav"' in t),
    ("footer landmark", lambda t: "<footer" in t),
    ("SITE SHELL v2", lambda t: "SITE SHELL v2" in t),
    ("brand-mark", lambda t: 'class="brand-mark"' in t),
    ("© 2026", lambda t: "© 2026" in t),
    ("SECURITY PNG", lambda t: "security_action_hitotsuboshi-small_color.png" in t),
    ("SECURITY ID", lambda t: "50000228580" in t),
    ("noopener external", lambda t: "rel=\"noopener noreferrer\"" in t or "ipa.go.jp" not in t),
    ("hig.css", lambda t: "assets/hig.css" in t),
]


def main() -> int:
    failed = False
    for name in PAGES:
        text = (ROOT / name).read_text(encoding="utf-8")
        page_failed = []
        for label, fn in CHECKS:
            if not fn(text):
                page_failed.append(label)
        if page_failed:
            failed = True
            print(f"FAIL {name}: {', '.join(page_failed)}")
        else:
            print(f"OK   {name}")
    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
