// preview.js
// Локальный HTTP-сервер для проверки dist/ так, как его отдаёт GitHub Pages
// (абсолютные пути /assets/... резолвятся от корня сайта, а не от диска,
// как это происходит при открытии файла напрямую через file://).
// Запуск: node preview.js  ->  http://localhost:5000

const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, 'dist');
const PORT = 5000;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.json': 'application/json; charset=utf-8'
};

if (!fs.existsSync(ROOT)) {
  console.error('[preview] dist/ не найдена. Сначала выполни: node build.js');
  process.exit(1);
}

const server = http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  if (urlPath.endsWith('/')) urlPath += 'index.html';

  const filePath = path.join(ROOT, urlPath);

  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 — файл не найден: ' + urlPath);
      return;
    }
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`[preview] http://localhost:${PORT}/       (RU)`);
  console.log(`[preview] http://localhost:${PORT}/kg/     (KG)`);
  console.log(`[preview] http://localhost:${PORT}/en/     (EN)`);
  console.log('[preview] Ctrl+C — остановить сервер');
});
