
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();
const connectDB = require("./src/db/connect");
const {
  queuePresence,
  removePresence,
  findNearby,
  setActiveUsersProvider,
} = require("./src/services/presence");

const app = express();
const server = http.createServer(app);
const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT"],
  },
});
const connectedUsers = new Map();
const useMongoProximity = process.env.USE_MONGO_PROXIMITY === "true";

setActiveUsersProvider(() => [...connectedUsers.values()]);

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

app.use("/api/rooms", require("./src/routes/rooms"));
app.use("/api/users", require("./src/routes/users"));

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to ProxiSpeak API!",
    status: "running",
  });
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("presence:join", (payload = {}, acknowledge = () => {}) => {
    const user = {
      id: socket.id,
      roomId: String(payload.roomId || "main"),
      name: String(payload.name || "Guest").trim().slice(0, 20),
      color: typeof payload.color === "string" ? payload.color : "#4f8ef7",
      x: Number(payload.x ?? 0),
      y: Number(payload.y ?? 0),
    };

    if (!queuePresence(user)) {
      acknowledge({ ok: false, error: "x and y must be finite coordinates from 0 to 1100" });
      return;
    }

    connectedUsers.set(socket.id, user);
    socket.join(user.roomId);
    acknowledge({ ok: true, socketId: socket.id, roomId: user.roomId });
  });

  socket.on("presence:move", async (payload = {}, acknowledge = () => {}) => {
    const user = connectedUsers.get(socket.id);
    if (!user) {
      acknowledge({ ok: false, error: "join a room before sending movement" });
      return;
    }

    const movedUser = { ...user, x: Number(payload.x), y: Number(payload.y) };
    if (!queuePresence(movedUser)) {
      acknowledge({ ok: false, error: "x and y must be finite coordinates from 0 to 1100" });
      return;
    }
    connectedUsers.set(socket.id, movedUser);

    if (!useMongoProximity) {
      acknowledge({ ok: true, nearby: [], proximitySource: "disabled" });
      return;
    }

    try {
      const nearby = await findNearby(socket.id, movedUser.roomId, movedUser.x, movedUser.y);
      acknowledge({
        ok: true,
        nearby: nearby.map(({ socketId, name, color, position }) => ({ socketId, name, color, position })),
        proximitySource: "mongo",
      });
    } catch (error) {
      console.error("Mongo proximity query failed:", error.message);
      acknowledge({ ok: false, error: "Mongo proximity query failed" });
    }
  });

  socket.on("disconnect", () => {
    connectedUsers.delete(socket.id);
    void removePresence(socket.id);
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;

async function start() {
  await connectDB();
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`ProxiSpeak server running on port ${PORT}`);
  });
}

start().catch((error) => {
  console.error("Server startup failed:", error.message);
  process.exitCode = 1;
});
