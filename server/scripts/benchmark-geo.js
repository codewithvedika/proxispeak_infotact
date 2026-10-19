// Usage: npm run bench         (50 test users)
//        npm run bench -- 500 (500 test users)
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const connectDB = require('../src/db/connect');
const Presence = require('../src/models/Presence');

const userCount = Number(process.argv[2] || 50);
const width = 1000;
const height = 600;
const radius = 100;
const runId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
const roomId = `bench-${runId}`;
const sampleCount = 200;
const warmupCount = 20;

if (!Number.isInteger(userCount) || userCount < 1 || userCount > 100_000) {
  console.error('User count must be an integer between 1 and 100000.');
  process.exit(1);
}

async function measure(label, query) {
  for (let i = 0; i < warmupCount; i += 1) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    await query(x, y).lean().exec();
  }

  const durations = [];
  for (let i = 0; i < sampleCount; i += 1) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const startedAt = process.hrtime.bigint();
    await query(x, y).lean().exec();
    durations.push(Number(process.hrtime.bigint() - startedAt) / 1e6);
  }

  durations.sort((a, b) => a - b);
  const average = durations.reduce((sum, value) => sum + value, 0) / durations.length;
  const p95 = durations[Math.ceil(durations.length * 0.95) - 1];
  console.log(
    `${label.padEnd(11)} avg ${average.toFixed(2)} ms | p95 ${p95.toFixed(2)} ms | max ${durations.at(-1).toFixed(2)} ms (round trip incl. network)`
  );
}

async function run() {
  const connected = await connectDB();
  if (!connected) throw new Error('Could not connect to MongoDB; check MONGO_URI.');

  try {
    await Presence.init();
    const documents = Array.from({ length: userCount }, (_, index) => ({
      socketId: `${runId}-${index}`,
      roomId,
      name: `Bench${index}`,
      position: [Math.random() * width, Math.random() * height],
    }));

    await Presence.insertMany(documents, { ordered: true });
    console.log(`Inserted ${documents.length} temporary presence documents in ${roomId}.`);

    await measure('$near', (x, y) =>
      Presence.find({
        roomId,
        position: { $near: [x, y], $maxDistance: radius },
      })
    );

    await measure('$geoWithin', (x, y) =>
      Presence.find({
        roomId,
        position: { $geoWithin: { $center: [[x, y], radius] } },
      })
    );

    const explain = await Presence.find({
      roomId,
      position: { $near: [width / 2, height / 2], $maxDistance: radius },
    }).explain('executionStats');

    console.log(
      'Server-side executionTimeMillis ($near):',
      explain.executionStats.executionTimeMillis
    );
    const plan = explain.queryPlanner.winningPlan;
    const stages = [];
    const indexNames = new Set();
    function collectPlanDetails(node) {
      if (!node || typeof node !== 'object') return;
      if (node.stage) stages.push(node.stage);
      if (node.indexName) indexNames.add(node.indexName);
      for (const value of Object.values(node)) {
        if (Array.isArray(value)) value.forEach(collectPlanDetails);
        else if (value && typeof value === 'object') collectPlanDetails(value);
      }
    }
    collectPlanDetails(plan);
    console.log('Winning plan stages:', [...new Set(stages)].join(' -> '));
    console.log('Indexes used:', [...indexNames].join(', ') || 'see explain output');
  } finally {
    const cleanup = await Presence.deleteMany({ roomId });
    console.log(`Removed ${cleanup.deletedCount} temporary presence documents.`);
    await mongoose.disconnect();
  }
}

run().catch((error) => {
  console.error('Geospatial benchmark failed:', error.message);
  process.exitCode = 1;
});
