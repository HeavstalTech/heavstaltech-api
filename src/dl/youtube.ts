import ytdl from '@distube/ytdl-core';
import yts from 'yt-search';
import { AUTHOR, YouTubeResult, YouTubeSearchResult } from '../types';

/*
 * YouTube Search
 */
export const search = async (query: string): Promise<YouTubeSearchResult[]> => {
  return new Promise(async (resolve, reject) => {
    try {
      const result = await yts(query);
      if (!result.all || result.all.length === 0) {
        return reject(new Error("No results found on YouTube."));
      }
      const data: YouTubeSearchResult[] = result.all.map((item: any) => {
        return {
          type: item.type as 'video' | 'channel' | 'list' | 'live',
          url: item.url,
          title: item.title,
          description: item.description,
          image: item.image,
          thumbnail: item.thumbnail,
          seconds: (item as any).seconds,
          timestamp: (item as any).timestamp,
          views: (item as any).views,
          ago: (item as any).ago,
          author: (item as any).author ? {
            name: (item as any).author.name,
            url: (item as any).author.url
          } : undefined
        };
      });
      resolve(data);
    } catch (error: any) {
      reject({
        message: error.message || "YouTube Search Failed"
      });
    }
  });
};

/*
 * YouTube Audio Downloader
 */
export const ytmp3 = async (url: string): Promise<YouTubeResult> => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!ytdl.validateURL(url)) {
        throw new Error("Invalid YouTube URL");
      }
      const info = await ytdl.getInfo(url);
      const format = ytdl.chooseFormat(info.formats, { 
        quality: 'highestaudio',
        filter: 'audioonly' 
      });
      if (!format) throw new Error("No audio stream found");
      const result: YouTubeResult = {
        author: AUTHOR,
        title: info.videoDetails.title,
        thumbnail: info.videoDetails.thumbnails[info.videoDetails.thumbnails.length - 1].url, // Highest res
        channel: info.videoDetails.ownerChannelName,
        published: info.videoDetails.publishDate,
        views: info.videoDetails.viewCount,
        duration: info.videoDetails.lengthSeconds,
        url: format.url
      };
      resolve(result);
    } catch (error: any) {
      reject({
        author: AUTHOR,
        status: false,
        message: error.message || "YouTube MP3 Failed"
      });
    }
  });
};

/*
 * YouTube Video Downloader
 */
export const ytmp4 = async (url: string): Promise<YouTubeResult> => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!ytdl.validateURL(url)) {
        throw new Error("Invalid YouTube URL");
      }
      const info = await ytdl.getInfo(url);
      const format = ytdl.chooseFormat(info.formats, { 
        quality: 'highest',
        filter: (f) => f.hasAudio === true && f.hasVideo === true && f.container === 'mp4'
      });
      const finalFormat = format || ytdl.chooseFormat(info.formats, { 
        quality: 'highest',
        filter: (f) => f.hasAudio === true && f.hasVideo === true
      });
      if (!finalFormat) throw new Error("No video stream found");
      const result: YouTubeResult = {
        author: AUTHOR,
        title: info.videoDetails.title,
        thumbnail: info.videoDetails.thumbnails[info.videoDetails.thumbnails.length - 1].url,
        channel: info.videoDetails.ownerChannelName,
        published: info.videoDetails.publishDate,
        views: info.videoDetails.viewCount,
        duration: info.videoDetails.lengthSeconds,
        url: finalFormat.url
      };
      resolve(result);
    } catch (error: any) {
      reject({
        author: AUTHOR,
        status: false,
        message: error.message || "YouTube MP4 Failed"
      });
    }
  });
};

/**
 * YouTube Play (Search & Download)
 * Searches for a query, grabs the first result, and returns the download link
 */
export const play = async (query: string, type: 'mp3' | 'mp4' = 'mp3'): Promise<YouTubeResult> => {
  try {
    const searchResults = await yts(query);
    const videos = searchResults.all.filter((v: any) => v.type === 'video');
    if (videos.length === 0) {
      throw new Error(`No video results found for: ${query}`);
    }
    const firstVideo = videos[0];
    if (type === 'mp4') {
      return await ytmp4(firstVideo.url);
    } else {
      return await ytmp3(firstVideo.url);
    }
  } catch (error: any) {
    throw new Error(`Play Failed: ${error.message}`);
  }
};
