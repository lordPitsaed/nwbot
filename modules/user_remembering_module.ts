import fs from "fs";
import { envVars, userIds } from "../constants";
import { getUserNamesById } from "../helpers";
import { bot } from "../main";

export const userRememberingModule = () => {
  bot.onText(/\/rememberme/, (msg) => {
    if (msg.chat.type === "private") {
      if (!userIds.includes(String(msg.from?.id))) {
        const newArr = userIds.push(String(msg.from?.id));
        fs.writeFileSync(envVars.REMEMBERED_USER_IDS, JSON.stringify({ userIds: newArr }));
        bot.sendMessage(msg.chat.id, `Q ${msg.from?.username}, ur id is: ${msg.from?.id}. I'll remember you`, {
          reply_to_message_id: msg.message_id,
        });
        getUserNamesById(bot, userIds, envVars.CHAT_ID);
      } else {
        bot.sendMessage(msg.chat.id, "I can remember you already, " + msg.from?.username, {
          reply_to_message_id: msg.message_id,
        });
      }
    } else {
      bot.sendMessage(msg.chat.id, `Try to use this in DM.`, { reply_to_message_id: msg.message_id });
    }
  });
};
