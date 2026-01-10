import { tiktok, tiktokSlide } from './dl/tiktok';
import { igdl, fbdl } from './dl/social';
import { twitter } from './dl/twitter';
import { search as ytSearch, ytmp3, ytmp4, play } from './dl/youtube';
import { ssweb, remini, styleText, wattpad, chords, morse } from './utils/tools';

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
  remini, 
  styleText, 
  wattpad, 
  chords,
  morse
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
  morse
};
export default {
  downloader,
  search,
  tools
};
