"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.client = void 0;
const whatsapp_web_js_1 = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const wwebjs_watcher_js_1 = require("./wwebjs_watcher.js");
const dotenv = require("dotenv");
const path = require("path");
dotenv.config();
/* ------------------------------------------------------------------------- */
/*                             initialize WWebJS                             */
/* ------------------------------------------------------------------------- */
exports.client = new whatsapp_web_js_1.Client({
    authStrategy: new whatsapp_web_js_1.LocalAuth({
        dataPath: path.resolve(__dirname, "..", ".wwebjs_auth"),
    }),
    puppeteer: {
        args: process.env.NODE_ENV === "production" ? ["--no-sandbox"] : [],
        executablePath: "/usr/bin/google-chrome",
    },
    webVersionCache: {
        type: "local",
        path: path.resolve(__dirname, "..", ".wwebjs_cache"),
    },
});
exports.client.on("qr", (qr) => {
    qrcode.generate(qr, { small: true });
});
exports.client.on("ready", async () => {
    (0, wwebjs_watcher_js_1.wwebjsWatchMessages)();
    console.log("Client is ready!");
});
exports.client.on("authenticated", () => {
    console.log("Client authenticated");
});
exports.client.on("auth_failure", (error) => {
    console.error("Authentication failed:", error);
});
exports.client.on("disconnected", (reason) => {
    console.log("Client disconnected:", reason);
});
async function initialize() {
    try {
        await exports.client.initialize();
    }
    catch (error) {
        console.error("Initialization failed:", error);
    }
}
initialize();
//# sourceMappingURL=app.js.map