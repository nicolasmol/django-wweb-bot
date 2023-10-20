"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = require("axios");
const config_1 = require("@/core/config");
async function getChatGPTresponse(messages) {
    const options = {
        method: "post",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        data: {
            model: "gpt-3.5-turbo",
            messages: messages,
        },
        url: config_1.default.chatGPTEndPoint,
    };
    try {
        const response = await (0, axios_1.default)(options);
        return response;
    }
    catch (error) {
        console.error(error);
        return null;
    }
}
exports.default = getChatGPTresponse;
//# sourceMappingURL=chatGpt.js.map