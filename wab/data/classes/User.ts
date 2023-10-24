import mongoose from "mongoose";
import { UserModel } from "database/models/userModel";
import { IUser, IUserChat, IUserProperties } from "data/interfaces/userInterface";
import { generateRandomLetters } from "utils/utils";

/**
 * Classe User pour gérer les utilisateurs.
 * @remarks
 * Cette classe est un singleton.
 * Elle permet de gérer les utilisateurs.
 *
 */
export class User implements IUserProperties {
    public phoneId: string;
    public likesCount: number;
    public dislikesCount: number;
    public anonymeId: string;
    public chats?: IUserChat[];

    //# Private properties

    #adText?: string;
    #setAdLeftCount: number;
    /*   
  #adDate?: Date;
  #membershipType?: string;
  #membershipExpirationDate?: Date;
  #getAdLeftCount?: number;
  #anonymousMsgLeftCount?: number;
  #chatGPptUserHistory?: {
    userMessage: string;
    chatGPTresponse: string;
  }[]; 
  */

    #doc: mongoose.Document & IUser;

    private currentChat: any;

    //~> Constructor
    /**
     * Crée un utilisateur.
     * @param phoneId - L'identifiant de téléphone.
     */
    private constructor(phoneId: string) {
        this.phoneId = phoneId;
        this.likesCount = 0;
        this.dislikesCount = 0;
        this.anonymeId = "";
        this.#setAdLeftCount = -1;
        this.#doc = {} as mongoose.Document & IUser;
    }

    //--> Getters

    /**
     * Crée un utilisateur.
     * @param phoneId - L'identifiant de téléphone.
     * @returns Une promesse.
     * @remarks
     * Crée un utilisateur à partir de l'identifiant de téléphone.
     */
    public static async get(phoneId: string): Promise<User> {
        let user = new User(phoneId);
        await user._initialize();
        return user;
    }

    /**
     * Retourne le texte de l'annonce.
     * @returns Le texte de l'annonce.
     * @remarks
     * Si l'utilisateur n'a pas d'annonce, retourne undefined.
     */
    public get adText(): string | undefined {
        return this.#adText;
    }

    public getOrSetActiveChat(chatId: string, isGroup: boolean): Promise<IUserChat> {
        this.currentChat = this.#doc.getOrSetChat(chatId, isGroup);
        return this.currentChat;
    }

    public isTargetRulePaused(ruleId: string): boolean {
        return this.currentChat.pausedRulesInUnixTs[ruleId] > Date.now();
    }

    //<-- Setters
    /**
     * Définit le texte de l'annonce.
     * @param adText - Le texte de l'annonce.
     * @remarks
     * Si l'utilisateur n'a pas d'annonce, la définit.
     */
    public set adText(adText: string) {
        if (this.#setAdLeftCount != 0) {
            this.#adText = adText;
            this.#setAdLeftCount = (this.#setAdLeftCount ?? 0) - 1;
            this.#doc.updateOne({
                adText: this.#adText,
                setAdLeftCount: this.#setAdLeftCount,
            });
        }
    }

    public setRulePauseInUnixTs(ruleId: string, pauseSec: number): void {
        this.#doc.updateChatPausedRulesInUnixTs(this.currentChat.id, ruleId, Date.now() + pauseSec * 1000);
    }

    public setActivateRule(ruleId: string): void {
        this.#doc.updateChatActiveRuleId(this.currentChat.id, ruleId);
    }

    //# Private methods
    /**
     * Initialise l'utilisateur.
     * @returns Une promesse.
     * @remarks
     * Initialise l'utilisateur à partir de la base de données.
     * Si l'utilisateur n'existe pas, le crée.
     * Si l'utilisateur n'a pas d'identifiant anonyme, le génère.
     */
    private async _initialize(): Promise<void> {
        let doc = await UserModel.findOne({ phoneId: this.phoneId });
        if (doc) {
            this.#doc = doc;
            //this.#adDate = this.#doc.adDate;
            this.#adText = this.#doc.adText;
            this.likesCount = this.#doc.likesCount;
            this.dislikesCount = this.#doc.dislikesCount;
            this.anonymeId = this.#doc.anonymeId;
            //this.#membershipType = this.#doc.membershipType;
            //this.#membershipExpirationDate = this.#doc.membershipExpirationDate;
            //this.#setAdLeftCount = this.#doc.setAdLeftCount ?? -1;
            //this.#getAdLeftCount = this.#doc.getAdLeftCount;
            //this.#anonymousMsgLeftCount = this.#doc.anonymousMsgLeftCount;
            //this.#chatGPptUserHistory = this.#doc.chatGPptUserHistory;
            this.chats = this.#doc.chats;
        } else {
            let doc = await UserModel.create({
                phoneId: this.phoneId,
                anonymeId: this._generateAnonymeId(),
            });
            this.#doc = doc;
        }
    }

    /**
     * Génère un identifiant anonyme.
     * @returns L'identifiant anonyme.
     * @remarks
     * L'identifiant anonyme est généré à partir de l'identifiant de téléphone.
     */
    private _generateAnonymeId(): void {
        this.anonymeId = this.phoneId.slice(0, -4) + generateRandomLetters(4);
    }
}
