"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.INITIAL_STATE_TEST = exports.INITIAL_STATE = exports.StateMachineValidTransitions = exports.Player = void 0;
exports.Player = {
    Black: "B",
    White: "W",
};
exports.StateMachineValidTransitions = {
    PENDING_INIT_ROLL: ["PENDING_ROLL"],
    PENDING_MOVE: ["PENDING_ROLL", "WIN"],
    PENDING_ROLL: ["PENDING_ROLL", "PENDING_MOVE"],
    WIN: [],
};
exports.INITIAL_STATE = {
    turn: undefined,
    diceRolled: [],
    plyRoll: [],
    positionTransitionsMap: [],
    stateMachine: "PENDING_INIT_ROLL",
    initDiceRolled: {
        W: -1,
        B: -1,
    },
    hitSpace: {
        W: 0,
        B: 0,
    },
    bearOff: {
        W: 0,
        B: 0,
    },
    pips: [
        { isEmpty: false, player: exports.Player.Black, count: 2, pipId: 0 },
        { isEmpty: true, player: undefined, count: 0, pipId: 1 },
        { isEmpty: true, player: undefined, count: 0, pipId: 2 },
        { isEmpty: true, player: undefined, count: 0, pipId: 3 },
        { isEmpty: true, player: undefined, count: 0, pipId: 4 },
        { isEmpty: false, player: exports.Player.White, count: 5, pipId: 5 },
        { isEmpty: true, player: undefined, count: 0, pipId: 6 },
        { isEmpty: false, player: exports.Player.White, count: 3, pipId: 7 },
        { isEmpty: true, player: undefined, count: 0, pipId: 8 },
        { isEmpty: true, player: undefined, count: 0, pipId: 9 },
        { isEmpty: true, player: undefined, count: 0, pipId: 10 },
        { isEmpty: false, player: exports.Player.Black, count: 5, pipId: 11 },
        { isEmpty: false, player: exports.Player.White, count: 5, pipId: 12 },
        { isEmpty: true, player: undefined, count: 0, pipId: 13 },
        { isEmpty: true, player: undefined, count: 0, pipId: 14 },
        { isEmpty: true, player: undefined, count: 0, pipId: 15 },
        { isEmpty: false, player: exports.Player.Black, count: 3, pipId: 16 },
        { isEmpty: true, player: undefined, count: 0, pipId: 17 },
        { isEmpty: false, player: exports.Player.Black, count: 5, pipId: 18 },
        { isEmpty: true, player: undefined, count: 0, pipId: 19 },
        { isEmpty: true, player: undefined, count: 0, pipId: 20 },
        { isEmpty: true, player: undefined, count: 0, pipId: 21 },
        { isEmpty: true, player: undefined, count: 0, pipId: 22 },
        { isEmpty: false, player: exports.Player.White, count: 2, pipId: 23 },
    ],
};
exports.INITIAL_STATE_TEST = {
    turn: "W",
    diceRolled: [],
    plyRoll: [],
    positionTransitionsMap: [],
    stateMachine: "PENDING_ROLL",
    initDiceRolled: {
        W: -1,
        B: -1,
    },
    hitSpace: {
        W: 0,
        B: 0,
    },
    bearOff: {
        W: 0,
        B: 0,
    },
    pips: [
        { isEmpty: true, player: undefined, count: 0, pipId: 0 },
        { isEmpty: true, player: undefined, count: 0, pipId: 1 },
        { isEmpty: true, player: undefined, count: 0, pipId: 2 },
        { isEmpty: true, player: undefined, count: 0, pipId: 3 },
        { isEmpty: true, player: undefined, count: 0, pipId: 4 },
        { isEmpty: false, player: exports.Player.Black, count: 2, pipId: 5 },
        { isEmpty: false, player: exports.Player.White, count: 1, pipId: 6 },
        { isEmpty: false, player: exports.Player.Black, count: 2, pipId: 7 },
        { isEmpty: true, player: undefined, count: 0, pipId: 8 },
        { isEmpty: true, player: undefined, count: 0, pipId: 9 },
        { isEmpty: true, player: undefined, count: 0, pipId: 10 },
        { isEmpty: true, player: undefined, count: 0, pipId: 11 },
        { isEmpty: true, player: undefined, count: 0, pipId: 12 },
        { isEmpty: true, player: undefined, count: 0, pipId: 13 },
        { isEmpty: false, player: exports.Player.White, count: 1, pipId: 14 },
        { isEmpty: true, player: undefined, count: 0, pipId: 15 },
        { isEmpty: false, player: exports.Player.Black, count: 3, pipId: 16 },
        { isEmpty: true, player: undefined, count: 0, pipId: 17 },
        { isEmpty: false, player: exports.Player.Black, count: 5, pipId: 18 },
        { isEmpty: true, player: undefined, count: 0, pipId: 19 },
        { isEmpty: true, player: undefined, count: 0, pipId: 20 },
        { isEmpty: true, player: undefined, count: 0, pipId: 21 },
        { isEmpty: true, player: undefined, count: 0, pipId: 22 },
        { isEmpty: true, player: undefined, count: 0, pipId: 23 },
    ],
};
