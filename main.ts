import schedule from "node-schedule";
import TelegramBot from "node-telegram-bot-api";
import repl from "repl";
import { envVars, userIds } from "./constants";
import { alertsModule, iqMeterModule, sigameRandomModule, userRememberingModule } from "./modules";
import { weenieMeterModule } from "./modules/weenie_meter_module";
import { prayForNwbButtonModule } from "./modules/pray_for_nwb_button_module/pray_for_nwb_button_module";
import { keyboardModule } from "./modules/keyboard_module";
import { getPbModule } from "./modules/get_pb_module";
import { geogessrModule } from "./modules/geogssr_module";
import fs from "fs";

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
getPbModule();
geogessrModule();

bot.onText(/\/ruok/, (msg) => {
  bot.sendMessage(msg.chat.id, "I`M OK");
});

bot.on("message", (msg) => {
  if (msg.from?.id && userIds.indexOf(msg.from.id) === -1) {
    bot.sendMessage(msg.chat.id, "TbI KTo?", { reply_to_message_id: msg.message_id });
    msg.text = null as unknown as undefined;
  }
});
console.log(envVars.LOG_ALL);
bot.on("message", (msg) => (envVars.LOG_ALL ? console.log(msg) : null));

const handleExit = async () => {
  console.log("[EXIT] Shutting down bot");
  await bot.close();
  await bot.stopPolling({ cancel: true });
  console.log("[EXIT] Bot shut down");
  await schedule.gracefulShutdown();
  process.exit();
};

repl.start().context.nwbot = { bot, exit: handleExit };

process.on("beforeExit", async function () {
  console.log("[EXIT] Exiting, schedules graceful shutdown.");
  await schedule.gracefulShutdown();
  console.log("[EXIT] Schedules shut down");
});

process.on("SIGINT", () => {
  schedule.gracefulShutdown().then(process.exit());
});
