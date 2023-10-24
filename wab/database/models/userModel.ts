import mongoose from "mongoose";
import { IUser, IUserChat } from "data/interfaces/userInterface";
import { userSchema } from "database/schemas/userSchema";

const methods = {
    async addLike(this: mongoose.Document & IUser): Promise<void> {
        await this.updateOne({ $inc: { likesCount: 1 } }).exec();
    },
    async addDislike(this: mongoose.Document & IUser): Promise<void> {
        await this.updateOne({ $inc: { dislikesCount: 1 } }).exec();
    },
    async updateChatPausedRulesInUnixTs(
        this: mongoose.Document & IUser,
        chatId: string,
        ruleId: string,
        unixTs: number
    ): Promise<void> {
        let chat = this.chats?.find((c) => c.id === chatId);
        if (chat) {
            chat.pausedRulesInUnixTs[ruleId] = unixTs;
            await this.updateOne({ chats: this.chats }).exec();
        }
    },
    async updateChatActiveRuleId(this: mongoose.Document & IUser, chatId: string, ruleId: string): Promise<void> {
        let chat = this.chats?.find((c) => c.id === chatId);
        if (chat) {
            chat.activeRuleId = ruleId;
            await this.updateOne({ chats: this.chats }).exec();
        }
    },
    async getOrSetChat(this: mongoose.Document & IUser, chatId: string, isGroup: boolean): Promise<IUserChat> {
        let chat = this.chats?.find((c) => c.id === chatId);
        if (!chat) {
            chat = {
                id: chatId,
                isGroup,
                activeRuleId: "",
                pausedRulesInUnixTs: {},
            };
            this.chats?.push(chat);
            await this.updateOne({ chats: this.chats }).exec();
        }

        return chat;
    },
};

for (const [methodName, method] of Object.entries(methods)) {
    userSchema.method(methodName, method);
}

const UserModel = Object.assign(mongoose.model<IUser>("User", userSchema), methods);

export { UserModel };
