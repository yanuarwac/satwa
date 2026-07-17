const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;

function readEnv() {
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) {
    return {};
  }

  const env = {};
  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const equalIndex = trimmed.indexOf('=');
    if (equalIndex === -1) continue;

    const key = trimmed.slice(0, equalIndex).trim();
    const value = trimmed.slice(equalIndex + 1).trim();
    env[key] = value;
  }

  return env;
}

const env = readEnv();
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || env.RAPIDAPI_KEY || '';
const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST || env.RAPIDAPI_HOST || 'animals-by-api-ninjas.p.rapidapi.com';

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data));
}

function serveStaticFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8'
  };

  if (!fs.existsSync(filePath)) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not Found');
    return;
  }

  const content = fs.readFileSync(filePath);
  res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
  res.end(content);
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

  if (req.method === 'GET' && url.pathname === '/api/animal') {
    const animalName = url.searchParams.get('name')?.trim();

    if (!animalName) {
      return sendJson(res, 400, { error: 'Parameter name is required' });
    }

    if (!RAPIDAPI_KEY) {
      return sendJson(res, 500, { error: 'RAPIDAPI_KEY is not configured on the server.' });
    }

    try {
      console.log('[api] request for', animalName);
      const upstreamUrl = `https://animals-by-api-ninjas.p.rapidapi.com/v1/animals?name=${encodeURIComponent(animalName)}`;

      const urlObj = new URL(upstreamUrl);
      const reqOptions = {
        hostname: urlObj.hostname,
        path: urlObj.pathname + urlObj.search,
        method: 'GET',
        headers: {
          'x-rapidapi-key': RAPIDAPI_KEY,
          'x-rapidapi-host': RAPIDAPI_HOST,
          'Content-Type': 'application/json'
        }
      };

      const upstreamData = await new Promise((resolve, reject) => {
        const reqUp = https.request(reqOptions, (upRes) => {
          let body = '';
          upRes.on('data', (chunk) => (body += chunk));
          upRes.on('end', () => {
            try {
              const parsed = JSON.parse(body);
              resolve({ statusCode: upRes.statusCode, body: parsed });
            } catch (e) {
              resolve({ statusCode: upRes.statusCode, body });
            }
          });
        });

        reqUp.on('error', (err) => reject(err));
        reqUp.end();
      });

      console.log('[api] upstream status', upstreamData.statusCode);
      try {
        console.log('[api] upstream body preview', JSON.stringify(upstreamData.body).slice(0, 500));
      } catch (e) {}

      return sendJson(res, upstreamData.statusCode >= 200 && upstreamData.statusCode < 300 ? 200 : upstreamData.statusCode, upstreamData.body);
    } catch (error) {
      return sendJson(res, 500, { error: error.message });
    }
  }

  if (req.method === 'GET' && url.pathname === '/') {
    return serveStaticFile(res, path.join(__dirname, 'index.html'));
  }

  if (req.method === 'GET' && (url.pathname === '/index.html' || url.pathname === '/index.js' || url.pathname === '/style.css')) {
    return serveStaticFile(res, path.join(__dirname, url.pathname.replace(/^\//, '')));
  }

  if (req.method === 'GET' && url.pathname === '/health') {
    return sendJson(res, 200, { ok: true });
  }

  return serveStaticFile(res, path.join(__dirname, 'index.html'));
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
