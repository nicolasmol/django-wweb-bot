import axios from "axios";
import Config from "@/core/config";

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
    const response = await axios(options);
    return response;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export default getChatGPTresponse;
