"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("@/index");
exports.default = {
    async forward({ Msg, To, }) {
        try {
            console.log(`Forwarding message to ${To.name}:`);
            await Msg.forward(To);
        }
        catch (error) {
            console.error("Failed to forward message:", error);
        }
    },
    async send({ msg, to, }) {
        try {
            console.log(`Sent message ${typeof msg === "string" ? msg : ""} to ${to}`);
            await (0, index_1.client)().sendMessage(to, msg);
        }
        catch (error) {
            console.error("Failed to send message:", error);
        }
    },
};
//# sourceMappingURL=msg.js.map