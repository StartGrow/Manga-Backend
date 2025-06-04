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
    
    const chapterData = {
      chapter_endpoint: `${slug}/`,
      chapter_name: slug.split('-').join(' ').trim(),
      title: "",
      chapter_pages: 0,
      chapter_image: [],
      next_chapter: ""
    };

    // Get title
    chapterData.title = $("#Judul > header > p > a > b").text().trim() || 
                        $(".dsk2 h1").text().replace("Komik ", "").trim();

    // Get chapter images
    const imageElements = $("#Baca_Komik > img[itemprop='image']");
    chapterData.chapter_pages = imageElements.length;
    
    imageElements.each((i, el) => {
      const src = $(el).attr("src");
      chapterData.chapter_image.push({
        chapter_image_link: src.replace(/i\d\.wp\.com\//, ""), // Remove all wp.com proxies
        image_number: i + 1,
      });
    });

    // Get next chapter link if available
    const nextChapter = $(".pagination .next, .buttnext").attr("href");
    if (nextChapter) {
      chapterData.next_chapter = nextChapter.replace(/^\/|\/$/g, ""); // Remove leading/trailing slashes
    }

    res.json({
      status: true,
      data: chapterData
    });
    
  } catch (error) {
    console.error("Chapter error:", error);
    res.status(500).json({
      status: false,
      message: error.message,
      data: {
        chapter_image: []
      }
    });
  }
});

module.exports = router;
