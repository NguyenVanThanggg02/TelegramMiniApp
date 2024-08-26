import { Telegraf } from "telegraf";
const TOKEN = "";
const bot = new Telegraf(TOKEN);

const web_link = "https://telegram-mini-app-psi.vercel.app/";
bot.start((ctx) =>
  ctx.reply("Welcome", {
    reply_markup: {
      keyboard: [[{ text: "web app", web_app: { url: web_link } }]],
    },
  }),
);
bot.launch();
