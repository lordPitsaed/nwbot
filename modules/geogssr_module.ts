import TelegramBot from "node-telegram-bot-api";
import { getRndGeogssrImage } from "../helpers/getRndGeogssrImage";
import { bot } from "../main";
import schedule from "node-schedule";
import { envVars } from "../constants";
import fs from "fs";
import { sendTempMessage } from "../helpers/sendTempMessage";
import { startTimeout } from "../helpers/timers";
import { sendErrorMessage } from "../helpers/sendErrorMessage";

export const geogessrModule = () => {
  let geoscore = JSON.parse(fs.readFileSync(envVars.GEOSCORE, { encoding: "utf-8" }));

  bot.on("text", async (msg) => {
    if (msg.text === "GEOGUESSER-ish") {
      const messageToReply = await bot.sendPhoto(
        msg.chat.id,
        "https://images.fineartamerica.com/images/artworkimages/mediumlarge/2/thinking-cat-douglas-sacha.jpg",
        { caption: "Думою..." }
      );
      try {
        const handleGeoGssr = async (messageToReply: TelegramBot.Message) => {
          const randomImage = await getRndGeogssrImage();

          if (randomImage?.lat === undefined || randomImage.lon === undefined || randomImage.url === undefined) {
            throw new Error();
          }

          const reply_markup = {
            inline_keyboard: [
              [
                { text: "go next (cd 30min)", callback_data: "get_new_geo_image" },
                {
                  text: "i'm dumb (-100 geocoin)",
                  callback_data: "skip_geo_image",
                },
              ],
            ],
          };

          const getCoolDown = bot
            .editMessageMedia(
              {
                type: "photo",
                media: randomImage.url,
                has_spoiler: true,
                caption: "Придумал",
              },
              { chat_id: messageToReply.chat.id, message_id: messageToReply.message_id, reply_markup }
            )
            .then(() => startTimeout(1800000));
          return { getCoolDown: await getCoolDown, randomImage: randomImage };
        };

        const geoGssr = await handleGeoGssr(messageToReply);

        bot.onReplyToMessage(messageToReply.chat.id, messageToReply.message_id, (repliedMessage) => {
          const userGeoScore = geoscore[repliedMessage.from?.username || repliedMessage.from?.first_name || ""];
          if (!!geoGssr?.randomImage) {
            if (
              geoGssr.randomImage?.location.display_name
                .toLowerCase()
                .includes(repliedMessage.text?.toLowerCase() || "")
            ) {
              geoscore[repliedMessage.from?.username || repliedMessage.from?.first_name || ""] = userGeoScore + 25;
              sendTempMessage(repliedMessage.chat.id, `@${repliedMessage.from?.username} угадал, +25 geocoin`, 4000);
            } else {
              geoscore[repliedMessage.from?.username || repliedMessage.from?.first_name || ""] = userGeoScore - 5;

              sendTempMessage(repliedMessage.chat.id, `@${repliedMessage.from?.username} не угадал, -5 geocoin`, 4000);
            }
            setTimeout(() => bot.deleteMessage(repliedMessage.chat.id, repliedMessage.message_id), 4000);
          }

          fs.writeFileSync(envVars.GEOSCORE, JSON.stringify(geoscore));
        });

        bot.on("callback_query", async (query) => {
          if (query.data === "get_new_geo_image" && !!geoGssr?.getCoolDown) {
            if (geoGssr.getCoolDown() > 0) {
              console.log(query);
              sendTempMessage(
                query.message?.chat.id || msg.chat.id,
                `Ждем кул довн, ещё ${geoGssr.getCoolDown()}`,
                4000
              );
            } else {
              handleGeoGssr(messageToReply);
            }
          }

          if (query.data === "skip_geo_image") {
            if (geoscore[query.from.username || query.from.first_name] > 100) {
              sendTempMessage(
                query.message?.chat.id || msg.chat.id,
                "Haha dumb, whatever. -100 geocoins, get gud.",
                4000
              );
              geoscore[query.from.username || query.from.first_name] -= 100;

              handleGeoGssr(messageToReply);

              fs.writeFileSync(envVars.GEOSCORE, JSON.stringify(geoscore));
            } else {
              sendTempMessage(query.message?.chat.id || msg.chat.id, "Man, u're broke ass.", 4000);
            }
          }
        });
      } catch (e) {
        console.log("[ERROR] getRndGeogssrImage error", e);
        return sendErrorMessage(msg.chat.id);
      }

      process.on("beforeExit", async function () {
        if (messageToReply) {
          console.log("[EXIT] Exiting, deleting geogssr message.");
          await bot.deleteMessage(messageToReply.chat.id, messageToReply.message_id);
          console.log("[EXIT] Deleted geogssr message");
        }
      });
    }

    if (msg.text === "GeoBalance") {
      bot.sendMessage(
        msg.chat.id,
        `@${msg.from?.username} Мда, негусто ${geoscore[msg.from?.username || msg.from?.first_name || ""] || 0}`
      );
    }
  });

  const rule = new schedule.RecurrenceRule();
  rule.hour = 0;
  rule.minute = 0;
  rule.tz = "Europe/Moscow";
  schedule.scheduleJob(rule, () => {
    for (let geouser of geoscore) {
      geoscore[geouser] += 50;
    }
    fs.writeFileSync(envVars.GEOSCORE, JSON.stringify(geoscore));
    bot.sendMessage(envVars.CHAT_ID, "Зарплата пришла $GEO 🚀!");
  });
};
