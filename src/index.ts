import Telegraf from 'telegraf';

import { about } from './commands';
import { LCDClient, Coin } from '@terra-money/terra.js';
import {chatId, start} from "./commands/about";

const debug = require('debug')('bot');

const terra = new LCDClient({
    URL: 'https://lcd.terra.dev',
    chainID: "columbus-4",
});
const contract = "terra1jxazgm67et0ce260kvrpfv50acuushpjsz2y0p";
const BOT_TOKEN = "1937360032:AAFceAYayqZTgLPKfK94fUe42oxVc7lY-YE" || '';
const USERNAME = "lunaER_bot" || '';
const PORT = (process.env.PORT && parseInt(process.env.PORT, 10)) || 3000;
const WEBHOOK_URL = `${process.env.WEBHOOK_URL}/bot${BOT_TOKEN}`;

const bot = new Telegraf(BOT_TOKEN, { username: USERNAME });

interface SimulationObject {
    return_amount: string,
    spread_amount: string,
    commission_amount: string,
}

bot.command('start', start()).on('text', start());
bot.command('test', about)

const production = () => {
};

const development = () => {
  debug('Bot runs in development mode');
  debug(`${USERNAME} deleting webhook`);
  bot.telegram.deleteWebhook();
  debug(`${USERNAME} starting polling`);
  bot.startPolling();

  let exchangeRate: number = 0;
  let rateInPercent = '';
  let prevMsg = '';

    const getExchangeRate = async () => {
        try {
            const result = await terra.wasm.contractQuery(
                contract,
                {
                    "simulation": {
                        "offer_asset": {
                            "amount": (1 * 1000000).toString(),
                            "info": {
                                "native_token": {
                                    "denom": "uluna"
                                }
                            }
                        }
                    }
                }
            )

            const simObject = result as SimulationObject;
            exchangeRate = (parseInt(simObject.return_amount)/ 1000000);
            // console.log(exchangeRate)
            // console.log(simObject);

            return exchangeRate;
        } catch (error) {
            console.error(error)
        }
    }

    setInterval(() => {
        getExchangeRate();
        const newMsg = `Luna-bLuna exchange rate is ~${exchangeRate} %
                  \n1 Luna : ~${(1 * exchangeRate).toFixed(4)} bLuna`;

        // send message only when rate changes
        if (prevMsg != newMsg && chatId) {
            bot.telegram.sendMessage(chatId, newMsg);
            prevMsg = newMsg;

            // send ALERT when its time to swap
            if (exchangeRate < 1) {
                bot.telegram.sendMessage(
                    chatId,
                    `🚨🚨🚨 Good time to get some FREE bLUNAs 🚨🚨🚨`)
            }
        }

        console.log('Time now is ', new Date());
        console.log('prevMsg is ',prevMsg);
        console.log('newMsg is ',newMsg);
        console.log('-----------------------------------');
    }, 5000)


};

process.env.NODE_ENV === 'production' ? production() : development();
