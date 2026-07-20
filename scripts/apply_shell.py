#!/usr/bin/env python3
"""Apply unified SITE SHELL v2 nav/footer to LP HTML pages."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

NAV_HOME = """<!-- SITE SHELL v2 nav-home -->
<nav class="nav" aria-label="メイン">
  <div class="nav__inner">
    <a href="index.html" class="nav__brand">
      <span class="brand-mark" aria-hidden="true">嶽</span>
      <span class="nav__brand-name">嶽ノ子</span>
    </a>
    <div class="nav__links">
      <a href="#trust">嶽ノ子の姿勢</a>
      <a href="#process">導入の流れ</a>
      <a href="#examples">対応業務</a>
      <a href="#price">料金</a>
      <a href="#faq">よくある質問</a>
      <a href="#contact" class="nav__cta">無料で相談する</a>
    </div>
  </div>
</nav>"""

NAV_SUB = """<!-- SITE SHELL v2 nav-sub -->
<nav class="nav" aria-label="メイン">
  <div class="nav__inner">
    <a href="index.html" class="nav__brand">
      <span class="brand-mark" aria-hidden="true">嶽</span>
      <span class="nav__brand-name">嶽ノ子</span>
    </a>
    <div class="nav__links">
      <a href="index.html">トップ</a>
      <a href="sample-app.html">見本アプリ</a>
      <a href="index.html#price">料金</a>
      <a href="company.html">運営者情報</a>
      <a href="index.html#contact" class="nav__cta">無料で相談する</a>
    </div>
  </div>
</nav>"""

FOOTER_HOME = """<!-- SITE SHELL v2 footer -->
<footer class="footer footer--warm">
  <div class="footer__inner">
    <div class="footer__cols">
      <div>
        <div class="footer__brand-row">
          <span class="brand-mark brand-mark--sm" aria-hidden="true">嶽</span>
          <span class="footer__brand-name">嶽ノ子</span>
        </div>
        <p class="footer__about">今のやり方を見せてください。介護現場の紙・Excel・手作業を、使いやすい仕組みに整えます。シフト・送迎・月次集計・申し送りなど、現場に残る業務に対応。</p>
      </div>
      <div>
        <p class="footer__col-h">SERVICE</p>
        <div class="footer__links">
          <a href="#trust">嶽ノ子の姿勢</a>
          <a href="#process">導入の流れ</a>
          <a href="#examples">対応業務</a>
          <a href="#price">料金</a>
          <a href="sample-app.html">見本アプリとは</a>
          <a href="business-improvement.html">業務改善支援</a>
          <a href="subsidy-app.html">国の補助金について</a>
        </div>
      </div>
      <div>
        <p class="footer__col-h">FOR</p>
        <div class="footer__links">
          <a href="manager.html">管理者の方へ</a>
          <a href="staff.html">現場職員の方へ</a>
          <a href="dayservice.html">デイサービスの方へ</a>
          <a href="small-facility.html">小規模事業所の方へ</a>
        </div>
      </div>
      <div>
        <p class="footer__col-h">COMPANY</p>
        <div class="footer__links">
          <a href="company.html">運営者情報</a>
          <a href="privacy.html">個人情報保護方針</a>
          <a href="terms.html">利用規約</a>
          <a href="conflict-of-interest.html">利益相反管理規程</a>
        </div>
      </div>
    </div>
    <div class="footer__disclaimer">
      <p class="h">役務の範囲と責任の所在</p>
      <p>当方（嶽ノ子）が提供する役務は、助言・教育・ツールの提供・データ整備に限られます。介護保険法および労働・社会保険関係法令に基づく書類の作成代行・提出代行は行いません（これらは社会保険労務士・行政書士等の独占業務です）。各種書類の作成・提出および報告内容の最終責任は、事業者ご本人にあります。書類の作成・提出が必要な場合は、お客様と各士業とのご契約を中立にご案内します（当方は紹介料を一切いただきません）。</p>
    </div>
    <div class="footer__security">
      <p class="h">SECURITY ACTION ／ 情報セキュリティ対策</p>
      <div class="footer__security-row">
        <a href="https://www.ipa.go.jp/security/security-action/" target="_blank" rel="noopener noreferrer" title="SECURITY ACTION セキュリティ対策自己宣言（IPA）" class="footer__security-badge">
          <img src="assets/security-action/security_action_hitotsuboshi-small_color.png" alt="SECURITY ACTION 一つ星（セキュリティ対策自己宣言）" width="72" height="72">
        </a>
        <div class="footer__security-text">
          <p>独立行政法人情報処理推進機構（IPA）の「SECURITY ACTION」一つ星に自己宣言しています。中小企業向け情報セキュリティ五か条への取組を宣言した事業者です。</p>
          <p class="footer__security-id">自己宣言ID：50000228580</p>
        </div>
      </div>
    </div>
    <div class="footer__bar">
      <span>© 2026 嶽ノ子 — TAKENOKONOKO</span>
      <span>TEL 070-1383-4420 ／ 平日・土 9:00-18:00</span>
      <span>SAGAMIHARA, KANAGAWA</span>
    </div>
  </div>
