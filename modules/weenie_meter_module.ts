import fs from 'fs';
import schedule from 'node-schedule';
import { CHAT_ID } from '../constants';
import { getRandInt, sortObj } from '../helpers';
import { bot } from '../main';

type TWeeniesMap = {
  [x: string]: number;
};

const REQUIRED_FILE = './data_files/weenies.txt';

export const weenieMeterModule = () => {
  try {
    fs.readFileSync(REQUIRED_FILE);
  } catch {
    fs.writeFileSync(REQUIRED_FILE, '{}');
  }
  let weenies: TWeeniesMap = JSON.parse(fs.readFileSync('./data_files/weenies.txt', { encoding: 'utf-8' }));

  bot.on('text', async (msg) => {
    if (msg.text?.toLowerCase() === 'пися') {
      const user = msg.from?.username || msg.from?.first_name || '';
      const randomizedRandom = Math.random() * 1000 < 995;
      console.log(randomizedRandom);
      const weenie = randomizedRandom ? await getRandInt(2, 25) : await getRandInt(40, 60);

      if (!weenies.hasOwnProperty(user)) {
        weenies[user] = weenie[0] || Math.floor(Math.random() * (30 - 5) + 5);
        if (weenies[user] <= 5) {
          bot.sendMessage(msg.chat.id, `Жесть... вот это корнишончик... ${weenie}см`);
        } else if (weenies[user] <= 10) {
          bot.sendMessage(msg.chat.id, `Твоя пися ${weenie}см. Соболезнуем ;(`);
        } else if (weenies[user] <= 15) {
          bot.sendMessage(msg.chat.id, `Твоя пися ${weenie}см.`);
        } else if (weenies[user] <= 25) {
          bot.sendMessage(msg.chat.id, `Вот это елда... Завидую блин. ${weenie}см`);
        } else if (weenies[user] > 25) {
          bot.sendMessage(msg.chat.id, `НИХУЯ, НЕ УБЕЙ НИКОГО ЭТОЙ ХУЙНЕЙ, ЛАДНО? ${weenie}см`);
        }
      } else {
        bot.sendMessage(msg.chat.id, `А ну-ка нах! Пися уже есть в базе, смотри - ${weenies[user]}см`);
      }

      fs.writeFileSync(REQUIRED_FILE, JSON.stringify(weenies));
    }

    if (msg.text?.toLowerCase() === 'писятоп') {
      let message = `Топ пись на сегодня:\n`;
      let iter = 1;
      const sortedWeenies = sortObj(weenies);

      for (const user in sortedWeenies) {
        message += `${iter}. ${user}: ${sortedWeenies[user]}см. \n`;
        iter++;
      }

      bot.sendMessage(CHAT_ID, message);
    }
  });

  const rule = new schedule.RecurrenceRule();
  rule.hour = 0;
  rule.minute = 0;
  rule.tz = 'Europe/Moscow';
  schedule.scheduleJob(rule, () => {
    fs.writeFileSync(REQUIRED_FILE, '{}');
    weenies = JSON.parse(fs.readFileSync(REQUIRED_FILE, { encoding: 'utf-8' }));
    bot.sendMessage(CHAT_ID, 'Великое обнуление пиписек!');
  });
};
