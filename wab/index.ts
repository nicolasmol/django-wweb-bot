import { Client, LocalAuth } from "whatsapp-web.js";
//@ts-ignore
import qrcode from "qrcode-terminal";
import handler from "core/handler";
import Config from "core/config";
import { Globs } from "core/globals";
import Rules from "data/classes/Rules";

let _client: Client;
export const client = () => _client;

(() => {
    console.log("Welcome to Djo Whatsapp-Bot");
    console.log("Please wait, Starting Bot...");
    _client = new Client({
        authStrategy: new LocalAuth(),
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
    _client.on("qr", (qr: string) => {
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
    /* ------------------------------------------------------------------------ */
    /*                                 on ready                                 */
    /* ------------------------------------------------------------------------ */
    _client.on("ready", async () => {
        console.log("Bot is ready!");
        console.log(
            "Whatsapp-Web Version : " + (await _client.getWWebVersion())
        );
        await _client.sendMessage(
            Config.owner,
            "Djo Whatsapp-Bot is ready to use"
        );

        /* ------------------------ Get Anonyme Ads Group ----------------------- */
        _client.getChats().then((chats) => {
            Globs.anonymeAdsGroup = chats.find(
                (chat) => chat.name === Config.anonymeAdsGroupName
            );
            if (Globs.anonymeAdsGroup) {
                console.log("Anonyme Ads Group found");
            }
        });
        /* ------------------------- Load rules in Globs ------------------------ */
        Rules.loadRulesFromJSON("./data/rules.json", true);
    });

    _client.on("message", async (msg) => {
        console.log("Received message:", msg.body);
        await handler(msg);
    });
})();
