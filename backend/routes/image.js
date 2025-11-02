import express from "express";
import { runPython } from "../utils/runPython.js";

const router = express.Router();

router.post("/", async (req, res) => {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt required" });

    try {
        console.log(`[IMAGE] Finding best match for: "${prompt}"`);
        const result = await runPython("find_image.py", [prompt]);
        res.json({
            success: true,
            image_path: result.image_path,
            filename: result.filename,
            match_score: result.match_score,
            reasoning: result.reasoning,
            analysis: result.analysis,
        });
    } catch (err) {
        console.error("[IMAGE]", err);
        res.status(500).json({ error: "Image matching failed", message: err.message });
    }
});

export default router;
