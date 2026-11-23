const http = require('http');
const fs = require('fs');
const path = require('path');

let PORT = parseInt(process.env.PORT || '5173', 10);
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

const server = http.createServer((req, res) => {
  let reqPath = decodeURI(req.url.split('?')[0]);

  // Route matching
  if (reqPath === '/' || reqPath === '') {
    reqPath = '/index.html';
  } else if (reqPath === '/collections' || reqPath === '/collections/') {
    reqPath = '/collections.html';
  } else if (reqPath === '/deals' || reqPath === '/deals/' || reqPath === '/offers' || reqPath === '/offers/') {
    reqPath = '/deals.html';
  } else if (reqPath.startsWith('/products/') || reqPath.startsWith('/product/') || reqPath === '/products' || reqPath === '/product') {
    reqPath = '/product.html';
  }

  let filePath = path.join(__dirname, reqPath);

  fs.stat(filePath, (err, stats) => {
    // If exact path not found, try appending .html if there is no extension
    if ((err || !stats || !stats.isFile()) && !path.extname(reqPath)) {
      const htmlCandidate = filePath + '.html';
      if (fs.existsSync(htmlCandidate)) {
        filePath = htmlCandidate;
        err = null;
      }
    }

    // Fallback for product dynamic routes
    if ((err || !stats || !stats.isFile()) && (reqPath.startsWith('/products/') || reqPath.startsWith('/product/'))) {
      filePath = path.join(__dirname, 'product.html');
      err = null;
    }

    fs.stat(filePath, (err2, stats2) => {
      if (err2 || !stats2 || !stats2.isFile()) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('404 Not Found');
        return;
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      res.writeHead(200, {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache'
      });

      fs.createReadStream(filePath).pipe(res);
    });
  });
});

function startServer(port) {
  server.listen(port, () => {
    console.log(`\n  ⚡ VAPE HOUSE Dev Server running at:`);
    console.log(`  > Local:   http://localhost:${port}/\n`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`  Port ${port} is currently active. Ready at: http://localhost:${port}/`);
    } else {
      console.error(err);
    }
  });
}

startServer(PORT);
