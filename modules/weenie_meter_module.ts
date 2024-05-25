import fs from "fs";
import schedule from "node-schedule";
import { envVars } from "../constants";
import { getRandInt, getTopFromObj, sortObj } from "../helpers";
import { bot } from "../main";

type TWeeniesMap = {
  [x: string]: number;
};

export const weenieMeterModule = () => {
  let weenies: TWeeniesMap = JSON.parse(
    fs.readFileSync(envVars.WEENIES, { encoding: "utf-8" })
  );
  let weeniesPbs: TWeeniesMap = JSON.parse(
    fs.readFileSync(envVars.WEENIES_PBS, { encoding: "utf-8" })
  );

  bot.on("text", async (msg) => {
    if (msg.text?.toLowerCase() === "пися") {
      const user = msg.from?.username || msg.from?.first_name || "";
      const randomizedRandom = Math.random() * 1000 < 995;
      const weenie =
        (randomizedRandom
          ? await getRandInt(200, 2500)
          : await getRandInt(4000, 6000))[0] / 100;
      const isPb = weenie > (weeniesPbs[user] || 0);
      if (isPb) {
        weeniesPbs[user] = weenie;
      }

      const pbMessage = isPb ? ` @${user} побил свой рекорд!` : "";

      if (!weenies.hasOwnProperty(user)) {
        weenies[user] = weenie;
        if (weenies[user] <= 5) {
          bot.sendMessage(
            msg.chat.id,
            `Жесть... вот это корнишончик... ${weenie}см` + pbMessage
          );
        } else if (weenies[user] <= 10) {
          bot.sendMessage(
            msg.chat.id,
            `Твоя пися ${weenie}см. Соболезнуем ;(` + pbMessage
          );
        } else if (weenies[user] <= 15) {
          bot.sendMessage(msg.chat.id, `Твоя пися ${weenie}см.` + pbMessage);
        } else if (weenies[user] <= 25) {
          bot.sendMessage(
            msg.chat.id,
            `Вот это елда... Завидую блин. ${weenie}см` + pbMessage
          );
        } else if (weenies[user] > 25) {
          bot.sendMessage(
            msg.chat.id,
            `НИХУЯ, НЕ УБЕЙ НИКОГО ЭТОЙ ХУЙНЕЙ, ЛАДНО? ${weenie}см` + pbMessage
          );
        }
      } else {
        bot.sendMessage(
          msg.chat.id,
          `А ну-ка нах! Пися уже есть в базе, смотри - ${weenies[user]}см`
        );
      }

      fs.writeFileSync(envVars.WEENIES, JSON.stringify(weenies));
      fs.writeFileSync(envVars.WEENIES_PBS, JSON.stringify(weeniesPbs));
    }

    if (msg.text?.toLowerCase() === "писятоп") {
      bot.sendMessage(
        msg.chat.id,
        getTopFromObj(weenies, "Топ пись на сегодня")
      );
    }
  });

  const rule = new schedule.RecurrenceRule();
  rule.hour = 0;
  rule.minute = 0;
  rule.tz = "Europe/Moscow";
  schedule.scheduleJob(rule, () => {
    fs.writeFileSync(envVars.WEENIES, "{}");
    weenies = JSON.parse(
      fs.readFileSync(envVars.WEENIES, { encoding: "utf-8" })
    );
    bot.sendMessage(envVars.CHAT_ID, "Великое обнуление пиписек!");
  });

  const pbRule = new schedule.RecurrenceRule();
  pbRule.hour = 0;
  pbRule.minute = 0;
  pbRule.tz = "Europe/Moscow";
  pbRule.date = 1;
  schedule.scheduleJob(pbRule, () => {
    weeniesPbs = JSON.parse(
      fs.readFileSync(envVars.WEENIES_PBS, { encoding: "utf-8" })
    );
    bot.sendMessage(
      envVars.CHAT_ID,
      getTopFromObj(weeniesPbs, "Топ пись за месяц")
    );
    fs.writeFileSync(envVars.WEENIES_PBS, "{}");
  });
};
