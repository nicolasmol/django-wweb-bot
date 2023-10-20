"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const User_1 = require("./data/classes/User");
require("./database/connector");
const fr_1 = require("./lib/locales/fr");
const config_1 = require("./core/config");
const objects_1 = require("@/utils/objects");
async function handler(msg) {
    const command = msg.body.trim().toLowerCase();
    try {
        if (command.startsWith(config_1.default.keywords.iamKeyWord)) {
            var user = await User_1.User.createUser(msg.from);
            user.
            ;
            let adMsg = (0, objects_1.copyObjectWithReplacements)(msg, {
                body: msg.body.substring(config_1.default.keywords.iamKeyWord.length),
            });
            await global.lib.modules.setAd({ Msg: adMsg, user });
        }
        else {
            await global.lib.res.send({
                to: msg.from,
                msg: "You sent: " + msg.body,
            });
        }
    }
    catch (err) {
        console.error(err);
        await global.lib.res.send({
            to: msg.from,
            msg: fr_1.default.errorSystemText,
        });
    }
}
exports.default = handler;
//# sourceMappingURL=handler.js.map