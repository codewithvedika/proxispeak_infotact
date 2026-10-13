const Position = require('../models/Position');

async function updatePosition(userId, roomId, x, y) {
  return Position.updateOne(
    { userId, roomId },
    { $set: { loc: [x, y], updatedAt: new Date() } },
    { upsert: true }
  );
}

async function findNearby(userId, roomId, x, y, radius = 100, limit = 8) {
  return Position.find({
    roomId,
    userId: { $ne: userId },
    loc: { $near: [x, y], $maxDistance: radius },
  }).limit(limit).lean();
}

async function removePosition(userId, roomId) {
  return Position.deleteOne({ userId, roomId });
}

module.exports = { updatePosition, findNearby, removePosition };