"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userSchema = void 0;
const mongoose_1 = require("mongoose");
const userSchema = new mongoose_1.default.Schema({
    phoneId: { type: String, required: true, unique: true, index: true },
    adDate: Date,
    adText: String,
    likesCount: { type: Number, default: 0 },
    dislikesCount: { type: Number, default: 0 },
    anonymeId: { type: String, unique: true, index: true },
    membershipType: { type: String, default: "free" },
    membershipExpirationDate: Date,
    setAdLeftCount: Number,
    getAdLeftCount: Number,
    anonymousMsgLeftCount: Number,
    chatGPptUserHistory: [{ userMessage: String, chatGPTresponse: String }],
    userChats: [
        {
            chatName: String,
            isGroup: Boolean,
            activeRuleId: String,
            pausedRuleTimeoutUnixTs: Number,
        },
    ],
});
exports.userSchema = userSchema;
userSchema.pre("save", function (next) {
    if (this.isModified("adText")) {
        this.adDate = new Date();
    }
    next();
});
//# sourceMappingURL=user.js.map