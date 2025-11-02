import express from "express";
import { runPython } from "../utils/runPython.js";

const router = express.Router();

router.post("/", async (req, res) => {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt required" });

    try {
        console.log(`[CAPTION] Generating for: "${prompt}"`);
        const result = await runPython("generate_caption.py", [prompt]);
        res.json({ success: true, ...result });
    } catch (err) {
        console.error("[CAPTION]", err);
        res.status(500).json({ error: "Caption generation failed", message: err.message });
    }
});

export default router;
