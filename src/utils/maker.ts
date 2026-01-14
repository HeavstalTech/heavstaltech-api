import axios from 'axios';
import * as cheerio from 'cheerio';
import FormData from 'form-data';
import { AUTHOR } from '../types';

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
];

const STYLE_MAP: Record<string, string> = {
    glitchtext: 'https://en.ephoto360.com/create-digital-glitch-text-effects-online-767.html',
    writetext: 'https://en.ephoto360.com/write-text-on-wet-glass-online-589.html',
    advancedglow: 'https://en.ephoto360.com/advanced-glow-effects-74.html',
    typographytext: 'https://en.ephoto360.com/create-typography-text-effect-on-pavement-online-774.html',
    pixelglitch: 'https://en.ephoto360.com/create-pixel-glitch-text-effect-online-769.html',
    neonglitch: 'https://en.ephoto360.com/create-impressive-neon-glitch-text-effects-online-768.html',
    flagtext: 'https://en.ephoto360.com/nigeria-3d-flag-text-effect-online-free-753.html',
    flag3dtext: 'https://en.ephoto360.com/free-online-american-flag-3d-text-effect-generator-725.html',
    deletingtext: 'https://en.ephoto360.com/create-eraser-deleting-text-effect-online-717.html',
    blackpinkstyle: 'https://en.ephoto360.com/online-blackpink-style-logo-maker-effect-711.html',
    glowingtext: 'https://en.ephoto360.com/create-glowing-text-effects-online-706.html',
    underwatertext: 'https://en.ephoto360.com/3d-underwater-text-effect-online-682.html',
    logomaker: 'https://en.ephoto360.com/free-bear-logo-maker-online-673.html',
    cartoonstyle: 'https://en.ephoto360.com/create-a-cartoon-style-graffiti-text-effect-online-668.html',
    papercutstyle: 'https://en.ephoto360.com/multicolor-3d-paper-cut-style-text-effect-658.html',
    watercolortext: 'https://en.ephoto360.com/create-a-watercolor-text-effect-online-655.html',
    effectclouds: 'https://en.ephoto360.com/write-text-effect-clouds-in-the-sky-online-619.html',
    blackpinklogo: 'https://en.ephoto360.com/create-blackpink-logo-online-free-607.html',
    gradienttext: 'https://en.ephoto360.com/create-3d-gradient-text-effect-online-600.html',
    summerbeach: 'https://en.ephoto360.com/write-in-sand-summer-beach-online-free-595.html',
    luxurygold: 'https://en.ephoto360.com/create-a-luxury-gold-text-effect-online-594.html',
    multicoloredneon: 'https://en.ephoto360.com/create-multicolored-neon-light-signatures-591.html',
    sandsummer: 'https://en.ephoto360.com/write-in-sand-summer-beach-online-576.html',
    galaxywallpaper: 'https://en.ephoto360.com/create-galaxy-wallpaper-mobile-online-528.html',
    '1917style': 'https://en.ephoto360.com/1917-style-text-effect-523.html',
    makingneon: 'https://en.ephoto360.com/making-neon-light-text-effect-with-galaxy-style-521.html',
    royaltext: 'https://en.ephoto360.com/royal-text-effect-online-free-471.html',
    freecreate: 'https://en.ephoto360.com/free-create-a-3d-hologram-text-effect-441.html',
    galaxystyle: 'https://en.ephoto360.com/create-galaxy-style-free-name-logo-438.html',
    lighteffects: 'https://en.ephoto360.com/create-light-effects-green-neon-online-429.html'
};

export const ephoto = async (style: string, text: string): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    try {
      const targetUrl = STYLE_MAP[style];
      if (!targetUrl) throw new Error(`Invalid style. Available: ${Object.keys(STYLE_MAP).join(', ')}`);

      const headers = {
        'User-Agent': USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)],
        'Content-Type': 'application/x-www-form-urlencoded'
      };

      // 1. Get Token and Cookies
      const getPage = await axios.get(targetUrl, { headers });
      const $ = cheerio.load(getPage.data);
      
      const formData = new FormData();
      const token = $('input[name="token"]').val();
      const build_server = $('input[name="build_server"]').val();
      const build_server_id = $('input[name="build_server_id"]').val();

      if (!token) throw new Error("Failed to fetch token from Ephoto360");

      formData.append('text[]', text);
      formData.append('token', token);
      formData.append('build_server', build_server);
      formData.append('build_server_id', build_server_id);

      // 2. Post Data
      const postRes = await axios.post(targetUrl, formData, {
        headers: {
          ...headers,
          ...formData.getHeaders(),
          'Cookie': getPage.headers['set-cookie']?.join('; ')
        }
      });

      const $post = cheerio.load(postRes.data);
      const formValue = $post('div#form_value').text();
      
      if (!formValue) throw new Error("Failed to initiate creation");
      
      const json = JSON.parse(formValue);

      // 3. Final Execution
      const finalData = new FormData();
      finalData.append('id_share', json.id_share);
      finalData.append('id_parent', json.id_parent);
      finalData.append('id_other', json.id_other);
      finalData.append('token', json.token);
      finalData.append('uid', json.uid);
      finalData.append('sign', json.sign);

      const finalRes = await axios.post('https://en.ephoto360.com/effect/create-image', finalData, {
        headers: {
          ...headers,
          ...finalData.getHeaders(),
          'Cookie': getPage.headers['set-cookie']?.join('; ')
        }
      });

      if (finalRes.data.success) {
        // The API returns a server path, we need to construct the full URL
        const fullUrl = 'https://en.ephoto360.com' + finalRes.data.image;
        resolve(fullUrl);
      } else {
        throw new Error("API returned failure");
      }

    } catch (error: any) {
      reject(new Error(`Ephoto Failed: ${error.message}`));
    }
  });
};
