// Minimal API gateway: one base URL for supabase-js, like the hosted project.
//   /auth/v1/*  → GoTrue      /rest/v1/* → PostgREST
import http from 'node:http';

const routes = [
  ['/auth/v1', Number(process.env.GOTRUE_PORT ?? 9999)],
  ['/rest/v1', Number(process.env.POSTGREST_PORT ?? 3000)],
];
const port = Number(process.env.GATEWAY_PORT ?? 54321);

http.createServer((req, res) => {
  const route = routes.find(([prefix]) => req.url.startsWith(prefix));
  if (req.method === 'OPTIONS') {
    res.writeHead(204, { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': '*' });
    return res.end();
  }
  if (!route) { res.writeHead(404); return res.end('no route'); }
  const [prefix, target] = route;
  const upstream = http.request(
    { host: '127.0.0.1', port: target, path: req.url.slice(prefix.length) || '/', method: req.method, headers: { ...req.headers, host: `127.0.0.1:${target}` } },
    (up) => {
      res.writeHead(up.statusCode ?? 502, { ...up.headers, 'access-control-allow-origin': '*' });
      up.pipe(res);
    },
  );
  upstream.on('error', (e) => { res.writeHead(502); res.end(String(e)); });
  req.pipe(upstream);
}).listen(port, '127.0.0.1', () => console.log(`gateway on :${port}`));
