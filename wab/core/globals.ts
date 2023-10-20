import { getNestedObject } from "utils/objects";
import chokidar = require("chokidar");
import Ad from "lib/com/Ad";
import Fr from "lib/loc/fr";
import { IRule } from "data/interfaces/rule";

export type KeyVal = { [key: string]: any };

interface Globals {
  [key: string]: any;
  lib: {
    loc: KeyVal;
    com: {
      ads: typeof Ad;
    };
  };
  rules: IRule[];
}

export let Globs: Globals = undefined as unknown as Globals;

export const Str = new Proxy(
  {},
  {
    get: function (_, name: string) {
      return Globs.lib.loc.fr[name];
    },
  }
) as typeof Fr;

(async () => {
  if (Globs) return;

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


      if (type === "unlink")  {
        delete getNestedObject(Globs.lib, pathArray)[file];
    } else {
        getNestedObject(Globs.lib, pathArray)[file] = (
          await import(
            `./${pathArray}` + (type === "change" ? `?update=${Date.now()}` : "")
          )
        ).default;
      }
      console.log(`${type.toUpperCase}: ${pathArray.join(".")}.${file}`);
    });
  }
})();
