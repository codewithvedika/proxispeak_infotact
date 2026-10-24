require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const Presence = require('../src/models/Presence');

async function main() {
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI is not set in server/.env');

  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 8000 });
  await Presence.init();

  const indexes = await Presence.collection.indexes();
  console.log(JSON.stringify(indexes, null, 2));

  const geo = indexes.find((index) => index.key?.position === '2d');
  const geoValid = geo && geo.min === 0 && geo.max === 1100;
  console.log(
    geoValid
      ? `✅ 2d index found: ${geo.name} (min ${geo.min}, max ${geo.max})`
      : '❌ 2d index missing or has unexpected bounds (expected min 0, max 1100)'
  );

  const ttl = indexes.find((index) => index.key?.updatedAt === 1 && index.expireAfterSeconds !== undefined);
  const ttlValid = ttl && ttl.expireAfterSeconds === 120;
  console.log(
    ttlValid
      ? `✅ TTL index found: ${ttl.name} (expires after ${ttl.expireAfterSeconds}s)`
      : '❌ updatedAt TTL index missing or not configured for 120 seconds'
  );

  if (!geoValid || !ttlValid) process.exitCode = 1;
}

main()
  .catch((error) => {
    console.error('Index verification failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
  });
