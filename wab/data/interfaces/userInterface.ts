import { UserModel } from "database/models/userModel";
interface IUserProperties {
    phoneId: string;
    adDate?: Date;
    adText?: string;
    likesCount: number;
    dislikesCount: number;
    anonymeId: string;
    membershipType?: string;
    membershipExpirationDate?: Date;
    setAdLeftCount?: number;
    getAdLeftCount?: number;
    anonymousMsgLeftCount?: number;
    chatGPptUserHistory?: IUserChatGptHistory[];
    chats?: IUserChat[];
}

interface IUser extends Document, IUserProperties {
    addLike(): typeof UserModel.addLike;
    addDislike(): typeof UserModel.addDislike;
    updateChatPausedRulesInUnixTs: typeof UserModel.updateChatPausedRulesInUnixTs;
    updateChatActiveRuleId: typeof UserModel.updateChatActiveRuleId;
    getOrSetChat: typeof UserModel.getOrSetChat;
}

interface IUserChatGptHistory {
    userMessage: string;
    chatGPTresponse: string;
}

interface IUserChat {
    id: string;
    isGroup: boolean;
    activeRuleId: string;
    pausedRulesInUnixTs: Record<string, number>;
}

export { IUser, IUserChat, IUserProperties };
