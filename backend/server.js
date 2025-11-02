// server.js
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import securityRoutes from "./routes/security.js";
import imageRoutes from "./routes/image.js";
import captionRoutes from "./routes/caption.js";
import memeRoutes from "./routes/meme.js";
import pipelineRoutes from "./routes/pipeline.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MEME_FOLDER = path.join(__dirname, "python/memes");

app.use(cors());
app.use(express.json());
app.use("/memes", express.static(MEME_FOLDER));

app.use("/api/security-check", securityRoutes);
app.use("/api/find-image", imageRoutes);
app.use("/api/generate-caption", captionRoutes);
app.use("/api/generate-meme", memeRoutes);
app.use("/generate-dinosaur", pipelineRoutes);

app.get("/", (req, res) =>
    res.json({
        status: "ok",
        message: "Dinosaur Meme API running 🦖",
        endpoints: [
            "POST /api/security-check",
            "POST /api/find-image",
            "POST /api/generate-caption",
            "POST /api/generate-meme",
            "POST /generate-dinosaur",
        ],
    })
);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log("=".repeat(60));
    console.log("DINOSAUR MEME API SERVER RUNNING");
    console.log("=".repeat(60));
    console.log(`→ http://localhost:${PORT}`);
});
