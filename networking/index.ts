import { Socket, Server } from "socket.io";
import filter from "lodash/filter";

import GameManager from "../backgammon/model/manager";

import { Actions, Rooms } from "./constants";
import { NetworkStatus, SocketWithRole } from "./types";
import { waitForDebugger } from "inspector";
import { createBrotliCompress } from "zlib";
import { throws } from "assert";
import { clearRoom, afterGuestOut, afterHostOut } from "../index";
const controller = require("../app/controllers/user.controller");

export default class NetworkingManager {
  id: string;
  roomStatus: NetworkStatus = "NOT_STARTED";
  roomName: string;
  server: Server | undefined;
  gameManager: GameManager | undefined;
  hostUsername: string | undefined;
  guestUsername: string | undefined;
  creator: Socket | undefined;
  hostPlayer: Socket | undefined;
  // creator!: Socket;
  // hostPlayer!: Socket;
  guestPlayer: Socket | undefined;

  constructor(
    server: Server,
    id: string,
    creator: Socket,
    roomName: string,
  ) {
    this.id = id;
    this.server = server;
    this.creator = creator;
    this.roomName = roomName;
    this.createRoom();
  }
  createRoom() {
    if (!this.creator) {
      throw new Error("Cannot host, no player");
    }

    const { id, creator } = this;

    this.roomStatus = "ROOM_CREATED";
    
    creator.emit(Actions.ROOM_CREATED, {
      roomId: id,
      status: this.roomStatus,
      roomName: this.roomName,
    });
  }

  hostRoom() {

    if (!this.hostPlayer) {
      throw new Error("Cannot host, no player");
    }

    const { id, hostPlayer } = this;

    this.roomStatus = "WAITING_FOR_GUEST";

    hostPlayer.join([id, Rooms.PLAYERS]);
    hostPlayer.emit(Actions.ROOM_JOINED, {
      roomId: id,
      role: "HOST",
      hostUsername: this.hostUsername,
      guestUsername:'',
      status: this.roomStatus,
      roomName: this.roomName,
    });

    hostPlayer.on("disconnect", () => {
      this.roomStatus = "NOT_STARTED";
    });
  }

  getSocketsWithRole(): SocketWithRole[] {
    const entries: any = filter(
      [
        {
          role: "HOST",
          playerSocket: this.hostPlayer,
        },
        {
          role: "GUEST",
          playerSocket: this.guestPlayer,
        },
      ],
      (entry) => entry.playerSocket !== undefined
    );

    return entries;
  }


  initGameManager() {
    const { server, hostPlayer, guestPlayer, id, hostUsername, guestUsername, creator } = this;

    if (!server || !hostPlayer || !guestPlayer || !id || !hostUsername || !guestUsername || !creator) {
      return;
    }

    this.gameManager = new GameManager(server, hostPlayer, guestPlayer, id, hostUsername, guestUsername, creator);
  }

  async joinPlayer(socket: Socket, username: string) {

    if (this.hostPlayer) {
      console.log("JOINING ROOM", this.id);

      this.guestPlayer = socket;
      this.guestUsername = username;
      this.guestPlayer.join([this.id, Rooms.PLAYERS]);

      this.roomStatus = "STARTED";

      if (!this.hostPlayer || !this.guestPlayer) {
        return;
      }

      const roomPayload = {
        roomId: this.id,
        hostUsername: this.hostUsername,
        guestUsername: this.guestUsername,
        status: this.roomStatus,
        roomName: this.roomName,
      };

      this.guestPlayer.emit(Actions.ROOM_JOINED, {
        ...roomPayload,
        role: "GUEST",
      });

      this.hostPlayer.emit(Actions.SYNC_NETWORK_STATUS, {
        ...roomPayload,
        role: "HOST",
      });

      this.initGameManager();;
    }

    if (!this.hostPlayer) {
      this.hostPlayer = socket;
      this.hostUsername = username;
      this.hostRoom();
    }
    return 1;
  }
}
