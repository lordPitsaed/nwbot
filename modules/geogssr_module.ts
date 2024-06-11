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
      setTimeout(() => bot.deleteMessage(msg.chat.id, msg.message_id), 4000);
      let geomessage: TelegramBot.Message | {} = JSON.parse(fs.readFileSync(envVars.GEOMESSAGE, { encoding: "utf-8" }));

      if ("chat" in geomessage) {
        sendTempMessage(geomessage, "Уже всё есть, пджи", {
          message_thread_id: geomessage.message_thread_id,
        });
      } else {
        const messageToReply = await bot.sendPhoto(
          msg.chat.id,
          "https://images.fineartamerica.com/images/artworkimages/mediumlarge/2/thinking-cat-douglas-sacha.jpg",
          { caption: "Думою...", message_thread_id: msg.message_thread_id }
        );

        fs.writeFileSync(envVars.GEOMESSAGE, JSON.stringify(messageToReply));

        try {
          const handleGeoGssr = async (messageToReply: TelegramBot.Message) => {
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

            const getCoolDown = bot
              .editMessageMedia(
                {
                  type: "photo",
                  media: randomImage.url,
                  has_spoiler: true,
                  caption:
                    "Придумал\nНадо угадать какая строка может попасться в адресе(в т.ч. частичная строка). Языки: rus/eng",
                },
                { chat_id: messageToReply.chat.id, message_id: messageToReply.message_id, reply_markup }
              )
              .then(() => startTimeout(300000));

            console.log("[LOG] GeoGuesser Answer", randomImage);

            return { getCoolDown: await getCoolDown, randomImage: randomImage };
          };

          let geoGssr = await handleGeoGssr(messageToReply);

          //TODO: MAKE SOMETHING BETTER THIS IMPL SUCKS ASS
          const checkAnswer = (repliedMessage: TelegramBot.Message, lang: "Ru" | "En") => {
            const answer = repliedMessage.text?.toLowerCase() || "";
            const hint = geoGssr.randomImage[`location${lang}`];
            return (
              hint.display_name.toLowerCase().includes(answer) ||
              hint.name.toLowerCase().includes(answer) ||
              hint.address.country.toLowerCase().includes(answer) ||
              hint.address.country_code.toLocaleLowerCase().includes(answer)
            );
          };

          const guessed: string[] = [];
          const wrongVariants: string[] = [];

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
                  geoscore[repliedMessage.from?.username || repliedMessage.from?.first_name || ""] = userGeoScore + 95;
                  sendTempMessage(repliedMessage, `@${repliedMessage.from?.username} угадал, +95 geocoin`);
                  guessed.push(repliedMessage.from?.username || repliedMessage.from?.first_name || "");
                }
              } else {
                geoscore[repliedMessage.from?.username || repliedMessage.from?.first_name || ""] = userGeoScore - 5;
                wrongVariants.push(repliedMessage.text || "");

                sendTempMessage(repliedMessage, `@${repliedMessage.from?.username} не угадал, -5 geocoin`);
              }
              bot.editMessageCaption(
                "Придумал\nНадо угадать какая строка может попасться в адресе(в т.ч. частичная строка). Языки: rus/eng\n\n" +
                  `Угадали:\n${guessed.join(" \n")}\n\nОшибки:\n${wrongVariants.join(" \n")}`,
                {
                  chat_id: messageToReply.chat.id,
                  message_id: messageToReply.message_id,
                }
              );
              setTimeout(() => bot.deleteMessage(repliedMessage.chat.id, repliedMessage.message_id), 4000);
            }

            fs.writeFileSync(envVars.GEOSCORE, JSON.stringify(geoscore));
          });

          bot.on("callback_query", async (query) => {
            if (query.data === "get_new_geo_image" && !!geoGssr?.getCoolDown) {
              if (geoGssr.getCoolDown() > 0) {
                sendTempMessage(query.message || msg, `Ждем кул довн, ещё ${geoGssr.getCoolDown() / 1000} сек`);
              } else {
                geoGssr = await handleGeoGssr(messageToReply);
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

                geoGssr = await handleGeoGssr(messageToReply);

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
    }

    if (msg.text === "GeoBalance") {
      setTimeout(() => bot.deleteMessage(msg.chat.id, msg.message_id), 4000);
      bot.sendMessage(
        msg.chat.id,
        `@${msg.from?.username} Мда, негусто ${geoscore[msg.from?.username || msg.from?.first_name || ""] || 0}`,
        { reply_to_message_id: msg.message_id }
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
