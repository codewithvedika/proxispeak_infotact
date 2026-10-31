// Usage: node scripts/update-layout.js <obstacleId> <x> <y>
// Example: node scripts/update-layout.js desks 250 400
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const Room = require('../src/models/Room');
const defaultRoom = require('../src/config/defaultRoom');

const [obstacleId, rawX, rawY] = process.argv.slice(2);
const x = Number(rawX);
const y = Number(rawY);

if (!obstacleId || !Number.isFinite(x) || !Number.isFinite(y)) {
  console.error('Usage: node scripts/update-layout.js <obstacleId> <x> <y>');
  process.exit(1);
}

async function main() {
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI is not set in server/.env');

  try {
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 8000 });

    let room = await Room.findOne({ roomId: defaultRoom.roomId });
    if (!room) room = await Room.create(defaultRoom);

    const obstacle = room.obstacles.find((item) => item.id === obstacleId);
    if (!obstacle) {
      const available = room.obstacles.map((item) => item.id).join(', ');
      throw new Error(`Unknown obstacle "${obstacleId}". Available: ${available}`);
    }

    if (x < 0 || y < 0 || x + obstacle.w > room.width || y + obstacle.h > room.height) {
      throw new Error(`Obstacle must stay within the room bounds (width ${room.width}, height ${room.height})`);
    }

    obstacle.x = x;
    obstacle.y = y;
    room.updatedAt = new Date();
    await room.save();

    console.log(`Moved "${obstacleId}" to (${x}, ${y}). Refresh the app to see it.`);
  } finally {
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
  }
}

main().catch((error) => {
  console.error('Layout update failed:', error.message);
  process.exitCode = 1;
});
