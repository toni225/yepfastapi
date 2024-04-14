import express from "express";
import { Server } from "socket.io";
// import { createServer } from "https";
import { createServer } from "http";

import userRoutes from "./user.routes";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";

import socketio from "./socket.io";

const app = express();
const port = 4000;
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    // origin: "https://yepfast.vercel.app",
  },
});

app.use(compression());
app.use(express.json());
app.use(helmet());
app.use(cors());

app.use("/v1/user", userRoutes);

// app.get("/socket.io", (req, res) => {
//   res.sendFile(
//     __dirname + "/node_modules/socket.io/client-dist/socket.io.min.js"
//   );
// });
// app.use(
//   "/socket.io/",
//   express.static(__dirname + "/node_modules/socket.io/client-dist")
// );
// app.use("/socket.io/", socketio);

let onlineUsers = [];

const addNewUser = (username, socketId) => {
  !onlineUsers.some((user) => user.username === username) &&
    onlineUsers.push({ username, socketId });
};

const removeUser = (socketId) => {
  onlineUsers = onlineUsers.filter((user) => user.socketId !== socketId);
};

const getUser = (username) => {
  return onlineUsers.find((user) => user.username === username);
};

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("newUser", (username) => {
    addNewUser(username, socket.id);
  });

  socket.on("sendNotification", ({ senderName, recieverName, ParkingID }) => {
    const receiver = getUser(recieverName);
    console.log(receiver);
    io.to(receiver.socketId).emit("getNotification", {
      senderName,
      ParkingID,
    });
  });

  socket.on("disconnect", () => {
    console.log("someone has left");

    removeUser(socket.id);
  });
});

app.get("/socket.io/", (req, res) => {
  res.sendFile(__dirname + "/socket.io.js");
});

server.listen(port, () => {
  console.log(`open: http://localhost:${port}`);
});

module.exports = app;
