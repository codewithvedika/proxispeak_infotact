// Shared in-memory state for this Node instance.
module.exports = {
  users: new Map(),      // socketId -> { id, userId, name, color, roomId, x, y }
  neighbors: new Map(),  // socketId -> Set of socketIds currently within hearing radius
};
