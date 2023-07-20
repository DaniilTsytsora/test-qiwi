import axios from 'axios';

import { parseString } from 'xml2js';

const CB_API_URL = 'https://www.cbr.ru/scripts/XML_daily.asp';

function formatDate(date) {
  const [year, month, day] = date.split('-');
  return `${day}/${month}/${year}`;
}

async function getCurrencyRates(code, date) {
  const formattedDate = formatDate(date);
  const queryUrl = `${CB_API_URL}?date_req=${formattedDate}`;

  try {
    const response = await axios.get(queryUrl);
    const xmlData = response.data;
    const result = await parseXml(xmlData);
    const currency = result.ValCurs.Valute.find(
      (valute) => valute.CharCode[0] === code.toUpperCase()
    );

    if (currency) {
      console.log(`${currency.CharCode[0]} (Доллар США): ${currency.Value[0]}`);
    } else {
      console.log('Currency not found for the given date.');
    }
  } catch (error) {
    console.error('Error fetching data:', error.message);
  }
}

function parseXml(xmlData) {
  return new Promise((resolve, reject) => {
    parseString(xmlData, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}

const args = process.argv.slice(2);
if (args.length !== 2) {
  console.log('Usage: node currency_rates --code=USD --date=2022-10-08');
} else {
  const code = args[0].split('=')[1];
  const date = args[1].split('=')[1];
  getCurrencyRates(code, date);
}
