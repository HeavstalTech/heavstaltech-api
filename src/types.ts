// src/types.ts

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
}

export interface SocialResult {
  author: Author;
  status: boolean;
  type: 'video' | 'image';
  title?: string;
  thumbnail?: string;
  url: string; 
}

export interface UtilsResult {
  author: Author;
  status: boolean;
  data: Buffer | string | any;
}
