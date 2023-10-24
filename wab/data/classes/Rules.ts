import * as fs from "fs";
import { IRule } from "data/interfaces/ruleInterface";
import * as chokidar from "chokidar";

/**
 * Classe pour gérer les règles à partir d'un fichier JSON.
 */
class Rules {
    static #jsonPath: string;
    static #rules: Record<string, IRule>;

    /**
     * Charge les règles à partir du fichier JSON spécifié.
     * @param jsonPath - Le chemin du fichier JSON.
     * @param initAutoReload - Indique si le rechargement automatique doit être initialisé.
     * @remarks
     * Charge les règles à partir du fichier JSON spécifié.
     * Si aucun chemin n'est spécifié, le chemin par défaut est utilisé.
     * Si initAutoReload est vrai, le rechargement automatique est initialisé.
     */
    static loadRulesFromJSON(jsonPath?: string, initAutoReload?: boolean) {
        if (!jsonPath) {
            jsonPath = Rules.#jsonPath;
        }
        Rules.#jsonPath = jsonPath;
        if (!jsonPath) throw new Error("No JSON path specified");
        try {
            const rulesJson = JSON.parse(fs.readFileSync(Rules.#jsonPath, "utf-8"));
            Rules.#rules = Rules.transformRulesJsonToFlatObject(rulesJson);
            if (initAutoReload) {
                const watcher = chokidar.watch(Rules.#jsonPath);
                watcher.on("change", () => {
                    console.log("JSON file changed, reloading rules...");
                    Rules.loadRulesFromJSON();
                });
            }
        } catch (error) {
            console.error("Error loading rules from JSON:", error);
        }
    }

    //--> Getters
    /**
     * Récupère les règles actuellement chargées.
     * @returns Les règles.
     */
    static get _(): Record<string, IRule> {
        return Rules.#rules;
    }

    /**
     * Transforme un objet JSON en règles.
     * @param rules
     * @param path - Le chemin.
     * @param idSet
     * @returns Les règles.
     * @remarks
     */
    private static transformRulesJsonToFlatObject(
        rules: IRule[],
        path: string = "",
        idSet: Set<string> = new Set()
    ): Record<string, IRule> {
        const flatObject: Record<string, IRule> = {};

        for (const rule of rules) {
            if (!/^\w+$/.test(rule.id)) {
                throw new Error(`Invalid ID: '${rule.id}'`);
            }
            if (idSet.has(rule.id)) {
                throw new Error(`Duplicate 'id' value found: ${rule.id}`);
            }
            const rulePath = path + (path.length > 0 ? "." : "") + rule.id;

            idSet.add(rule.id);

            flatObject[rulePath] = {
                regexes: {},
                ...rule,
            };

            if (rule.rules) {
                const subRulesObject = this.transformRulesJsonToFlatObject(rule.rules, rulePath, idSet);
                Object.assign(flatObject, subRulesObject);
                for (const childRule of rule.rules) {
                    if (!childRule.receivedMessageAsRex) {
                        throw new Error(`Missing 'receivedMessageAsRex' in rule with id '${rule.id}'`);
                    }
                    flatObject[rulePath].regexes = {
                        ...flatObject[rulePath].regexes,
                        [childRule.receivedMessageAsRex]: childRule,
                    };
                }
            }
        }

        return flatObject;
    }
}

export default Rules;
