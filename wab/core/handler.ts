import { User } from "data/classes/User";
import "database/connector";
import Config from "core/config";
import { Globs, Str } from "core/globals";
import Rules from "data/classes/Rules";
import WAWebJS = require("whatsapp-web.js");
import { IRuleAction, IRule } from "data/interfaces/ruleInterface";

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
        let currentChat = await Msg.getChat();

        let chat = await user.getOrSetActiveChat(currentChat.id._serialized, currentChat.isGroup);

        if (chat && chat.activeRuleId) {
            let rule = Rules._[chat.activeRuleId];
            if (rule && rule.regexes) {
                for (let [regex, targetRule] of Object.entries(rule.regexes)) {
                    let isMatch = Msg.body.match(new RegExp(regex, "i"));
                    if (isMatch) {
                        if (!user.isTargetRulePaused(targetRule.id)) {
                            if (targetRule.ifMatch) {
                                await executeRuleAction({
                                    targetRule,
                                    ruleAction: targetRule.ifMatch,
                                    Msg,
                                    user,
                                });
                            }
                        } else {
                            if (targetRule.ifPaused) {
                                await executeRuleAction({
                                    targetRule,
                                    ruleAction: targetRule.ifPaused,
                                    Msg,
                                    user,
                                });
                            }
                        }
                        if (rule.stopAtFirstMatch) {
                            break;
                        }
                    } else {
                        if (rule.ifNoMatch) {
                            await executeRuleAction({ ruleAction: rule.ifNoMatch, Msg, user });
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

/**
 * Exécute une action de règle.
 * @param targetRule - La règle cible.
 * @param ruleAction - L'action de règle à exécuter.
 * @param Msg - Le message WhatsApp reçu.
 * @param user - L'utilisateur associé au message.
 * @remarks
 * Exécute une action de règle.
 */
async function executeRuleAction({
    targetRule,
    ruleAction,
    Msg,
    user,
}: {
    targetRule?: IRule;
    ruleAction: IRuleAction;
    Msg: WAWebJS.Message;
    user: User;
}): Promise<void> {
    if (targetRule) {
        user.setRulePauseInUnixTs(targetRule.id, targetRule.pauseRuleInSeconds || 0);
    }

    if (ruleAction.doBeforeReply) {
        await executeModule(ruleAction.doBeforeReply, Msg, user);
    }
    let replies = [];
    if (ruleAction.replyMessages) {
        for (let replyMessage of ruleAction.replyMessages) {
            let reply = replyMessage.replace(/{{(.*?)}}/g, (_) => "tocomplete" || "");
            replies.push(reply);
            await Msg.reply(reply);
            await new Promise((resolve) => setTimeout(resolve, Config.delayBetweenRepliesInSec * 1000));
        }
    }
    if (ruleAction.doAfterReply) {
        await executeModule(ruleAction.doAfterReply, Msg, user, replies);
    }
    if (ruleAction.thenGoToRuleId) {
        user.setActivateRule(ruleAction.thenGoToRuleId);
    }
}

/**
 * Exécute un module.
 * @param command - La commande à exécuter.
 * @param Msg - Le message WhatsApp reçu.
 * @param user - L'utilisateur associé au message.
 * @param replies - Les réponses déjà envoyées.
 */
async function executeModule(command: string, Msg: WAWebJS.Message, user: User, replies?: string[]): Promise<void> {
    let [moduleName, functionName] = command.split(".");

    let module = Globs.getModule(moduleName);
    if (module && !module.disabled) {
        if (functionName) {
            if (module[functionName]) {
                await module[functionName](Msg, user, replies);
            } else {
                throw new Error(`Function ${functionName} not found in module ${moduleName}`);
            }
        } else {
            if (module.execute) {
                await module.execute(Msg, user, replies);
            } else {
                throw new Error(`Function execute not found in module ${moduleName}`);
            }
        }
    }
}
