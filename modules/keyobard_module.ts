import { bot } from "../main";

export const keyboardModule = () => {
  bot.on("text", (msg) => {
    if (msg.text?.toLowerCase() === "бот ку") {
      bot.sendMessage(msg.chat.id, "ку", {
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
        reply_to_message_id: msg.message_id,
      });
    }
  });
};
