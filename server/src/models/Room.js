const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  width: { type: Number, default: 1600 },
  height: { type: Number, default: 1000 },
  obstacles: [{ x: Number, y: Number, w: Number, h: Number, type: String }],
});

module.exports = mongoose.model('Room', roomSchema);