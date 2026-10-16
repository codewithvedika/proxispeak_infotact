const mongoose = require('mongoose');

const obstacleSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    w: { type: Number, required: true },
    h: { type: Number, required: true },
    label: String,
  },
  { _id: false }
);

const roomSchema = new mongoose.Schema({
  roomId: { type: String, required: true, unique: true, trim: true },
  name: { type: String, required: true, trim: true },
  width: { type: Number, default: 1000, min: 1 },
  height: { type: Number, default: 600, min: 1 },
  obstacles: { type: [obstacleSchema], default: [] },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Room', roomSchema);
