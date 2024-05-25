import { text } from "stream/consumers";
import { getRandInt } from "../../helpers";
import { startTimeout } from "../../helpers/timers";
import { bot } from "../../main";

import { quotes } from "./quotes";

export const prayForNwbButtonModule = () => {
  let getTimeRemaining = () => 0;
  bot.on("text", async (msg) => {
    if (
      msg.text?.includes("/pray") ||
      msg.text?.toLowerCase() === "pray for nwb"
    ) {
      if (!getTimeRemaining()) {
        const randomIndex = await getRandInt(0, quotes.length);
        const randomQuote =
          quotes[
            randomIndex ||
              Math.floor(Math.random() * (quotes.length - 0 + 1)) + 0
          ];
        bot.deleteMessage(msg.chat.id, msg.message_id);
        bot.sendMessage(msg.chat.id, randomQuote);
        getTimeRemaining = startTimeout(3600000);
      } else {
        bot.deleteMessage(msg.chat.id, msg.message_id);
        bot
          .sendMessage(
            msg.chat.id,
            `не гони так, интернет-герой, я в кд, ещё ${(
              getTimeRemaining() / 60000
            ).toFixed(0)} мин`
          )
          .then((sentMsg) =>
            setTimeout(
              () => bot.deleteMessage(sentMsg.chat.id, sentMsg.message_id),
              5000
            )
          );
      }
    }
  });
};
