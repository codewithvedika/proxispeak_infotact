const C = require('../../shared/constants.json');
const E = require('../../shared/events.json');
const tryRequire = require('../utils/tryRequire');
const { users, neighbors } = require('./state');

const Presence = tryRequire(() => require('../models/Presence'));
const mongoose = tryRequire(() => require('mongoose'));

const R = C.HEARING_RADIUS;

const useMongo = () =>
  process.env.USE_MONGO_PROXIMITY === 'true' &&
  Presence && mongoose && mongoose.connection.readyState === 1;

// --- Option 1: in-memory (always works) ---
function nearbyInMemory(user) {
  const out = [];
  for (const u of users.values()) {
    if (u.id === user.id || u.roomId !== user.roomId) continue;
    const d = Math.hypot(u.x - user.x, u.y - user.y);
    if (d <= R) out.push({ id: u.id, d });
  }
  return out.sort((a, b) => a.d - b.d).slice(0, C.MAX_PEERS).map((o) => o.id);
}

// --- Option 2: MongoDB geospatial $near on the 2d index (project doc requirement) ---
async function nearbyInMongo(user) {
  const docs = await Presence.find(
    {
      roomId: user.roomId,
      socketId: { $ne: user.id },
      position: { $near: [user.x, user.y], $maxDistance: R },
    },
    { socketId: 1 }
  ).limit(C.MAX_PEERS).lean();
  return docs.map((d) => d.socketId);
}

function setLink(io, a, b, on) {
  const ev = on ? E.PROXIMITY_ENTER : E.PROXIMITY_LEAVE;
  io.to(a).emit(ev, { peerId: b });
  io.to(b).emit(ev, { peerId: a });
  const other = neighbors.get(b);   // keep the other side symmetric if it is on this instance
  if (other) { if (on) other.add(a); else other.delete(a); }
}

const inflight = new Set();
const dirty = new Set();

async function updateProximity(io, user) {
  if (inflight.has(user.id)) { dirty.add(user.id); return; }
  inflight.add(user.id);
  try {
    do {
      dirty.delete(user.id);
      let ids;
      try {
        ids = useMongo() ? await nearbyInMongo(user) : nearbyInMemory(user);
      } catch (err) {
        console.error('proximity fallback to memory:', err.message);
        ids = nearbyInMemory(user);
      }
      if (!users.has(user.id)) break;           // user disconnected meanwhile
      const next = new Set(ids);
      const prev = neighbors.get(user.id) || new Set();
      neighbors.set(user.id, next);
      for (const id of next) if (!prev.has(id)) setLink(io, user.id, id, true);
      for (const id of prev) if (!next.has(id)) setLink(io, user.id, id, false);
    } while (dirty.has(user.id));
  } finally {
    inflight.delete(user.id);
  }
}

function removeFromProximity(io, id) {
  const mine = neighbors.get(id) || new Set();
  for (const peer of mine) {
    io.to(peer).emit(E.PROXIMITY_LEAVE, { peerId: id });
    const s = neighbors.get(peer);
    if (s) s.delete(id);
  }
  neighbors.delete(id);
  dirty.delete(id);
}

module.exports = { updateProximity, removeFromProximity, useMongo };
