import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();
export const userIds = (() => fs.readFileSync('./remembered_user_ids.txt').toString().split('\n'))();

export const CHAT_ID = process.env.CHAT_ID || '';
export const ALERT_TOPIC = process.env.BOT_NOTIFICATIONS_TOPIC || '';
export const BOT_TOKEN = process.env.BOT_TOKEN || '';
export const RANDOM_ORG_TOKEN = process.env.RANDOM_ORG_TOKEN || '';
