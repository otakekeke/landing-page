// 2026-11-19: suryo/ は「下水道の数量拾い」の試作品（架空の図面で動く見本）。住所を知っている人だけが開く。
// 元は takenokonoko/豊川市_下水道数量拾い/demo にある（ここでは直さない）。直す時は元で
// node tools/test_core.cjs・node tools/compare_ui.cjs <前の版>・node tools/check_flow.cjs を通してから、3つのファイルをそのまま写す。
// ここで見ること：検索に出さない・ほかのページからつながない・外のファイルを読まない・内部のメモが残っていない・見本の図面が2つある。
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dir = path.join(root, 'suryo');
const h = await fs.readFile(path.join(dir, 'index.html'), 'utf8');
assert.match(h, /^<!doctype html>\n<html lang="ja">/, 'suryo/index.html: document start');
assert.ok(h.includes('<meta name="robots" content="noindex, nofollow">'), 'suryo/index.html: noindex');
assert.ok(!h.includes('\r'), 'suryo/index.html: CRLF');
assert.equal((h.match(/<h1\b/g) || []).length, 1, 'suryo/index.html: one H1');
assert.doesNotMatch(h, /claude|artifact|takenoko-knowledge|my_projects/i, 'suryo/index.html: internal notes left');
assert.doesNotMatch(h, /(?<![A-Za-z])[A-Z]:[\\/](?![\\/])/, 'suryo/index.html: a path on this computer');
// 外のファイルを読まない（スクリプト・スタイル・字の形）。図面を読むのは、このフォルダの見本の2つだけ
assert.doesNotMatch(h, /<script\b[^>]*\bsrc=|<link\b|@import|url\(\s*['"]?(?:https?:)?\/\//i, 'suryo/index.html: loads an outside file');
assert.equal((h.match(/\bfetch\(/g) || []).length, 1, 'suryo/index.html: fetch is used only for the sample drawings');
assert.ok(h.includes("['sample-heimen.dxf', 'sample-judan.dxf'].map(function (n) { return fetch(n)"), 'suryo/index.html: the sample drawings are read from this folder');
// 画面の作り（script の前）のつなぐ先は、ページの中・見本の図面・サイトのトップだけ
const markup = h.slice(0, h.indexOf('<script'));
const refs = [...markup.matchAll(/(?<![\w-])(?:src|href)="([^"]+)"/g)].map((m) => m[1]);
for (const u of refs) assert.match(u, /^(#[\w-]+|sample-(heimen|judan)\.dxf|https:\/\/takenokonoko\.com\/)$/, `suryo/index.html: unexpected reference ${u}`);
for (const f of ['sample-heimen.dxf', 'sample-judan.dxf']) {
  const b = await fs.readFile(path.join(dir, f));
  assert.ok(b.length > 1000 && b.includes('EOF'), `suryo/${f}: a DXF file`);
}
// ほかのページからつながない
const names = (await fs.readdir(root)).filter((n) => n.endsWith('.html'));
for (const n of names) assert.ok(!(await fs.readFile(path.join(root, n), 'utf8')).includes('suryo'), `${n}: links to suryo/`);
console.log(JSON.stringify({ suryo: 'PASS', references: refs.length, pagesWithoutLink: names.length }));
