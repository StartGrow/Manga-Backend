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
      const endpoint = $(el).find('a').attr('href')?.replace(/^\/manga\//, '') || '';
      const thumbnail = $(el).find('img').attr('src');
      const chapter = $(el).find('.artists a span').text().trim();
      const rawLabel = $(el).find('.newchlabel').text().trim();
      let fallbackTime = $(el).find('.dtch').text().trim();
      fallbackTime = fallbackTime.replace(/hri/g, 'hari');
      const label = rawLabel || fallbackTime || null;
      const chapter_endpoint = $(el).find('.artists a').attr('href').replace(/^\/+/, '') || '';
      const type = $(el).find('span.type').text().trim();

      results.push({
        title,
        endpoint,
        thumbnail,
        chapter,
        label,
        type,
        chapter_endpoint
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

async function DoujindesuDetail(url) {
  try {
    const { data } = await axios.get(`https://kyouka-proxy.hf.space/pages?url=https://doujindesu.tv/manga/${url}`);
    const $ = cheerio.load(data);

    const title = $("section.metadata h1.title").clone().children().remove().end().text().trim();
    const altTitle = $("section.metadata h1.title .alter i").text().trim();
    const thumbnail = $("aside figure.thumbnail img").attr("src");

    const tableRows = $("section.metadata table tr");
    const metadata = {};
    tableRows.each((i, el) => {
      const key = $(el).find("td").first().text().trim().toLowerCase();
      const value = $(el).find("td").last().text().trim();
      metadata[key] = value;
    });

    const genres = [];
    $("section.metadata .tags a").each((i, el) => {
      const url = $(el).attr("href");
      const slug = url.split("/genre/")[1].replace(/\//g, "");
      const name = $(el).text().trim();
      genres.push({ name, slug, url });
    });

    const chapters = [];
    $("#chapter_list ul li").each((i, el) => {
      const title = $(el).find(".lchx a").text().trim();
      const chapterPath = $(el).find(".eps a").attr("href");
      const uploadDate = $(el).find(".date").text().trim();
      chapters.push({ title, chapterUrl: chapterPath, uploadDate });
    });

    return {
      title,
      altTitle,
      thumbnail,
      status: metadata["status"] || null,
      type: metadata["type"] || null,
      series: metadata["series"] || null,
      author: metadata["author"] || null,
      group: metadata["group"] || null,
      rating: metadata["rating"] || null,
      createdDate: metadata["created date"] || null,
      genres,
      chapters,
    };
  } catch (err) {
    console.error("Error in DoujindesuDetail:", err.message);
    return null;
  }
}

module.exports = {
    scrapeDoujindesu,
    DoujindesuDetail
};
