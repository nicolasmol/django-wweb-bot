import { User } from "@/data/classes/User";
import Config from "@/core/config";

import { Globals, Str } from "@/index";
import getChatGPTresponse from "@/utils/chatGpt";
import WAWebJS = require("whatsapp-web.js");
declare var global: Globals;

export default {
  async setAd({
    Msg,
    user,
  }: {
    Msg: WAWebJS.Message;
    user: User;
  }): Promise<void> {
    var res = await this.checkValidAdText(Msg.body);
    if (typeof res === "object") {
      await global.lib.res.send({
        to: Msg.from,
        msg: res.errorMessage,
      });
    } else {
      user.adText = Msg.body;
      await global.lib.res.send({
        to: Msg.from,
        msg: global.lib.res.formatedAd(user),
      });
    }
  },

  async checkValidAdText(
    adText: string
  ): Promise<boolean | { errorMessage: string }> {
    if (
      this.forbiddenWordsAsRegex.some(
        (word: { [Symbol.match](string: string): RegExpMatchArray }) =>
          adText.match(word)
      )
    ) {
      return { errorMessage: Str.sorryContainsForbiddenWordsText };
    }

    if (adText.match(this.checkPhoneRegex)) {
      return { errorMessage: Str.sorrySeemsToHavePhoneText };
    }

    var chatGPTanswer = this.validateAdWithChatGPT(adText);

    if (chatGPTanswer === false) {
      return { errorMessage: Str.sorryDoesntSeemsToBeCompleteText };
    }

    if (chatGPTanswer === null) {
      var nameAndAge = adText.match(this.startsWithNameAndAgeRegex);

      if (nameAndAge === null) {
        return { errorMessage: Str.sorryDoesntSeemsToStartwithNameAndAgeText };
      }

      var forCheckAdText = adText.replace(this.startsWithNameAndAgeRegex, "");

      if (!forCheckAdText.match(this.iamRegex)) {
        return { errorMessage: Str.sorryDoesntSeemsToContainIamText };
      }
      if (!forCheckAdText.match(this.locationRegex)) {
        return { errorMessage: Str.sorryDoesntSeemsToContainLocationText };
      }
      if (!forCheckAdText.match(this.myGoalRegex)) {
        return { errorMessage: Str.sorryDoesntSeemsToContainMyGoalText };
      }
    }

    return true;
  },

  async validateAdWithChatGPT(adText: string): Promise<boolean | null> {
    if (Config.useChatGPT === false) return null;

    var messages = [
      {
        role: "user",
        content:
          global.lib.locales.fr_chatGpt.chatGTPpofileValidationPrePromptText.replace(
            "%1",
            adText
          ),
      },
    ];

    var response = await getChatGPTresponse(messages);
    if (response === null) return null;

    var result = response.data["choices"][0]["message"]["content"];

    return result.includes("Oui");
  },

  forbiddenWordsAsRegex: [
    "\bpute?",
    "pa[yi]ant?",
    "(par)?t(ou)?ze?",
    "\bga?n?gs*bang?",
    "tournante",
    "chems?",
  ],

  startsWithNameAndAgeRegex:
    /^((sa?lu?t?|co?u?co?u?|bo?n?jo?u?r|yo|hello|hey|bo?n?so?i?r|yo|we?sh)[A-ZÀ-ÿ\s\p{P}]+)?(j(e|\s*'?)\s*((suis?(?!s?\s[aà]\s))|(m\s*'(app?e?ll?e?)|me\s+((pr[ée])?nomm?e?)))[\s\p{P}])?([A-ZÀ-ÿ]+['"\-\s]*[A-ZÀ-ÿ]{2,}[A-ZÀ-ÿ\s\p{P}]*)(\s+j\s*'ai\s+)?(\d{2,})\s+an?s?[\s\p{P}]+/iu,

  iamRegex: /j(e|\s*'?)\s*(suis?(?!s?\s[aà]\s))\s+[\d\s\p{L}'-]{3,}/iu,

  locationRegex:
    /j(e|\s*'?)?\s*(suis\s+(?:(?!une?)|(?=chez|dans))|((vous\s+|te\s+)?(re[çc]ois?|invite)|vi[es]?|h?abite?)).*(.*(?:[aà]|aux?))\s+[\d\s\p{L}'-]{3,}/iu,

  myGoalRegex:
    /j(e|\s*'?)\s*((re)?ch(erche?)?|propose?|organi[sz]e?|ai\s+envie?\s+d(\s*'une?|e)|veux?|sh?ouh?ait[es]?|d[ée]sire?)\s+[\d\s\p{L}'-]{3,}/iu,

  checkPhoneRegex: /\+?[\d\s]*\d[\d\s]{6,}\d/,
};
