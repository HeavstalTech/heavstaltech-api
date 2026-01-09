// test.js
const api = require('./dist/index.js');
async function run() {
  console.log("Testing TikTok...");
  const tt = await api.downloader.tiktok("https://vt.tiktok.com/ZSFKTkuMA/"); 
  console.log(tt);
  console.log("Testing Lyrics...");
  const chord = await api.search.chords("Hello Adele");
  console.log(chord);
}
run();
