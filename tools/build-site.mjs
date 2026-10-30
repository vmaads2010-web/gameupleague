// Builds the pages so they never depend on one slow download:
//  1. copies website/assets/league.css into the league-css markers of each page (styles arrive with the HTML)
//  2. copies website/content.json into the gul-data marker of index.html (a backup copy the page uses
//     only if downloading content.json fails; the page always tries the live file first)
// The deploy workflow runs this on every push, so editing content.json or league.css is enough.
// To check locally:  node tools/build-site.mjs
import fs from 'node:fs';
import path from 'node:path';

const here = new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const root = path.resolve(path.dirname(here), '..');
const site = path.join(root, 'website');

function swap(html, start, end, block, label, fallbackLink) {
  const i = html.indexOf(start);
  const j = html.indexOf(end);
  if (i >= 0 && j > i) return html.slice(0, i) + block + html.slice(j + end.length);
  if (fallbackLink && html.includes(fallbackLink)) return html.replace(fallbackLink, () => block);
  throw new Error('markers for ' + label + ' not found');
}

// ---- styles
const css = fs.readFileSync(path.join(site, 'assets', 'league.css'), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .split('\n').map(l => l.trim()).filter(Boolean).join('\n');
if (css.includes('</style')) throw new Error('league.css must not contain a closing style tag');
const cssBlock = '<!-- league-css:start -->\n<style id="league-css">\n' + css + '\n</style>\n<!-- league-css:end -->';
const LINK = '<link rel="stylesheet" href="assets/league.css">';

for (const name of ['index.html', 'register.html', 'register-team.html']) {
  const file = path.join(site, name);
  const before = fs.readFileSync(file, 'utf8');
  const after = swap(before, '<!-- league-css:start -->', '<!-- league-css:end -->', cssBlock, name + ' styles', LINK);
  if (!after.includes(css.split('\n').pop())) throw new Error(name + ': styles did not land');
  fs.writeFileSync(file, after);
  console.log(name + ' styles: ' + (after === before ? 'already up to date' : 'updated') + ' (' + (css.length / 1024).toFixed(1) + ' KB)');
}

// ---- data backup copy (index only)
const data = JSON.stringify(JSON.parse(fs.readFileSync(path.join(site, 'content.json'), 'utf8')))
  .replace(/</g, '\\u003c');
const dataBlock = '<!-- gul-data:start -->\n<script type="application/json" id="gul-data">' + data + '</script>\n<!-- gul-data:end -->';
const indexFile = path.join(site, 'index.html');
const indexBefore = fs.readFileSync(indexFile, 'utf8');
const indexAfter = swap(indexBefore, '<!-- gul-data:start -->', '<!-- gul-data:end -->', dataBlock, 'index data');
fs.writeFileSync(indexFile, indexAfter);
console.log('index.html data: ' + (indexAfter === indexBefore ? 'already up to date' : 'updated') + ' (' + (data.length / 1024).toFixed(1) + ' KB)');
