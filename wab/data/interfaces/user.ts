interface IUserProperties {
  phoneId: string;
  adDate?: Date;
  adText?: string;
  likesCount?: number;
  dislikesCount?: number;
  anonymeId?: string;
  membershipType?: string;
  membershipExpirationDate?: Date;
  setAdLeftCount?: number;
  getAdLeftCount?: number;
  anonymousMsgLeftCount?: number;
  chatGPptUserHistory?: IUserChatGptHistory[];
  userChats?: IUserChat[];
}

interface IUser extends Document, IUserProperties {
  addLike(): Promise<void>;
  addDislike(): Promise<void>;
}

interface IUserChatGptHistory {
  userMessage: string;
  chatGPTresponse: string;
}

interface IUserChat {
  chatName: string;
  isGroup: boolean;
  activeRuleId: string;
  pausedRuleTimeoutUnixTs: number;
}

export { IUser, IUserProperties };
