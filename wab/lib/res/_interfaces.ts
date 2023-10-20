import { User } from "@/data/classes/User";
import WAWebJS = require("whatsapp-web.js");

export interface IResponses {
  formatedAd(user: User): string;
  send({ to, msg }: { to: string; msg: string }): Promise<void>;
  forward({
    Msg,
    To,
  }: {
    Msg: WAWebJS.Message;
    To: WAWebJS.Chat;
  }): Promise<void>;
}
