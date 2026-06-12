const http = require('http');

function del(path, cookie) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: 'localhost', port: 3000, path,
      method: 'DELETE',
      headers: cookie ? { Cookie: cookie } : {},
    };
    const req = http.request(opts, res => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => resolve({ status: res.statusCode }));
    });
    req.on('error', reject);
    req.end();
  });
}

function post(path, data) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: 'localhost', port: 3000, path,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    };
    const req = http.request(opts, res => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        const setCookie = res.headers['set-cookie'];
        resolve({ status: res.statusCode, cookie: setCookie ? setCookie[0] : null });
      });
    });
    req.on('error', reject);
    req.write(JSON.stringify(data));
    req.end();
  });
}

async function main() {
  const login = await post('/api/auth', { password: 'raamlabelaz' });
  const cookie = login.cookie;
  console.log('Login:', login.status);

  const ids = [
    'test-alpha', 'test-beta', 'test-gamma',
    'test-delta', 'test-epsilon', 'test-zeta',
  ];

  for (const id of ids) {
    const res = await del(`/api/artists/${id}`, cookie);
    console.log('Deleted', id, '→', res.status);
  }
}
main().catch(console.error);