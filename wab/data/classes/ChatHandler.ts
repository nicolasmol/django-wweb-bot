import { User } from "./User";
import { IUserChat } from "../interfaces/userInterface";
import { IRule, IRuleAction } from "data/interfaces/ruleInterface";
import WAWebJS from "whatsapp-web.js";
import { Globs } from "core/globals";
import Config from "core/config";

class ChatHandler {
    private currentChat: IUserChat | undefined;

    constructor(private user: User, private Msg: WAWebJS.Message) {}

    public async getOrSetActiveChat(): Promise<IUserChat> {
        let currentChat = await this.Msg.getChat();
        this.currentChat = await this.user.doc.getOrSetChat(currentChat.id._serialized, currentChat.isGroup);
        return this.currentChat;
    }

    public isTargetRulePaused(ruleId: string): boolean {
        return (this.currentChat!.pausedRulesInUnixTs[ruleId] || 0) > Date.now();
    }

    public async setRulePauseInUnixTs(ruleId: string, pauseSec: number): Promise<void> {
        this.user.doc.updateChatPausedRulesInUnixTs(this.currentChat!.id, ruleId, Date.now() + pauseSec * 1000);
    }

    public async setActivateRule(ruleId: string): Promise<void> {
        this.user.doc.updateChatActiveRuleId(this.currentChat!.id, ruleId);
    }

    /**
     * Exécute une action de règle.
     * @param targetRule - La règle cible.
     * @param ruleAction - L'action de règle à exécuter.
     * @param Msg - Le message WhatsApp reçu.
     * @param user - L'utilisateur associé au message.
     */

    public async executeRuleAction({
        targetRule,
        ruleAction,
    }: {
        targetRule?: IRule;
        ruleAction: IRuleAction;
    }): Promise<void> {
        if (targetRule) {
            this.setRulePauseInUnixTs(targetRule.id, targetRule.pauseRuleInSeconds || 0);
        }

        if (ruleAction.doBeforeReply) {
            await this.executeModule(ruleAction.doBeforeReply);
        }
        let replies = [];
        if (ruleAction.replyMessages) {
            for (let replyMessage of ruleAction.replyMessages) {
                let reply = replyMessage.replace(/{{(.*?)}}/g, (_) => "tocomplete" || "");
                replies.push(reply);
                await this.Msg.reply(reply);
                await new Promise((resolve) => setTimeout(resolve, Config.delayBetweenRepliesInSec * 1000));
            }
        }
        if (ruleAction.doAfterReply) {
            await this.executeModule(ruleAction.doAfterReply, replies);
        }
        if (ruleAction.thenGoToRuleId) {
            this.setActivateRule(ruleAction.thenGoToRuleId);
        }
    }

    /**
     * Exécute un module.
     * @param command - La commande à exécuter.
     * @param Msg - Le message WhatsApp reçu.
     * @param user - L'utilisateur associé au message.
     * @param replies - Les réponses déjà envoyées.
     */
    private async executeModule(command: string, replies?: string[]): Promise<void> {
        let [moduleName, functionName] = command.split(".");

        let module = Globs.getModule(moduleName);
        if (module && !module.disabled) {
            if (functionName) {
                if (module[functionName]) {
                    await module[functionName](this.Msg, this.user, replies);
                } else {
                    throw new Error(`Function ${functionName} not found in module ${moduleName}`);
                }
            } else {
                if (module.execute) {
                    await module.execute(this.Msg, this.user, replies);
                } else {
                    throw new Error(`Function execute not found in module ${moduleName}`);
                }
            }
        }
    }
}

export default ChatHandler;
