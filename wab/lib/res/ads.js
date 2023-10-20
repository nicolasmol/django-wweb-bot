"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    formatedAd(user) {
        if (!user.adText) {
            return global.lib.locales.fr.noAdFormatedTextResponseTemplate
                .replace("%1", user.anonymeId)
                .replace("%3", user.likesCount)
                .replace("%4", user.dislikesCount);
        }
        var adTextWAFormatedParts = user.adText.split("\n");
        adTextWAFormatedParts = adTextWAFormatedParts.map(function (line) {
            return "_" + line.trim() + "_";
        });
        return global.lib.locales.fr.formatedAdTextResponseTemplate
            .replace("%1", user.anonymeId)
            .replace("%2", adTextWAFormatedParts.join("\n"))
            .replace("%3", user.likesCount)
            .replace("%4", user.dislikesCount);
    },
};
//# sourceMappingURL=ads.js.map