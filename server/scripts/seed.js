require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const connectDB = require('../src/db/connect');
const Room = require('../src/models/Room');
const Presence = require('../src/models/Presence');
const defaultRoom = require('../src/config/defaultRoom');

async function seed() {
  const connected = await connectDB();
  if (!connected) throw new Error('Could not connect to MongoDB; check MONGO_URI');

  await Presence.init();
  await Room.findOneAndUpdate(
    { roomId: defaultRoom.roomId },
    { $set: defaultRoom },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  console.log('Seeded room:', defaultRoom.roomId);
  console.log('Presence indexes:', await Presence.collection.indexes());
}

seed()
  .catch((error) => {
    console.error('Seed failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
  });
