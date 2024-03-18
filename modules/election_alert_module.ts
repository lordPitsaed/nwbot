import { ALERT_TOPIC, CHAT_ID, userIds } from '../constants';
import { getUserNamesById, mapUsernamesToMsg } from '../helpers';
import { bot } from '../main';

export const electionAlertModule = async () => {
  const userNames = await getUserNamesById(bot, userIds, CHAT_ID || '');

  bot.on('text', async (msg) => {
    if (/голосова.+/gi.test(msg.text || '')) {
      return bot.sendPhoto(
        msg.chat.id,
        'AgACAgIAAxkBAAI4HWPBa58z63f5EOdJXTqq8f_Cg1RdAAJrwzEbhswJSrwXy9s5rbM5AQADAgADeAADLQQ',
        {
          caption: `${mapUsernamesToMsg(userNames)}
  ВСЕМ ГОЛОСОВАТЬ БЫСТРА! <a href='https://t.me/c/1626204508/3282?offset=-1'>суда</a>`,
          message_thread_id: +ALERT_TOPIC,
          parse_mode: 'HTML',
        }
      );
    }
  });
};
