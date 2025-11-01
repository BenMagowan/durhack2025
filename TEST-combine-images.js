//**TEST: RUNS WITH MemeInput

const express = require("express");
const multer = require("multer");
const Jimp = require("jimp"); //install jimp
const path = require("path");
const fs = require("fs");
const cors = require("cors");

const app = express();
const PORT = 5000; //****TEMPORARY SERVER FOR TESTING

app.use(cors());
app.use(express.json());

//to ensure that memes folder exists
fs.mkdirSync("memes", { recursive: true });

//serve static images and generated memes
app.use("/images", express.static(path.join(__dirname, "images")));
app.use("/memes", express.static(path.join(__dirname, "memes")));

app.post("/generate-dinosaur", async (req, res) => {
  try {
    const imagePath = path.join(__dirname, "images", "dinosaur.jpeg"); //****ADD A FOLDER CALLED IMAGES AND ADD DINOSAUR.JPEG TO TEST THIS. NEEDS TO BE MODIFIED
    const image = await Jimp.read(imagePath);

    //scale text relative to image size
    const fontSize = Math.floor(image.bitmap.height / 10);
    let font;
    if (fontSize > 128) font = await Jimp.loadFont(Jimp.FONT_SANS_128_WHITE);
    else if (fontSize > 64) font = await Jimp.loadFont(Jimp.FONT_SANS_64_WHITE);
    else if (fontSize > 32) font = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);
    else font = await Jimp.loadFont(Jimp.FONT_SANS_16_WHITE);

    const text = "me when computer science";

    // Print text only at bottom
    image.print(
      font,
      0,
      image.bitmap.height - fontSize - 10,
      {
        text,
        alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
      },
      image.bitmap.width
    );

    // Save meme with timestamp
    const fileName = `dino-meme-${Date.now()}.png`;
    const outputPath = path.join(__dirname, "memes", fileName);
    await image.writeAsync(outputPath);

    // Send a full URL to frontend
    const fullUrl = `http://localhost:${PORT}/memes/${fileName}`;
    res.json({ imageUrl: fullUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate dinosaur meme" });
  }
});

// --- Route 2: Generate meme from uploaded image and text ---
const upload = multer({ dest: "uploads/" });

app.post("/generate", upload.single("image"), async (req, res) => {
  try {
    const { topText, bottomText } = req.body;
    if (!req.file) return res.status(400).json({ error: "No image uploaded" });

    const image = await Jimp.read(req.file.path);
    const font = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);

    // Top text
    image.print(
      font,
      0,
      0,
      {
        text: topText || "",
        alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
        alignmentY: Jimp.VERTICAL_ALIGN_TOP,
      },
      image.bitmap.width,
      image.bitmap.height
    );

    // Bottom text
    image.print(
      font,
      0,
      0,
      {
        text: bottomText || "",
        alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
        alignmentY: Jimp.VERTICAL_ALIGN_BOTTOM,
      },
      image.bitmap.width,
      image.bitmap.height
    );

    const fileName = `meme-${Date.now()}.png`;
    const outputPath = path.join(__dirname, "memes", fileName);
    await image.writeAsync(outputPath);

    //Send full image URL
    const fullUrl = `http://localhost:${PORT}/memes/${fileName}`;
    res.json({ imageUrl: fullUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate meme" });
  }
});

app.listen(PORT, () => {
  console.log("Backend running on http://localhost:${PORT}");
});
