// test.js
const run = async () => {
  try {
    console.log("Loading API from ./dist/index.js...");
    const api = require('./dist/index.js');
    if (!api.downloader || !api.search) {
      throw new Error("API exports are missing!");
    }
    console.log("Testing TikTok...");
    const tt = await api.downloader.tiktok("https://vt.tiktok.com/ZSFKTkuMA/"); 
    console.log("TikTok Result:", tt.status ? "Success" : "Failed");
    if (!tt.status) console.log(tt);
    console.log("Testing Chords...");
    const chord = await api.search.chords("Hello Adele");
    console.log("Chords Result:", chord.title ? "Success" : "Failed");
    console.log("All System Tests Passed");
    process.exit(0);
  } catch (error) {
    console.error("Test Failed:", error);
    process.exit(1);
  }
};
run();
