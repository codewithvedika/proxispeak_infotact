// Usage: npm run load            (50 simulated users)
//        npm run load -- 100
const { io } = require('socket.io-client');
const E = require('../../shared/events.json');

const URL = process.env.URL || 'http://localhost:5000';
const N = Number(process.argv[2] || 50);
const SECONDS = 20;

let moves = 0, enters = 0, leaves = 0, connected = 0;
const clients = [];

for (let i = 0; i < N; i++) {
  const s = io(URL, { query: { name: `bot${i}` }, transports: ['websocket'] });
  let x = Math.random() * 1000, y = Math.random() * 600;
  s.on('connect', () => { connected++; });
  s.on(E.MOVEMENT_UPDATED, () => { moves++; });
  s.on(E.PROXIMITY_ENTER, () => { enters++; });
  s.on(E.PROXIMITY_LEAVE, () => { leaves++; });
  const timer = setInterval(() => {
    x = Math.min(1000, Math.max(0, x + (Math.random() - 0.5) * 30));
    y = Math.min(600, Math.max(0, y + (Math.random() - 0.5) * 30));
    s.emit(E.MOVEMENT_UPDATE, { x, y });
  }, 100);
  clients.push({ s, timer });
}

setTimeout(() => {
  clients.forEach(({ s, timer }) => { clearInterval(timer); s.disconnect(); });
  console.log(`Users connected: ${connected}/${N}`);
  console.log(`movement:updated received: ${moves} (${(moves / SECONDS).toFixed(0)}/s)`);
  console.log(`proximity:enter ${enters} · proximity:leave ${leaves}`);
  process.exit(0);
}, SECONDS * 1000);
