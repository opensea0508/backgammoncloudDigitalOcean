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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isWin = exports.isEqualMove = exports.getOpponent = exports.isFacingNorth = exports.getInitialState = void 0;
var isEqual_1 = __importDefault(require("lodash/isEqual"));
var constants_1 = require("../constants");
var getInitialState = function () { return (__assign({}, constants_1.INITIAL_STATE)); };
exports.getInitialState = getInitialState;
var isFacingNorth = function (player) { return player === "W"; };
exports.isFacingNorth = isFacingNorth;
var getOpponent = function (p) {
    return p === "W" ? "B" : "W";
};
exports.getOpponent = getOpponent;
var isEqualMove = function (move, anotherMove) {
    return (0, isEqual_1.default)(move, anotherMove);
};
exports.isEqualMove = isEqualMove;
var isWin = function (state, player) {
    return state.bearOff[player] === 15;
};
exports.isWin = isWin;
