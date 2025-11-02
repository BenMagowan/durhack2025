import express from "express";
import cors from "cors";
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MEME_FOLDER = path.join(__dirname, "python/memes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/memes", express.static(MEME_FOLDER));

// Path to Python scripts
const PYTHON_DIR = path.join(__dirname, "python");

/**
 * Run Python script and return JSON result
 */
function runPythonScript(scriptName, args = []) {
    return new Promise((resolve, reject) => {
        const python = spawn("python3", [
            path.join(PYTHON_DIR, scriptName),
            ...args,
        ]);

        let stdout = "";
        let stderr = "";

        python.stdout.on("data", (data) => {
            stdout += data.toString();
        });

        python.stderr.on("data", (data) => {
            stderr += data.toString();
        });

        python.on("close", (code) => {
            if (code !== 0) {
                reject(new Error(`Python script failed: ${stderr}`));
            } else {
                try {
                    const result = JSON.parse(stdout);
                    resolve(result);
                } catch (e) {
                    // If the output is not JSON, resolve with a default object
                    resolve({ success: true });
                }
            }
        });
    });
}

/**
 * STEP 1: Security check endpoint
 */
app.post("/api/security-check", async (req, res) => {
    try {
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: "Prompt is required" });
        }

        console.log(`[SECURITY] Checking prompt: "${prompt}"`);

        // Call Python security checker
        const result = await runPythonScript("security_check.py", [prompt]);

        console.log(
            `[SECURITY] Result: ${result.is_safe ? "SAFE" : "BLOCKED"} (score: ${result.score})`
        );

        res.json(result);
    } catch (error) {
        console.error("[SECURITY] Error:", error.message);
        res.status(500).json({
            error: "Security check failed",
            message: error.message,
        });
    }
});

/**
 * STEP 2: Find best matching dinosaur image for a prompt
 */
app.post("/api/find-image", async (req, res) => {
    try {
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: "Prompt is required" });
        }

        console.log(`[FIND-IMAGE] Finding image for: "${prompt}"`);

        // Call Python to find best image
        const result = await runPythonScript("find_image.py", [prompt]);

        console.log(`[FIND-IMAGE] ✓ Selected: ${result.filename} (score: ${result.match_score})`);

        res.json({
            success: true,
            image_path: result.image_path,
            filename: result.filename,
            match_score: result.match_score,
            reasoning: result.reasoning,
            analysis: result.analysis
        });
    } catch (error) {
        console.error("[FIND-IMAGE] Error:", error.message);
        res.status(500).json({
            error: "Image matching failed",
            message: error.message,
        });
    }
});

/**
 * STEP 3: Generate caption text for a prompt
 */
app.post("/api/generate-caption", async (req, res) => {
    try {
        const { prompt, image_analysis } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: "Prompt is required" });
        }

        console.log(`[GENERATE-CAPTION] Generating caption for: "${prompt}"`);

        // Call Python script to generate caption text
        const result = await runPythonScript("generate_caption.py", [prompt]);

        console.log(`[GENERATE-CAPTION] ✓ Generated caption`);

        res.json({
            success: true,
            ...result
        });
    } catch (error) {
        console.error("[GENERATE-CAPTION] Error:", error.message);
        res.status(500).json({
            error: "Caption generation failed",
            message: error.message,
        });
    }
});

/**
 * STEP 4: Generate final meme with image + caption
 * Takes filename and caption text, combines them into final meme
 */
app.post("/api/generate-meme", async (req, res) => {
    try {
        const { filename, top_text, bottom_text } = req.body;

        if (!filename) {
            return res.status(400).json({ error: "Filename is required" });
        }

        console.log(`[GENERATE-MEME] Creating meme with: ${filename}`);
        console.log(`  Top: "${top_text}"`);
        console.log(`  Bottom: "${bottom_text}"`);

        // Call Python script to generate meme
        const result = await runPythonScript("generate_meme.py", [
            path.join(PYTHON_DIR, "dinosaur_photos", filename),
            top_text || "",
            bottom_text || ""
        ]);

        if (!result.success) {
            throw new Error(result.error);
        }

        res.json({
            success: true,
            imageUrl: result.output_path,
            message: "Meme generated successfully"
        });
    } catch (error) {
        console.error("[GENERATE-MEME] Error:", error.message);
        res.status(500).json({
            error: "Meme generation failed",
            message: error.message,
        });
    }
});

