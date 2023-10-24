import { User } from "data/classes/User";
import "database/connector";
import { Str } from "core/globals";
import Rules from "data/classes/Rules";
import WAWebJS = require("whatsapp-web.js");
import ChatHandler from "data/classes/ChatHandler";

/**
 * Fonction principale du bot.
 * @param Msg - Le message WhatsApp reçu.
 * @remarks
 * Fonction principale du bot.
 * Elle est appelée à chaque fois qu'un message est reçu.
 * */
export default async function handler(Msg: WAWebJS.Message): Promise<void> {
    try {
        let user = await User.get(Msg.from);
        let chatHandler = new ChatHandler(user, Msg);
        let chat = await chatHandler.getOrSetActiveChat();

        if (chat && chat.activeRuleId) {
            let rule = Rules._[chat.activeRuleId];
            if (rule && rule.regexes) {
                for (let [regex, targetRule] of Object.entries(rule.regexes)) {
                    let isMatch = Msg.body.match(new RegExp(regex, "i"));
                    if (isMatch) {
                        if (!chatHandler.isTargetRulePaused(targetRule.id)) {
                            if (targetRule.ifMatch) {
                                await chatHandler.executeRuleAction({
                                    targetRule,
                                    ruleAction: targetRule.ifMatch,
                                });
                            }
                        } else {
                            if (targetRule.ifPaused) {
                                await chatHandler.executeRuleAction({
                                    targetRule,
                                    ruleAction: targetRule.ifPaused,
                                });
                            }
                        }
                        if (rule.stopAtFirstMatch) {
                            break;
                        }
                    } else {
                        if (rule.ifNoMatch) {
                            await chatHandler.executeRuleAction({
                                ruleAction: rule.ifNoMatch,
                            });
                        }
                    }
                }
            }
        }
    } catch (err) {
        console.error(err);
        await Msg.reply(Str.errorSystemText);
    }
}
