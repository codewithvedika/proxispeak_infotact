const { io } = require('socket.io-client');
const E = require('../../shared/events.json');

const URL = process.env.URL || 'http://localhost:5000';
const mk = (name) => io(URL, { query: { name }, transports: ['websocket'] });
const a = mk('Alice');
const b = mk('Bob');
const wait = (s) => new Promise((r) => s.on('connect', r));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let farPhase = false;
let gotNear = false;
let gotFar = false;

b.on(E.WEBRTC_OFFER, (m) => {
  if (m.from !== a.id) return;
  if (!farPhase) { gotNear = true; console.log('✅ Offer relayed while users are in range'); }
  else gotFar = true;
});

(async () => {
  await Promise.all([wait(a), wait(b)]);
  await sleep(700);
  a.emit(E.WEBRTC_OFFER, { to: b.id, sdp: { type: 'offer', sdp: 'test' } });   // in range
  await sleep(700);
  farPhase = true;
  a.emit(E.MOVEMENT_UPDATE, { x: 900, y: 500 });                               // walk far away
  await sleep(700);
  a.emit(E.WEBRTC_OFFER, { to: b.id, sdp: { type: 'offer', sdp: 'test' } });   // out of range
  await sleep(700);
  if (gotNear && !gotFar) {
    console.log('✅ Offer BLOCKED when users are out of range');
    console.log('\nSIGNALING TESTS PASSED');
    process.exit(0);
  }
  console.error('❌ FAILED', { gotNear, gotFar });
  process.exit(1);
})();
