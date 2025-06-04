const router = require("express").Router();
const cheerio = require("cheerio");
const axios = require("axios").default
const AxiosService = require("../helpers/axiosService");

router.get("/", (req, res) => {
  res.send({
    message: "chapter"
  });
});

//chapter ----done ----
router.get("/:slug", async (req, res) => {
  const slug = req.params.slug;
  try {
    const response = await AxiosService(`ch/${slug}/`);
    const $ = cheerio.load(response.data);
    const content = $("#article");
    let chapter_image = [];
    const obj = {};
    obj.chapter_endpoint = slug + "/";
    obj.chapter_name = slug.split('-').join(' ').trim()

    obj.title = $('#Judul > header > p > a > b').text().trim()
    /**
     * @Komiku
     */
    const getTitlePages = content.find(".dsk2")
    getTitlePages.filter(() => {
      obj.title = $(getTitlePages).find("h1").text().replace("Komik ", "");
    });

    /**
     * @Komiku
     */
    // Perbaikan selektor gambar
    const getPages = $('#Baca_Komik img[itemprop="image"]')

    obj.chapter_pages = getPages.length;
    getPages.each((i, el) => {
      const src = $(el).attr("src");
      // Pastikan URL gambar valid dan tidak mengandung i0.wp.com
      if (src && src.startsWith('http')) {
        chapter_image.push({
          chapter_image_link: src.replace('i0.wp.com/', ''),
          image_number: i + 1,
        });
      }
    });
    
    // Jika tidak ada gambar ditemukan, coba alternatif selektor
    if (chapter_image.length === 0) {
      $('#Baca_Komik img').each((i, el) => {
        const src = $(el).attr("src");
        if (src && src.startsWith('http')) {
          chapter_image.push({
            chapter_image_link: src.replace('i0.wp.com/', ''),
            image_number: i + 1,
          });
        }
      });
    }
    
    obj.chapter_image = chapter_image;
    
    if (chapter_image.length === 0) {
      throw new Error("Tidak dapat menemukan gambar chapter");
    }
    
    res.json(obj);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      status: false,
      message: error.message,
      chapter_image: []
    });
  }
});

module.exports = router;
