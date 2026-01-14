import axios from 'axios';
import * as cheerio from 'cheerio';
import FormData from 'form-data';

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
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
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      };

      const getPage = await axios.get(targetUrl, { headers });
      const cookies = getPage.headers['set-cookie']?.map(c => c.split(';')[0]).join('; ') || '';
      const $ = cheerio.load(getPage.data);
      const formData = new FormData();
      let form = $('input[name="text[]"]').closest('form');
      if (!form.length) form = $('form[id="createimage"]');
      if (!form.length) form = $('form[action*="create-image"]');
      if (!form.length) {
        const title = $('title').text();
        if (title.includes('Cloudflare') || title.includes('Human')) {
            throw new Error("Ephoto360 blocked the request (Cloudflare/IP Block)");
        }
        throw new Error("Could not find generation form on Ephoto360");
      }
      form.find('input').each((i, elem) => {
        const name = $(elem).attr('name');
        const value = $(elem).attr('value');
        const type = $(elem).attr('type');

        if (name && value && type !== 'submit' && !name.includes('text')) {
            formData.append(name, value);
        }
      });

      formData.append('text[]', text);
      const postRes = await axios.post(targetUrl, formData, {
        headers: {
          ...headers,
          ...formData.getHeaders(),
          'Cookie': cookies,
          'Referer': targetUrl,
          'Origin': 'https://en.ephoto360.com'
        }
      });

      const $post = cheerio.load(postRes.data);
      const formValue = $post('div#form_value').text();
      if (!formValue) {
        const jsonCheck = typeof postRes.data === 'object' ? postRes.data : null;
        if (jsonCheck?.success) {
             return resolve('https://en.ephoto360.com' + jsonCheck.image);
        }
        throw new Error("Failed to initiate creation (Server rejected form data)");
      }
      
      const json = JSON.parse(formValue);
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
          'Cookie': cookies,
          'Referer': targetUrl,
          'Origin': 'https://en.ephoto360.com'
        }
      });

      if (finalRes.data.success) {
        const fullUrl = 'https://en.ephoto360.com' + finalRes.data.image;
        resolve(fullUrl);
      } else {
        throw new Error("API returned failure in final step");
      }
    } catch (error: any) {
      reject(new Error(`Ephoto Failed: ${error.message}`));
    }
  });
};
