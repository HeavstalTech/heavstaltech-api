# @heavstaltech/api

![NPM Version](https://img.shields.io/npm/v/@heavstaltech/api?style=flat-square)
![Build Status](https://img.shields.io/github/actions/workflow/status/HeavstalTech/heavstaltech-api/test.yml?style=flat-square&label=tests)
![License](https://img.shields.io/npm/l/@heavstaltech/api?style=flat-square)

A powerful, all-in-one scraping and utility library built by **HEAVSTAL TECH**. 
This module provides easy access to media downloaders (TikTok, YouTube, Instagram, Facebook), search engines, and AI tools.

It is designed to work seamlessly in both **CommonJS (`require`)** and **ES Modules (`import`)** environments.

---

## 🌐 Heavstal Tech Ecosystem

This package is part of the **Heavstal Tech** ecosystem. 

**Explore More APIs:**  
Visit our official API Hub to discover more tools, endpoints, and detailed documentation:  
👉 **[https://heavstal-tech.vercel.app/apis](https://heavstal-tech.vercel.app/apis)**

---

## 📦 Installation

Install via npm:

```bash
npm install @heavstaltech/api
```

---

## 🚀 Usage (ESM vs CJS)

This library is a **hybrid module**. You can use it in legacy Node.js projects or modern TypeScript/ESM projects without any configuration.

### CommonJS (`require`)
```javascript
const { downloader, search, tools } = require('@heavstaltech/api');

// or require specific functions
const { tiktok } = require('@heavstaltech/api');
```

### ES Modules / TypeScript (`import`)
```typescript
import { downloader, search, tools } from '@heavstaltech/api';

// or import specific functions
import { tiktok, remini } from '@heavstaltech/api';
```

---

## 📚 API Documentation

### 1. Social Media Downloaders

#### TikTok (Video & Slides)
Supports downloading videos without watermarks, searching for videos, and fetching slide images.

```javascript
// 1. Search or Download via URL
const result = await downloader.tiktok("https://vt.tiktok.com/ZS..."); 
// OR search: await downloader.tiktok("funny cat videos");

console.log(result);
/* Output:
{
  author: { name: 'HEAVSTAL TECH', ... },
  status: true,
  title: 'Video Title',
  no_watermark: 'https://...',
  audio: 'https://...'
}
*/

// 2. TikTok Slides
const slide = await downloader.tiktokSlide("https://vt.tiktok.com/ZS...");
console.log(slide);
```

#### Instagram (Reels, Images, Videos)
Downloads content from Instagram public posts.

```javascript
const ig = await downloader.igdl("https://www.instagram.com/p/Cp...");

ig.forEach(media => {
  console.log(`Type: ${media.type} | URL: ${media.url}`);
});
```

#### Facebook (Watch & Public Videos)
Downloads public Facebook videos in SD or HD.

```javascript
const fb = await downloader.fbdl("https://fb.watch/...");
console.log(fb);
```

---

### 2. YouTube (Search & Download)

**Note:** Powered by `@distube/ytdl-core` and `yt-search`.

#### Search
```javascript
const results = await search.youtube("No Copyright Sounds");
console.log(results[0]); // Returns video details
```

#### Download Audio (MP3)
```javascript
const audio = await downloader.ytmp3("https://youtu.be/...");
console.log(audio.url); // Direct download link
```

#### Download Video (MP4)
```javascript
const video = await downloader.ytmp4("https://youtu.be/...");
console.log(video.url); // Direct download link
```

#### Play (Search & Auto-Download)
Searches for a query and immediately returns the download link for the first result.
```javascript
// Get Audio
const song = await downloader.play("Adele Hello", "mp3");

// Get Video
const vid = await downloader.play("Adele Hello", "mp4");
```

---

### 3. Search & Lyrics

#### Guitar Chords & Lyrics
Fetches chords and lyrics from Gitagram.
```javascript
const song = await search.chords("Ed Sheeran Perfect");
console.log(song.chord);
```

#### Wattpad
Search for stories on Wattpad.
```javascript
const stories = await search.wattpad("Werewolf");
console.log(stories);
```

---

### 4. Utilities & AI Tools

#### Remini (AI Image Enhancer)
Enhances low-quality images using AI. Returns a `Buffer`.
```javascript
const fs = require('fs');

// Methods: 'enhance', 'recolor', 'dehaze'
const buffer = await tools.remini("https://example.com/blurry.jpg", "enhance");

fs.writeFileSync("enhanced.jpg", buffer);
```

#### Screenshot Website
Takes a screenshot of any URL.
```javascript
const buffer = await tools.ssweb("https://google.com", "desktop");
// options: 'desktop', 'tablet', 'phone'
```

#### Stylish Text
Converts normal text into fancy fonts.
```javascript
const fonts = await tools.styleText("Heavstal Tech");
console.log(fonts);
```

---

## 📝 License

This project is licensed under the **MIT License**.

---

<div align="center">
  <p>Maintained by <a href="https://heavstal-tech.vercel.app">HEAVSTAL TECH</a></p>
  <p><i>Building Tomorrow's Web, Today.</i></p>
</div>
