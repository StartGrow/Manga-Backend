require('dotenv').config();
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
const manga = require("./routers/manga");
const chapter = require("./routers/chapter");
const cors = require("cors");
const helmet = require("helmet");

const allowedOrigins = ['https://nekonime.xyz', 'https://anime.nekonime.xyz'];

const corsOptions = {
  origin: function (origin, callback) {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true); // Mengizinkan akses
    } else {
      callback(new Error('Not allowed by CORS')); // Menolak akses jika domain tidak dikenali
    }
  },
  methods: ['GET', 'POST'], // Sesuaikan dengan metode HTTP yang Anda izinkan
  allowedHeaders: ['Content-Type', 'Authorization'], // Sesuaikan dengan header yang perlu diterima
};

// Menggunakan middleware CORS dengan opsi di atas
app.use(cors(corsOptions));
app.use(helmet());
app.use("/api", manga);
app.use(express.static("./public"));
app.use("/api/chapter", chapter);

app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "api path not found",
  });
});
// listening
app.listen(PORT, () => {
  console.log("Listening on PORT:" + PORT);
});
