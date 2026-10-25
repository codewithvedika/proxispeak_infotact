const C = require('../../shared/constants.json');
const E = require('../../shared/events.json');
const tryRequire = require('../utils/tryRequire');
const { users } = require('./state');
const { updateProximity, removeFromProximity, useMongo } = require('./proximity');

const presence = tryRequire(() => require('../services/presence')) || {
  queuePresence() {},
  removePresence() {},
};
const Presence = tryRequire(() => require('../models/Presence'));

const COLORS = ['#e6194b', '#3cb44b', '#4363d8', '#f58231', '#911eb4', '#42d4f4', '#f032e6', '#bfef45'];
const colorFor = (id) => {
  let h = 0;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return COLORS[h % COLORS.length];
};
const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

// In multi-instance mode, users on other Node instances live only in MongoDB presence.
async function getRoomUsers(roomId) {
  const map = new Map();
  if (useMongo()) {
    try {
      const docs = await Presence.find({ roomId }).limit(200).lean();
      for (const d of docs) {
        map.set(d.socketId, { id: d.socketId, name: d.name, color: d.color, roomId, x: d.position[0], y: d.position[1] });
      }
    } catch (err) { console.error('getRoomUsers:', err.message); }
  }
  for (const u of users.values()) if (u.roomId === roomId) map.set(u.id, u); // local data is fresher
  return [...map.values()];
}

module.exports = function registerMovement(io, socket) {
  const q = socket.handshake.query;
  const roomId = String(q.roomId || C.DEFAULT_ROOM);
  const user = {
    id: socket.id,
    userId: q.userId || null,
    name: String(q.name || 'Guest').slice(0, 20),
    color: colorFor(socket.id),
    roomId,
    x: C.SPAWN_X + Math.random() * 40,
    y: C.SPAWN_Y + Math.random() * 40,
  };

  users.set(socket.id, user);
  socket.join(roomId);

  socket.on(E.MOVEMENT_UPDATE, (p) => {
    if (!p || !Number.isFinite(p.x) || !Number.isFinite(p.y)) return;   // validation
    user.x = clamp(p.x, 0, C.MAP_WIDTH);
    user.y = clamp(p.y, 0, C.MAP_HEIGHT);
    socket.to(roomId).emit(E.MOVEMENT_UPDATED, { id: user.id, x: user.x, y: user.y });
    presence.queuePresence(user);
    updateProximity(io, user);
  });

  socket.on('disconnect', () => {
    removeFromProximity(io, user.id);
    users.delete(user.id);
    presence.removePresence(user.id);
    io.to(roomId).emit(E.USERS_LEFT, { id: user.id });
  });

  getRoomUsers(roomId).then((list) => socket.emit(E.USERS_CURRENT, list));
  socket.to(roomId).emit(E.USERS_JOINED, user);
  presence.queuePresence(user);
  updateProximity(io, user);
};
