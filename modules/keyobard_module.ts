import TelegramBot from "node-telegram-bot-api";
import { bot } from "../main";
import fs from "fs";

const KEYBOARD_MESSAGE = "./data_files/keyboard_message.json";

export const keyboardModule = () => {
  let message: TelegramBot.Message = JSON.parse(
    fs.readFileSync(KEYBOARD_MESSAGE, {
      encoding: "utf-8",
    })
  );
  bot.on("text", async (msg) => {
    if (msg.text?.toLowerCase() === "бот ку") {
      if (message.hasOwnProperty("chat") && message.chat.id === msg.chat.id) {
        bot.deleteMessage(message.chat.id, message.message_id);
      }
      const options = {
        reply_markup: {
          keyboard: [
            [{ text: "PRAY FOR NWB" }],
            [{ text: "пися" }, { text: "писятоп" }],
            [{ text: "айку" }, { text: "айкутоп" }],
          ],
          resize_keyboard: true,
          one_time_keyboard: true,
        },
        message_thread_id: msg.message_thread_id,
      };

      try {
        message = await bot.sendMessage(msg.chat.id, "ку", {
          ...options,
          reply_to_message_id: msg.message_id,
        });
      } catch {
        message = await bot.sendMessage(msg.chat.id, "ку", options);
      }

      fs.writeFileSync(KEYBOARD_MESSAGE, JSON.stringify(message));
    }
  });
};
