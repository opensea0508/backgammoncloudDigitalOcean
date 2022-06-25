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
exports.getNextMoveNodesAfterMove = exports.getNextState = exports.pickMoveFromSequence = exports.getLeap = exports.getDiceCountInMoveSequence = exports.getHitCountInMoveSequence = void 0;
var map_1 = __importDefault(require("lodash/map"));
var findIndex_1 = __importDefault(require("lodash/findIndex"));
var filter_1 = __importDefault(require("lodash/filter"));
var clamp_1 = __importDefault(require("lodash/clamp"));
var maxBy_1 = __importDefault(require("lodash/maxBy"));
var last_1 = __importDefault(require("lodash/last"));
var get_1 = __importDefault(require("lodash/get"));
var find_1 = __importDefault(require("lodash/find"));
// utils
var index_1 = require("./index");
var bearoff_1 = require("./bearoff");
var getHitCountInMoveSequence = function (moves) {
    return moves.reduce(function (hitCount, move) { return (move.isHit ? hitCount + 1 : hitCount); }, 0);
};
exports.getHitCountInMoveSequence = getHitCountInMoveSequence;
var getDiceCountInMoveSequence = function (moves) { return moves.length; };
exports.getDiceCountInMoveSequence = getDiceCountInMoveSequence;
var getLeap = function (from, die, player, shouldClamp, // We don't clamp when making a decision for bearing off
shouldReverse) {
    if (shouldClamp === void 0) { shouldClamp = true; }
    if (shouldReverse === void 0) { shouldReverse = false; }
    var fromQuantity = from === "hit-space" ? ((0, index_1.isFacingNorth)(player) ? 24 : -1) : from;
    var clamps = {
        northFacing: shouldClamp ? -1 : -Infinity,
        southFacing: shouldClamp ? 24 : Infinity,
    };
    // In this context -1, 24 are the hitSpace positions for the players accordingly
    var leap = (0, index_1.isFacingNorth)(player)
        ? (0, clamp_1.default)(fromQuantity - die, clamps.northFacing, Infinity)
        : (0, clamp_1.default)(fromQuantity + die, -Infinity, clamps.southFacing);
    return leap;
};
exports.getLeap = getLeap;
/* When there are more then one MoveSequence for a given PositionTransition
we want to pick the "best" move for the player.

  For now these 2 metrics are taken into account:
    1. How much hits there are for the specific sequence (THE MORE THE MERRIER)
    2. How much moves in total the sequence consists of (LESS IS MORE) :)
*/
var pickMoveFromSequence = function (toPip, movesSequence) {
    var moves = movesSequence.moves;
    var movesToPosition = (0, filter_1.default)(moves, function (moveSequence) { return (0, get_1.default)((0, last_1.default)(moveSequence), "to") === toPip; });
    var bestMoveSequence = (0, maxBy_1.default)(movesToPosition, function (moveSeq) {
        return (0, exports.getHitCountInMoveSequence)(moveSeq) +
            (0, exports.getDiceCountInMoveSequence)(moveSeq) * -1;
    });
    return bestMoveSequence;
};
exports.pickMoveFromSequence = pickMoveFromSequence;
var transformPip = function (pip, move) {
    var from = move.from, to = move.to, player = move.player, isHit = move.isHit;
    if (![from, to].includes(pip.pipId)) {
        return pip;
    }
    var _a = [pip.pipId === from, pip.pipId === to], isSource = _a[0], isTarget = _a[1];
    if (isSource) {
        var newPip = __assign({}, pip);
        newPip.count = (0, clamp_1.default)(newPip.count - 1, 0, Infinity);
        newPip.player = newPip.count > 0 ? player : undefined;
        newPip.isEmpty = newPip.count === 0;
        return newPip;
    }
    if (isTarget) {
        var newPip = __assign({}, pip);
        newPip.count = isHit ? 1 : newPip.count + 1;
        newPip.player = player;
        newPip.isEmpty = false;
        return newPip;
    }
    return pip;
};
var getNextState = function (state, move) {
    var hitSpace = state.hitSpace, bearOff = state.bearOff, pips = state.pips, diceRolled = state.diceRolled;
    var from = move.from, isHit = move.isHit, player = move.player, die = move.die;
    var isFromHitSpaceMove = from === "hit-space";
    var isBearOff = (0, bearoff_1.isBearOffMove)(move);
    var updatedPips = (0, map_1.default)(pips, function (pip) { return transformPip(pip, move); });
    var updatedHitSpace = __assign({}, hitSpace);
    var updatedBearOff = __assign({}, bearOff);
    if (isHit) {
        var opponent = (0, index_1.getOpponent)(player);
        var currentHitCount = updatedHitSpace[opponent];
        updatedHitSpace[opponent] = currentHitCount + 1;
    }
    if (isFromHitSpaceMove) {
        var currentHitCount = updatedHitSpace[player];
        updatedHitSpace[player] = (0, clamp_1.default)(currentHitCount - 1, 0, Infinity);
    }
    if (isBearOff) {
        var currentBearOffCount = updatedBearOff[player];
        // theoretically upper bound  for this backgammon variation is 15 but
        // let's not hardcode that here and instead just generalise with +Infinity
        updatedBearOff[player] = (0, clamp_1.default)(currentBearOffCount + 1, Infinity);
    }
    var dieIndex = (0, findIndex_1.default)(diceRolled, function (d) { return d === die; });
    return __assign(__assign({}, state), { diceRolled: (0, filter_1.default)(diceRolled, function (_, i) { return i !== dieIndex; }), hitSpace: updatedHitSpace, bearOff: updatedBearOff, pips: updatedPips });
};
exports.getNextState = getNextState;
var getNextMoveNodesAfterMove = function (moveNodes, move) {
    var childrenNodes = (0, find_1.default)(moveNodes, function (mn) { return (0, index_1.isEqualMove)(mn.data, move); });
    return childrenNodes ? childrenNodes.children : [];
};
exports.getNextMoveNodesAfterMove = getNextMoveNodesAfterMove;
