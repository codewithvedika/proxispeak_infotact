# Scaling ProxiSpeak

## Problem
One Node.js process holds all sockets in memory. If we run a second process (to serve more users), a user on process A cannot send messages to a user on process B.

## Solution: Redis Pub/Sub + Socket.IO Redis adapter
- Each Node instance publishes socket events to Redis and subscribes to events from the others.
- `io.to(socketId).emit(...)` and `socket.to(room).emit(...)` then reach sockets on every instance.
- Enabled in `server/server.js` only when `REDIS_URL` is set.

## Shared state
In-memory maps (`users`, `neighbors`) exist per instance only. For multi-instance mode we therefore:
- keep every user's position in MongoDB (`presences`, throttled bulk writes every 300 ms),
- run proximity with MongoDB `$near` (`USE_MONGO_PROXIMITY=true`),
- build `users:current` from MongoDB for users on other instances.

## Limits
- Positions in MongoDB can be up to ~300 ms old.
- WebRTC is a full mesh: connections grow with nearby users, so we cap peers with `MAX_PEERS`.
