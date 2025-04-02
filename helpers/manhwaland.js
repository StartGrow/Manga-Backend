const axios = require('axios');
const cheerio = require('cheerio');

async function ManhwalandL() {
    try {
        const { data } = await axios.get('https://www.manhwaland.asia/');
        const $ = cheerio.load(data);
        let mangas = [];

        $('.listupd .utao').each((i, element) => {
            const title = $(element).find('.luf a.series h4').text().trim();
            const link = $(element).find('.luf a.series').attr('href');
            const slug = link.replace('https://www.manhwaland.asia/manga/', '').replace(/\/$/, '');
            const image = $(element).find('.imgu img').attr('src').replace(/\?resize=\d+,\d+/, '');
            const status = $(element).find('.statusind').text().trim();
            let chapters = [];

            $(element).find('.luf ul li').each((j, el) => {
                const chapterTitle = $(el).find('.eggchap').text().trim();
                const chapterLink = $(el).find('a').attr('href');
                const chapterSlug = chapterLink.replace('https://www.manhwaland.asia/', '').replace(/\/$/, '');
                const timeAgo = $(el).find('.eggtime').text().trim();
                
                if (chapterTitle) {
                    chapters.push({ chapterTitle, chapterLink, chapterSlug, timeAgo });
                }
            });

            if (chapters.length > 0 || status) {
                let manga = { title, link, slug, image, chapters };
                if (status) {
                    manga.status = status;
                }
                mangas.push(manga);
            }
        });

        return mangas;
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}
async function ManhwalandGenreList() {
  try {
    const response = await axios.get('https://www.manhwaland.asia/manga');
    const $ = cheerio.load(response.data);
    
    return $('ul.genrez li label')
      .map((i, el) => {
        return $(el).text()
          .trim()
          .toLowerCase()
          .replace(/\s+/g, '-')  // Replace spaces with [-]
          .replace(/\./g, '');     // Remove dots
      })
      .get()
      .filter(name => name);  // Remove empty strings

  } catch (error) {
    console.error("Error:", error.message);
    return [];
  }
}
/*async function ManhwalandL(page = 1) {
    try {
        const url = `https://www.manhwaland.asia/manga/?page=${page}&order=update`;
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);
        let mangas = [];

        $('.listupd .bs').each((i, element) => {
            const title = $(element).find('.bigor .tt').text().trim();
            const link = $(element).find('a').attr('href');
            const slug = link.replace('https://www.manhwaland.asia/manga/', '').replace(/\/$/, '');
            const image = $(element).find('.limit img').attr('src').split('?')[0];
            const latestChapter = $(element).find('.adds .epxs').text().trim();
            const rating = $(element).find('.numscore').text().trim();
            
            // Mengambil status dari span dengan kelas 'status'
            const status = $(element).find('.status').text().trim() || 'Unknown';
            
            let manga = { 
                title, 
                link, 
                slug, 
                image, 
                latestChapter, 
                status
            };
            if (rating) {
                manga.rating = parseFloat(rating);
            }

            mangas.push(manga);
        });

        // Check for previous and next page
        const prevPage = $('.hpage a.l').attr('href');
        const nextPage = $('.hpage a.r').attr('href');

        // Menentukan halaman sebelumnya dan berikutnya
		const hasPrevPage = prevPage ? page - 1 : 0;  // Halaman sebelumnya
        const hasNextPage = nextPage.split("page=")[1].split("&")[0]; 

        return { mangas, hasPrevPage, hasNextPage };
    } catch (error) {
        console.error('Error fetching data:', error);
        return { mangas: [], hasPrevPage: false, hasNextPage: false };
    }
}*/
async function ManhwalandChapter(url) {
    try {
        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        const $ = cheerio.load(data);
        const title = $('div.chdesc b').first().text().trim();
        const noscriptHtml = $('noscript').html() || '';
        const imageUrls = [...noscriptHtml.matchAll(/https?:\/\/[^"'\s]+?\.(webp|jpg|jpeg|png|gif)/gi)]
            .map(match => match[0]);
        
        return {
            title,
            images: imageUrls
        };
    } catch (error) {
        console.error('Error:', error.message);
        return null;
    }
}
async function ManhwalandDetail(url) {
    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);
        
        const title = $('h1.entry-title').text().trim();
        const thumbnail = $('.thumb img').attr('src').replace(/\?resize=\d+,\d+/, '');
        const rating = $('.rating-prc .num').text().trim();
        const status = $('.tsinfo .imptdt:contains("Status") i').text().trim();
        const type = $('.tsinfo .imptdt:contains("Type") a').text().trim();
        const author = $('.tsinfo .imptdt:contains("Author") i').text().trim();
        const postedBy = $('.tsinfo .imptdt:contains("Posted By") i').text().trim();
        const postedOn = $('.tsinfo .imptdt:contains("Posted On") time').text().trim();
        const updatedOn = $('.tsinfo .imptdt:contains("Updated On") time').text().trim();
        const genres = $('.wd-full .mgen a').map((i, el) => $(el).text().trim()).get();
        const synopsis = $('.entry-content-single p').text().trim();
        
        const chapters = [];
        $('#chapterlist li').each((i, el) => {
            const chapterTitle = $(el).find('.chapternum').text().trim();
            const chapterUrl = $(el).find('a').attr('href');
            const chapterDate = $(el).find('.chapterdate').text().trim();
            const chapterSlug = chapterUrl.replace('https://www.manhwaland.asia/', '').replace(/\/$/, '');
            chapters.push({ title: chapterTitle, url: chapterUrl, slug: chapterSlug, date: chapterDate });
        });
        
        return {
            title,
            thumbnail,
            rating,
            status,
            type,
            author,
            postedBy,
            postedOn,
            updatedOn,
            genres,
            synopsis,
            chapters
        };
    } catch (error) {
        console.error('Error scraping:', error);
    }
}
const BASE_URL = 'https://www.manhwaland.asia';
async function scrapeManhwaland(query, page = 1) {
    try {
        const url = `${BASE_URL}/page/${page}/?s=${query}`;
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);

        let results = [];
        $('.listupd .bsx').each((_, el) => {
            const element = $(el);
            const title = element.find('.bigor .tt').text().trim();
            const slug = element.find('a').attr('href')
                .replace(`${BASE_URL}/manga/`, '')
                .replace(`${BASE_URL}/`, '')
                .replace(/\//g, '');
            const chapter = element.find('.bigor .adds .epxs').text().trim();
            const rating = element.find('.bigor .adds .numscore').text().trim();
            const img = element.find('.limit img').attr('src').replace(/\?resize=\d+,\d+/, '');

            results.push({ title, slug, chapter, rating, img });
        });

        let nextPage = $('.pagination .next.page-numbers').attr('href');
        nextPage = nextPage ? nextPage.match(/page\/(\d+)/)?.[1] : null;
        
        return { results, nextPage };
    } catch (error) {
        console.error('Error scraping data:', error);
        return { results: [], nextPage: null };
    }
}
async function ManhwalandSearch(query) {
    let page = 1;
    let allResults = [];
    let hasNextPage = true;

    while (hasNextPage) {
        console.log(`Scraping page ${page}...`);
        const { results, nextPage } = await scrapeManhwaland(query, page);
        allResults = [...allResults, ...results];
        hasNextPage = !!nextPage;
        if (nextPage) page = parseInt(nextPage);
    }
    return allResults;
}
const REMOVE_URL = ['https://www.manhwaland.asia/', 'https://www.manhwaland.asia/manga/'];
async function ManhwalandTags(genre, page = 1) {
    try {
        const url = `${BASE_URL}/genres/${genre}/page/${page}/`;
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);
        
        let results = [];
        
        $('.listupd .bsx').each((i, el) => {
            const element = $(el);
            const title = element.find('.tt').text().trim();
            const chapter = element.find('.epxs').text().trim();
            const rating = element.find('.numscore').text().trim();
            const status = element.find('.status').text().trim();
            const image = element.find('img').attr('src').replace(/\?resize=\d+,\d+/, '');
            let slugs = element.find('a').attr('href');
            let slug = slugs.replace('https://www.manhwaland.asia/manga/', '').replace(/\/$/, '');
            
            results.push({ title, slug, chapter, rating, status, image });
        });
        
        let nextPage = $('.pagination .next.page-numbers').attr('href');
        if (nextPage) {
            nextPage = nextPage.replace(BASE_URL + '/genres/' + genre + '/page/', '').replace('/', '');
        }
        
        return { results, nextPage: nextPage ? parseInt(nextPage) : null };
    } catch (error) {
        console.error(`Error scraping genre ${genre}:`, error.message);
        return { results: [], nextPage: null };
    }
}

module.exports = {
    ManhwalandL,
    ManhwalandChapter,
    ManhwalandDetail,
    ManhwalandSearch,
    ManhwalandTags,
    ManhwalandGenreList
};
