import { Chat, Client, LocalAuth } from "whatsapp-web.js";
import qrcode = require("qrcode-terminal");
import chokidar = require("chokidar");
import handler from "./handler";
import Config from "./core/config";
import { IModules } from "./lib/modules/_interfaces";
import { IResponses } from "./lib/res/_interfaces";

export interface Globals {
  lib: {
    modules: IModules;
    res: IResponses;
    [key: string]: any;
  };
  anonymeAdsGroup: Chat;
  [key: string]: any;
}
declare var global: Globals;

let _client: Client;
export const client = () => _client;

interface Locales {
  [key: string]: string;
}

export const Str: Locales = new Proxy(
  {},
  {
    get: function (target, name) {
      return global.lib.locales.fr[name];
    },
  }
);

async function start() {
  console.log("Welcome to Djo Whatsapp-Bot");
  console.log("Please wait, Starting Bot...");
  _client = new Client({
    authStrategy: new LocalAuth({}),
    puppeteer: {
      headless: true,
      executablePath: "/usr/bin/google-chrome-stable",
      args: [
        "--no-sandbox",
        "--disable-gpu-sandbox",
        "--disable-dev-shm-usage",
        "--disable-features=IsolateOrigins,site-per-process",
      ],
    },
  });
  _client.initialize();
  _client.on("change_state", (msg) => console.log(msg));
  _client.on("qr", (qr: String) => {
    qrcode.generate(
      qr,
      {
        small: true,
      },
      function (qrcode: any) {
        console.log(qrcode);
      }
    );
    console.log("Scan Qr Code");
  });
  _client.on("ready", async () => {
    console.log("Bot is ready!");
    console.log("Whatsapp-Web Version : " + (await _client.getWWebVersion()));
    _client.sendMessage(Config.owner, "Djo Whatsapp-Bot is ready to use");
  });

  _client.getChats().then((chats) => {
    global.anonymeAdsGroup = chats.find(
      (chat) => chat.name === Config.anonymeAdsGroupName
    );
    if (global.anonymeAdsGroup) {
      console.log("Anonyme Ads Group found");
    }
  });
  _client.on("message", async (msg) => {
    console.log("Received message:", msg.body);
    await handler(msg);
  });
}

function getNestedObject(obj: { [x: string]: any }, pathArr: string | any[]) {
  for (let i = 0; i < pathArr.length; i++) {
    if (!obj[pathArr[i]]) obj[pathArr[i]] = {};
    obj = obj[pathArr[i]];
  }
  return obj;
}

var watcher = chokidar.watch("./lib/**/*.js", {
  ignored: /^\.|^_.*$/,
  persistent: true,
});

watcher.on("error", function (error) {
  console.error("Error happened", error);
});

for (const type of ["add", "change", "unlink"]) {
  watcher.on(type, async function (pathh) {
    const path = pathh.split("/");
    const file = path.pop();

    if (type === "unlink") {
      delete getNestedObject(global.lib, path)[file];
    } else {
      getNestedObject(global.lib, path)[file] = (
        await import(
          `./${pathh}` + (type === "change" ? `?update=${Date.now()}` : "")
        )
      ).default;
    }
    console.log(`${type.toUpperCase}: ${path.join(".")}.${file}`);
  });
}

start();
