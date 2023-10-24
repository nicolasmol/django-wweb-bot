import { User } from "data/classes/User";
import Config from "core/config";
import getChatGPTresponse from "utils/chatGpt";
import WAWebJS = require("whatsapp-web.js");
import { Str } from "core/globals";

/**
 * Classe Ad pour gérer les annonces d'utilisateurs.
 */
class Ad {
    /**
     * Définit une annonce pour un utilisateur.
     * @param Msg - Le message WhatsApp contenant l'annonce.
     * @param user - L'utilisateur associé à l'annonce.
     */

    public static async set(Msg: WAWebJS.Message, user: User): Promise<void> {
        const res = await Ad.validate(Msg.body);

        if (typeof res === "string") {
            await Msg.reply(res);
        } else {
            user.adText = Msg.body;
            await Msg.reply(Ad.formatOutput(user));
        }
    }

    /**
     * Vérifie si un texte d'annonce est valide.
     * @param adText - Le texte de l'annonce à valider.
     * @returns Une valeur booléenne ou un objet contenant un message d'erreur.
     */
    private static async validate(adText: string): Promise<boolean | string> {
        if (
            Str.forbiddenWordsAsRegex.some((word) => RegExp(word).exec(adText))
        ) {
            return Str.sorryContainsForbiddenWordsText;
        }

        if (RegExp(Str.checkPhoneRegex).exec(adText)) {
            return Str.sorrySeemsToHavePhoneText;
        }

        const chatGPTanswer = await Ad.validateWithChatGPT(adText);

        if (chatGPTanswer === false) {
            return Str.sorryDoesntSeemsToBeCompleteText;
        }

        if (chatGPTanswer === null) {
            const nameAndAge = RegExp(Str.startsWithNameAndAgeRegex).exec(
                adText
            );

            if (nameAndAge === null) {
                return Str.sorryDoesntSeemsToStartwithNameAndAgeText;
            }

            const forCheckAdText = adText.replace(
                Str.startsWithNameAndAgeRegex,
                ""
            );

            if (!RegExp(Str.iamRegex).exec(forCheckAdText)) {
                return Str.sorryDoesntSeemsToContainIamText;
            }
            if (!RegExp(Str.locationRegex).exec(forCheckAdText)) {
                return Str.sorryDoesntSeemsToContainLocationText;
            }
            if (!RegExp(Str.myGoalRegex).exec(forCheckAdText)) {
                return Str.sorryDoesntSeemsToContainMyGoalText;
            }
        }

        return true;
    }

    /**
     * Valide le texte de l'annonce à l'aide de ChatGPT.
     * @param adText - Le texte de l'annonce à valider.
     * @returns Une valeur booléenne ou null en l'absence de ChatGPT.
     */
    private static async validateWithChatGPT(
        adText: string
    ): Promise<boolean | null> {
        if (!Config.useChatGPT) return null;

        const messages = [
            {
                role: "user",
                content: Str.chatGTPpofileValidationPrePromptText.replace(
                    "%1",
                    adText
                ),
            },
        ];

        const response = await getChatGPTresponse(messages);
        if (response === null) return null;

        const result = response.data["choices"][0]["message"]["content"];

        return result.includes("Oui");
    }

    /**
     * Formate la sortie de l'annonce.
     * @param user - L'utilisateur avec l'annonce.
     * @returns Le texte formaté de l'annonce.
     */
    private static formatOutput(user: User): string {
        if (!user.adText) {
            return Str.noAdFormatedTextResponseTemplate
                .replace("%1", user.anonymeId)
                .replace("%3", user.likesCount.toString())
                .replace("%4", user.dislikesCount.toString());
        }
        let adTextWAFormatedParts = user.adText.split("\n");
        adTextWAFormatedParts = adTextWAFormatedParts.map(function (line) {
            return "_" + line.trim() + "_";
        });

        return Str.formatedAdTextResponseTemplate
            .replace("%1", user.anonymeId)
            .replace("%2", adTextWAFormatedParts.join("\n"))
            .replace("%3", user.likesCount.toString())
            .replace("%4", user.dislikesCount.toString());
    }
}

export default Ad;
