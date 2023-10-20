/*
import { Document, Schema } from "mongoose";
import { UserChatGptHistoryModel } from "@/database/schemas/UserChatGptHistory";

export interface IUserChatGptHistory extends Document {
  userId: string;
  userMessage: string;
  chatGPTresponse: string;
}

export class UserChatGptHistory {
  public userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  public async updateChatGPTuserHistory(
    userMessage: string,
    chatGPTresponse: string,
    maxChatCount: number
  ) {
    // Insérer le nouvel échange
    await UserChatGptHistoryModel.create({
      userId: this.userId,
      userMessage,
      chatGPTresponse,
    });

    // Vérifier le nombre d'échanges pour l'utilisateur
    const chatCount = await UserChatGptHistoryModel.countDocuments({
      userId: this.userId,
    });

    // Si le nombre d'échanges dépasse maxChatCount, supprimer les échanges excédentaires
    if (chatCount > maxChatCount) {
      const oldestChats = await UserChatGptHistoryModel.find({
        userId: this.userId,
      })
        .sort({ createdAt: 1 })
        .limit(chatCount - maxChatCount);

      // Supprimer les échanges excédentaires
      for (const chat of oldestChats) {
        chat.deleteOne; // Utilisation de la méthode remove sur le document Mongoose
      }
    }
  }

  public async getChatGPTUserHistory(): Promise<
    { role: string; content: string }[]
  > {
    // Récupérez l'historique de l'utilisateur depuis la base de données
    const userHistory = await UserChatGptHistoryModel.find({
      userId: this.userId,
    }).sort({ createdAt: 1 });

    // Transformez les données en format souhaité (rôle et contenu)
    const history = userHistory.map((entry) => {
      return [
        { role: "user", content: entry.userMessage },
        { role: "assistant", content: entry.chatGPTresponse },
      ];
    });

    return history;
  }
}

*/
