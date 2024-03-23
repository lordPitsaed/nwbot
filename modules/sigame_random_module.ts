import schedule from 'node-schedule';
import { InlineQueryResultArticle } from 'node-telegram-bot-api';
import { CHAT_ID } from '../constants';
import { getSiGamePacks } from '../helpers';
import { bot } from '../main';

export const sigameRandomModule = async () => {
  const cachedSiGamePacks = await getSiGamePacks();
  const packsArr = cachedSiGamePacks?.packs || [];
  const getRandomPack = () => packsArr[Math.floor(Math.random() * packsArr?.length)];

  bot.on('inline_query', (query) => {
    if (query.query === 'пак') {
      // const tagsArr = query.query.split(' ');
      const randomPack = getRandomPack();
      const queryResult: InlineQueryResultArticle = {
        type: 'article',
        id: 'loading_id',
        title:
          'Found pack: ' +
          `[Name: ${randomPack.package.name} | Rounds count: ${randomPack.package.rounds.length} | Date: ${randomPack.package.date} | Downloads: ${randomPack.package.info.downloads_count}]`,
        input_message_content: {
          message_text: `[Name: ${randomPack.package.name} | Rounds count: ${randomPack.package.rounds.length} | Date: ${randomPack.package.date} | Downloads: ${randomPack.info.downloads_count}]`,
        },
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Download', url: randomPack.info.url }],
            [{ text: 'New', callback_data: 'gen_new_pack' }],
          ],
        },
      };

      bot.answerInlineQuery(query.id, [queryResult]);
    }
  });

  bot.on('callback_query', (cbQuery) => {
    if (cbQuery.data?.includes('gen_new_pack')) {
      const randomPack = getRandomPack();

      const queryResult: InlineQueryResultArticle = {
        type: 'article',
        id: 'loading_id',
        title:
          'Found pack: ' +
          `[Name: ${randomPack.package.name} | Rounds count: ${randomPack.package.rounds.length} | Date: ${randomPack.package.date} | Downloads: ${randomPack.package.info.downloads_count}]`,
        input_message_content: {
          message_text: `[Name: ${randomPack.package.name} | Rounds count: ${randomPack.package.rounds.length} | Date: ${randomPack.package.date} | Downloads: ${randomPack.info.downloads_count}]`,
        },
        reply_markup: {
          inline_keyboard: [
            [
              { text: 'Download', url: randomPack.info.url },
              { text: 'New', callback_data: 'gen_new_pack' },
            ],
          ],
        },
      };
      bot.editMessageText(
        'Found pack: ' +
          `[Name: ${randomPack.package.name} | Rounds count: ${randomPack.package.rounds.length} | Date: ${randomPack.package.date} | Downloads: ${randomPack.package.info.downloads_count}]`,
        {
          inline_message_id: cbQuery.inline_message_id,
          reply_markup: {
            inline_keyboard: [
              [
                { text: 'Download', url: randomPack.info.url },
                { text: 'New', callback_data: 'gen_new_pack' },
              ],
            ],
          },
        }
      );
    }
  });
  const rule = new schedule.RecurrenceRule();
  rule.date = 15;

  const job = schedule.scheduleJob(rule, () => getSiGamePacks(Math.random() * (338 - 1) + 1));
};
