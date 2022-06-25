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
exports.generateAllMoveSequencesFromPositionTransition = exports.getValidMoveNodes = exports.getPossibleMoveNodes = exports.getPositionTransitionsFromMoveNodes = exports.getPositionTransitionsFromMoveNodesPerPip = exports.getMaxMoveNodesDepth = exports.getPositionId = void 0;
var map_1 = __importDefault(require("lodash/map"));
var filter_1 = __importDefault(require("lodash/filter"));
var maxBy_1 = __importDefault(require("lodash/maxBy"));
var max_1 = __importDefault(require("lodash/max"));
var uniq_1 = __importDefault(require("lodash/uniq"));
var uniqBy_1 = __importDefault(require("lodash/uniqBy"));
var times_1 = __importDefault(require("lodash/times"));
var last_1 = __importDefault(require("lodash/last"));
var flatMap_1 = __importDefault(require("lodash/flatMap"));
// utils
var index_1 = require("./index");
var move_maker_1 = require("./move-maker");
var bearoff_1 = require("./bearoff");
var getPositionId = function (positionEntry) {
    return positionEntry === "hit-space" ? "hit-space" : positionEntry.pipId;
};
exports.getPositionId = getPositionId;
/*
  We calculate the max depth of the POSSIBLE MoveNodes[],
  This is needed so we can infer if the POSSIBLE MovesNode is actually VALID too
*/
var getMaxMoveNodesDepth = function (movesNodes) {
    if (movesNodes.length === 0) {
        return 0;
    }
    var maxDepth = (0, max_1.default)((0, map_1.default)(movesNodes, function (node) {
        return node.children.length !== 0 ? 1 + (0, exports.getMaxMoveNodesDepth)(node.children) : 1;
    }));
    return maxDepth || 0;
};
exports.getMaxMoveNodesDepth = getMaxMoveNodesDepth;
var getPositionTransitionsFromMoveNodesPerPip = function (from, moveNodes) {
    var currentMoveNodes = (0, filter_1.default)(moveNodes, function (node) { return node.data.from === from; });
    var transitions = [];
    for (var _i = 0, currentMoveNodes_1 = currentMoveNodes; _i < currentMoveNodes_1.length; _i++) {
        var _a = currentMoveNodes_1[_i], move = _a.data, children = _a.children;
        var currentTransition = {
            from: move.from,
            to: move.to,
        };
        var followingTransitions = (0, exports.getPositionTransitionsFromMoveNodesPerPip)(move.to, children);
        transitions.push.apply(transitions, __spreadArray([currentTransition], followingTransitions, true));
    }
    return transitions;
};
exports.getPositionTransitionsFromMoveNodesPerPip = getPositionTransitionsFromMoveNodesPerPip;
var getPositionTransitionsFromMoveNodes = function (moveNodes, player) {
    var currentMoveNodes = (0, uniqBy_1.default)((0, filter_1.default)(moveNodes, function (node) { return node.data.player === player; }), function (node) { return node.data.from; });
    var positionTransitionsMap = [];
    for (var _i = 0, currentMoveNodes_2 = currentMoveNodes; _i < currentMoveNodes_2.length; _i++) {
        var move = currentMoveNodes_2[_i].data;
        var positionTransitions = (0, exports.getPositionTransitionsFromMoveNodesPerPip)(move.from, moveNodes);
        var positionTransitionEntry = {
            from: move.from,
            to: (0, uniq_1.default)((0, map_1.default)(positionTransitions, "to")),
        };
        positionTransitionsMap.push(positionTransitionEntry);
    }
    return positionTransitionsMap;
};
exports.getPositionTransitionsFromMoveNodes = getPositionTransitionsFromMoveNodes;
/*
  Maybe one of the most important move generator util.
  This will generate all the possible sequences of moves of how one 'ply'
  can end up being given a set of dice rolled.

  By POSSIBLE Move it is considered any atomic move that
  makes sense by the trivial rules for this backgammon variation.

  Not all POSSIBLE Moves will end up being VALID too, because there are specific conditions how
  a 'ply' shall be played. For all the rules read more here: https://www.bkgm.com/rules.html
*/
var getPossibleMoveNodes = function (state, player) {
    var pips = state.pips, hitSpace = state.hitSpace, dice = state.diceRolled;
    var opponent = (0, index_1.getOpponent)(player);
    var currentPlayersPips = (0, filter_1.default)(pips, { player: player });
    var moveNodes = [];
    var diceRolled = (0, uniq_1.default)(dice); // It is uniq cause for doubles we don't want to yield duplicate combinations;
    var hasHitSpaceChecker = hitSpace[player] > 0;
    var playerPositionsIterator = hasHitSpaceChecker
        ? (0, times_1.default)(hitSpace[player])
        : currentPlayersPips;
    var _loop_1 = function (i) {
        var fromPosition = (hasHitSpaceChecker ? "hit-space" : playerPositionsIterator[i]);
        var leaps = diceRolled.map(function (die) { return ({
            leap: (0, move_maker_1.getLeap)((0, exports.getPositionId)(fromPosition), die, player),
            die: die,
        }); });
        for (var _i = 0, leaps_1 = leaps; _i < leaps_1.length; _i++) {
            var _a = leaps_1[_i], leap = _a.leap, die = _a.die;
            var toPip = pips[leap];
            var canLeap = toPip !== undefined && (toPip.player !== opponent || toPip.count === 1);
            var isBearOff = leap === (0, bearoff_1.getBearOffPosition)(player);
            var shouldBearOffWithMove = isBearOff &&
                (0, bearoff_1.canBearOffWithThisMove)(state, {
                    from: (0, exports.getPositionId)(fromPosition),
                    to: leap,
                    isHit: false,
                    player: player,
                    die: die,
                });
            var isValid = canLeap || shouldBearOffWithMove;
            if (isValid) {
                var move = {
                    from: (0, exports.getPositionId)(fromPosition),
                    to: shouldBearOffWithMove ? (0, bearoff_1.getBearOffPosition)(player) : toPip.pipId,
                    player: player,
                    isHit: !shouldBearOffWithMove && toPip.player === opponent,
                    die: die,
                };
                var nextState = __assign({}, (0, move_maker_1.getNextState)(state, move));
                var node = {
                    data: move,
                    children: [],
                };
                var validChildrenMoveNodes = (0, exports.getPossibleMoveNodes)(nextState, player);
                node.children = __spreadArray([], validChildrenMoveNodes, true);
                moveNodes.push(node);
            }
        }
    };
    for (var i = 0; i < playerPositionsIterator.length; i++) {
        _loop_1(i);
    }
    return moveNodes;
};
exports.getPossibleMoveNodes = getPossibleMoveNodes;
/*
  This util eventually yields a list of TreeNodes that will consist of
  all the VALID and only VALID sequences of moves of how one 'ply' can
  end up being, given a set of dice rolled.

  It basically scans a list of POSSIBLE MoveNodes and leaves out those
  that do not fit into the official Backgammon restrictions of
  how a 'ply' shall be played
*/
var getValidMoveNodes = function (movesNodes) {
    var _a;
    var maxDepth = (0, exports.getMaxMoveNodesDepth)(movesNodes);
    var validMoveNodes = [];
    for (var _i = 0, movesNodes_1 = movesNodes; _i < movesNodes_1.length; _i++) {
        var possibleMoveNode = movesNodes_1[_i];
        var childrenMaxDepth = (0, exports.getMaxMoveNodesDepth)(possibleMoveNode.children);
        if (childrenMaxDepth + 1 === maxDepth) {
            validMoveNodes.push(possibleMoveNode);
        }
    }
    if (maxDepth === 1) {
        var maxDie_1 = (_a = (0, maxBy_1.default)(validMoveNodes, function (node) { return node.data.die; })) === null || _a === void 0 ? void 0 : _a.data.die;
        if (maxDie_1 !== undefined) {
            var biggerDieMoveNodes = (0, filter_1.default)(validMoveNodes, function (node) { return node.data.die === maxDie_1; });
            return biggerDieMoveNodes;
        }
    }
    return validMoveNodes;
};
exports.getValidMoveNodes = getValidMoveNodes;
var generateAllMoveSequencesFromPositionTransition = function (moveNodes, positionTransition) {
    var currentNodes = (0, filter_1.default)(moveNodes, function (mn) { return mn.data.from === positionTransition.from; });
    if (currentNodes.length === 0) {
        return [];
    }
    var movesSequences = (0, map_1.default)(currentNodes, function (node) { return [node.data]; });
    for (var i = 0; i < currentNodes.length; i++) {
        var moveSequence = movesSequences[i];
        var lastMoveInSequence = (0, last_1.default)(moveSequence);
        if (lastMoveInSequence.to === positionTransition.to) {
            continue;
        }
        var nextPositionTransition = {
            from: lastMoveInSequence.to,
            to: positionTransition.to,
        };
        var childrenNodes = currentNodes[i].children;
        for (var _i = 0, childrenNodes_1 = childrenNodes; _i < childrenNodes_1.length; _i++) {
            var childNode = childrenNodes_1[_i];
            var childMove = childNode.data;
            if (childMove.from === nextPositionTransition.from) {
                var followingMoveSequence = (0, flatMap_1.default)((0, exports.generateAllMoveSequencesFromPositionTransition)([childNode], nextPositionTransition));
                moveSequence.push.apply(moveSequence, followingMoveSequence);
            }
        }
    }
    return movesSequences;
};
exports.generateAllMoveSequencesFromPositionTransition = generateAllMoveSequencesFromPositionTransition;