/**
 * FULL PIPELINE: Complete meme generation
 * This is the main endpoint that orchestrates everything
 */
app.post("/generate-dinosaur", async (req, res) => {
    try {
        const { prompt } = req.body;

        if (!prompt || !prompt.trim()) {
            return res.status(400).json({ error: "Prompt is required" });
        }

        console.log(`\n${"=".repeat(60)}`);
        console.log(`[PIPELINE] Starting meme generation for: "${prompt}"`);
        console.log("=".repeat(60));

        // Step 1: Security check
        console.log("[STEP 1/4] Running security check...");
        const securityResult = await runPythonScript("security_check.py", [prompt]);

        if (!securityResult.is_safe) {
            console.log(`[STEP 1/4]  BLOCKED: ${securityResult.reason}`);
            return res.status(400).json({
                error: "Prompt failed security check",
                reason: securityResult.reason,
                categories: securityResult.categories,
                score: securityResult.score,
            });
        }
        console.log("[STEP 1/4] ✓ Security check passed");

        // Step 2: Generate caption
        console.log("[STEP 2/4] Generating caption text...");
        const captionResult = await runPythonScript("generate_caption.py", [prompt]);
        console.log(`[STEP 2/4] ✓ Caption: "${captionResult.top_text}" / "${captionResult.bottom_text}"`);

        // Step 3: Generate image
        console.log("[STEP 3/4] Generating image...");
        const imageResult = await runPythonScript("generate_image.py", [captionResult.image_prompt, "image.jpg"]);
        console.log(`[STEP 3/4] ✓ Image generated`);

        // Step 4: Combine image + text
        console.log("[STEP 4/4] Combining image and text...");
        // Call Python script to generate meme
        const result = await runPythonScript("generate_meme.py", [
            path.join(__dirname, "python", "images", "image.jpg"),
            captionResult.top_text || "",
            captionResult.bottom_text || ""
        ]);

        if (!result.success) {
            throw new Error(result.error);
        }

        // Log the final meme URL
        console.log(`[STEP 4/4] ✓ Meme created: ${result.output_path}`);

        // Return complete result with the image
        const imageUrl = `http://localhost:8080/memes/${result.output_path.split('/').pop()}`;
        res.json({
            success: true,
            imageUrl: imageUrl,
            filename: "image.jpg",
            top_text: captionResult.top_text,
            bottom_text: captionResult.bottom_text,
        });

        console.log(`${"=".repeat(60)}`);
        console.log("[PIPELINE] ✓ Complete!\n");
    } catch (error) {
        console.error("[PIPELINE]  Error:", error.message);
        res.status(500).json({
            error: "Meme generation pipeline failed",
            message: error.message,
        });
    }
});

// Health check
app.get("/", (req, res) => {
    res.json({
        status: "ok",
        message: "Dinosaur Meme API is running",
        endpoints: {
            "POST /api/security-check": "Check if prompt is safe",
            "POST /api/find-image": "Find best matching dinosaur image",
            "POST /api/generate-caption": "Generate meme caption text",
            "POST /api/generate-meme": "Combine image + caption",
            "POST /generate-dinosaur": "Full pipeline (all steps)"
        }
    });
});

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log("=".repeat(60));
    console.log("DINOSAUR MEME API SERVER");
    console.log("=".repeat(60));
    console.log(`Server running on http://localhost:${PORT}`);
    console.log("\nAvailable Endpoints:");
    console.log("  GET  /                          - Health check");
    console.log("  POST /api/security-check        - Security check only");
    console.log("  POST /api/find-image            - Find image only");
    console.log("  POST /api/generate-caption      - Generate caption (TODO)");
    console.log("  POST /api/generate-meme         - Combine image + text (TODO)");
    console.log("  POST /generate-dinosaur         - Full pipeline");
    console.log("=".repeat(60));
    console.log("\nSetup checklist:");
    console.log("  ✓ Python scripts in ./python/ directory");
    console.log("  ✓ OPENROUTER_API_KEY environment variable set");
    console.log("  ✓ dino_analysis.json file exists");
    console.log("\nPress Ctrl+C to stop\n");
});