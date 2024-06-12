import { envVars, userIds } from "../constants";
import { getUserNamesById, mapUsernamesToMsg } from "../helpers";
import { bot } from "../main";

export const alertsModule = async () => {
  const userNames = await getUserNamesById(bot, userIds, envVars.CHAT_ID || "");

  bot.on("text", (msg) => {
    //maybe refactor someday, but not today, sry future me :)
    if (/@izy0_0/gimu.test(msg.text || "")) {
      return bot.sendSticker(msg.chat.id, "CAACAgIAAxkBAAI33WPBSPQL2UROQimkYk9Ul3pW-v4UAAJ-IwACmJW4SSlarZtgGiRZLQQ", {
        reply_to_message_id: msg?.message_id,
      });
    }

    if (/@all/gimu.test(msg.text || "")) {
      bot.sendMessage(msg.chat.id, `${msg.from?.username} созвал всех ${mapUsernamesToMsg(userNames)}`, {
        reply_to_message_id: msg?.message_id,
      });
    }

    if (msg.text === "@ALL") {
      for (let i = 0; i < 5; i++) {
        bot.sendMessage(msg.chat.id, `${msg.from?.username} созвал всех ${mapUsernamesToMsg(userNames)}`, {
          reply_to_message_id: msg.message_id,
        });
      }
    }

    if (/^.* *когда *.*[?$]/gimu.test(msg.text || "")) {
      return bot.sendPhoto(
        msg.chat.id,
        "AgACAgIAAxkBAAI4KmPBbBSPu5Krhmqz6bw_XggV5e1fAAJuwzEbhswJSiowMchwBZVuAQADAgADeAADLQQ",
        {
          caption: `Запомни детка эту фразу: "Все будет, но не сразу"`,
          reply_to_message_id: msg.message_id,
        }
      );
    }
  });
};
