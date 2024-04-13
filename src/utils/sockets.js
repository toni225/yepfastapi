// src/utils/socket.ts
import { Socket, Server } from "socket.io";

class Socket {
  _instance;

  _io;
  _users = {
    id: String,
    username: String,
    created_at: String,
  };
  _socketIdUserId = {
    [key]: String,
  };

  constructor(server) {
    this.io = server;

    this.io.on("connection", (socket) => {
      console.log("a user connected");

      socket.on("join", (user) => {
        this._users[user.id] = {
          socketId: socket.id,
          socket: socket,
          user,
        };

        this._socketIdUserId[socket.id] = user.id;
      });

      socket.on("disconnect", () => {
        const userId = this._socketIdUserId[socket.id];

        if (userId) {
          delete this._users[userId];
          delete this._socketIdUserId[socket.id];
        }
      });
    });
  }

  static getInstance(server) {
    if (this._instance) {
      return this._instance;
    }

    if (server) {
      this._instance = new Socket(server);
      return this._instance;
    }

    return Error("Failed to init socket");
  }
}

export default Socket;
