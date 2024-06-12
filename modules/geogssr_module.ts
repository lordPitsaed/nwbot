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
  const startupGeomessage: TelegramBot.Message | {} = JSON.parse(
    fs.readFileSync(envVars.GEOMESSAGE, { encoding: "utf-8" })
  );
  if ("chat" in startupGeomessage) {
    bot.deleteMessage(startupGeomessage.chat.id, startupGeomessage.message_id);
    fs.writeFileSync(envVars.GEOMESSAGE, "{}");
  }

  bot.on("text", async (msg) => {
    if (msg.text === "GeoGuesser") {
      let geomessage: TelegramBot.Message | {} = JSON.parse(fs.readFileSync(envVars.GEOMESSAGE, { encoding: "utf-8" }));

      const messageToReply = await bot
        .sendPhoto(
          msg.chat.id,
          "https://images.fineartamerica.com/images/artworkimages/mediumlarge/2/thinking-cat-douglas-sacha.jpg",
          {
            caption: "Думою...",
            reply_to_message_id: msg.message_id,
          }
        )
        .then((sentMsg) => {
          bot.deleteMessage(msg.chat.id, msg.message_id);
          return sentMsg;
        });

      fs.writeFileSync(envVars.GEOMESSAGE, JSON.stringify(messageToReply));

      try {
        const handleGeoGssr = async (messageToReply: TelegramBot.Message, cancelTimeout: () => void) => {
          if ("chat" in geomessage) {
            cancelTimeout();
            bot.deleteMessage(geomessage.chat.id, geomessage.message_id);
          }
          const randomImage = await getRndGeogssrImage();

          if (randomImage?.lat === undefined || randomImage.lon === undefined || randomImage.url === undefined) {
            throw new Error();
          }

          const reply_markup = {
            inline_keyboard: [
              [
                { text: "go next (cd 5min)", callback_data: "get_new_geo_image" },
                {
                  text: "i'm dumb (-100 geocoin)",
                  callback_data: "skip_geo_image",
                },
              ],
            ],
          };

          bot.editMessageMedia(
            {
              type: "photo",
              media: randomImage.url,
              has_spoiler: true,
              caption:
                "Придумал\nНадо угадать СТРАНУ(в т.ч. часть названия) или отправить локацию с точкой внутри страны. Языки: rus/eng",
            },
            { chat_id: messageToReply.chat.id, message_id: messageToReply.message_id, reply_markup }
          );

          console.log(
            "[LOG] GeoGuesser Answer. Country:",
            randomImage.locationEn.address.country,
            ". Coords:",
            randomImage.locationEn.lat,
            ", ",
            randomImage.locationEn.lon
          );

          return { randomImage, reply_markup };
        };

        //TODO: Move this to handleGeoGssrFunc
        let timer = startTimeout(300000);
        let geoGssr = await handleGeoGssr(messageToReply, timer.cancelTimeout);

        const checkAnswer = (repliedMessage: TelegramBot.Message, lang: "Ru" | "En") => {
          if ("location" in repliedMessage) {
            const boundingBox = geoGssr.randomImage.locationEn.boundingbox;
            const answer = repliedMessage.location as TelegramBot.Location;
            //TODO: higher rewards for more precise location
            return (
              answer.latitude >= +boundingBox[0] &&
              answer.latitude <= +boundingBox[1] &&
              answer.longitude >= +boundingBox[2] &&
              answer.longitude <= +boundingBox[3]
            );
          }
          const answer = repliedMessage.text?.toLowerCase() || "";
          const hint = geoGssr.randomImage[`location${lang}`];
          if (!answer.includes("ё")) {
            return answer.length < 2
              ? false
              : hint.display_name.toLowerCase().replace(/ё/gi, "е").includes(answer) ||
                  hint.name.toLowerCase().replace(/ё/gi, "е").includes(answer) ||
                  hint.address.country.toLowerCase().replace(/ё/gi, "е").includes(answer) ||
                  hint.address.country_code.toLocaleLowerCase().replace(/ё/gi, "е").includes(answer);
          } else {
            return answer.length < 2
              ? false
              : hint.display_name.toLowerCase().includes(answer) ||
                  hint.name.toLowerCase().includes(answer) ||
                  hint.address.country.toLowerCase().includes(answer) ||
                  hint.address.country_code.toLocaleLowerCase().includes(answer);
          }
        };

        let guessed: string[] = [];
        let wrongVariants: string[] = [];

        bot.onReplyToMessage(messageToReply.chat.id, messageToReply.message_id, (repliedMessage) => {
          const userGeoScore = geoscore[repliedMessage.from?.username || repliedMessage.from?.first_name || ""];
          if (!!geoGssr?.randomImage) {
            if (checkAnswer(repliedMessage, "En") || checkAnswer(repliedMessage, "Ru")) {
              if (
                guessed.includes(repliedMessage.from?.username || "") ||
                guessed.includes(repliedMessage.from?.first_name || "")
              ) {
                sendTempMessage(repliedMessage, `Тю блять арбузер ебаный @${repliedMessage.from?.username}`);
              } else {
                geoscore[repliedMessage.from?.username || repliedMessage.from?.first_name || ""] = userGeoScore + 99;
                sendTempMessage(
                  repliedMessage,
                  `@${repliedMessage.from?.username} угадал, \\+99 geocoin, вот тебе ссилка на ||[локу](https://www.openstreetmap.org/search?query=\\${geoGssr.randomImage.locationEn.lat}%20\\${geoGssr.randomImage.locationEn.lon})||`,
                  { parse_mode: "MarkdownV2" },
                  20000
                );
                guessed.push(repliedMessage.from?.username || repliedMessage.from?.first_name || "");
              }
            } else {
              geoscore[repliedMessage.from?.username || repliedMessage.from?.first_name || ""] = userGeoScore - 5;
              wrongVariants.push(repliedMessage.text || "");

              sendTempMessage(repliedMessage, `@${repliedMessage.from?.username} не угадал, -5 geocoin`);
            }
            bot.editMessageCaption(
              "Придумал\nНадо угадать СТРАНУ(в т.ч. часть названия) или отправить локацию с точкой внутри страны. Языки: rus/eng\n\n" +
                `Угадали:\n${guessed.join("\n")}\n\nОшибки:\n${wrongVariants.join("\n")}`,
              {
                chat_id: messageToReply.chat.id,
                message_id: messageToReply.message_id,
                reply_markup: geoGssr.reply_markup,
              }
            );
            setTimeout(() => bot.deleteMessage(repliedMessage.chat.id, repliedMessage.message_id), 4000);
          }

          fs.writeFileSync(envVars.GEOSCORE, JSON.stringify(geoscore));
        });

        bot.on("callback_query", async (query) => {
          const timeRemaining = timer.getTimeRemaining();
          if (query.data === "get_new_geo_image" && timeRemaining) {
            if (timeRemaining > 0) {
              sendTempMessage(query.message || msg, `Ждем кул довн, ещё ${timeRemaining / 1000} сек`);
            } else {
              bot.editMessageMedia(
                {
                  type: "photo",
                  media:
                    "https://images.fineartamerica.com/images/artworkimages/mediumlarge/2/thinking-cat-douglas-sacha.jpg",
                  has_spoiler: false,
                  caption: "Думою...",
                },
                { chat_id: messageToReply.chat.id, message_id: messageToReply.message_id }
              );
              timer.cancelTimeout();
              timer = startTimeout(300000);
              geoGssr = await handleGeoGssr(messageToReply, timer.cancelTimeout);
              guessed = [];
              wrongVariants = [];
            }
          }

          if (query.data === "skip_geo_image") {
            if (geoscore[query.from.username || query.from.first_name] > 100) {
              sendTempMessage(
                query.message || msg,
                `Haha dumb, whatever. -100 geocoins, get gud.\n${geoGssr.randomImage.locationEn.display_name}`,
                {},
                10000
              );
              geoscore[query.from.username || query.from.first_name] -= 100;

              bot.editMessageMedia(
                {
                  type: "photo",
                  media:
                    "https://images.fineartamerica.com/images/artworkimages/mediumlarge/2/thinking-cat-douglas-sacha.jpg",
                  has_spoiler: false,
                  caption: "Думою...",
                },
                { chat_id: messageToReply.chat.id, message_id: messageToReply.message_id }
              );

              timer.cancelTimeout();
              timer = startTimeout(300000);
              geoGssr = await handleGeoGssr(messageToReply, timer.cancelTimeout);
              guessed = [];
              wrongVariants = [];

              fs.writeFileSync(envVars.GEOSCORE, JSON.stringify(geoscore));
            } else {
              sendTempMessage(query.message || msg, "Man, u're broke ass.");
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
      bot
        .sendMessage(
          msg.chat.id,
          `@${msg.from?.username} Мда, негусто ${geoscore[msg.from?.username || msg.from?.first_name || ""] || 0}`,
          { reply_to_message_id: msg.message_id }
        )
        .then(() => bot.deleteMessage(msg.chat.id, msg.message_id));
    }
  });

  const rule = new schedule.RecurrenceRule();
  rule.hour = 0;
  rule.minute = 0;
  rule.tz = "Europe/Moscow";
  schedule.scheduleJob(rule, () => {
    for (let geouser in geoscore) {
      geoscore[geouser] += 99;
    }
    fs.writeFileSync(envVars.GEOSCORE, JSON.stringify(geoscore));
    bot.sendMessage(envVars.CHAT_ID, "Зарплата пришла $GEO 🚀!");
  });
};
