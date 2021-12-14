const debug = require('debug')('bot:about_command');
let chatId = ''

const about = () => (ctx: any) => {
  const message = `*Bot started*\n`;
  debug(`Triggered "about" command with message \n${message}`);

  return ctx.replyWithMarkdown(message);
};

const start = () => (ctx: any) => {
  chatId = ctx.chat.id;
  const message = `*Bot started!*\n🚨🚨🚨 Warning DO NOT Authenticate with this bot`;
  debug(`Triggered "about" command with message \n${message}`);

  return ctx.replyWithMarkdown(message);
};

export { about, start, chatId };
