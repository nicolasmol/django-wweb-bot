import { isValidId } from "@/utils/objects";
import * as fs from "fs";
import { IRule } from "../interfaces/rule";

function transformJSONToRules(
  jsonObj: any,
  parentIds: string[] = []
): Record<string, IRule> {
  const rule: Record<string, IRule> = {};

  if (!isValidId(jsonObj.id)) {
    throw new Error(`Invalid ID: '${jsonObj.id}'`);
  }

  if (parentIds.includes(jsonObj.id)) {
    throw new Error(`Circular reference detected for rule ID: ${jsonObj.id}`);
  }

  rule[jsonObj.id] = {
    ...jsonObj,
  };

  if (jsonObj.rules && jsonObj.rules.length > 0) {
    for (const childRule of jsonObj.rules) {
      const childRuleObject = transformJSONToRules(childRule, [
        ...parentIds,
        jsonObj.id,
      ]);
      Object.assign(rule[jsonObj.id], childRuleObject);
      rule[jsonObj.id].matches = {
        ...rule[jsonObj.id].matches,
        [childRule.receivedMessageAsRex]: childRuleObject,
      };
    }
  }

  if (jsonObj.matches && Object.keys(jsonObj.matches).length > 0) {
    rule[jsonObj.id].matches = jsonObj.matches;
  }

  return rule;
}

const rulesJson = JSON.parse(
  fs.readFileSync("../rules/config.json").toString("utf-8")
);

const parentIds = new Set<string>();
const rulesObject = transformJSONToRules(rulesJson);
