// Runs 50 simulated Socket.IO users for 20 seconds against the local server.
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const { io } = require('socket.io-client');

const userCount = 50;
const durationMs = 20_000;
const movementIntervalMs = 500;
const serverUrl = process.env.LOAD_TEST_URL || `http://127.0.0.1:${process.env.PORT || 5000}`;
const clients = [];

if (process.env.USE_MONGO_PROXIMITY !== 'true') {
  console.error('Set USE_MONGO_PROXIMITY=true in server/.env and restart the server first.');
  process.exit(1);
}

const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function connectUser(index) {
  const socket = io(serverUrl, {
    transports: ['websocket'],
    reconnection: false,
    timeout: 8_000,
  });
  clients.push(socket);

  await new Promise((resolve, reject) => {
    socket.once('connect', resolve);
    socket.once('connect_error', reject);
  });

  const position = { x: 400 + (index % 40), y: 220 + (index % 40) };
  const joined = await new Promise((resolve, reject) => {
    socket.timeout(8_000).emit(
      'presence:join',
      { roomId: 'main', name: `Load${index}`, x: position.x, y: position.y },
      (error, response) => {
        if (error) return reject(error);
        if (!response?.ok) return reject(new Error(response?.error || 'join rejected'));
        return resolve(response);
      }
    );
  });

  return { socket, position, joined };
}

async function main() {
  const results = { connected: 0, movementAcks: 0, movementErrors: 0, skippedTicks: 0 };
  let users = [];
  let movementTimer;

  try {
    users = await Promise.all(Array.from({ length: userCount }, (_, index) => connectUser(index)));
    users.forEach((user) => { user.inFlight = false; });
    results.connected = users.length;
    console.log(`Connected users: ${results.connected}/${userCount}`);
    console.log(`Server: ${serverUrl}; Mongo proximity enabled on server.`);

    const startedAt = Date.now();
    movementTimer = setInterval(() => {
      for (const [index, user] of users.entries()) {
        if (user.inFlight) {
          results.skippedTicks += 1;
          continue;
        }

        user.position.x = 400 + ((user.position.x - 399 + 7) % 80);
        user.position.y = 200 + ((user.position.y - 199 + 5) % 80);
        user.inFlight = true;

        user.socket.timeout(5_000).emit(
          'presence:move',
          user.position,
          (error, response) => {
            user.inFlight = false;
            if (error || !response?.ok || response.proximitySource !== 'mongo') {
              results.movementErrors += 1;
            } else {
              results.movementAcks += 1;
            }
          }
        );
      }
    }, movementIntervalMs);

    await wait(durationMs);
    clearInterval(movementTimer);
    movementTimer = undefined;
    await wait(5_000);

    const elapsedSeconds = (Date.now() - startedAt - 5_000) / 1000;
    console.log(`Duration: ${Math.round(elapsedSeconds)} seconds`);
    console.log(`Successful Mongo-backed movement acknowledgements: ${results.movementAcks}`);
    console.log(`Failed movement acknowledgements: ${results.movementErrors}`);
    console.log(`Movement ticks skipped while a prior request was pending: ${results.skippedTicks}`);
    console.log(
      `Successful proximity queries per second (approx.): ${(results.movementAcks / elapsedSeconds).toFixed(1)}`
    );
    console.log('All simulated clients are disconnecting; server removes their Presence documents.');
  } finally {
    if (movementTimer) clearInterval(movementTimer);
    clients.forEach((socket) => socket.disconnect());
    await wait(500);
  }
}

main().catch((error) => {
  console.error('Mongo proximity load test failed:', error.message);
  process.exitCode = 1;
});
