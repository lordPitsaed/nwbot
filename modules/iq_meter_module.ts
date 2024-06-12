import fs from "fs";
import schedule from "node-schedule";
import { envVars } from "../constants";
import { getRandInt, getTopFromObj, sortObj } from "../helpers";
import { bot } from "../main";

type TIqMap = {
  [x: string]: number;
};

export const iqMeterModule = () => {
  let iqs: TIqMap = JSON.parse(fs.readFileSync(envVars.IQ, { encoding: "utf-8" }));
  let iqsPbs: TIqMap = JSON.parse(fs.readFileSync(envVars.IQ_PBS, { encoding: "utf-8" }));

  bot.on("text", async (msg) => {
    if (msg.text?.toLowerCase() === "айку" || msg.text?.toLowerCase() === "iq") {
      const user = msg.from?.username || msg.from?.first_name || "";

      if (!iqs.hasOwnProperty(user)) {
        const randomizedRandom = Math.random() * 1000 < 995;
        const iq = (randomizedRandom ? await getRandInt(60, 150) : await getRandInt(160, 420))[0];
        const isPb = iq > (iqsPbs[user] || 0);

        if (isPb) {
          iqsPbs[user] = iq;
        }

        const pbMessage = isPb ? ` @${user} побил свой рекорд!` : "";

        iqs[user] = iq;
        if (iqs[user] <= 5) {
          bot.sendMessage(msg.chat.id, `Жесть... тик-токер в чате... ${iq}п.` + pbMessage, {
            reply_to_message_id: msg?.message_id,
          });
        } else if (iqs[user] <= 70) {
          bot.sendMessage(
            msg.chat.id,
            `Ваш интеллект как у петикантропа, надеюсь с пенисом вам повезло больше. ${iq}п.` + pbMessage,
            { reply_to_message_id: msg?.message_id }
          );
        } else if (iqs[user] <= 100) {
          bot.sendMessage(msg.chat.id, `Норм ${iq}п.` + pbMessage, { reply_to_message_id: msg?.message_id });
        } else if (iqs[user] <= 150) {
          bot.sendMessage(msg.chat.id, `Альберт Ынштейн в чате. ${iq}п.` + pbMessage, {
            reply_to_message_id: msg?.message_id,
          });
        } else if (iqs[user] > 160) {
          bot.sendMessage(msg.chat.id, `Типичный пользователь ВК видео? ${iq}п.` + pbMessage, {
            reply_to_message_id: msg?.message_id,
          });
        }
      } else {
        bot.sendMessage(msg.chat.id, `А ну-ка нах! Ваш интеллект уже учтен - ${iqs[user]}п.`, {
          reply_to_message_id: msg?.message_id,
        });
      }

      fs.writeFileSync(envVars.IQ, JSON.stringify(iqs));
      fs.writeFileSync(envVars.IQ_PBS, JSON.stringify(iqsPbs));
    }

    if (msg.text?.toLowerCase() === "айкутоп") {
      bot.sendMessage(msg.chat.id, getTopFromObj(iqs, "Топ умников на сегодня"), {
        reply_to_message_id: msg?.message_id,
      });
    }
  });

  const rule = new schedule.RecurrenceRule();
  rule.hour = 12;
  rule.minute = 0;
  rule.tz = "Europe/Moscow";
  schedule.scheduleJob(rule, () => {
    fs.writeFileSync(envVars.IQ, "{}");
    iqs = JSON.parse(fs.readFileSync(envVars.IQ, { encoding: "utf-8" }));
    bot.sendMessage(envVars.CHAT_ID, "Великое обнуление очкоф интеллекта!");
  });

  const pbRule = new schedule.RecurrenceRule();
  pbRule.hour = 0;
  pbRule.minute = 0;
  pbRule.tz = "Europe/Moscow";
  pbRule.date = 1;
  schedule.scheduleJob(pbRule, () => {
    iqsPbs = JSON.parse(fs.readFileSync(envVars.IQ_PBS, { encoding: "utf-8" }));
    bot.sendMessage(envVars.CHAT_ID, getTopFromObj(iqsPbs, "Топ умников за месяц"));
    fs.writeFileSync(envVars.IQ_PBS, "{}");
    iqsPbs = JSON.parse(fs.readFileSync(envVars.IQ_PBS, { encoding: "utf-8" }));
  });
};
