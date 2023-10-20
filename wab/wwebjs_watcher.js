"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wwebjsWatchMessages = void 0;
const activeChats = {};
const app_js_1 = require("./app.js");
// function getGroupsToWatch() {
//   const groupsToWatch =
//     process.env.NODE_ENV === "production" ? [/𝙂𝙍𝙄𝘿𝘾𝙄.*/] : [/𝘿𝙅𝙊 • Tests/];
//   return groupsToWatch;
// }
function wwebjsWatchMessages() {
    app_js_1.client.on("message", async (msg) => {
        console.log("Received message:", msg.body);
        await handleIncomingMessage(msg);
    });
}
exports.wwebjsWatchMessages = wwebjsWatchMessages;
async function handleIncomingMessage(msg) { }
async function sendMessage(to, text) {
    try {
        await app_js_1.client.sendMessage(to, text);
    }
    catch (error) {
        console.error("Failed to send message:", error);
    }
}
//# sourceMappingURL=wwebjs_watcher.js.map