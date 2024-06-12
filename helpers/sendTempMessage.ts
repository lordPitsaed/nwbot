import TelegramBot from "node-telegram-bot-api";
import { bot } from "../main";

export function sendTempMessage(
  msg: TelegramBot.Message,
  message: string,
  options?: TelegramBot.SendMessageOptions,
  delay = 4000
) {
  return bot
    .sendMessage(msg.chat.id, message, { ...options, reply_to_message_id: msg?.message_id })
    .then((msg) => setTimeout(() => bot.deleteMessage(msg.chat.id, msg.message_id), delay));
}
