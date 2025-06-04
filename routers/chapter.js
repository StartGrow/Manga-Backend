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
    const html = await AxiosService(`ch/${slug}/`);
    const $ = cheerio.load(html);
    
    const chapterData = {
      chapter_endpoint: slug + "/",
      chapter_name: slug.split('-').join(' ').trim(),
      title: $("h1").first().text().replace("Komik ", "").trim(),
      chapter_pages: 0,
      chapter_image: []
    };

    // Get all chapter images
    $("#Baca_Komik img").each((i, el) => {
      const imgSrc = $(el).attr("src");
      if (imgSrc) {
        chapterData.chapter_image.push({
          chapter_image_link: imgSrc.replace('i0.wp.com/', ''),
          image_number: i + 1
        });
      }
    });

    chapterData.chapter_pages = chapterData.chapter_image.length;

    // Get additional info from the hidden span if needed
    const chapterInfo = $(".chapterInfo");
    if (chapterInfo.length) {
      chapterData.chapter_number = chapterInfo.attr("valueChapter");
      chapterData.total_images = chapterInfo.attr("valueGambar");
    }

    res.json(chapterData);
    
  } catch (error) {
    console.error("Error fetching chapter:", error);
    res.status(500).json({
      status: false,
      message: "Failed to fetch chapter data",
      chapter_image: []
    });
  }
});

module.exports = router;
