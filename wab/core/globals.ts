import { getNestedObject } from "utils/objects";
import chokidar = require("chokidar");
import Ad from "lib/com/Ad";
import Fr from "lib/loc/fr";

export type KeyVal = { [key: string]: any };

interface Globals {
    [key: string]: any;
    lib: {
        loc: KeyVal;
        com: {
            ads: typeof Ad;
        };
    };
    getModule(module: string): any | undefined;
}

export const Globs: Globals = {
    lib: {
        loc: Fr,
        com: {
            ads: Ad,
        },
    },
    getModule(module: string): any | undefined {
        function searchInObject(obj: any): any | undefined {
            if (obj && typeof obj === "object") {
                if (obj.hasOwnProperty(module)) {
                    return obj[module];
                } else {
                    for (const key in obj) {
                        const result = searchInObject(obj[key]);
                        if (result !== undefined) {
                            return result;
                        }
                    }
                }
            }
            return undefined;
        }

        return searchInObject(this["lib"]);
    },
};
export const Str = new Proxy(
    {},
    {
        get: function (_, name: string) {
            return Globs.lib.loc.fr[name];
        },
    }
) as typeof Fr;

(async () => {
    if (Globs.lib) return;

    const watcher = chokidar.watch("./lib/**/*.js", {
        ignored: /^\.|^_.*$/,
        persistent: true,
    });

    watcher.on("error", function (error) {
        console.error("Error happened", error);
    });

    for (const type of ["add", "change", "unlink"]) {
        watcher.on(type, async (path): Promise<void> => {
            const pathArray = path.split("/");
            const file = pathArray.pop();

            if (type === "unlink") {
                delete getNestedObject(Globs.lib, pathArray)[file];
            } else {
                getNestedObject(Globs.lib, pathArray)[file] = (
                    await import(`./${pathArray}` + (type === "change" ? `?update=${Date.now()}` : ""))
                ).default;
            }
            console.log(`${type.toUpperCase}: ${pathArray.join(".")}.${file}`);
        });
    }
})();
