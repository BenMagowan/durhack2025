import express from "express";
import { runPython } from "../utils/runPython.js";

const router = express.Router();

router.post("/", async (req, res) => {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt required" });

    try {
        console.log(`[SECURITY] Checking: "${prompt}"`);
        const result = await runPython("security_check.py", [prompt]);
        res.json(result);
    } catch (err) {
        console.error("[SECURITY]", err);
        res.status(500).json({ error: "Security check failed", message: err.message });
    }
});

export default router;
