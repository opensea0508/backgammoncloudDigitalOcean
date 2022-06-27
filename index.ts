import express from "express";
import cors from "cors";
import http from "http";

import { Server, Socket } from "socket.io";
import { filter, map, result } from "lodash";
import NetworkingManager from "./networking";
import { Actions, Errors } from "./networking/constants";
import { IError, Room, RoomInfo } from "./networking/types";
import { getUniqueId, generateError } from "./utils";
import { hashPassword, doesPasswordMatchHash } from "./utils/security-utils";
import { waitForDebugger } from "inspector";
import { clear } from "console";
import { createForOf } from "typescript";
import path from "path";

var corsOptions = {
  origin: "*"
};

// import { play } from "./test-sim";

// play();

const app = express();
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
});
async function initialize() {
  const config = require('config.json');
  const mysql = require('mysql2/promise');
  const { Sequelize } = require('sequelize');
  const { host, port, user, password, database } = config.database;
  const connection = await mysql.createConnection({ host, port, user, password });
  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);
  
  // connect to db
  const sequelize = new Sequelize(database, user, password, { dialect: 'mysql' });
}


// database
const db = require("./app/models");
const Role = db.role;
// db.create_db();
db.sequelize.sync().then(() => {
  initial();
})

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

//set port, listen for requests
const PORT = 80;

//TODO: put this somewhere else

// routes
require("./app/routes/auth.routes")(app);
require("./app/routes/user.routes")(app);
const controller = require("./app/controllers/user.controller");


const networkManagers: NetworkingManager[] = [];

const getAllRoomsFromManagers = async (managers: NetworkingManager[]) => {
  let rr: RoomInfo[] = [];
  for (let i = 0; i < managers.length; i++) {
    let m = managers[i];
    let temp = {
      id: m.id,
      name: m.roomName,
      hostUsername: m.hostUsername || "",
      guestUsername: m.guestUsername || "",
      hostCountry: m.hostUsername? await controller.getCountryInfo(m.hostUsername): "",
      guestCountry: m.guestUsername? await controller.getCountryInfo(m.guestUsername): ""
    }
    rr.push(temp);
  }
  return rr;
}

const getPendingRoomsFromManagers = (managers: NetworkingManager[]): Room[] =>
  map(
    filter(managers, (m) => (m.roomStatus === "WAITING_FOR_GUEST" || m.roomStatus === "ROOM_CREATED")),
    (m) => ({
      id: m.id,
      name: m.roomName,
    })
  );

