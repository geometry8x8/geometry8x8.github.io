// build.js
// Сборка статического сайта из шаблона + словарей.
// Запуск: node build.js
// Зависимостей нет намеренно — минимальная поверхность атаки, ничего не устаревает.

const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, 'src');
const DIST = path.join(__dirname, 'dist');
const SITE_URL = 'https://geometry.kg';

const LOCALES = [
  { key: 'ru', outDir: '' },   // корень домена
  { key: 'kg', outDir: 'kg' },
  { key: 'en', outDir: 'en' }
];

function readJSON(p) {
  return JSON.parse(fs.readFileSync(p, 'utf-8'));
}

function rimraf(dir) {
  if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
}

function copyDir(src, dst) {
  fs.mkdirSync(dst, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dst, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

function buildLangSwitch(currentKey) {
  const paths = { ru: '/', kg: '/kg/', en: '/en/' };
  const labels = { ru: 'RU', kg: 'KG', en: 'EN' };
  return Object.keys(paths).map(key => {
    const cls = key === currentKey ? ' class="active"' : '';
    return `<a href="${paths[key]}"${cls}>${labels[key]}</a>`;
  }).join('');
}

function buildAltLinks(currentKey) {
  const hreflangMap = { ru: 'ru', kg: 'ky', en: 'en' };
  const paths = { ru: '/', kg: '/kg/', en: '/en/' };
  const lines = Object.keys(paths).map(key =>
    `<link rel="alternate" hreflang="${hreflangMap[key]}" href="${SITE_URL}${paths[key]}">`
  );
  lines.push(`<link rel="canonical" href="${SITE_URL}${paths[currentKey]}">`);
  return lines.join('\n');
}

function render(template, dict) {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    if (Object.prototype.hasOwnProperty.call(dict, key)) return dict[key];
    console.warn(`[build] нет значения для ключа {{${key}}}`);
    return match;
  });
}

function main() {
  rimraf(DIST);
  fs.mkdirSync(DIST, { recursive: true });

  const template = fs.readFileSync(path.join(SRC, 'templates', 'page.template.html'), 'utf-8');

  for (const locale of LOCALES) {
    const dict = readJSON(path.join(SRC, 'locales', `${locale.key}.json`));

    const computed = {
      ...dict,
      LANG_SWITCH: buildLangSwitch(locale.key),
      ALT_LINKS: buildAltLinks(locale.key)
    };

    const html = render(template, computed);

    const outDir = path.join(DIST, locale.outDir);
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, 'index.html'), html, 'utf-8');
    console.log(`[build] ${locale.key} -> dist/${locale.outDir}/index.html`);
  }

  copyDir(path.join(SRC, 'assets'), path.join(DIST, 'assets'));

  const cnamePath = path.join(__dirname, 'CNAME');
  if (fs.existsSync(cnamePath)) {
    fs.copyFileSync(cnamePath, path.join(DIST, 'CNAME'));
  }

  console.log('[build] готово: dist/');
}

main();
