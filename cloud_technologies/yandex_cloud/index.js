const fetch = require('node-fetch');
const { random, includes } = require('lodash');
// API "умных мыслей":
const api = `http://api.forismatic.com/api/1.0/?method=getQuote&format=json&key=${random(1, 999999)}&lang=ru`;
const numapi = 'http://numbersapi.com/random?json'
// Определение функции получения данных и возврат отформатированной цитаты:
async function getData(url) {
  try {
    const data = await fetch(url);
    const json = await data.json();
    const quote = json.quoteText;
    const author = json.quoteAuthor.length === 0 ? 'Автор неизвестен' : json.quoteAuthor;
    return `<b>${quote}</b>\n\u2014 <i>${author}</i>`;
  } catch (err) {
    console.error('Fail to fetch data: ' + err);
    return 'Мысль потеряна! Попробуй ещё раз.';
  }
}
async function getNum(url) {
  const data = await fetch(url);
  const json = await data.json();
  const num = json.number;
  return `${num}`;
}
// Определение функции поиска ключевых слов во фразе юзера:
function getTrigger(str) {
  const triggerWords = ['мысль', 'мысли', 'цитата', 'цитаты', 'изречение', 'изречения', 'мудрость', 'мудрости', 'мудрые',
    'мудрую', 'мудрое', 'высказывание', 'высказывания'];
  for (let item of triggerWords) {
    if (includes(str, item.toLowerCase())) {
      return true;
    }
  }
  return false;
}



// Яндекс-функция:
module.exports.bot = async (event) => {
  const body = JSON.parse(event.body);
  const text = body.message.text;
  
  const userMsg = text.toLowerCase();
  let botMsg;
  let photoUrl;
  let urlNum;
  let inlineKeyText;
  let msg = {};
  let isPhoto = false;
  
  let link = [];
  link[0] = 'https://storage.yandexcloud.net/img-bot/smart-bot/1.jpg';
  link[1] = 'https://storage.yandexcloud.net/img-bot/smart-bot/2.jpg';
  link[2] = 'https://storage.yandexcloud.net/img-bot/smart-bot/3.jpg';

  let a = random(0,2);

  if (getTrigger(userMsg)) {
    botMsg = await getData(api);
  } else if (userMsg === '/start') {
    botMsg = 'Нажми на кнопку "Умная мысль", чтобы получить её.';
  } else if (userMsg === '/help') {
    botMsg = 'Я поставляю умные мысли от умных людей! Нажимай на кнопку "Умная мысль", чтобы получать их.';
  } else if (userMsg === 'умный котик') {
    isPhoto = true;
    inlineKeyText = await getNum(numapi);
    urlNum = 'http://numbersapi.com/'+inlineKeyText;
    photoUrl = link[a];
  } else {
    botMsg = 'Давай не будем отвлекаться. Просто нажимай кнопку "Умная мысль", и получай эти мысли.';
  }

  if (isPhoto) {
    msg = {
      'method': 'sendPhoto',
      'photo': photoUrl,
      'chat_id': body.message.chat.id,
      'text': botMsg,
      'reply_markup': JSON.stringify({
        inline_keyboard: [
          [{ text: inlineKeyText, url: urlNum }]
        ]
      })
    };
  } else {
    // Шлём текстовое сообщение:
    msg = {
      'method': 'sendMessage',
      'parse_mode': 'HTML',
      'chat_id': body.message.chat.id,
      'text': botMsg,
      // Устанавливаем кнопки для быстрого ввода:
      'reply_markup': JSON.stringify({
        keyboard: [
          [{ text: 'Умная мысль' }],
          [{ text: 'Умный котик' }]
        ]
      })
    };
  }
  
  // Возвращаем результат в Telegram:
  return {
    'statusCode': 200,
    'headers': {
      'Content-Type': 'application/json; charset=utf-8'
    },
    'body': JSON.stringify(msg),
    'isBase64Encoded': false
  };
};
