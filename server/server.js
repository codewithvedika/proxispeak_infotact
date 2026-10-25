require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const C = require('./../shared/constants.json');
const tryRequire = require('./utils/tryRequire');
const { users } = require('./sockets/state');
const registerMovement = require('./sockets/movement');
const registerSignaling = require('./sockets/signaling');

// Modules owned by the Database member (optional until merged)
const connectDB = tryRequire(() => require('./config/db'));
const roomRoutes = tryRequire(() => require('./routes/rooms'));
const userRoutes = tryRequire(() => require('./routes/users'));
const mongoose = tryRequire(() => require('mongoose'));

const PORT = process.env.PORT || C.SERVER_PORT;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

const app = express();
app.use(cors({ origin: CLIENT_ORIGIN.split(',') }));
app.use(express.json());

app.get('/', (req, res) => res.json({ app: 'ProxiSpeak', message: 'Server is running' }));
app.get('/health', (req, res) =>
  res.json({
    status: 'ok',
    users: users.size,
    mongo: mongoose ? mongoose.connection.readyState === 1 : false,
    hearingRadius: C.HEARING_RADIUS,
  })
);
if (roomRoutes) app.use('/api/rooms', roomRoutes);
if (userRoutes) app.use('/api/users', userRoutes);

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: CLIENT_ORIGIN.split(',') } });

async function start() {
  if (connectDB) await connectDB();

  if (process.env.REDIS_URL) {
    try {
      const { createAdapter } = require('@socket.io/redis-adapter');
      const { createClient } = require('redis');
      const pub = createClient({ url: process.env.REDIS_URL });
      const sub = pub.duplicate();
      await Promise.all([pub.connect(), sub.connect()]);
      io.adapter(createAdapter(pub, sub));
      console.log('Redis adapter enabled');
    } catch (err) {
      console.error('Redis unavailable, running single instance:', err.message);
    }
  }

  io.on('connection', (socket) => {
    console.log('connected', socket.id);
    registerMovement(io, socket);
    registerSignaling(io, socket);
  });

  server.listen(PORT, () => console.log(`ProxiSpeak server on port ${PORT}`));
}
start();
