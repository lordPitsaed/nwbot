import fs from 'fs';
import { CHAT_ID, userIds } from '../constants';
import { getUserNamesById } from '../helpers';
import { bot } from '../main';

export const userRememberingModule = () => {
  bot.onText(/\/rememberme/, (msg) => {
    if (msg.chat.type === 'private') {
      fs.appendFileSync('./data_files/remembered_user_ids.txt', String(msg.from?.id) + '\n');
      bot.sendMessage(msg.chat.id, `Q ${msg.from?.username}, ur id is: ${msg.from?.id}. I'll remember you`);
      getUserNamesById(bot, userIds, CHAT_ID);
    } else {
      bot.sendMessage(msg.chat.id, `Try to use this in DM.`);
    }
  });
};
