const E = require('../../shared/events.json');
const { neighbors } = require('./state');

// Relays WebRTC messages only between users who are currently within the hearing radius.
module.exports = function registerSignaling(io, socket) {
  const relay = (event) => {
    socket.on(event, (payload) => {
      const to = payload && payload.to;
      if (!to || typeof to !== 'string') return;
      const targetIsLocal = io.sockets.sockets.has(to);
      const mine = neighbors.get(socket.id);
      // If the target is on another Node instance we cannot check it locally, so allow it.
      if (targetIsLocal && !(mine && mine.has(to))) return;
      io.to(to).emit(event, { ...payload, from: socket.id });
    });
  };
  [E.WEBRTC_OFFER, E.WEBRTC_ANSWER, E.WEBRTC_ICE].forEach(relay);
};
