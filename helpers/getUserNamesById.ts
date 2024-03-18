import TelegramBot from 'node-telegram-bot-api';

export async function getUserNamesById(bot: TelegramBot, usersIds: string[], chatId: string) {
  const usernames: string[] = [];
  for (let i = 0; i < usersIds.length; i++) {
    try {
      console.log('[HELPER] Searching For: ', usersIds[i]);
      let res = await bot.getChatMember(chatId, +usersIds[i]);
      console.log('[HELPER] Found: ', res.user.username);
      if (res.user.username) {
        usernames.push(res.user.username);
      } else {
        throw new Error();
      }
    } catch (err) {
      console.warn('[WARN] Unable to fetch username for id:', usersIds[i], err);
    }
  }
  return usernames;
}
