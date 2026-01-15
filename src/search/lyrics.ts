import axios from 'axios';
import * as cheerio from 'cheerio';
import { AUTHOR, LyricsResult } from '../types';

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
];

const getRandomHeaders = (referer: string) => ({
  'User-Agent': USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)],
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Referer': referer
});

const scrapeGenius = async (query: string): Promise<LyricsResult> => {
  const searchUrl = `https://genius.com/api/search/multi?per_page=5&q=${encodeURIComponent(query)}`;
  
  const { data } = await axios.get(searchUrl, { 
    headers: { ...getRandomHeaders('https://genius.com/'), 'Accept': 'application/json, text/plain, */*' } 
  });
  
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

  const pageRes = await axios.get(songUrl, { headers: getRandomHeaders('https://genius.com/') });
  const $ = cheerio.load(pageRes.data);

  let lyricsText = '';
  
  $('div[data-lyrics-container="true"]').each((i, elem) => {
    $(elem).find('br').replaceWith('\n');
    lyricsText += $(elem).text() + '\n\n';
  });

  lyricsText = lyricsText.trim();

  if (!lyricsText) lyricsText = $('.lyrics').text().trim();
  if (!lyricsText) throw new Error("Could not parse lyrics from Genius page.");

  return {
    author: AUTHOR,
    status: true,
    title,
    artist,
    image,
    url: songUrl,
    lyrics: lyricsText
  };
};

const scrapeLyricsCom = async (query: string): Promise<LyricsResult> => {
  const searchUrl = `https://www.lyrics.com/serp.php?st=${encodeURIComponent(query)}&stype=1`;
  
  const { data } = await axios.get(searchUrl, { headers: getRandomHeaders('https://www.lyrics.com/') });
  const $ = cheerio.load(data);

  const firstResult = $('.best-matches .bm-label a').first();
  if (!firstResult.length) throw new Error("No songs found on Lyrics.com");

  const link = 'https://www.lyrics.com' + firstResult.attr('href');
  const title = firstResult.text();
  
  const pageRes = await axios.get(link, { headers: getRandomHeaders('https://www.lyrics.com/') });
  const $$ = cheerio.load(pageRes.data);

  const lyricsText = $$('pre#lyric-body-text').text().trim();
  const artist = $$('h3.lyric-artist a').text().trim() || 'Unknown Artist';
  const image = $$('img.album-thumb').attr('src') || '';

  if (!lyricsText) throw new Error("Could not parse lyrics from Lyrics.com");

  return {
    author: AUTHOR,
    status: true,
    title,
    artist,
    image,
    url: link,
    lyrics: lyricsText
  };
};

export const lyrics = async (query: string): Promise<LyricsResult> => {
  try {
    return await scrapeGenius(query);
  } catch (error: any) {
    try {
      return await scrapeLyricsCom(query);
    } catch (fallbackError: any) {
      throw new Error(`All sources failed. Genius: ${error.message}. Fallback: ${fallbackError.message}`);
    }
  }
};
