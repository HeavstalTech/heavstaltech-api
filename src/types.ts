export interface Author {
  name: string;
  source: string;
}

export const AUTHOR: Author = {
  name: "HEAVSTAL TECH",
  source: "https://heavstal-tech.vercel.app"
};

export interface TikTokResult {
  author: Author;
  status: boolean;
  title: string;
  cover?: string;
  origin_cover?: string;
  no_watermark?: string;
  watermark?: string;
  music?: string;
  views?: number | string;
  likes?: number | string;
  comments?: number | string;
  shares?: number | string;
  downloads?: number | string;
  uniqueId?: string;
  profileUrl?: string;
  profileImage?: string;
  hashtags?: string[];
  slideImages?: string[];
  author_name?: string;
}

export interface SocialResult {
  author: Author;
  status: boolean;
  type: 'video' | 'image';
  title?: string;
  thumbnail?: string;
  url: string;
}

export interface YouTubeResult {
  author: Author;
  title: string;
  thumbnail: string;
  channel: string;
  published: string;
  views: string;
  url: string;
  duration?: number | string;
  status?: boolean;
}

export interface YouTubeSearchResult {
  type: 'video' | 'channel' | 'list' | 'live';
  url: string;
  title: string;
  description?: string;
  image?: string;
  thumbnail?: string;
  seconds?: number;
  timestamp?: string;
  views?: number;
  ago?: string;
  author?: {
    name: string;
    url: string;
  };
}

export interface UtilsResult {
  author: Author;
  status: boolean;
  data: Buffer | string | any;
}
