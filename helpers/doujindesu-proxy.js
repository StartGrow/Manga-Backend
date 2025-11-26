const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Scrape data dari halaman Doujindesu menggunakan proxy.
 * @returns {Promise<object>} - Data hasil scrape dalam format JSON
 */
async function scrapeDoujindesu() {
  try {
    const response = await axios.get("https://proxy.hiura.biz.id/proxy-doujin?url=https://doujindesu.tv");
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

async function DoujindesuDetail(slug) {
  try {
    const { data } = await axios.get(`https://kyouka-proxy-2.hf.space/pages?url=https://doujindesu.tv/manga/${slug}`);
    const $ = cheerio.load(data);

    const title = $("section.metadata h1.title").clone().children().remove().end().text().trim();
    const altTitle = $("section.metadata h1.title .alter i").text().trim();
    const thumbnail = $("aside figure.thumbnail img").attr("src")?.replace('https://doujindesu.tv', 'https://cdn.doujindesu.dev');

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
      const chapterPath = $(el).find(".eps a").attr("href").replace(/^\/+/, '') || '';
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

async function DoujindesuChapter(slug) {
  try {
    const { data } = await axios.get(`https://kyouka-proxy-4.hf.space/pages?url=https://doujindesu.tv/${slug}`);
    const $ = cheerio.load(data);
    const title = $("script + h1").first().text().trim();
    const dateRelease = $(".epx").first().contents().filter(function () {
      return this.type === "text";
    }).text().trim().replace(/,\s*in$/, '');
    const images = [];
    $("#anu img").each((_, el) => {
      const src = $(el).attr("src");
      if (src) images.push(encodeURI(src));
    });
    return {
      title,
      date: dateRelease,
      images,
      total: images.length
    };
  } catch (error) {
    console.error("Failed to fetch chapter:", error.message);
    return null;
  }
}

async function DoujindesuSearch(query) {
  const url = `https://kyouka-proxy-5.hf.space/pages?url=https://doujindesu.tv/?s=${encodeURIComponent(query)}`;

  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const results = [];

    $('article.entry').each((_, el) => {
      const element = $(el);
      const title = element.find('h3.title span').text().trim();
      const rawLink = element.find('a').attr('href');
      const link = 'https://doujindesu.tv' + rawLink;
      const thumbnail = element.find('figure.thumbnail img').attr('src')?.replace('https://doujindesu.tv', 'https://cdn.doujindesu.dev');
      const type = element.find('figure.thumbnail span.type').text().trim();
      const score = element.find('.score').text().trim().replace(/\s+/g, '');
      const status = element.find('.status').text().trim();
      const slug = rawLink.replace(/^\/manga\//, '').replace(/\/$/, '');

      results.push({
        title,
        type,
        score,
        status,
        link,
        thumbnail,
        slug
      });
    });

    return results;
  } catch (err) {
    console.error('Error fetching Doujindesu search:', err.message);
    return [];
  }
}

async function DoujindesuGenres(genre, page = 1) {
  const baseDoujindesu = 'https://doujindesu.tv';
  const baseProxy = 'https://kyouka-proxy.hf.space/pages?url=';
  const url = page === 1
    ? `${baseProxy}${baseDoujindesu}/genre/${genre}?order=populer`
    : `${baseProxy}${baseDoujindesu}/genre/${genre}/page/${page}/?order=populer`;

  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const results = [];

    $('article.entry').each((_, el) => {
      const element = $(el);
      const rawLink = element.find('a').attr('href');
      const link = `${baseDoujindesu}${rawLink}`;
      const slug = rawLink.replace(/^\/manga\//, '').replace(/\/$/, '');
      const title = element.find('h3.title span').text().trim();
      const thumbnail = element.find('figure.thumbnail img').attr('src')?.replace('https://doujindesu.tv', 'https://cdn.doujindesu.dev');
      const type = element.find('figure.thumbnail span.type').text().trim();
      const score = element.find('.score').text().trim();
      const status = element.find('.status').text().trim();

      results.push({
        title,
        type,
        score,
        status,
        link,
        thumbnail,
        slug
      });
    });
    let nextPage = null;
    const nextBtn = $('li.last a[title="Next page"]').attr('href');
    if (nextBtn) {
      const match = nextBtn.match(/\/page\/(\d+)\//);
      if (match) {
        nextPage = parseInt(match[1]);
      }
    }
    return {
      currentPage: page,
      nextPage,
      results
    };
  } catch (err) {
    console.error(`Error fetching genre ${genre} page ${page}:`, err.message);
    return {
      currentPage: page,
      nextPage: null,
      results: []
    };
  }
}

module.exports = {
    scrapeDoujindesu,
    DoujindesuDetail,
    DoujindesuChapter,
    DoujindesuSearch,
    DoujindesuGenres
};
