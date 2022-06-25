"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.canBearOffWithThisMove = exports.isPipInBearOffPosition = exports.getBearOffPosition = exports.isPipAtBearOffOrder = exports.getBearOffOrder = exports.canBearOff = exports.getBearOffPositions = exports.getLeastBearOffPosition = exports.isBearOffMove = void 0;
var map_1 = __importDefault(require("lodash/map"));
var filter_1 = __importDefault(require("lodash/filter"));
var some_1 = __importDefault(require("lodash/some"));
var every_1 = __importDefault(require("lodash/every"));
var times_1 = __importDefault(require("lodash/times"));
var find_1 = __importDefault(require("lodash/find"));
// utils
var index_1 = require("./index");
var move_maker_1 = require("./move-maker");
var isBearOffMove = function (move) {
    return move.to === (0, exports.getBearOffPosition)(move.player);
};
exports.isBearOffMove = isBearOffMove;
var getLeastBearOffPosition = function (player) {
    return (0, index_1.isFacingNorth)(player) ? 5 : 18;
};
exports.getLeastBearOffPosition = getLeastBearOffPosition;
var getBearOffPositions = function (player) {
    return (0, map_1.default)((0, times_1.default)(6), function (n) {
        return (0, index_1.isFacingNorth)(player)
            ? (0, exports.getLeastBearOffPosition)(player) - n
            : (0, exports.getLeastBearOffPosition)(player) + n;
    });
};
exports.getBearOffPositions = getBearOffPositions;
var canBearOff = function (state, player) {
    var hitSpace = state.hitSpace, pips = state.pips;
    var hasHitSpaceChecker = hitSpace[player] > 0;
    if (hasHitSpaceChecker) {
        return false;
    }
    var currentPlayersPips = (0, filter_1.default)(pips, { player: player });
    var areAllCheckersOnLastQuadrant = (0, every_1.default)(currentPlayersPips, function (pip) {
        return (0, exports.isPipInBearOffPosition)(player, pip.pipId);
    });
    return areAllCheckersOnLastQuadrant;
};
exports.canBearOff = canBearOff;
var getBearOffOrder = function (state, player) {
    var positions = (0, exports.getBearOffPositions)(player);
    var pips = state.pips;
    var currentPlayersPips = (0, filter_1.default)(pips, { player: player });
    var order = (0, find_1.default)(positions, function (n) {
        return (0, some_1.default)(currentPlayersPips, {
            pipId: n,
        });
    });
    if (order === undefined) {
        return positions[0];
    }
    return order;
};
exports.getBearOffOrder = getBearOffOrder;
// THIS MEANS THAT
// FROM THE GIVEN PIP
// MOVES WITH GREATER DIE ROLL CAN
// ENTER THE BEAROFF
var isPipAtBearOffOrder = function (pipId, order) {
    return pipId === order;
};
exports.isPipAtBearOffOrder = isPipAtBearOffOrder;
var getBearOffPosition = function (player) {
    return (0, index_1.isFacingNorth)(player) ? -1 : 24;
};
exports.getBearOffPosition = getBearOffPosition;
var isPipInBearOffPosition = function (player, pipId) {
    var leastBearOffPosition = (0, exports.getLeastBearOffPosition)(player);
    var isIt = (0, index_1.isFacingNorth)(player)
        ? pipId <= leastBearOffPosition
        : pipId >= leastBearOffPosition;
    return isIt;
};
exports.isPipInBearOffPosition = isPipInBearOffPosition;
var canBearOffWithThisMove = function (state, move) {
    var from = move.from, die = move.die, player = move.player;
    var _a = [
        (0, exports.isBearOffMove)(move),
        from === "hit-space",
        (0, exports.canBearOff)(state, player),
    ], isBearOff = _a[0], isFromHitSpace = _a[1], canPlayerBearOff = _a[2];
    if (!isBearOff || isFromHitSpace || !canPlayerBearOff) {
        return false;
    }
    if (from === "hit-space") {
        // this will never happen, just the best workaround for typescript
        // not being smart enough to not being able to infer that: from === 'hit-space' will fail
        // to go to here therefore 'from' will always be a number
        // I can cast it, but let's just do it defensively this time.
        return false;
    }
    var bearOffOrder = (0, exports.getBearOffOrder)(state, player);
    var isPipAtOrder = (0, exports.isPipAtBearOffOrder)(from, bearOffOrder);
    var unclampedLeap = (0, move_maker_1.getLeap)(from, die, player, false);
    // In order to be able to bear off:
    //  1. Either current Pip is at order position OR
    //  2. Current Pip tries to bear off with exact die face to bearoff position
    var check = isPipAtOrder || unclampedLeap === (0, exports.getBearOffPosition)(player);
    return check;
};
exports.canBearOffWithThisMove = canBearOffWithThisMove;
