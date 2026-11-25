// 2026-11-25: aki/ は「障害福祉サービスの空き状況」の試作品（架空の事業所で動く見本）。住所を知っている人だけが開く。
// 元は試作品の作業フォルダにある（ここでは直さない）。直す時は元で node tools/check_flow.cjs・node tools/tap_tasks.cjs を通してから、index.html をそのまま写す。
// ここで見ること：検索に出さない・ほかのページからつながない・外のファイルを読まない・外へ送らない・覚えるのはこのブラウザの中の1つの名前だけ・内部のメモが無い。
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dir = path.join(root, 'aki');
assert.deepEqual(await fs.readdir(dir), ['index.html'], 'aki/: only index.html is served');
const h = await fs.readFile(path.join(dir, 'index.html'), 'utf8');
assert.match(h, /^<!doctype html>\n<html lang="ja">/, 'aki/index.html: document start');
assert.ok(h.includes('<meta name="robots" content="noindex, nofollow">'), 'aki/index.html: noindex');
assert.ok(!h.includes('\r'), 'aki/index.html: CRLF');
// 立場ごとの画面に h1 が1つずつ（見えるのはいつも1つ）。どれも main の中
const main = [h.indexOf('<main'), h.indexOf('</main>')];
const h1 = [...h.matchAll(/<h1\b/g)].map((m) => m.index);
assert.ok(h1.length >= 1 && h1.every((i) => i > main[0] && i < main[1]), 'aki/index.html: h1 inside main');
assert.doesNotMatch(h, /claude|artifact|takenoko-knowledge|my_projects/i, 'aki/index.html: internal notes left');
assert.doesNotMatch(h, /(?<![A-Za-z])[A-Z]:[\\/](?![\\/])/, 'aki/index.html: a path on this computer');
// 外のファイルを読まない（スクリプト・スタイル・字の形）。つなぐ先はページの中だけ
assert.doesNotMatch(h, /<script\b[^>]*\bsrc=|@import|url\(\s*['"]?(?:https?:)?\/\//i, 'aki/index.html: loads an outside file');
assert.deepEqual(h.match(/<link\b[^>]*>/g), ['<link rel="icon" href="data:,">'], 'aki/index.html: unexpected link');
const refs = [...h.matchAll(/(?<![\w-])(?:src|href)\s*=\s*["']([^"']+)["']/g)].map((m) => m[1]);
for (const u of refs) assert.match(u, /^(#[\w-]+|data:,)$/, `aki/index.html: unexpected reference ${u}`);
assert.doesNotMatch(h, /href\s*=\s*["']?(?:tel|mailto):/i, 'aki/index.html: a link that calls or mails');
// 外へ送らない。覚えるのは、このブラウザの中の1つの名前だけ
assert.doesNotMatch(h, /\bfetch\(|XMLHttpRequest|sendBeacon|WebSocket|EventSource|sessionStorage|indexedDB|document\.cookie|window\.open|\bimport\(/, 'aki/index.html: sends or keeps something outside');
assert.ok(h.includes("var KEY = 'akijokyo-demo-v3';"), 'aki/index.html: the storage name');
const store = h.match(/localStorage\.\w+\([^)]*\)?/g) || [];
assert.ok(store.length >= 1 && store.every((s) => /^localStorage\.(getItem|setItem|removeItem)\(KEY\b/.test(s)), `aki/index.html: storage other than the one name ${store}`);
// ほかのページからつながない
const names = (await fs.readdir(root)).filter((n) => n.endsWith('.html'));
for (const n of names) assert.doesNotMatch(await fs.readFile(path.join(root, n), 'utf8'), /(?<![\w-])aki\//, `${n}: links to aki/`);
assert.doesNotMatch(await fs.readFile(path.join(root, 'suryo', 'index.html'), 'utf8'), /(?<![\w-])aki\//, 'suryo/index.html: links to aki/');
console.log(JSON.stringify({ aki: 'PASS', references: refs.length, storage: store.length, pagesWithoutLink: names.length + 1 }));
