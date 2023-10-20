"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const user_1 = require("@/data/models/user");
class User {
    phoneId;
    userChats;
    _adDate;
    _adText;
    _likesCount;
    _dislikesCount;
    _anonymeId;
    _membershipType;
    _membershipExpirationDate;
    _setAdLeftCount;
    _getAdLeftCount;
    _anonymousMsgLeftCount;
    _chatGPptUserHistory;
    _doc;
    //~> Constructor
    constructor(phoneId) {
        this.phoneId = phoneId;
    }
    //{ Public methods }
    static async createUser(phoneId) {
        let user = new User(phoneId);
        await user._initialize();
        return user;
    }
    //# Private methods
    async _initialize() {
        this._doc = await user_1.UserModel.findOne({ phoneId: this.phoneId });
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
        }
        else {
            this._doc = await user_1.UserModel.create({
                phoneId: this.phoneId,
                anonymeId: this._generateAnonymeId(),
            });
        }
    }
    _generateAnonymeId() {
        this._anonymeId = this.phoneId.slice(0, -4) + generateRandomLetters;
    }
    //<-- Setters
    set adText(adText) {
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
    get adText() {
        return this._adText;
    }
    get anonymeId() {
        return this._anonymeId;
    }
    get likesCount() {
        return this._likesCount;
    }
    get dislikesCount() {
        return this._dislikesCount;
    }
}
exports.User = User;
//# sourceMappingURL=User.js.map