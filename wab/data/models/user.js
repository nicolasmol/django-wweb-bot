"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const mongoose_1 = require("mongoose");
const user_1 = require("@/database/schemas/user");
const methods = {
    async addLike() {
        await this.updateOne({ $inc: { likesCount: 1 } }).exec();
    },
    async addDislike() {
        await this.updateOne({ $inc: { dislikesCount: 1 } }).exec();
    },
};
for (const [methodName, method] of Object.entries(methods)) {
    user_1.userSchema.method(methodName, method);
}
const UserModel = mongoose_1.default.model("User", user_1.userSchema);
exports.UserModel = UserModel;
//# sourceMappingURL=user.js.map