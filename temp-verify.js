process.env.RAPIDAPI_KEY = 'bb11b658a6msh4aedfa86cb702b9p1d3391jsncb6dc36cee7f';
process.env.RAPIDAPI_HOST = 'animals-by-api-ninjas.p.rapidapi.com';
const path = require('path');
const fn = require(path.join(process.cwd(), 'api', 'animal.js'));
const req = { url: '/api/animal?name=lion', method: 'GET' };
const res = {
  statusCode: 200,
  headers: {},
  body: '',
  setHeader(k, v) { this.headers[k] = v; },
  writeHead(code, headers) { this.statusCode = code; Object.assign(this.headers, headers); },
  end(chunk) { if (chunk) this.body += chunk || ''; console.log('RESULT', this.statusCode, JSON.stringify(this.headers), this.body); }
};
Promise.resolve(fn(req, res)).catch(err => { console.error('FUNC ERROR', err); process.exit(1); });
