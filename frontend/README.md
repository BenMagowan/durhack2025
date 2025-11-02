# 🦕 Dinosaur Meme Generator Frontend

This is the client-side application for the Dinosaur Meme Generator, built to provide a clean interface for users to input prompts and display the resulting AI-generated dinosaur memes.

Built with React and initially bootstrapped using Create React App (CRA).

# ⚙️ Setup

**Prerequisites**

    Node.js (LTS recommended)

    The Dinosaur Meme Generator Backend must be running (e.g., on http://localhost:5000).

# Install & Run

In the project directory (frontend/), run:
npm install
npm start

The application will open in your browser at http://localhost:3000. It will automatically reload when you make changes.

# Production Build

To prepare the app for deployment, run:
npm run build

This command builds the app into the build folder, optimizing the code for the best performance.

# 🧱 Structure

Based on the file tree, the frontend structure is standard for a CRA project, with a custom component for the core application logic.

frontend/
├── node_modules/          # Project dependencies
├── public/
│   ├── favicon.ico
│   ├── index.html         # Main HTML file
│   ├── manifest.json      # PWA metadata
│   └── robots.txt
├── src/                   # Source code
│   ├── assets/            # Static assets (e.g., react.svg)
│   ├── App.css
│   ├── App.jsx            # Main application component
│   ├── index.css
│   ├── index.js           # Entry point (renders App)
│   └── MemeInput.jsx      # Likely component for user prompt input
├── package-lock.json
├── package.json           # Project metadata & scripts
└── README.md

# 🔄 Meme Flow

**User Interaction:**
User enters a prompt in the text box.
Clicks Generate Meme.
Frontend sends the prompt to the backend via:
POST http://localhost:5000/generate-dinosaur
Backend returns the meme image URL.
Frontend displays the meme.

**Example React usage:**
<img src={resultUrl} alt="AI generated meme" style={{ maxWidth: "400px" }} />

# 🧾 Scripts

npm start: Runs development server (localhost:3000)
npm run build: Builds production bundle into build/ folder
npm test: Launches test runner
npm run eject: Exposes all CRA configuration for manual edits

# 🌐 Backend Integration

Frontend expects backend running at:
http://localhost:5000
    Endpoint for testing: /generate-dinosaur
    Full pipeline: /api/pipeline

Example fetch in React:
const response = await fetch("http://localhost:5000/generate-dinosaur", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ prompt }),
});
const data = await response.json();
setResultUrl(data.imageUrl);

# 🧾 License
MIT License © 2025 Dinosaur Meme Team 🦕
