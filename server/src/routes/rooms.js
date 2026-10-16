const router = require('express').Router();
const mongoose = require('mongoose');
const Room = require('../models/Room');
const defaultRoom = require('../config/defaultRoom');

const dbUp = () => mongoose.connection.readyState === 1;

function validObstacles(obstacles) {
  return (
    Array.isArray(obstacles) &&
    obstacles.every(
      (obstacle) =>
        obstacle &&
        typeof obstacle.id === 'string' &&
        ['x', 'y', 'w', 'h'].every((key) => Number.isFinite(obstacle[key])) &&
        obstacle.w >= 0 &&
        obstacle.h >= 0
    )
  );
}

// Load an office layout. The default layout keeps the client usable while Atlas is unavailable.
router.get('/:roomId', async (req, res) => {
  const { roomId } = req.params;

  try {
    if (!dbUp()) {
      return roomId === defaultRoom.roomId
        ? res.json(defaultRoom)
        : res.status(503).json({ error: 'database unavailable' });
    }

    const room = await Room.findOne({ roomId }).lean();
    if (room) return res.json(room);
    if (roomId === defaultRoom.roomId) return res.json(defaultRoom);
    return res.status(404).json({ error: 'room not found' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Persist a layout and its sound-blocking obstacles.
router.put('/:roomId', async (req, res) => {
  const { roomId } = req.params;
  const { name, obstacles, width, height } = req.body || {};

  if (!validObstacles(obstacles)) {
    return res.status(400).json({ error: 'obstacles must contain id, x, y, w and h numbers' });
  }
  if (width !== undefined && (!Number.isFinite(width) || width <= 0)) {
    return res.status(400).json({ error: 'width must be a positive number' });
  }
  if (height !== undefined && (!Number.isFinite(height) || height <= 0)) {
    return res.status(400).json({ error: 'height must be a positive number' });
  }

  try {
    if (!dbUp()) return res.status(503).json({ error: 'database unavailable' });

    const room = await Room.findOneAndUpdate(
      { roomId },
      {
        $set: {
          name: String(name || roomId).trim() || roomId,
          obstacles,
          ...(width === undefined ? {} : { width }),
          ...(height === undefined ? {} : { height }),
          updatedAt: new Date(),
        },
      },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    ).lean();
    return res.json(room);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
