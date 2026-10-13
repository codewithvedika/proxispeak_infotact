const mongoose = require('mongoose');

const positionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  roomId: { type: String, required: true },
  loc: { type: [Number], required: true },   // [x, y]
  updatedAt: { type: Date, default: Date.now },
});

positionSchema.index({ userId: 1, roomId: 1 }, { unique: true });
positionSchema.index({ loc: '2d' }, { min: 0, max: 2000 });  // flat map, not a globe

module.exports = mongoose.model('Position', positionSchema);