import axios from 'axios';
import * as cheerio from 'cheerio';
import { AUTHOR, SocialResult } from '../types';

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1'
];
const getRandomHeaders = () => ({
  'User-Agent': USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)],
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.5',
  'Accept-Encoding': 'gzip, deflate, br',
  'Connection': 'keep-alive'
});

/**
 * Facebook Video Downloader
 * Source: getmyfb.com
 */
export const fbdl = async (url: string): Promise<SocialResult[]> => {
  return new Promise(async (resolve, reject) => {
    try {
      const { data } = await axios.post("https://getmyfb.com/process", 
        new URLSearchParams({
          id: url,
          locale: "en"
        }), 
        {
          headers: {
            ...getRandomHeaders(),
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "Cookie": "PHPSESSID=mtkljtmk74aiej5h6d846gjbo4; __cflb=04dToeZfC9vebXjRcJCMjjSQh5PprejufZXs2vHCt5; _token=K5Qobnj4QvoYKeLCW6uk" //s
          }
        }
      );

      const $ = cheerio.load(data);
      const results: SocialResult[] = [];
      const title = $("div.results-item-text").eq(0).text().trim();
      const thumbnail = $(".results-item-image-wrapper img").attr("src") || "";
      $("a.btn-download").each((i, el) => {
        const link = $(el).attr("href");
        if (link) {
          results.push({
            author: AUTHOR,
            status: true,
            type: 'video',
            title: title || "Facebook Video",
            thumbnail: thumbnail,
            url: link
          });
        }
      });

      if (results.length === 0) {
        const singleLink = $("a").attr("href");
        if(singleLink && singleLink.startsWith('http')) {
           results.push({
            author: AUTHOR,
            status: true,
            type: 'video',
            title: title,
            thumbnail: thumbnail,
            url: singleLink
           })
        } else {
             reject(new Error("No Facebook video found (Private or Invalid URL)"));
             return;
        }
      }
      resolve(results);

    } catch (error: any) {
      reject({
        author: AUTHOR,
        status: false,
        message: error.message || "Facebook Download Failed"
      });
    }
  });
};

/**
 * Instagram Downloader
 * Source: indown.io
 */
export const igdl = async (url: string): Promise<SocialResult[]> => {
  return new Promise(async (resolve, reject) => {
    try {
      const initialResponse = await axios.get("https://indown.io/", {
        headers: getRandomHeaders()
      });
      
      const _$ = cheerio.load(initialResponse.data);
      const referer = _$("input[name=referer]").val() as string;
      const locale = _$("input[name=locale]").val() as string;
      const _token = _$("input[name=_token]").val() as string;
      const cookies = initialResponse.headers["set-cookie"]?.join(" ") || "";

      if (!_token) throw new Error("Failed to fetch Instagram token");
      const { data } = await axios.post(
        "https://indown.io/download",
        new URLSearchParams({
          link: url,
          referer,
          locale,
          _token,
        }),
        {
          headers: {
            ...getRandomHeaders(),
            "Content-Type": "application/x-www-form-urlencoded",
            "Cookie": cookies,
            "Origin": "https://indown.io",
            "Referer": "https://indown.io/"
          },
        }
      );

      const $ = cheerio.load(data);
      const result: SocialResult[] = [];
      $("video").each(function () {
        const $$ = $(this);
        const src = $$.find("source").attr("src");
        const poster = $$.attr("poster");
        if (src) {
          result.push({
            author: AUTHOR,
            status: true,
            type: "video",
            thumbnail: poster,
            url: src,
          });
        }
      });

      $("img.img-fluid").each(function () {
        const $$ = $(this);
        const src = $$.attr("src");
        if (src) {
          result.push({
            author: AUTHOR,
            status: true,
            type: "image",
            thumbnail: src,
            url: src,
          });
        }
      });
      
      if(result.length === 0) {
         $(".btn-group a").each((i, el) => {
             const link = $(el).attr("href");
             if(link && link !== "#") {
                 result.push({
                    author: AUTHOR,
                    status: true,
                    type: "video",
                    url: link
                 });
             }
         });
      }

      if (result.length === 0) {
        const errorMsg = $(".alert-danger").text().trim();
        reject(new Error(errorMsg || "No media found. Account might be private."));
      } else {
        resolve(result);
      }
    } catch (error: any) {
      reject({
        author: AUTHOR,
        status: false,
        message: error.message || "Instagram Download Failed"
      });
    }
  });
};
