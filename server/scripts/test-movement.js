const { io } = require('socket.io-client');
const E = require('../../shared/events.json');

const URL = process.env.URL || 'http://localhost:5000';
const mk = (name) => io(URL, { query: { name }, transports: ['websocket'] });
const a = mk('Alice');
const b = mk('Bob');
const wait = (s) => new Promise((r) => s.on('connect', r));
const ok = (m) => console.log('✅', m);

let bPos = null;
let sawLeave = false;

b.on(E.USERS_CURRENT, (list) => { bPos = list.find((u) => u.id === b.id); });

b.on(E.MOVEMENT_UPDATED, ({ id, x, y }) => {
  if (id === a.id) ok(`Bob received Alice's movement (${x}, ${y})`);
});

b.on(E.PROXIMITY_LEAVE, ({ peerId }) => {
  if (peerId !== a.id || sawLeave) return;
  sawLeave = true;
  ok('Bob got proximity:leave after Alice walked far away');
  a.emit(E.MOVEMENT_UPDATE, { x: bPos.x, y: bPos.y });   // walk back next to Bob
});

b.on(E.PROXIMITY_ENTER, ({ peerId }) => {
  if (peerId === a.id && sawLeave) {
    ok('Bob got proximity:enter when Alice came back');
    console.log('\nALL CHECKS PASSED');
    process.exit(0);
  }
});

(async () => {
  await Promise.all([wait(a), wait(b)]);
  await new Promise((r) => setTimeout(r, 700));
  a.emit(E.MOVEMENT_UPDATE, { x: 900, y: 500 });
})();

setTimeout(() => { console.error('❌ TIMEOUT: not all events were received'); process.exit(1); }, 8000);
