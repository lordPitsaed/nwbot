import { envVars } from "../constants";
import fs from "fs";
import { bot } from "../main";

export const getPbModule = () => {
  const weeniesPbs = JSON.parse(
    fs.readFileSync(envVars.WEENIES_PBS, { encoding: "utf-8" })
  );
  const iqPbs = JSON.parse(
    fs.readFileSync(envVars.IQ_PBS, { encoding: "utf-8" })
  );

  bot.on("text", (msg) => {
    const user = msg.from?.username || msg.from?.first_name || "";

    if (
      msg.text?.toLowerCase() === "пб" ||
      msg.text?.toLowerCase() === "pb" ||
      msg.text?.toLowerCase() === "рекорды"
    ) {
      bot.sendMessage(
        msg.chat.id,
        `@${user} твои рекорды: пися - ${weeniesPbs[user]}, айку - ${iqPbs[user]} 
        }`
      );
    }
  });
};
