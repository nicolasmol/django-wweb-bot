"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
(async () => {
    try {
        (0, mongoose_1.set)("strictQuery", true);
        const db = await (0, mongoose_1.connect)("mongodb://localhost/wab");
        console.log("DB connected to " + db.connection.name + "\n");
    }
    catch (error) {
        console.log(error);
    }
})();
//# sourceMappingURL=connector.js.map