import { connect, set } from "mongoose";

(async () => {
    try {
        set("strictQuery", true);
        const db = await connect("mongodb://localhost/wab");
        console.log("DB connected to " + db.connection.name + "\n");
    } catch (error) {
        console.log(error);
    }
})();
