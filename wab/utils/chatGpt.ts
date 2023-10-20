import axios from "axios";
import Config from "core/config";

/**
 * Vérifie si un texte d'annonce est valide.
 * @returns Une valeur booléenne ou un objet contenant un message d'erreur.
 * @param messages le texte à analyser
 */
async function getChatGPTresponse(messages: { role: string; content: any }[]) {
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
    url: Config.chatGPTEndPoint,
  };

  try {
    return await axios(options);
  } catch (error) {
    console.error(error);
    return null;
  }
}

export default getChatGPTresponse;
