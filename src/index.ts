import Telegraf from 'telegraf';

import { about } from './commands';
import { greeting } from './text';
import axios, {AxiosResponse} from 'axios';

const debug = require('debug')('bot');

const BOT_TOKEN = "1814835694:AAGQQRwGlwsYBCDqRjSI6twPdoTrs3z6iqo" || '';
const USERNAME = "lunaER_bot" || '';
const PORT = (process.env.PORT && parseInt(process.env.PORT, 10)) || 3000;
const WEBHOOK_URL = `443/bot${BOT_TOKEN}`;

const bot = new Telegraf(BOT_TOKEN, { username: USERNAME });

bot.command('about', about()).on('text', greeting());

const production = () => {
  debug('Bot runs in production mode');
  debug(`${USERNAME} setting webhook: ${WEBHOOK_URL}`);
  bot.telegram.setWebhook(WEBHOOK_URL);
  debug(`${USERNAME} starting webhook on port: ${PORT}`);
  bot.startWebhook(`/bot${BOT_TOKEN}`, null, PORT);
};

const development = () => {
  debug('Bot runs in development mode');
  debug(`${USERNAME} deleting webhook`);
  bot.telegram.deleteWebhook();
  debug(`${USERNAME} starting polling`);
  bot.startPolling();

  let exchangeRate = 0;
  let rateInPercent = '';

  axios.get('https://lcd.terra.dev/wasm/contracts/terra1jxazgm67et0ce260kvrpfv50acuushpjsz2y0p/store?query_msg={%22pool%22:{}}')
      .then((res: any) => {
        // handle success
        const lunaInPool = res.data.result.assets[0].amount;
        const bLunaInPool = res.data.result.assets[1].amount;

        //Exchange rate for luna : bLuna
        exchangeRate = lunaInPool/bLunaInPool;
        rateInPercent = ((exchangeRate - 1) * 100).toFixed(2);

      })
      .catch((error: string) => {
        // handle error
        console.log(error);
      })
      .then(() => {
        // always executed
        console.log("Get request made")
      });


  setInterval(() => {
        if (exchangeRate < 1) {
          bot.telegram.sendMessage(
              65823869,
              `SWAP NOW !!!!! \nASDASFSFDSFGEWGFHFHFG`)
        }

        bot.telegram.sendMessage(
            65823869,
            `Current Luna-bLuna exchange rate is ~${rateInPercent} % 
                  \n10 Luna : ~${(10 * exchangeRate).toFixed(3)} bLuna
`)
      }, 3000);
  };

process.env.NODE_ENV === 'production' ? production() : development();
