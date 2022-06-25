"use strict";
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
exports.rollDice = exports.rollDie = void 0;
var random_1 = __importDefault(require("lodash/random"));
var rollDie = function () {
    var dieRolled = (0, random_1.default)(1, 6);
    return dieRolled;
};
exports.rollDie = rollDie;
var rollDice = function () {
    var diceRolled = [(0, exports.rollDie)(), (0, exports.rollDie)()];
    if (diceRolled[0] === diceRolled[1]) {
        diceRolled = __spreadArray(__spreadArray([], diceRolled, true), diceRolled, true);
    }
    return diceRolled;
};
exports.rollDice = rollDice;
