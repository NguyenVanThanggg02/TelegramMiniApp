import { Telegraf } from "telegraf";

const TOKEN = "7273544566:AAFEYQS5oJZR0s9npHlbWwlBYcT1RKjoa3o";
const bot = new Telegraf(TOKEN);

const web_link = "https://telegram-mini-app-psi.vercel.app/";

bot.start((ctx) => {
  const message = ctx.message.text;
  const params = message.replace('/start ', ''); // Lấy tham số từ lệnh

  if (params) {
    const urlParams = new URLSearchParams(params);
    const tenantId = urlParams.get('tenant_id');
    const tableId = urlParams.get('tableId');
    const storeId = urlParams.get('storeId');

    ctx.reply(`Bot được khởi động với Tenant ID: ${tenantId}, Table ID: ${tableId}, Store ID: ${storeId}`);
  } else {
    ctx.reply("Welcome", {
      reply_markup: {
        keyboard: [[{ text: "web app", web_app: { url: web_link } }]],
      },
    });
  }
});

bot.launch();
