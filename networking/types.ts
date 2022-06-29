import { Socket } from "socket.io";
import { Consequence, GameState, PlayerType } from "../backgammon/types";

export interface RoomInfo {
  id: string;
  name: string;
  hostUsername: string;
  guestUsername: string;
  hostCountry: any;
  guestCountry: any;
  status: string;
}

export interface Room {
  id: string;
  name: string;
}

export type NetworkStatus = "NOT_STARTED" | "WAITING_FOR_GUEST" | "STARTED" | "ROOM_CREATED";

export type NetworkRole = "HOST" | "GUEST";

export interface SocketWithRole {
  role: NetworkRole;
  playerSocket: Socket;
}

export interface DiceRolledMetadata {
  player: PlayerType;
  die: number;
  nthDie: number;
}

export interface ExecuteRollPayload {
  diceRolledMetadata: DiceRolledMetadata[];
  consequences: Consequence[];
  state: GameState;
}

export type ErrorType = "PASSWORD_NOT_VALID" | "PASSWORD_NOT_PRESENT" | "ROOM_NOT_EMPTY";

export interface IError {
  errorType: ErrorType;
  payload: any;
}
