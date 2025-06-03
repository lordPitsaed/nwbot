import schedule from "node-schedule";
import { getRandInt } from "../../helpers";
import { startTimeout } from "../../helpers/timers";
import { bot } from "../../main";

import { envVars } from "../../constants";
import { quotes, shadowTaxBible } from "./quotes";

export const prayForNwbButtonModule = () => {
  let getTimeRemaining = () => 0;
  return bot.on("text", async (msg) => {
    if (
      msg.text?.includes("/pray") ||
      msg.text?.toLowerCase() === "pray for nwb" ||
      msg.text?.toLocaleLowerCase() === "pray"
    ) {
      if (!getTimeRemaining()) {
        const randomIndex = await getRandInt(0, quotes.length);
        const randomQuote = quotes[randomIndex || Math.floor(Math.random() * (quotes.length - 1))];

        bot.sendMessage(msg.chat.id, randomQuote, { reply_to_message_id: msg?.message_id }).then();
        getTimeRemaining = startTimeout(1800000).getTimeRemaining as () => number;
      } else {
        bot
          .sendMessage(
            msg.chat.id,
            `не гони так, интернет-герой, я в кд, ещё ${(getTimeRemaining() / 60000).toFixed(0)} мин`,
            { reply_to_message_id: msg?.message_id }
          )
          .then((sentMsg) => {
            setTimeout(() => bot.deleteMessage(sentMsg.chat.id, sentMsg.message_id), 5000);
            bot.deleteMessage(msg.chat.id, msg.message_id);
          });
      }
    }
  });
};

const pbRule = new schedule.RecurrenceRule();
pbRule.hour = 6;
pbRule.minute = 0;
pbRule.tz = "Europe/Moscow";
schedule.scheduleJob(pbRule, async () => {
  const randomIndex = await getRandInt(0, quotes.length);
  const randomQuote = shadowTaxBible[randomIndex || Math.floor(Math.random() * (shadowTaxBible.length - 1))];

  bot.sendMessage(envVars.CHAT_ID, `${randomQuote} Аминь. НВБ покоряет все без помех и препятствий!`);
});
