const router = require("express").Router();
const cheerio = require("cheerio");
const axios = require("axios").default;
const AxiosService = require("../helpers/axiosService");

router.get("/", (req, res) => {
  res.send({
    message: "chapter"
  });
});

// chapter endpoint
router.get("/:slug", async (req, res) => {
  const slug = req.params.slug;
  try {
    const response = await AxiosService(`https://komiku.org/${slug}/`);
    const $ = cheerio.load(response.data);
    
    const obj = {
      chapter_endpoint: slug + "/",
      chapter_name: slug.split('-').join(' ').trim(),
      title: "",
      chapter_pages: 0,
      chapter_image: []
    };

    // Get all chapter images if they exist
    const getPages = $('#Baca_Komik img');
    if (getPages.length > 0) {
      obj.chapter_pages = getPages.length;
      getPages.each((i, el) => {
        obj.chapter_image.push({
          chapter_image_link: $(el).attr("src"),
          image_number: i + 1,
        });
      });
    }

    res.json(obj);
  } catch (error) {
    console.log(error);
    res.json({
      chapter_endpoint: slug + "/",
      chapter_name: slug.split('-').join(' ').trim(),
      title: "",
      chapter_pages: 0,
      chapter_image: []
    });
  }
});

module.exports = router;
