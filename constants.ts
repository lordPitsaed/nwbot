import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const USER_IDS_FILE = process.env.FILE_REMEMBERED_USER_IDS as string;

export const userIds: string[] = JSON.parse(
  fs.readFileSync(USER_IDS_FILE, { encoding: "utf-8" })
).userIds;

export const envVars = {
  IQ_PBS: process.env.FILE_IQ_PBS || "",
  IQ: process.env.FILE_IQ || "",
  KEYBOARD_MESSAGE: process.env.FILE_KEYBOARD_MESSAGE || "",
  REMEMBERED_USER_IDS: process.env.FILE_REMEMBERED_USER_IDS || "",
  SIGAME_PACKS: process.env.FILE_SIGAME_PACKS || "",
  WEENIES_PBS: process.env.FILE_WEENIES_PBS || "",
  WEENIES: process.env.FILE_WEENIES || "",
  RANDOM_ORG_TOKEN: process.env.RANDOM_ORG_TOKEN || "",
  BOT_TOKEN: process.env.BOT_TOKEN || "",
  ALERT_TOPIC: process.env.BOT_NOTIFICATIONS_TOPIC || "",
  CHAT_ID: process.env.CHAT_ID || "",
  LOG_ALL: process.env.LOG_ALL_MSGS || "false",
};
