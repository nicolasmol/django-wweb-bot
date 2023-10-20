import { User } from "@/data/classes/User";
import WAWebJS = require("whatsapp-web.js");

export interface IModules {
  setAd: ({
    Msg,
    user,
  }: {
    Msg: WAWebJS.Message;
    user: User;
  }) => Promise<string>;
}
