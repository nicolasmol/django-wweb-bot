import WAWebJS = require("whatsapp-web.js");
import { client } from "@/index";

export default {
  async forward({
    Msg,
    To,
  }: {
    Msg: WAWebJS.Message;
    To: WAWebJS.Chat;
  }): Promise<void> {
    try {
      console.log(`Forwarding message to ${To.name}:`);
      await Msg.forward(To);
    } catch (error) {
      console.error("Failed to forward message:", error);
    }
  },

  async send({
    msg,
    to,
  }: {
    to: string;
    msg: WAWebJS.MessageContent;
  }): Promise<void> {
    try {
      console.log(
        `Sent message ${typeof msg === "string" ? msg : ""} to ${to}`
      );
      await client().sendMessage(to, msg);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  },
};
