import { User } from "data/classes/User";
import "database/connector";
import Config from "core/config";
import { Globs, Str } from "core/globals";
import Rules from "data/classes/Rules";
import WAWebJS = require("whatsapp-web.js");
import { IRuleAction, IRule } from "data/interfaces/ruleInterface";
import { IUserChat } from "data/interfaces/userInterface";

/**
 * The `export default async function handler(Msg: WAWebJS.Message) {` is exporting a default asynchronous function called
 * `handler`. This function takes a parameter `Msg` of type `WAWebJS.Message`. It is used to handle incoming messages in a
 * chat application. The function is marked as `async` because it uses `await` to handle asynchronous operations.
 *
 * @async
 * @function
 * @name handler
 * @kind function
 * @param {WAWebJS.Message} Msg
 * @returns {Promise<void>}
 * @exports
 */
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
 * The `executeRuleAction` function is an asynchronous function that takes an object as a parameter. This object contains
 * properties such as `targetRule`, `ruleAction`, `Msg`, and `user`.
 *
 * @async
 * @function
 * @name executeRuleAction
 * @kind function
 * @param {{ targetRule?: IRule | undefined ruleAction: IRuleAction Msg: WAWebJS.Message user: User }} { targetRule, ruleAction, Msg, user, }
 * @returns {Promise<void>}
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
 * The `executeModule` function is an asynchronous function that takes four parameters: `command`, `Msg`, `user`, and
 * `replies`.
 *
 * @async
 * @function
 * @name executeModule
 * @kind function
 * @param {string} command
 * @param {WAWebJS.Message} Msg
 * @param {User} user
 * @param {string[]} replies?
 * @returns {Promise<void>}
 */
async function executeModule(command: string, Msg: WAWebJS.Message, user: User, replies?: string[]): Promise<void> {
    let [moduleName, functionName] = command.split(".");

    let module = Globs.findModuleValue(moduleName);
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
