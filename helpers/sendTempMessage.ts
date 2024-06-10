import TelegramBot from "node-telegram-bot-api";
import { bot } from "../main";

export const sendTempMessage = (chatId: number, message: string, delay: number) => {
  return bot
    .sendMessage(chatId, message)
    .then((msg) => setTimeout(() => bot.deleteMessage(msg.chat.id, msg.message_id), delay));
};