io.on("connection", (socket: Socket) => {
  socket.on(Actions.GET_ROOMS, () => {
    const rooms = getPendingRoomsFromManagers(networkManagers);

    socket.emit(Actions.ROOMS_FETCHED, {
      rooms,
    });
  });

  socket.on(Actions.GET_ALL_ROOMS, async () => {
    console.log("get all rooms from managers");
    const allRooms = await getAllRoomsFromManagers(networkManagers);
    socket.emit(Actions.ALL_ROOMS_FETCHED, {
      allRooms,
    });
  });

  socket.on(Actions.CREATE_ROOM, async (payload: any) => {
    const id = getUniqueId();
    const { roomName } = payload;

    console.log("ADMIN WANTS TO CREATE A ROOM", roomName);


    const networkManager = new NetworkingManager(
      io,
      id,
      socket,
      roomName,
    );

    networkManagers.push(networkManager);
  });

  socket.on(Actions.DELETE_ROOM, async (payload: any) => {
    const { roomId } = payload;
    deleteRoom(roomId);
    console.log(networkManagers.length);
    const allRooms = await getAllRoomsFromManagers(networkManagers);
    socket.emit(Actions.ALL_ROOMS_FETCHED, {
      allRooms,
    });
  });

  socket.on(Actions.JOIN_ROOM, async (payload: any) => {
    const { roomId, username } = payload;

    console.log("PLAYER WANTS TO JOIN A ROOM", roomId, username);

    const networkManager = networkManagers.find((it) => it.id === roomId);

    if (!networkManager) {
      console.log(`Couldn't find room with id ${roomId} `);
      return;
    }

    try {

      const ret = await networkManager.joinPlayer(socket, username);
      const allRooms = await getAllRoomsFromManagers(networkManagers);
      io.emit(Actions.ALL_ROOMS_FETCHED, {
        allRooms,
      });

    } catch (err) {
      const error = err as IError;
      socket.emit(Actions.ERROR_OCCURRED, error);
    }
  });

  socket.on(Actions.QUIT_FROM_GAME, async (payload: any) => {
    console.log("============3.In server Actions.QUIT_FROM_GAME==============");
    const {status, roomId, role, hostUsername, guestUsername} = payload;

    for(let i = 0; i < networkManagers.length; i++) {
      if (networkManagers[i].id === roomId) {
        if(status === "STARTED") {
    
          // server.emit(Actions.PLAYER_OUT, {role});
          
          if(role === "HOST") {
            socket.emit(Actions.PLAYER_OUT, {role});
            networkManagers[i].guestPlayer?.emit(Actions.PLAYER_OUT, {role});
            console.log("------------before running of afterHostOut-----------");
            controller.updateWinTime(guestUsername);
            controller.updateLossTime(hostUsername);
    
            networkManagers[i].hostPlayer = networkManagers[i].guestPlayer;
            networkManagers[i].hostUsername = networkManagers[i].guestUsername;
            networkManagers[i].guestPlayer = undefined;
            networkManagers[i].guestUsername = undefined;
            
            afterHostOut(roomId);
          }
          if(role === "GUEST") {
            socket.emit(Actions.PLAYER_OUT, {role});
            networkManagers[i].hostPlayer?.emit(Actions.PLAYER_OUT, {role});
            console.log("------------------before running of afterGuestOut--------------------");
            controller.updateWinTime(hostUsername);
            controller.updateLossTime(guestUsername);
    
            networkManagers[i].guestPlayer = undefined;
            networkManagers[i].guestUsername = undefined;
            
            afterGuestOut(roomId);
            
          }
        }
        if(status === "WAITING_FOR_GUEST") {
          console.log("--------------------------------THERE IS NO PLAYER--------------------");
          socket.emit(Actions.NO_PLAYER, {});
          
          clearRoom(roomId);
        }
        const allRooms = await getAllRoomsFromManagers(networkManagers);
        networkManagers[i].creator?.emit(Actions.ALL_ROOMS_FETCHED, {
          allRooms,
        });
      }
    }
    
  });
});

export function clearRoom(removeId: string | undefined) {
  console.log("this is clearRoom");
  for(let i = 0; i < networkManagers.length; i++) {
    console.log(networkManagers[i].id);
    if(networkManagers[i].id === removeId) {
      // networkManagers.splice(i, 1);
      networkManagers[i].roomStatus = "ROOM_CREATED";
      networkManagers[i].hostPlayer = undefined;
      networkManagers[i].guestPlayer = undefined;
      networkManagers[i].hostUsername = undefined;
      networkManagers[i].guestUsername = undefined;
      networkManagers[i].gameManager = undefined;
    }
  }
}

export function deleteRoom(removeId: string | undefined) {
  console.log("this is clearRoom");
  for(let i = 0; i < networkManagers.length; i++) {
    console.log(networkManagers[i].id);
    if(networkManagers[i].id === removeId) {
      networkManagers.splice(i, 1);
    }
  }
}

export function afterHostOut(removeId: string | undefined) {
  console.log("-----------running afterHostOut----------");
  for(let i = 0; i < networkManagers.length; i++) {
    if(networkManagers[i].id == removeId) {
      networkManagers[i].roomStatus = "WAITING_FOR_GUEST";
      networkManagers[i].hostPlayer = networkManagers[i].guestPlayer;
      networkManagers[i].hostUsername = networkManagers[i].guestUsername;
      networkManagers[i].guestPlayer = undefined;
      networkManagers[i].guestUsername = undefined;
    }
  }
}

export function afterGuestOut(removeId: string | undefined) {
  console.log("-----------running afterGuestOut----------");
  for(let i = 0; i < networkManagers.length; i++) {
    if(networkManagers[i].id == removeId) {
      
      networkManagers[i].roomStatus = "WAITING_FOR_GUEST";
      networkManagers[i].guestPlayer = undefined;
      networkManagers[i].guestUsername = undefined;
    }
  }
}

server.listen(PORT, () => {
  console.log(`The application is listening on port ${PORT}!`);
});

function initial() {
  Role.create({
    id: 1,
    name: "user"
  });

  Role.create({
    id: 2,
    name: "moderator"
  });

  Role.create({
    id: 3,
    name: "admin"
  });

}

