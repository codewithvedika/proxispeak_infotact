# Database code walkthrough

| File | What it does |
|---|---|
| `server/server.js` | Starts Express and Socket.IO, connects to MongoDB, exposes the room/user routes, and handles presence join/move/disconnect events. |
| `server/src/db/connect.js` | Connects Mongoose to Atlas and reports whether the connection succeeded. |
| `server/src/config/defaultRoom.js` | Defines the built-in `main` office layout used for seeding and as an offline fallback. |
| `server/src/models/Presence.js` | Defines temporary live socket positions and the unique socket, compound `2d`, and 120-second TTL indexes. |
| `server/src/models/Room.js` | Defines saved room dimensions and embedded obstacle layouts. |
| `server/src/models/User.js` | Defines registered display names, colors, and creation timestamps. |
| `server/src/models/Position.js` | Defines the alternate user/room position schema and its unique and geospatial indexes. |
| `server/src/routes/rooms.js` | Loads a room layout and validates/persists layout updates. |
| `server/src/routes/users.js` | Creates and lists registered users. |
| `server/src/services/presence.js` | Queues and batches socket presence writes, refreshes idle users, removes disconnected users, and queries nearby sockets. |
| `server/src/services/positionService.js` | Provides CRUD-style helpers for the alternate `Position` model and its geospatial query. |
| `server/scripts/seed.js` | Seeds the default room and ensures the presence indexes exist. |
| `server/scripts/benchmark-geo.js` | Inserts isolated benchmark presences, compares `$near` with `$geoWithin`, reports latency and explain-plan details, then removes test records. |
| `server/scripts/check-indexes.js` | Verifies the presence collection's expected `2d` and TTL indexes. |
| `server/scripts/load-test-mongo.js` | Simulates 50 Socket.IO users moving through the room and records Mongo-backed proximity acknowledgements. |
| `server/scripts/update-layout.js` | Moves a named obstacle in the persisted `main` room after validating its destination. |
| `docs/DATABASE.md` | Documents the collections, indexes, geospatial query, presence batching, and collection diagram. |
