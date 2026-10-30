// Copies website/assets/league.css into the <style> block between the league-css markers of each page.
// Why: a separate stylesheet blocks the whole page while it downloads, so one slow request could leave
// the site blank. Inlined, the styles arrive with the HTML. Edit assets/league.css, then run:
//   node tools/inline-league-css.mjs
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
const cssPath = path.join(root, 'website', 'assets', 'league.css');
const pages = ['index.html', 'register.html', 'register-team.html'].map(p => path.join(root, 'website', p));

const css = fs.readFileSync(cssPath, 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .split('\n').map(l => l.trim()).filter(Boolean).join('\n');
if (css.includes('</style')) throw new Error('league.css must not contain a closing style tag');

const START = '<!-- league-css:start -->';
const END = '<!-- league-css:end -->';
const block = `${START}\n<style id="league-css">\n${css}\n</style>\n${END}`;
const LINK = '<link rel="stylesheet" href="assets/league.css">';

for (const page of pages) {
  let html = fs.readFileSync(page, 'utf8');
  if (html.includes(START)) {
    html = html.replace(new RegExp(`${START}[\s\S]*?${END}`), () => block);
  } else if (html.includes(LINK)) {
    html = html.replace(LINK, () => block);
  } else {
    throw new Error(`${path.basename(page)}: no league-css markers or stylesheet link found`);
  }
  fs.writeFileSync(page, html);
  console.log(`${path.basename(page)}: league.css inlined (${(css.length / 1024).toFixed(1)} KB)`);
}
