const mongoose = require('mongoose');

const presenceSchema = new mongoose.Schema({
  socketId: { type: String, required: true, unique: true },
  roomId: { type: String, required: true, default: 'main', index: true },
  name: { type: String, maxlength: 20 },
  color: String,
  position: {
    type: [Number],
    required: true,
    validate: {
      validator: (value) => value.length === 2 && value.every(Number.isFinite),
      message: 'position must be a pair of finite [x, y] coordinates',
    },
  },
  updatedAt: { type: Date, default: Date.now, index: { expires: 120 } },
});

// The office is a flat pixel plane, so use the legacy 2d index instead of 2dsphere.
presenceSchema.index({ position: '2d', roomId: 1 }, { min: 0, max: 1100 });

module.exports = mongoose.model('Presence', presenceSchema);
