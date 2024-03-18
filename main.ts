import dotenv from 'dotenv';
import schedule from 'node-schedule';
import TelegramBot from 'node-telegram-bot-api';
import repl from 'repl';
import { BOT_TOKEN } from './constants';
import { alertsModule, iqMeterModule, userRememberingModule } from './modules';
import { weenieMeterModule } from './modules/weenie_meter_module';

dotenv.config();

export const bot = new TelegramBot(BOT_TOKEN || '', {
  polling: true,
});

userRememberingModule();
alertsModule();
weenieMeterModule();
iqMeterModule();

bot.onText(/\/ruok/, (msg) => {
  bot.sendMessage(msg.chat.id, 'I`M OK');
});

process.env.LOG_ALL_MSGS && bot.on('message', (msg) => console.log(msg));

repl.start().context.bot = bot;

process.on('SIGINT', function () {
  schedule.gracefulShutdown().then(() => process.exit(0));
});
