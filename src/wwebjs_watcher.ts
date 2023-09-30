const activeChats = {};

import WAWebJS = require("whatsapp-web.js");
import { client } from "./app.js";

// function getGroupsToWatch() {
//   const groupsToWatch =
//     process.env.NODE_ENV === "production" ? [/𝙂𝙍𝙄𝘿𝘾𝙄.*/] : [/𝘿𝙅𝙊 • Tests/];
//   return groupsToWatch;
// }

export function wwebjsWatchMessages() {
  client.on("message", async (msg: WAWebJS.Message) => {
    console.log("Received message:", msg.body);
    await handleIncomingMessage(msg);
  });
}

async function handleIncomingMessage(msg: WAWebJS.Message) {}

async function sendMessage(to: string, text: WAWebJS.MessageContent) {
  try {
    await client.sendMessage(to, text);
  } catch (error) {
    console.error("Failed to send message:", error);
  }
}
