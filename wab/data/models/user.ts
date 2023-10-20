import mongoose from "mongoose";
import { IUser } from "@/data/interfaces/user";
import { userSchema } from "@/database/schemas/user";

const methods = {
  async addLike(this: mongoose.Document & IUser) {
    await this.updateOne({ $inc: { likesCount: 1 } }).exec();
  },
  async addDislike(this: mongoose.Document & IUser) {
    await this.updateOne({ $inc: { dislikesCount: 1 } }).exec();
  },
};

for (const [methodName, method] of Object.entries(methods)) {
  userSchema.method(methodName, method);
}

const UserModel = mongoose.model<IUser>("User", userSchema);
export { UserModel };
