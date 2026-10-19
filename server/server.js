
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();
const connectDB = require("./src/db/connect");

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

  socket.on("disconnect", () => {
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
