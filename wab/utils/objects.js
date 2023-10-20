"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidId = exports.copyObjectWithReplacements = void 0;
function copyObjectWithReplacements(original, replacements) {
    return {
        ...original,
        ...replacements,
    };
}
exports.copyObjectWithReplacements = copyObjectWithReplacements;
function isValidId(id) {
    return typeof id === "string" && /^[A-Za-z0-9_]+$/.test(id);
}
exports.isValidId = isValidId;
//# sourceMappingURL=objects.js.map