import axios from 'axios';
import * as cheerio from 'cheerio';
import FormData from 'form-data';
import https from 'https';
import { AUTHOR, Author } from '../types';

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
};

const ignoreSSL = new https.Agent({  
  rejectUnauthorized: false,
  servername: 'inferenceengine.vyro.ai'
});

const MORSE_MAP: Record<string, string> = {
  'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
  'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
  'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
  'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
  'Y': '-.--', 'Z': '--..',
  '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-',
  '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.',
  '.': '.-.-.-', ',': '--..--', '?': '..--..', "'": '.----.', '!': '-.-.--',
  '/': '-..-.', '(': '-.--.', ')': '-.--.-', '&': '.-...', ':': '---...',
  ';': '-.-.-.', '=': '-...-', '+': '.-.-.', '-': '-....-', '_': '..--.-',
  '"': '.-..-.', '$': '...-..-', '@': '.--.-.',
  ' ': '/' 
};
const REVERSE_MORSE = Object.fromEntries(
  Object.entries(MORSE_MAP).map(([char, code]) => [code, char])
);

export const ssweb = async (url: string, device: 'desktop' | 'tablet' | 'phone' = 'desktop'): Promise<Buffer> => {
  return new Promise(async (resolve, reject) => {
    try {
      const baseURL = 'https://www.screenshotmachine.com';
      const param = { url: url, device: device, cacheLimit: 0 };
      const { data, headers } = await axios.post(`${baseURL}/capture.php`, 
        new URLSearchParams(param as any), {
        headers: { 'content-type': 'application/x-www-form-urlencoded; charset=UTF-8', 'User-Agent': HEADERS['User-Agent'] }
      });
      if (data.status !== 'success') throw new Error('Screenshot generation failed');
      const cookies = headers['set-cookie']?.join('') || '';
      const imageResponse = await axios.get(`${baseURL}/${data.link}`, {
        headers: { 'cookie': cookies, 'User-Agent': HEADERS['User-Agent'] },
        responseType: 'arraybuffer'
      });
      resolve(imageResponse.data);
    } catch (error: any) {
      reject(new Error(`SSWeb Failed: ${error.message}`));
    }
  });
};

export const remini = async (imageUrl: string, method: 'enhance' | 'recolor' | 'dehaze' = 'enhance'): Promise<Buffer> => {
  return new Promise(async (resolve, reject) => {
    try {
      const validMethods = ["enhance", "recolor", "dehaze"];
      const selectedMethod = validMethods.includes(method) ? method : "enhance";
      const imgBuffer = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      const form = new FormData();
      form.append("model_version", 1, {
        header: { "Content-Transfer-Encoding": "binary", "contentType": "multipart/form-data; charset=utf-8" }
      });
      form.append("image", Buffer.from(imgBuffer.data), {
        filename: "enhance_image_body.jpg",
        contentType: "image/jpeg",
      });
      const url = `https://inferenceengine.vyro.ai/${selectedMethod}`;
      const response = await axios.post(url, form, {
        headers: {
          ...form.getHeaders(),
          "User-Agent": "okhttp/4.9.3",
          "Connection": "Keep-Alive",
          "Accept-Encoding": "gzip"
        },
        responseType: 'arraybuffer',
        httpsAgent: ignoreSSL 
      });
      resolve(response.data);
    } catch (error: any) {
      reject(new Error(`Remini Failed: ${error.message}`));
    }
  });
};

export const styleText = async (text: string): Promise<{ author: Author, name: string, result: string }[]> => {
  return new Promise(async (resolve, reject) => {
    try {
      const { data } = await axios.get(`http://qaz.wtf/u/convert.cgi?text=${encodeURIComponent(text)}`);
      const $ = cheerio.load(data);
      const result: { author: Author, name: string, result: string }[] = [];
      $('table > tbody > tr').each((i, el) => {
        const name = $(el).find('td').first().text().trim();
        const styled = $(el).find('td').eq(1).text().trim();
        if (name && styled) {
          result.push({ author: AUTHOR, name: name, result: styled });
        }
      });
      resolve(result);
    } catch (error: any) {
      reject(new Error(`StyleText Failed: ${error.message}`));
    }
  });
};

export const wattpad = async (query: string): Promise<any[]> => {
  try {
    const { data } = await axios.get(`https://www.wattpad.com/search/${encodeURIComponent(query)}`, { headers: HEADERS });
    const $ = cheerio.load(data);
    const results: any[] = [];
    $('.story-card').each((i, el) => {
       const title = $(el).find('.story-title').text().trim();
       const image = $(el).find('.cover img').attr('src');
       const link = 'https://www.wattpad.com' + $(el).find('a.story-card-data').attr('href');
       const reads = $(el).find('.read-count').text().trim();  
       if (title) results.push({ author: AUTHOR, title, image, link, reads });
    });
    if (results.length === 0) {
        $('div.cover').each((i, el) => {
             results.push({ author: AUTHOR, image: $(el).find('img').attr('src') });
        });
    }
    return results;
  } catch (error: any) {
    throw new Error(`Wattpad Failed: ${error.message}`);
  }
};

/**
 * Morse Code Engine
 * Encodes Text to Morse OR Decodes Morse to Text
 */
export const morse = async (input: string, mode: 'encode' | 'decode' = 'encode'): Promise<string> => {
  return new Promise((resolve) => {
    if (mode === 'encode') {
      const result = input
        .toUpperCase()
        .split('')
        .map(char => MORSE_MAP[char] || char)
        .join(' ');
      resolve(result);
    } else {
      const result = input
        .split(' ') 
        .map(code => REVERSE_MORSE[code] || (code === '/' ? ' ' : code))
        .join('')
        .replace(/\s+/g, ' ').trim();
      resolve(result);
    }
  });
};

export const chords = async (query: string): Promise<any> => {
  try {
    const searchUrl = `https://www.gitagram.com/?s=${encodeURIComponent(query).replace(/%20/g, "+")}`;
    const { data } = await axios.get(searchUrl, { headers: HEADERS });
    const $ = cheerio.load(data);   
    const firstResultUrl = $("table.table > tbody > tr").eq(0).find("td").eq(0).find("a").eq(0).attr("href");
    if (!firstResultUrl) throw new Error("No chords found");
    const songPage = await axios.get(firstResultUrl, { headers: HEADERS });
    const $song = cheerio.load(songPage.data); 
    const $hcontent = $song("div.hcontent");
    const artist = $hcontent.find("div > a > span.subtitle").text().trim();
    const title = $hcontent.find("h1.title").text().trim();
    const content = $song("div.content > pre").text().trim();
    return { author: AUTHOR, title, artist, url: firstResultUrl, chord: content };
  } catch (error: any) {
    throw new Error(`Chords Failed: ${error.message}`);
  }
};
