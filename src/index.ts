import { tiktok, tiktokSlide } from './dl/tiktok';
import { igdl, fbdl } from './dl/social';
import { twitter } from './dl/twitter';
import { search as ytSearch, ytmp3, ytmp4, play } from './dl/youtube';
import { ssweb, remini, styleText, wattpad, chords, morse, tts } from './utils/tools';
import { ephoto } from './utils/maker';

export * from './types';
export { 
  tiktok, 
  tiktokSlide, 
  igdl, 
  fbdl,
  twitter,
  twitter as xdl,
  ytSearch, 
  ytmp3, 
  ytmp4, 
  play,
  ssweb,
  tts,
  remini, 
  styleText, 
  wattpad, 
  chords,
  morse,
  ephoto
};
export const downloader = {
  tiktok,
  tiktokSlide,
  igdl,
  fbdl,
  twitter,
  xdl: twitter,
  ytmp3,
  ytmp4,
  play
};
export const search = {
  youtube: ytSearch,
  wattpad,
  chords
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
