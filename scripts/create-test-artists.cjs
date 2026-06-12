const http = require('http');

function post(path, data, cookie) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: 'localhost', port: 3000, path,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    };
    if (cookie) opts.headers.Cookie = cookie;
    const req = http.request(opts, res => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        const setCookie = res.headers['set-cookie'];
        resolve({ status: res.statusCode, body, cookie: setCookie ? setCookie[0] : cookie });
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

  const artists = [
    { id: 'test-alpha', name: 'Alpha', origin: 'US', role: 'DJ', genres: ['House'], bio: ['Test'], highlights: ['Test'], portfolio: [], socials: [], visual: { initials: 'AL', position: 'high', tone: 'from-stone-300/20' } },
    { id: 'test-beta', name: 'Beta Wave Long', origin: 'UK', role: 'Producer', genres: ['Techno'], bio: ['Test'], highlights: ['Test'], portfolio: [], socials: [], visual: { initials: 'BW', position: 'middle', tone: 'from-stone-300/20' } },
    { id: 'test-gamma', name: 'Gamma Ray', origin: 'DE', role: 'DJ', genres: ['Deep House'], bio: ['Test'], highlights: ['Test'], portfolio: [], socials: [], visual: { initials: 'GR', position: 'low', tone: 'from-stone-300/20' } },
    { id: 'test-delta', name: 'Delta', origin: 'FR', role: 'DJ', genres: ['Indie Dance'], bio: ['Test'], highlights: ['Test'], portfolio: [], socials: [], visual: { initials: 'DL', position: 'high', tone: 'from-stone-300/20' } },
    { id: 'test-epsilon', name: 'Epsilon', origin: 'JP', role: 'Producer', genres: ['Melodic House'], bio: ['Test'], highlights: ['Test'], portfolio: [], socials: [], visual: { initials: 'EP', position: 'middle', tone: 'from-stone-300/20' } },
    { id: 'test-zeta', name: 'Zeta', origin: 'BR', role: 'DJ', genres: ['House'], bio: ['Test'], highlights: ['Test'], portfolio: [], socials: [], visual: { initials: 'ZT', position: 'low', tone: 'from-stone-300/20' } },
  ];

  for (const a of artists) {
    const res = await post('/api/artists', a, cookie);
    console.log('Created', a.id, '→', res.status);
  }
}
main().catch(console.error);