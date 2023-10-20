import mongoose from "mongoose";
import { UserModel } from "@/data/models/user";
import { IUser, IUserProperties } from "@/data/interfaces/user";

export class User implements IUserProperties {
  public phoneId: string;
  public userChats?: {
    chatName: string;
    isGroup: boolean;
    activeRuleId: string;
    pausedRuleTimeoutUnixTs: number;
  }[];

  private _adDate?: Date;
  private _adText?: string;
  private _likesCount?: number;
  private _dislikesCount?: number;
  private _anonymeId?: string;
  private _membershipType?: string;
  private _membershipExpirationDate?: Date;
  private _setAdLeftCount?: number;
  private _getAdLeftCount?: number;
  private _anonymousMsgLeftCount?: number;
  private _chatGPptUserHistory?: {
    userMessage: string;
    chatGPTresponse: string;
  }[];

  private _doc: mongoose.Document & IUser;

  //~> Constructor
  constructor(phoneId: string) {
    this.phoneId = phoneId;
  }

  //{ Public methods }
  public static async createUser(phoneId: string): Promise<User> {
    let user = new User(phoneId);
    await user._initialize();
    return user;
  }

  //# Private methods
  private async _initialize(): Promise<void> {
    this._doc = await UserModel.findOne({ phoneId: this.phoneId });
    if (this._doc) {
      this._adDate = this._doc.adDate;
      this._adText = this._doc.adText;
      this._likesCount = this._doc.likesCount;
      this._dislikesCount = this._doc.dislikesCount;
      this._anonymeId = this._doc.anonymeId;
      this._membershipType = this._doc.membershipType;
      this._membershipExpirationDate = this._doc.membershipExpirationDate;
      this._setAdLeftCount = this._doc.setAdLeftCount;
      this._getAdLeftCount = this._doc.getAdLeftCount;
      this._anonymousMsgLeftCount = this._doc.anonymousMsgLeftCount;
      this._chatGPptUserHistory = this._doc.chatGPptUserHistory;
      this.userChats = this._doc.userChats;
    } else {
      this._doc = await UserModel.create({
        phoneId: this.phoneId,
        anonymeId: this._generateAnonymeId(),
      });
    }
  }

  private _generateAnonymeId(): void {
    this._anonymeId = this.phoneId.slice(0, -4) + generateRandomLetters;
  }

  //<-- Setters
  public set adText(adText: string) {
    if (this._setAdLeftCount > 0) {
      this._adText = adText;
      this._setAdLeftCount--;
      this._doc.updateOne({
        adText: this._adText,
        setAdLeftCount: this._setAdLeftCount,
      });
    }
  }

  //--> Getters
  public get adText(): string {
    return this._adText;
  }
  public get anonymeId(): string {
    return this._anonymeId;
  }
  public get likesCount(): number {
    return this._likesCount;
  }
  public get dislikesCount(): number {
    return this._dislikesCount;
  }
}
