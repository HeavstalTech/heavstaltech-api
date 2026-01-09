import { tiktok, tiktokSlide } from './dl/tiktok';
import { igdl, fbdl } from './dl/social';
import { search as ytSearch, ytmp3, ytmp4, play } from './dl/youtube';
import { ssweb, remini, styleText, wattpad, chords } from './utils/tools';

export * from './types';
export { 
  tiktok, 
  tiktokSlide, 
  igdl, 
  fbdl, 
  ytSearch, 
  ytmp3, 
  ytmp4, 
  play,
  ssweb, 
  remini, 
  styleText, 
  wattpad, 
  chords
};
export const downloader = {
  tiktok,
  tiktokSlide,
  igdl,
  fbdl,
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
  styleText
};
export default {
  downloader,
  search,
  tools
};
