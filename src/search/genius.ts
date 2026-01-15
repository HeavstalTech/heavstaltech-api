import axios from 'axios';
import * as cheerio from 'cheerio';
import { AUTHOR } from '../types';

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
];

const getRandomHeaders = () => ({
  'User-Agent': USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)],
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'en-US,en;q=0.9',
  'Referer': 'https://genius.com/'
});

interface LyricsResult {
  author: typeof AUTHOR;
  status: boolean;
  title: string;
  artist: string;
  image: string;
  url: string;
  lyrics: string;
}

export const genius = async (query: string): Promise<LyricsResult> => {
  return new Promise(async (resolve, reject) => {
    try {
      const searchUrl = `https://genius.com/api/search/multi?per_page=5&q=${encodeURIComponent(query)}`;
      const { data } = await axios.get(searchUrl, { headers: getRandomHeaders() });
      const sections = data.response?.sections || [];
      const songSection = sections.find((s: any) => s.type === 'song');
      
      if (!songSection || !songSection.hits || songSection.hits.length === 0) {
        throw new Error("No songs found on Genius.");
      }

      const hit = songSection.hits[0].result;
      const songUrl = hit.url;
      const title = hit.title;
      const artist = hit.artist_names;
      const image = hit.song_art_image_thumbnail_url;
      const pageRes = await axios.get(songUrl, { 
        headers: {
            ...getRandomHeaders(),
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
        } 
      });

      const $ = cheerio.load(pageRes.data);
      let lyrics = '';
      
      $('div[data-lyrics-container="true"]').each((i, elem) => {
        $(elem).find('br').replaceWith('\n');
        lyrics += $(elem).text() + '\n\n';
      });

      lyrics = lyrics.trim();
      if (!lyrics) {
        lyrics = $('.lyrics').text().trim();
      }

      if (!lyrics) throw new Error("Could not parse lyrics from page.");
      const result: LyricsResult = {
        author: AUTHOR,
        status: true,
        title,
        artist,
        image,
        url: songUrl,
        lyrics
      };
      resolve(result);
    } catch (error: any) {
      reject({
        author: AUTHOR,
        status: false,
        message: error.message || "Genius Scraper Failed"
      });
    }
  });
};
