const router = require('express').Router();
const mongoose = require('mongoose');
const User = require('../models/User');

const COLORS = ['#e6194b', '#3cb44b', '#4363d8', '#f58231', '#911eb4', '#42d4f4'];
const dbUp = () => mongoose.connection.readyState === 1;

router.post('/', async (req, res) => {
  const name = String(req.body?.name || '').trim().slice(0, 20);
  if (!name) return res.status(400).json({ error: 'name is required' });

  try {
    if (!dbUp()) return res.status(503).json({ error: 'database unavailable' });
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    const user = await User.create({ name, color });
    return res.status(201).json(user);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.get('/', async (_req, res) => {
  try {
    if (!dbUp()) return res.status(503).json({ error: 'database unavailable' });
    const users = await User.find().sort({ createdAt: -1 }).limit(100).lean();
    return res.json(users);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
