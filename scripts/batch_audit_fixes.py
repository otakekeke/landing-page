"""One-off batch fixes from 計画書LP整合監査 plan."""
from pathlib import Path

root = Path(__file__).resolve().parent.parent
for p in root.glob("*.html"):
    t = p.read_text(encoding="utf-8")
    orig = t
    t = t.replace("平日・土 9:00-18:00", "平日・土曜 9:00-18:00")
    t = t.replace(
        '<a href="sample-app.html">見本アプリ</a>',
        '<a href="sample-app.html">見本アプリとは</a>',
    )
    if t != orig:
        p.write_text(t, encoding="utf-8")
        print("updated", p.name)
