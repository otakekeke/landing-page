#!/usr/bin/env python3
from pathlib import Path

root = Path(__file__).resolve().parents[1]
nav_old = '<span class="brand-mark" aria-hidden="true">嶽</span>'
nav_new = '<img class="brand-mark" src="assets/favicon.svg" alt="" width="30" height="30">'
foot_old = '<span class="brand-mark brand-mark--sm" aria-hidden="true">嶽</span>'
foot_new = '<img class="brand-mark brand-mark--sm" src="assets/favicon.svg" alt="" width="28" height="28">'

for p in root.glob("*.html"):
    text = p.read_text(encoding="utf-8")
    updated = text.replace(nav_old, nav_new).replace(foot_old, foot_new)
    if updated != text:
        p.write_text(updated, encoding="utf-8")
        print(p.name)
