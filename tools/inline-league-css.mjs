// Copies website/assets/league.css into the <style> block between the league-css markers of each page.
// Why: a separate stylesheet blocks the whole page while it downloads, so one slow request could leave
// the site blank. Inlined, the styles arrive with the HTML. Edit assets/league.css, then run:
//   node tools/inline-league-css.mjs
import fs from 'node:fs';
import path from 'node:path';

const here = new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const root = path.resolve(path.dirname(here), '..');
const cssPath = path.join(root, 'website', 'assets', 'league.css');
const pages = ['index.html', 'register.html', 'register-team.html'].map(p => path.join(root, 'website', p));

const css = fs.readFileSync(cssPath, 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .split('\n').map(l => l.trim()).filter(Boolean).join('\n');
if (css.includes('</style')) throw new Error('league.css must not contain a closing style tag');

const START = '<!-- league-css:start -->';
const END = '<!-- league-css:end -->';
const LINK = '<link rel="stylesheet" href="assets/league.css">';
const block = START + '\n<style id="league-css">\n' + css + '\n</style>\n' + END;
const lastLine = css.split('\n').pop();

for (const page of pages) {
  const before = fs.readFileSync(page, 'utf8');
  let html = before;
  const i = html.indexOf(START);
  const j = html.indexOf(END);
  if (i >= 0 && j > i) {
    html = html.slice(0, i) + block + html.slice(j + END.length);
  } else if (html.includes(LINK)) {
    html = html.replace(LINK, () => block);
  } else {
    throw new Error(path.basename(page) + ': no league-css markers or stylesheet link found');
  }
  if (!html.includes(lastLine)) throw new Error(path.basename(page) + ': the inlined CSS did not land');
  fs.writeFileSync(page, html);
  console.log(path.basename(page) + ': ' + (html === before ? 'already up to date' : 'updated') + ' (' + (css.length / 1024).toFixed(1) + ' KB)');
}
