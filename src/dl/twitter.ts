import axios from 'axios';
import * as cheerio from 'cheerio';
import { AUTHOR, TwitterResult } from '../types';
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
];
const getRandomHeaders = () => ({
  'User-Agent': USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)],
  'Content-Type': 'application/x-www-form-urlencoded',
  'Origin': 'https://twdown.net',
  'Referer': 'https://twdown.net/'
});

/**
 * Twitter/X Video Downloader
 * x.com and twitter.com links
 */
export const twitter = async (url: string): Promise<TwitterResult> => {
  return new Promise(async (resolve, reject) => {
    try {
      const cleanUrl = url.replace("x.com", "twitter.com");
      const config = new URLSearchParams({ URL: cleanUrl });
      const { data } = await axios.post('https://twdown.net/download.php', config, {
        headers: getRandomHeaders()
      });
      const $ = cheerio.load(data);
      const desc = $('div:nth-child(1) > div:nth-child(2) > p').text().trim();
      const thumb = $('div:nth-child(1) > img').attr('src'); 
      const video_hd = $('tbody > tr:nth-child(1) > td:nth-child(4) > a').attr('href');
      const video_sd = $('tr:nth-child(2) > td:nth-child(4) > a').attr('href');   
      let audio = $('body > div.jumbotron > div > center > div.row > div > div:nth-child(5) > table > tbody > tr:nth-child(3) > td:nth-child(4) > a').attr('href');
      if (audio && !audio.startsWith('http')) audio = 'https://twdown.net/' + audio;
      if (!video_sd && !video_hd) {
        throw new Error("No media found. Account might be private or link is invalid.");
      }
      const result: TwitterResult = {
        author: AUTHOR,
        status: true,
        desc: desc || "X/Twitter Video",
        thumbnail: thumb || "",
        video_sd,
        video_hd,
        audio
      };
      resolve(result);
    } catch (error: any) {
      reject({
        author: AUTHOR,
        status: false,
        message: error.message || "X/Twitter Download Failed"
      });
    }
  });
};
