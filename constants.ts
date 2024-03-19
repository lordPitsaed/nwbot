import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const USER_IDS_FILE = './data_files/remembered_user_ids.txt';

export const userIds = (() => {
  return fs
    .readFileSync(USER_IDS_FILE, { encoding: 'utf-8', flag: 'a+' })
    .split('\n')
    .filter((el) => !!el);
})();

export const CHAT_ID = process.env.CHAT_ID || '';
export const ALERT_TOPIC = process.env.BOT_NOTIFICATIONS_TOPIC || '';
export const BOT_TOKEN = process.env.BOT_TOKEN || '';
export const RANDOM_ORG_TOKEN = process.env.RANDOM_ORG_TOKEN || '';
