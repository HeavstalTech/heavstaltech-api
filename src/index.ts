import { tiktok, tiktokSlide } from './dl/tiktok';
import { igdl, fbdl } from './dl/social';
import { twitter } from './dl/twitter';
import { pinterest } from './dl/pinterest';
import { search as ytSearch, ytmp3, ytmp4, play } from './dl/youtube';
import { ssweb, remini, styleText, wattpad, chords, morse, tts } from './utils/tools';
import { ephoto } from './utils/maker';
import { lyrics } from './search/lyrics';

export * from './types';

export { 
  tiktok, 
  tiktokSlide, 
  igdl, 
  fbdl, 
  twitter,
  twitter as xdl,
  pinterest,
  ytSearch, 
  ytmp3, 
  ytmp4, 
  play,
  ssweb, 
  remini, 
  styleText, 
  wattpad, 
  chords,
  morse,
  tts,
  ephoto,
  lyrics
};

export const downloader = {
  tiktok,
  tiktokSlide,
  igdl,
  fbdl,
  twitter,
  xdl: twitter,
  pinterest,
  ytmp3,
  ytmp4,
  play
};

export const search = {
  youtube: ytSearch,
  wattpad,
  chords,
  lyrics
};

export const tools = {
  ssweb,
  remini,
  styleText,
  morse,
  tts,
  ephoto
};

export default {
  downloader,
  search,
  tools
};
