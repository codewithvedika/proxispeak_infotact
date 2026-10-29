// Usage: node scripts/update-layout.js <obstacleId> <x> <y>
// Example: node scripts/update-layout.js desks 250 400
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Room = require('../src/models/Room');
const defaultRoom = require('../src/config/defaultRoom');

const [id, x, y] = process.argv.slice(2);
if (!id || !Number.isFinite(Number(x)) || !Number.isFinite(Number(y))) {
  console.log('Usage: node scripts/update-layout.js <obstacleId> <x> <y>');
  process.exit(1);
}

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  let room = await Room.findOne({ roomId: 'main' });
  if (!room) room = await Room.create(defaultRoom);
  const o = room.obstacles.find((item) => item.id === id);
  if (!o) {
    console.log('Unknown obstacle. Available:', room.obstacles.map((item) => item.id).join(', '));
  } else {
    o.x = Number(x);
    o.y = Number(y);
    room.updatedAt = new Date();
    await room.save();
    console.log(`Moved "${id}" to (${x}, ${y}). Refresh the app to see it.`);
  }
  await mongoose.disconnect();
})().catch((e) => { console.error(e); process.exit(1); });

