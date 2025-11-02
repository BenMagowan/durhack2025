import { spawn } from "child_process";
import path from "path";

export function runPython(scriptName, args = []) {
    return new Promise((resolve, reject) => {
        const pythonCmd = process.platform === "win32" ? "python" : "python3"; // ✅ cross-platform
        const scriptPath = path.join(__dirname, "../python", scriptName);

        const pyProcess = spawn(pythonCmd, [scriptPath, ...args]);

        let output = "";
        pyProcess.stdout.on("data", (data) => {
            output += data.toString();
        });

        let error = "";
        pyProcess.stderr.on("data", (data) => {
            error += data.toString();
        });

        pyProcess.on("close", (code) => {
            if (code !== 0) {
                return reject(new Error(error || `Python exited with code ${code}`));
            }

            try {
                const json = JSON.parse(output);
                resolve(json);
            } catch (e) {
                resolve({ raw_output: output.trim() });
            }
        });

        pyProcess.on("error", (err) => reject(err)); // captures ENOENT too
    });
}
