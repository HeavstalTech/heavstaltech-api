import axios from 'axios';
import * as cheerio from 'cheerio';
import { AUTHOR, TikTokResult } from '../types';

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1'
];

const getRandomHeaders = () => ({
  'User-Agent': USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)],
  'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
  'Accept': 'application/json, text/javascript, */*; q=0.01'
});

const cleanText = (str: string) => str ? str.replace(/(<br?\s?\/?>)/gi, " \n").replace(/(<([^>]+)>)/gi, "").trim() : "";
const cleanUrl = (url: string) => url ? url.replace('https:', 'http:') : "";

const lovetikFallback = async (url: string): Promise<TikTokResult> => {
  try {
    const { data } = await axios.post("https://lovetik.com/api/ajax/search", 
      new URLSearchParams({ query: url }), 
      { headers: getRandomHeaders() }
    );

    if (!data.links) throw new Error("Lovetik: No links found");

    return {
      author: AUTHOR,
      status: true,
      title: cleanText(data.desc),
      cover: cleanUrl(data.cover),
      no_watermark: cleanUrl(data.links.find((l: any) => l.a && !l.s)?.a), // Usually the first link is No WM
      watermark: cleanUrl(data.links.find((l: any) => l.s?.includes('Watermark'))?.a),
      music: cleanUrl(data.links.find((l: any) => l.t?.includes('Audio'))?.a),
      author_name: cleanText(data.author),
      views: "N/A"
    } as TikTokResult;

  } catch (error: any) {
    throw new Error(`Fallback Failed: ${error.message}`);
  }
};

/**
 * Main TikTok Function
 * Supports: URL Download & Search Query
 */
export const tiktok = async (input: string): Promise<TikTokResult> => {
  return new Promise(async (resolve, reject) => {
    try {
      const isUrl = input.match(/tiktok\.com/i);
      let data;
      
      try {
        if (isUrl) {
          const apiUrl = `https://www.tikwm.com/api/?url=${encodeURIComponent(input)}`;
          const response = await axios.get(apiUrl, { headers: getRandomHeaders() });
          if (response.data.code !== 0) throw new Error("Private video or Invalid URL");
          data = response.data.data;
        } else {
          const apiUrl = `https://www.tikwm.com/api/feed/search`;
          const response = await axios.post(apiUrl, 
            new URLSearchParams({
              keywords: input,
              count: '1',
              cursor: '0',
              HD: '1'
            }), 
            { headers: { ...getRandomHeaders(), 'Cookie': 'current_language=en' } }
          );
          
          if (!response.data.data?.videos || response.data.data.videos.length === 0) {
            throw new Error(`No results found for: ${input}`);
          }
          data = response.data.data.videos[0];
        }

        const result: TikTokResult = {
          author: AUTHOR,
          status: true,
          title: data.title,
          cover: data.cover,
          origin_cover: data.origin_cover,
          no_watermark: data.play,
          watermark: data.wmplay,
          music: data.music,
          views: data.play_count,
          likes: data.digg_count,
          comments: data.comment_count,
          shares: data.share_count,
          downloads: data.download_count
        };
        resolve(result);

      } catch (primaryError) {
        if (isUrl) {
          console.warn("Primary TikTok API failed, switching to fallback...");
          const fallbackData = await lovetikFallback(input);
          resolve(fallbackData);
        } else {
          throw primaryError;
        }
      }
    } catch (error: any) {
      reject({
        author: AUTHOR,
        status: false,
        message: error.message || "TikTok processing failed"
      });
    }
  });
};

/**
 * TikTok Slide Downloader
 */
export const tiktokSlide = async (url: string): Promise<TikTokResult> => {
  try {
    const response = await axios.post("https://api.ttsave.app/", {
      id: url,
      hash: '1e3a27c51eb6370b0db6f9348a481d69',
      mode: 'slide',
      locale: 'en',
      loading_indicator_url: 'https://ttsave.app/images/slow-down.gif',
      unlock_url: 'https://ttsave.app/en/unlock'
    }, {
      headers: getRandomHeaders()
    });

    const $ = cheerio.load(response.data);
    const $element = $('div.flex.flex-col.items-center.justify-center.mt-2.mb-5');
    
    // Check if we actually got content
    if ($element.length === 0) throw new Error("Slide not found or service unavailable");

    const statsDiv = $element.find('div.flex.flex-row.items-center.justify-center');
    
    return {
      author: AUTHOR,
      status: true,
      uniqueId: $element.find('input#unique-id').attr('value'),
      title: $element.find('div.flex.flex-row.items-center.justify-center h2').text().trim(),
      profileImage: $element.find('a').first().find('img').attr('src'),
      profileUrl: $element.find('a').first().attr('href'),
      hashtags: $element.find('p.text-gray-600').text().split(' ').filter(Boolean),
      likes: statsDiv.eq(0).find('span').text().trim(),
      comments: statsDiv.eq(1).find('span').text().trim(),
      shares: statsDiv.eq(2).find('span').text().trim(),
      downloads: statsDiv.eq(3).find('span').text().trim(),
      views: statsDiv.eq(4).find('span').text().trim()
    };

  } catch (error: any) {
     return {
        author: AUTHOR,
        status: false,
        title: "Error",
        views: error.message
     } as TikTokResult;
  }
};
