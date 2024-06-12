import { envVars } from "../constants";
import fs from "fs";
import { bot } from "../main";

export const getPbModule = () => {
  return bot.on("text", (msg) => {
    const weeniesPbs = JSON.parse(fs.readFileSync(envVars.WEENIES_PBS, { encoding: "utf-8" }));
    const iqPbs = JSON.parse(fs.readFileSync(envVars.IQ_PBS, { encoding: "utf-8" }));
    const user = msg.from?.username || msg.from?.first_name || "";

    if (msg.text?.toLowerCase() === "пб" || msg.text?.toLowerCase() === "pb" || msg.text?.toLowerCase() === "рекорды") {
      bot
        .sendMessage(
          msg.chat.id,
          `@${user} твои рекорды: 
          пися - ${weeniesPbs[user]}, 
          айку - ${iqPbs[user]}`,
          { reply_to_message_id: msg?.message_id }
        )
        .then((sentMsg) => {
          setTimeout(() => bot.deleteMessage(msg.chat.id, msg.message_id), 5000);
          setTimeout(() => bot.deleteMessage(msg.chat.id, sentMsg.message_id), 15000);
        });
    }
  });
};
