import fs from 'fs';
import schedule from 'node-schedule';
import { CHAT_ID } from '../constants';
import { getRandInt, sortObj } from '../helpers';
import { bot } from '../main';

type TIqMap = {
  [x: string]: number;
};

export const iqMeterModule = () => {
  const iqs: TIqMap = JSON.parse(fs.readFileSync('./iq.txt').toString());

  bot.on('text', async (msg) => {
    if (msg.text?.toLowerCase() === 'айку' || msg.text?.toLowerCase() === 'iq') {
      const user = msg.from?.username || msg.from?.first_name || '';

      if (!iqs.hasOwnProperty(user)) {
        const randomizedRandom = Math.random() * 1000 < 995;
        const iq = randomizedRandom ? await getRandInt(60, 150) : await getRandInt(160, 420);

        iqs[user] = iq[0] || Math.floor(Math.random() * (30 - 5) + 5);

        if (iqs[user] <= 5) {
          bot.sendMessage(msg.chat.id, `Жесть... тик-токер в чате... ${iq}п.`);
        } else if (iqs[user] <= 70) {
          bot.sendMessage(
            msg.chat.id,
            `Ваш интеллект как у петикантропа, надеюсь с пенисом вам повезло больше. ${iq}п.`
          );
        } else if (iqs[user] <= 100) {
          bot.sendMessage(msg.chat.id, `Норм ${iq}п.`);
        } else if (iqs[user] <= 150) {
          bot.sendMessage(msg.chat.id, `Альберт Ынштейн в чате. ${iq}п.`);
        } else if (iqs[user] > 160) {
          bot.sendMessage(msg.chat.id, `Типичный пользователь ВК видео? ${iq}п.`);
        }
      } else {
        bot.sendMessage(msg.chat.id, `А ну-ка нах! Ваш интеллект уже учтен - ${iqs[user]}п.`);
      }

      fs.writeFileSync('./data_files/iq.txt', JSON.stringify(iqs));
    }

    if (msg.text?.toLowerCase() === 'писятоп') {
      let message = `Главный умник сегодня:\n`;
      let iter = 1;
      const sortedIqs = sortObj(iqs);

      for (const user in sortedIqs) {
        message += `${iter}. ${user}: ${sortedIqs[user]}см. \n`;
        iter++;
      }

      bot.sendMessage(CHAT_ID, message);
    }
  });

  const rule = new schedule.RecurrenceRule();
  rule.hour = 12;
  rule.minute = 0;
  rule.tz = 'Europe/Moscow';
  schedule.scheduleJob(rule, () => {
    fs.writeFileSync('./data_files/iq.txt', '{}');
    bot.sendMessage(CHAT_ID, 'Великое обнуление очкоф интеллекта!');
  });
};
