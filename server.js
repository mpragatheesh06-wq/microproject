const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.sql': 'text/plain; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.pdf': 'application/pdf'
};

const server = http.createServer((req, res) => {
  // Normalize and sanitize requested URL path
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  let pathname = decodeURIComponent(parsedUrl.pathname);

  if (pathname === '/' || pathname === '') {
    pathname = '/index.html';
  }

  const filePath = path.normalize(path.join(PUBLIC_DIR, pathname));

  // Security check: ensure path is within PUBLIC_DIR
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    return;
  }

  const checkAndServe = (targetPath) => {
    fs.stat(targetPath, (err, stats) => {
      if (err) {
        // Try appending .html if no extension was provided
        if (!path.extname(targetPath) && !targetPath.endsWith('.html')) {
          const htmlCandidate = targetPath + '.html';
          if (fs.existsSync(htmlCandidate)) {
            return serveFile(htmlCandidate);
          }
        }
        console.log(`[404] ${req.method} ${pathname} -> Not found on disk (${targetPath})`);
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
        return;
      }

      let fileToRead = targetPath;
      if (stats.isDirectory()) {
        fileToRead = path.join(targetPath, 'index.html');
      }

      serveFile(fileToRead);
    });
  };

  const serveFile = (fileToRead) => {
    const ext = path.extname(fileToRead).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(fileToRead, (readErr, content) => {
      if (readErr) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('500 Internal Server Error');
        return;
      }

      console.log(`[200] ${req.method} ${pathname} -> ${path.basename(fileToRead)}`);
      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      });
      res.end(content);
    });
  };

  checkAndServe(filePath);
});

server.listen(PORT, () => {
  console.log(`SmartRoute Server running at http://localhost:${PORT}/`);
  console.log(`- Landing Page:     http://localhost:${PORT}/index.html`);
  console.log(`- User Portal:      http://localhost:${PORT}/user-portal.html`);
  console.log(`- DAA Algorithm:    http://localhost:${PORT}/daa-explain.html`);
  console.log(`- Admin Dashboard:  http://localhost:${PORT}/admin-dashboard.html`);
  console.log(`- Admin Login:      http://localhost:${PORT}/admin-login.html`);
});