</footer>"""

FOOTER_SUB = FOOTER_HOME.replace('href="#trust"', 'href="index.html#trust"').replace(
    'href="#process"', 'href="index.html#process"'
).replace('href="#examples"', 'href="index.html#examples"').replace(
    'href="#price"', 'href="index.html#price"'
)

SKIP_HOME = '<a href="#main" class="skip-link">本文へスキップ</a>\n'
SKIP_SUB = '<a href="#main" class="skip-link">本文へスキップ</a>\n'

import re

NAV_RE = re.compile(
    r"<!-- =+ NAV =+ -->.*?<nav class=\"nav\">.*?</nav>",
    re.DOTALL,
)
FOOTER_RE = re.compile(
    r"<!-- =+ FOOTER =+ -->.*?<footer class=\"footer\">.*?</footer>",
    re.DOTALL,
)


def ensure_skip_link(body: str) -> str:
    if 'class="skip-link"' in body:
        return body
    return body.replace("<body>\n", "<body>\n" + SKIP_SUB, 1)


def ensure_main_wrapper(body: str, is_home: bool) -> str:
    if 'id="main"' in body:
        return body
    if is_home:
        body = body.replace(
            NAV_HOME + "\n\n",
            NAV_HOME + "\n\n<main id=\"main\">\n",
            1,
        )
    else:
        body = body.replace(
            NAV_SUB + "\n\n",
            NAV_SUB + "\n\n<main id=\"main\">\n",
            1,
        )
    body = body.replace(
        "\n<!-- SITE SHELL v2 footer -->",
        "\n</main>\n\n<!-- SITE SHELL v2 footer -->",
        1,
    )
    return body


def process_file(path: Path, is_home: bool) -> None:
    text = path.read_text(encoding="utf-8")
    nav = NAV_HOME if is_home else NAV_SUB
    footer = FOOTER_HOME if is_home else FOOTER_SUB

    if NAV_RE.search(text):
        text = NAV_RE.sub(f"<!-- ===================== NAV ===================== -->\n{nav}", text, count=1)
    if FOOTER_RE.search(text):
        text = FOOTER_RE.sub(f"<!-- ===================== FOOTER ===================== -->\n{footer}", text, count=1)

    text = text.replace("© 2025 嶽ノ子", "© 2026 嶽ノ子")
    text = ensure_skip_link(text)
    text = ensure_main_wrapper(text, is_home)
    path.write_text(text, encoding="utf-8")
    print(f"updated {path.name}")


def main() -> None:
    process_file(ROOT / "index.html", is_home=True)
    subpages = [
        "manager.html", "staff.html", "dayservice.html", "small-facility.html",
        "sample-app.html", "business-improvement.html", "subsidy-app.html",
        "company.html", "privacy.html", "terms.html", "conflict-of-interest.html",
    ]
    for name in subpages:
        process_file(ROOT / name, is_home=False)


if __name__ == "__main__":
    main()
