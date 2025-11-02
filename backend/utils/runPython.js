import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PYTHON_DIR = path.join(__dirname, "../python");

export function runPython(scriptName, args = []) {
    return new Promise((resolve, reject) => {
        const process = spawn("python3", [path.join(PYTHON_DIR, scriptName), ...args]);
        let stdout = "";
        let stderr = "";

        process.stdout.on("data", (data) => (stdout += data));
        process.stderr.on("data", (data) => (stderr += data));

        process.on("close", (code) => {
            if (code !== 0) return reject(new Error(stderr || "Python script failed"));
            try {
                resolve(JSON.parse(stdout));
            } catch {
                resolve({ success: true, output: stdout.trim() });
            }
        });
    });
}
