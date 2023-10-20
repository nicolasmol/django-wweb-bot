"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Str = exports.client = void 0;
const whatsapp_web_js_1 = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const chokidar = require("chokidar");
const handler_1 = require("./handler");
const config_1 = require("./core/config");
let _client;
const client = () => _client;
exports.client = client;
exports.Str = new Proxy({}, {
    get: function (target, name) {
        return global.lib.locales.fr[name];
    },
});
async function start() {
    console.log("Welcome to Djo Whatsapp-Bot");
    console.log("Please wait, Starting Bot...");
    _client = new whatsapp_web_js_1.Client({
        authStrategy: new whatsapp_web_js_1.LocalAuth({}),
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
    _client.on("qr", (qr) => {
        qrcode.generate(qr, {
            small: true,
        }, function (qrcode) {
            console.log(qrcode);
        });
        console.log("Scan Qr Code");
    });
    _client.on("ready", async () => {
        console.log("Bot is ready!");
        console.log("Whatsapp-Web Version : " + (await _client.getWWebVersion()));
        _client.sendMessage(config_1.default.owner, "Djo Whatsapp-Bot is ready to use");
    });
    _client.getChats().then((chats) => {
        global.anonymeAdsGroup = chats.find((chat) => chat.name === config_1.default.anonymeAdsGroupName);
        if (global.anonymeAdsGroup) {
            console.log("Anonyme Ads Group found");
        }
    });
    _client.on("message", async (msg) => {
        console.log("Received message:", msg.body);
        await (0, handler_1.default)(msg);
    });
}
function getNestedObject(obj, pathArr) {
    for (let i = 0; i < pathArr.length; i++) {
        if (!obj[pathArr[i]])
            obj[pathArr[i]] = {};
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
        }
        else {
            getNestedObject(global.lib, path)[file] = (await Promise.resolve(`${`./${pathh}` + (type === "change" ? `?update=${Date.now()}` : "")}`).then(s => require(s))).default;
        }
        console.log(`${type.toUpperCase}: ${path.join(".")}.${file}`);
    });
}
start();
//# sourceMappingURL=index.js.map