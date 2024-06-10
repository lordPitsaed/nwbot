import { bot } from "../main";

export const sendErrorMessage = (chatId: number) =>
  bot.sendPhoto(
    chatId,
    "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwallpapercave.com%2Fwp%2Fwp7683467.jpg",
    { caption: "Я сломался (╥﹏╥). Попробуй снова или зови моего папу..." }
  );
