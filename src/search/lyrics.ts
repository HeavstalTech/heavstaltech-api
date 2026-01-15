import axios from 'axios';
import { AUTHOR, LyricsResult } from '../types';

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
];

const getRandomHeaders = () => ({
  'User-Agent': USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)]
});

const fetchLrcLib = async (query: string): Promise<LyricsResult> => {
  const searchUrl = `https://lrclib.net/api/search?q=${encodeURIComponent(query)}`;
  const { data } = await axios.get(searchUrl, { headers: getRandomHeaders() });
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error("No lyrics found on LRCLIB.");
  }
  
  const track = data.find((t: any) => t.plainLyrics) || data[0];
  if (!track.plainLyrics && !track.syncedLyrics) {
      throw new Error("Track found but no lyrics content.");
  }
  return {
    author: AUTHOR,
    status: true,
    title: track.trackName,
    artist: track.artistName,
    image: track.albumArt || "",
    url: `https://lrclib.net/api/get/${track.id}`,
    lyrics: track.plainLyrics || track.syncedLyrics
  };
};

const fetchGenius = async (query: string): Promise<LyricsResult> => {
  const searchUrl = `https://genius.com/api/search/multi?per_page=1&q=${encodeURIComponent(query)}`;
  const { data } = await axios.get(searchUrl, { 
      headers: { ...getRandomHeaders(), 'Referer': 'https://genius.com/' } 
  });

  const hit = data.response?.sections?.find((s: any) => s.type === 'song')?.hits?.[0]?.result;
  if (!hit) throw new Error("No songs found on Genius.");
  return {
    author: AUTHOR,
    status: true,
    title: hit.title,
    artist: hit.artist_names,
    image: hit.song_art_image_thumbnail_url,
    url: hit.url,
    lyrics: `[Lyrics available at source]\n${hit.url}`
  };
};

export const lyrics = async (query: string): Promise<LyricsResult> => {
  try {
    return await fetchLrcLib(query);
  } catch (lrcError) {
    try {
        return await fetchGenius(query);
    } catch (geniusError: any) {
        throw new Error(`Lyrics lookup failed. LRCLIB: ${lrcError}. Genius: ${geniusError.message}`);
    }
  }
};
