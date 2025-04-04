const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Scrape data dari halaman Doujindesu menggunakan proxy.
 * @returns {Promise<object>} - Data hasil scrape dalam format JSON
 */
async function scrapeDoujindesu(url) {
  try {
    const response = await axios.get("https://kyouka-proxy.hf.space/pages?url=https://doujindesu.tv");
    const html = response.data;
    const $ = cheerio.load(html);
    const results = [];

    $('.entry').each((i, el) => {
      const title = $(el).find('h3.title span').text().trim();
      const endpoint = $(el).find('a').attr('href');
      const thumbnail = $(el).find('img').attr('src');
      const chapter = $(el).find('.artists a span').text().trim();
      const rawLabel = $(el).find('.newchlabel').text().trim();
      let fallbackTime = $(el).find('.dtch').text().trim();
      fallbackTime = fallbackTime.replace(/hri/g, 'hari');
      const label = rawLabel || fallbackTime || null;
      const type = $(el).find('span.type').text().trim();

      results.push({
        title,
        endpoint,
        thumbnail,
        chapter,
        label,
        type,
      });
    });

    return {
      developer: 'KyoukaDev',
      status: true,
      data: {
        results,
      },
    };
  } catch (error) {
    return {
      developer: 'KyoukaDev',
      status: false,
      message: error.message,
    };
  }
}

module.exports = {
    scrapeDoujindesu
};
