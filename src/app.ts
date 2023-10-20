import { Client, LocalAuth } from "whatsapp-web.js";
import qrcode = require("qrcode-terminal");
import { wwebjsWatchMessages } from "./wwebjs_watcher.js";
import dotenv = require("dotenv");
import path = require("path");
dotenv.config();

/* ------------------------------------------------------------------------- */
/*                             initialize WWebJS                             */
/* ------------------------------------------------------------------------- */
export const client = new Client({
  authStrategy: new LocalAuth({
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

client.on("qr", (qr: String) => {
  qrcode.generate(qr, { small: true });
});

client.on("ready", async () => {
  wwebjsWatchMessages();
  console.log("Client is ready!");
});

client.on("authenticated", () => {
  console.log("Client authenticated");
});

client.on("auth_failure", (error: String) => {
  console.error("Authentication failed:", error);
});

client.on("disconnected", (reason: String) => {
  console.log("Client disconnected:", reason);
});

async function initialize() {
  try {
    await client.initialize();
  } catch (error) {
    console.error("Initialization failed:", error);
  }
}
initialize();
