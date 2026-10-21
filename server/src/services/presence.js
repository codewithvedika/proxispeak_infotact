const mongoose = require('mongoose');
const Presence = require('../models/Presence');

const PRESENCE_FLUSH_MS = 300;
const HEARTBEAT_MS = 30_000;
const pending = new Map();
let activeUsersProvider = () => [];

const dbUp = () => mongoose.connection.readyState === 1;

function validPosition(x, y) {
  return Number.isFinite(x) && Number.isFinite(y) && x >= 0 && x <= 1100 && y >= 0 && y <= 1100;
}

// Called on every movement. Only the most recent position for each socket is retained.
function queuePresence(user) {
  if (!user || !user.id || !validPosition(user.x, user.y)) return false;
  pending.set(user.id, {
    socketId: user.id,
    roomId: user.roomId || 'main',
    name: String(user.name || '').trim().slice(0, 20),
    color: user.color,
    position: [user.x, user.y],
  });
  return true;
}

// Write all queued users together instead of issuing one database write per movement event.
async function flush() {
  if (!dbUp() || pending.size === 0) return { acknowledged: false, queued: pending.size };

  const documents = [...pending.values()];
  pending.clear();
  const operations = documents.map((document) => ({
    updateOne: {
      filter: { socketId: document.socketId },
      update: { $set: { ...document, updatedAt: new Date() } },
      upsert: true,
    },
  }));

  try {
    return await Presence.bulkWrite(operations, { ordered: false });
  } catch (error) {
    // Preserve the latest known values so a temporary Atlas failure does not lose them.
    documents.forEach((document) => pending.set(document.socketId, document));
    console.error('Presence flush failed:', error.message);
    return { acknowledged: false, error };
  }
}

async function removePresence(socketId) {
  pending.delete(socketId);
  if (!dbUp()) return { acknowledged: false };

  try {
    return await Presence.deleteOne({ socketId });
  } catch (error) {
    console.error('Presence removal failed:', error.message);
    return { acknowledged: false, error };
  }
}

async function findNearby(socketId, roomId, x, y, radius = 100, limit = 8) {
  if (!dbUp()) throw new Error('database unavailable');
  return Presence.find({
    roomId,
    socketId: { $ne: socketId },
    position: { $near: [x, y], $maxDistance: radius },
  })
    .limit(limit)
    .lean();
}

// The Socket.IO owner registers its connected-user store once during server setup.
function setActiveUsersProvider(provider) {
  if (typeof provider !== 'function') throw new TypeError('active user provider must be a function');
  activeUsersProvider = provider;
}

setInterval(() => void flush(), PRESENCE_FLUSH_MS).unref();
setInterval(() => {
  for (const user of activeUsersProvider()) queuePresence(user);
}, HEARTBEAT_MS).unref();

module.exports = { queuePresence, removePresence, findNearby, flush, setActiveUsersProvider };
