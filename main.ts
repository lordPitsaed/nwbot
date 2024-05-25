import dotenv from "dotenv";
import fs from "fs";
import schedule from "node-schedule";
import TelegramBot from "node-telegram-bot-api";
import repl from "repl";
import { envVars } from "./constants";
import {
  alertsModule,
  iqMeterModule,
  sigameRandomModule,
  userRememberingModule,
} from "./modules";
import { weenieMeterModule } from "./modules/weenie_meter_module";
import { prayForNwbButtonModule } from "./modules/pray_for_nwb_button_module/pray_for_nwb_button_module";
import { keyboardModule } from "./modules/keyobard_module";

export const bot = new TelegramBot(envVars.BOT_TOKEN || "", {
  polling: true,
});

userRememberingModule();
alertsModule();
weenieMeterModule();
iqMeterModule();
sigameRandomModule();
prayForNwbButtonModule();
keyboardModule();

bot.onText(/\/ruok/, (msg) => {
  bot.sendMessage(msg.chat.id, "I`M OK");
});

bot.on("message", (msg) => Boolean(envVars.LOG_ALL) ?? console.log(msg));

repl.start().context.bot = bot;

process.on("SIGINT", function () {
  schedule.gracefulShutdown().then(() => process.exit(0));
});
