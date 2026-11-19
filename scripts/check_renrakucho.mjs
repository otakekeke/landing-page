// 2026-11-19: renrakucho.html は「声で入れる連絡帳」の見本（架空の利用者で動く）。住所を知っている人だけが開く。
// 元は takenokonoko/sales-demo/renrakucho-demo.html（ここでは直さない）。直す時は元で
// node renrakucho-demo.test.cjs・node renrakucho-relay.test.cjs を通してから、node build_lp_renrakucho.cjs で作り直す。
// 文を整える所だけ、中継 renrakucho-ai.takenokonoko.com に頼む（鍵は中継にだけあり、このページには無い）。
// ここで見ること：検索に出さない・ほかのページからつながない・外へ出るのは中継と書体だけ・内部のメモや鍵が残っていない。
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const h = await fs.readFile(path.join(root, 'renrakucho.html'), 'utf8');
assert.match(h, /^<!doctype html>\n<html lang="ja">/, 'renrakucho.html: document start');
assert.ok(h.includes('<meta name="robots" content="noindex,nofollow">'), 'renrakucho.html: noindex');
assert.ok(!h.includes('\r'), 'renrakucho.html: CRLF');
assert.equal((h.match(/<!--/g) || []).length, 1, 'renrakucho.html: comments left in the served page');
assert.doesNotMatch(h, /artifact|takenoko-knowledge|my_projects|sk-ant/i, 'renrakucho.html: internal notes or a key left');
assert.doesNotMatch(h, /(?<![A-Za-z])[A-Z]:[\\/](?![\\/])/, 'renrakucho.html: a path on this computer');
// 外へ出るのは、中継（1つの住所・1か所の fetch）と書体だけ
const RELAY = '<script>window.RENRAKUCHO_AI_URL="https://renrakucho-ai.takenokonoko.com/ask";</script>';
assert.equal(h.split(RELAY).length - 1, 1, 'renrakucho.html: the relay address is set once');
assert.equal(h.split('renrakucho-ai.takenokonoko.com').length - 1, 1, 'renrakucho.html: the relay address appears only where it is set');
assert.equal((h.match(/\bfetch\(/g) || []).length, 1, 'renrakucho.html: fetch is used only for the relay');
assert.ok(h.includes('await fetch(AI_URL, {'), 'renrakucho.html: fetch goes to the relay address');
assert.equal((h.match(/<script\b/g) || []).length, 2, 'renrakucho.html: two inline scripts (the relay address and the page)');
assert.doesNotMatch(h, /<script\b[^>]*\bsrc=|@import|url\(|http:\/\//i, 'renrakucho.html: loads an outside file');
const links = [...h.matchAll(/<link\b[^>]*\bhref="([^"]+)"/g)].map((m) => m[1]);
assert.deepEqual(links, ['assets/favicon.svg', 'https://fonts.googleapis.com', 'https://fonts.gstatic.com', 'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700&display=swap'], 'renrakucho.html: unexpected link');
// ほかのページからつながない
const names = (await fs.readdir(root)).filter((n) => n.endsWith('.html') && n !== 'renrakucho.html');
for (const n of names) assert.ok(!(await fs.readFile(path.join(root, n), 'utf8')).includes('renrakucho'), `${n}: links to renrakucho.html`);
console.log(JSON.stringify({ renrakucho: 'PASS', links: links.length, pagesWithoutLink: names.length }));
