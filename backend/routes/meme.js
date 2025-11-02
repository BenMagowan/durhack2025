import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { runPython } from "../utils/runPython.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PYTHON_DIR = path.join(__dirname, "../python");

const router = express.Router();

router.post("/", async (req, res) => {
    const { filename, top_text, bottom_text } = req.body;
    if (!filename) return res.status(400).json({ error: "Filename required" });

    try {
        console.log(`[MEME] Combining text + image: ${filename}`);
        const result = await runPython("generate_meme.py", [
            path.join(PYTHON_DIR, "dinosaur_photos", filename),
            top_text || "",
            bottom_text || "",
        ]);

        if (!result.success) throw new Error(result.error);

        const imageFile = path.basename(result.output_path);
        const imageUrl = `http://localhost:8080/memes/${imageFile}`;
        res.json({ success: true, imageUrl, message: "Meme generated successfully" });
    } catch (err) {
        console.error("[MEME]", err);
        res.status(500).json({ error: "Meme generation failed", message: err.message });
    }
});

export default router;
