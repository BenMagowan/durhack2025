import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { runPython } from "../utils/runPython.js";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PYTHON_DIR = path.join(__dirname, "../python");

router.post("/", async (req, res) => {
    const { prompt } = req.body;
    if (!prompt?.trim()) return res.status(400).json({ error: "Prompt required" });

    console.log("\n" + "=".repeat(60));
    console.log(`[PIPELINE] Starting for: "${prompt}"`);
    console.log("=".repeat(60));

    try {
        // Step 1: Security
        const security = await runPython("security_check.py", [prompt]);
        if (!security.is_safe) {
            return res.status(400).json({ error: "Unsafe prompt", ...security });
        }
        console.log("[1/4] ✓ Security check passed");

        // Step 2: Caption
        const caption = await runPython("generate_caption.py", [prompt]);
        console.log(`[2/4] ✓ Caption: ${caption.top_text} / ${caption.bottom_text}`);

        // Step 3: Image
        const image = await runPython("generate_image.py", [caption.image_prompt, "image.jpg"]);
        console.log("[3/4] ✓ Image generated");

        // Step 4: Meme
        const meme = await runPython("generate_meme.py", [
            path.join(PYTHON_DIR, "images", "image.jpg"),
            caption.top_text,
            caption.bottom_text,
        ]);

        const imageFile = path.basename(meme.output_path);
        const imageUrl = `http://localhost:8080/memes/${imageFile}`;

        console.log("[4/4] ✓ Meme ready:", imageUrl);
        res.json({ success: true, imageUrl, ...caption });
    } catch (err) {
        console.error("[PIPELINE]", err);
        res.status(500).json({ error: "Pipeline failed", message: err.message });
    }
});

export default router;
