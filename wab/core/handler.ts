import { User } from "data/classes/User";
import "database/connector";
import Config from "core/config";
import { copyObjectWithReplacements as copyWith } from "utils/objects";
import { Globs, Str } from "core/globals";
import WAWebJS = require("whatsapp-web.js");

/**
 * Gère les messages.
 * @param Msg - Le message.
 * @param rules
 * @returns Une promesse.
 */
async function handler(Msg: WAWebJS.Message) {
    const command = Msg.body.trim().toLowerCase();

    try {
        if (command.startsWith(Config.keywords.iamKeyWord)) {
            let user = await User.get(Msg.from);

            let adMsg = copyWith(Msg, {
                body: Msg.body.substring(Config.keywords.iamKeyWord.length),
            });
            await Globs.lib.com.ads.set(adMsg, user);
        } else {
            await Msg.reply("You sent: " + Msg.body);
        }
    } catch (err) {
        console.error(err);
        await Msg.reply(Str.errorSystemText);
    }
}

export default handler;
