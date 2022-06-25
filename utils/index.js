"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateError = exports.getUniqueId = void 0;
var getUniqueId = function () { return "_" + Math.random().toString(36).substr(2, 9); };
exports.getUniqueId = getUniqueId;
var generateError = function (errorType, payload) { return ({
    errorType: errorType,
    payload: payload,
}); };
exports.generateError = generateError;
