import TelegramBot from "node-telegram-bot-api";
import { bot } from "../main";
import fs from "fs";
import { envVars } from "../constants";
import { sendErrorMessage } from "../helpers/sendErrorMessage";

export const keyboardModule = () => {
  let message: TelegramBot.Message = JSON.parse(
    fs.readFileSync(envVars.KEYBOARD_MESSAGE, {
      encoding: "utf-8",
    })
  );
  return bot.on("text", async (msg) => {
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
            [{ text: "РЕКОРДЫ" }],
            [{ text: "GeoGuesser" }, { text: "GeoBalance" }, { text: "GeoTop[poka net]" }],
          ],
          resize_keyboard: true,
          one_time_keyboard: true,
        },
        reply_to_message_id: msg?.message_id,
      };

      try {
        message = await bot.sendMessage(msg.chat.id, "ку", options).then((sentMsg) => {
          bot.deleteMessage(msg.chat.id, msg.message_id);
          return sentMsg;
        });
      } catch {
        sendErrorMessage(msg.chat.id).then(() => bot.deleteMessage(msg.chat.id, msg.message_id));
      }

      fs.writeFileSync(envVars.KEYBOARD_MESSAGE, JSON.stringify(message));
    }
  });
};
