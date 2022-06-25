"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var maxBy_1 = __importDefault(require("lodash/maxBy"));
var get_1 = __importDefault(require("lodash/get"));
var last_1 = __importDefault(require("lodash/last"));
var some_1 = __importDefault(require("lodash/some"));
var utils_1 = require("../utils");
var move_maker_1 = require("../utils/move-maker");
var move_generator_1 = require("../utils/move-generator");
var roller_1 = require("../utils/roller");
var constants_1 = require("../constants");
var authorizeValidStates = function (action, validStates, currentState) {
    if (!validStates.includes(currentState)) {
        console.log("Invalid Action ".concat(action, " for state ").concat(currentState));
        // throw new Error(`Invalid Action ${action} for state ${currentState}`);
        return false;
    }
    return true;
};
var Backgammon = /** @class */ (function () {
    function Backgammon() {
        this.pendingTransactionEntries = [];
        this.currentMoveNodes = null;
        this.state = (0, utils_1.getInitialState)();
    }
    Backgammon.prototype.switchTurn = function (player) {
        var turn = this.state.turn;
        this.transitionStateMachine("PENDING_ROLL");
        if (turn === undefined && player) {
            //after init roll
            this.state.turn = player;
            return;
        }
        if (turn === undefined) {
            throw new Error("Invalid State: Cannot switch turn");
        }
        var resettedStateFields = {
            turn: (0, utils_1.getOpponent)(turn),
            diceRolled: [],
            plyRoll: [],
            positionTransitionsMap: [],
        };
        this.state = __assign(__assign({}, this.state), resettedStateFields);
    };
    Backgammon.prototype.transitionStateMachine = function (nextTransition) {
        var currentTransition = this.state.stateMachine;
        if (constants_1.StateMachineValidTransitions[currentTransition].includes(nextTransition)) {
            this.state.stateMachine = nextTransition;
            return;
        }
        throw new Error("Invalid State: Cannot transition from ".concat(currentTransition, " to ").concat(nextTransition, " "));
    };
    Backgammon.prototype.areThereAvailableMoves = function (positionTransitionEntries) {
        var state = this.state;
        var areThere = state.stateMachine !== "PENDING_MOVE" ||
            (0, some_1.default)(positionTransitionEntries, function (positionTransition) { return positionTransition.to.length > 0; });
        return areThere;
    };
    Backgammon.prototype.hasInitRolled = function (player) {
        return this.state.initDiceRolled[player] !== -1;
    };
    Backgammon.prototype.getInitialTurn = function () {
        var initDiceRolled = this.state.initDiceRolled;
        if (initDiceRolled.W === initDiceRolled.B) {
            return false;
        }
        var diceOrder = [
            {
                player: constants_1.Player.White,
                die: initDiceRolled.W,
            },
            {
                player: constants_1.Player.Black,
                die: initDiceRolled.B,
            },
        ];
        return (0, get_1.default)((0, maxBy_1.default)(diceOrder, "die"), "player");
    };
    Backgammon.prototype.rollDice = function (player) {
        var _a;
        console.log("dovagjam ovde", player);
        var _b = this.state, diceRolled = _b.diceRolled, initDiceRolled = _b.initDiceRolled, stateMachine = _b.stateMachine;
        var validStates = ["PENDING_INIT_ROLL", "PENDING_ROLL"];
        var isAuthorized = authorizeValidStates("rollDice", validStates, stateMachine);
        if (!isAuthorized) {
            return;
        }
        var isInitRoll = stateMachine === "PENDING_INIT_ROLL";
        var consequences = [];
        if (isInitRoll) {
            var canInitRoll = initDiceRolled[player] === -1; // Has Already rolled
            if (canInitRoll) {
                var rolledDie = (0, roller_1.rollDie)();
                this.state.initDiceRolled = __assign(__assign({}, initDiceRolled), (_a = {}, _a[player] = rolledDie, _a));
                var diceRolledInfo = {
                    isInit: true,
                    player: player,
                    rolledDice: [rolledDie],
                };
                if (this.hasInitRolled((0, utils_1.getOpponent)(player))) {
                    var initialTurn = this.getInitialTurn();
                    if (!initialTurn) {
                        this.state.initDiceRolled = {
                            W: -1,
                            B: -1,
                        };
                        // We add a consequence
                        // This serves the client to show the Die and then update the actual resetted state
                        consequences.push({
                            type: "SAME_DIE_ROLLED",
                            payload: {
                                rolledDie: rolledDie,
                            },
                        });
                    }
                    else {
                        consequences.push({
                            type: "FINISHED_INIT_ROLL",
                            payload: {
                                turn: initialTurn,
                                initDiceRolled: this.getState().initDiceRolled,
                            },
                        });
                        this.switchTurn(initialTurn);
                    }
                }
                return {
                    consequences: consequences,
                    diceRolledInfo: diceRolledInfo,
                };
            }
            else {
                console.log("Player ".concat(player, " cannot roll again cause he already rolled"));
                return;
            }
        }
        //Normal Roll from here
        var canRoll = stateMachine === "PENDING_ROLL" && diceRolled.length === 0;
        if (!canRoll) {
            console.log("Invalid Action: Cannot roll in state: ".concat(stateMachine, " "));
            return;
        }
        var rolledDice = (0, roller_1.rollDice)();
        this.state.diceRolled = __spreadArray([], rolledDice, true);
        this.state.plyRoll = __spreadArray([], rolledDice, true);
        console.log("ROLLED DICE", rolledDice);
        console.log("-".repeat(50));
        var moveNodes = (0, move_generator_1.getValidMoveNodes)((0, move_generator_1.getPossibleMoveNodes)(this.state, player));
        this.currentMoveNodes = moveNodes;
        var positionTransitions = (0, move_generator_1.getPositionTransitionsFromMoveNodes)(moveNodes, player);
        this.state.positionTransitionsMap = positionTransitions;
        this.transitionStateMachine("PENDING_MOVE");
        if (!this.areThereAvailableMoves(positionTransitions)) {
            this.switchTurn((0, utils_1.getOpponent)(player));
            consequences.push({
                type: "NON_AVAILABLE_MOVES",
                payload: {
                    player: player,
                    rolledDice: rolledDice,
                },
            });
        }
        return {
            consequences: consequences,
            diceRolledInfo: {
                isInit: false,
                player: player,
                rolledDice: rolledDice,
            },
        };
    };
    Backgammon.prototype.move = function (move) {
        var _a = this.state, turn = _a.turn, stateMachine = _a.stateMachine;
        var validStates = ["PENDING_MOVE"];
        authorizeValidStates("makeMove", validStates, stateMachine);
        if (turn !== move.player) {
            throw new Error("Invalid state: Cannot move player: ".concat(move.player));
        }
        if (this.currentMoveNodes === null) {
            throw new Error("Invalid state: There are no moves in the tree for player: ".concat(move.player));
        }
        var nextState = (0, move_maker_1.getNextState)(this.state, move);
        this.pendingTransactionEntries.push({
            move: move,
            nextState: nextState,
            previousState: this.state,
            previousMoveNodes: this.currentMoveNodes,
        });
        var nextMoveNodes = (0, move_maker_1.getNextMoveNodesAfterMove)(this.currentMoveNodes, move);
        var nextTransitionMap = (0, move_generator_1.getPositionTransitionsFromMoveNodes)(nextMoveNodes, move.player);
        this.state = __assign(__assign({}, nextState), { positionTransitionsMap: nextTransitionMap });
        this.currentMoveNodes = nextMoveNodes;
        var hasPlayerWon = (0, utils_1.isWin)(this.state, move.player);
        if (hasPlayerWon) {
            this.transitionStateMachine("WIN");
            this.state.turn = undefined;
            return {
                isWin: true,
                player: move.player,
            };
        }
        return {
            isWin: false,
            player: move.player,
        };
    };
    Backgammon.prototype.undo = function () {
        var pendingTransactionEntries = this.pendingTransactionEntries;
        var undoedTransactionEntry = (0, last_1.default)(pendingTransactionEntries);
        var undoedState = (0, get_1.default)(undoedTransactionEntry, "previousState", this.getState());
        var undoedMoveNodes = (0, get_1.default)(undoedTransactionEntry, "previousMoveNodes", this.currentMoveNodes);
        this.state = __assign({}, undoedState);
        this.currentMoveNodes = undoedMoveNodes;
        this.pendingTransactionEntries = pendingTransactionEntries.slice(0, -1);
    };
    Backgammon.prototype.pickMoveByPositionTransition = function (positionTransition) {
        var from = positionTransition.from, to = positionTransition.to;
        var pips = this.state.pips;
        var currentMoveNodes = this.currentMoveNodes;
        if (currentMoveNodes === null) {
            console.log("Something got corrupted, no moves in the move tree");
            return [];
        }
        var pip = pips.find(function (p) { return p.pipId === from; });
        if (pip === undefined && from !== "hit-space") {
            throw new Error("Invalid position pip not present");
        }
        var validMoves = (0, move_generator_1.generateAllMoveSequencesFromPositionTransition)(currentMoveNodes, positionTransition);
        var positionEntry = pip || "hit-space";
        var pickedMoveSequence = (0, move_maker_1.pickMoveFromSequence)(to, {
            pipId: (0, move_generator_1.getPositionId)(positionEntry),
            moves: validMoves,
        });
        return pickedMoveSequence || [];
    };
    Backgammon.prototype.confirmMove = function () {
        var state = this.state;
        var stateMachine = state.stateMachine;
        if (stateMachine !== "WIN") {
            this.switchTurn();
        }
        var currentPendingTransactionEntries = __spreadArray([], this.pendingTransactionEntries, true);
        this.pendingTransactionEntries = [];
        return currentPendingTransactionEntries;
    };
    Backgammon.prototype.getState = function () {
        return this.state;
    };
    return Backgammon;
}());
exports.default = Backgammon;
