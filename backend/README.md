# 🦖 Dinosaur Meme Generator Backend

This backend powers the **Dinosaur Meme Generator**, an AI-assisted meme creator that turns user prompts into funny dinosaur memes.
Built with **Node.js + Express** and **Python scripts** for AI captioning and image generation.

---

## ⚙️ Setup

### Prerequisites

-   Node.js ≥ 18
-   Python ≥ 3.8
-   Python deps: `Pillow`, `requests`, `openai` (if using AI)

### Install & Run

```bash
npm install
node server.js
```

Server runs on [http://localhost:5000](http://localhost:5000)

---

## 🧱 Structure

```
backend/
├── server.js              # Entry point
├── routes/                # Express routes
│   ├── security.js        # Safety check
│   ├── image.js           # Find/generate dino image
│   ├── caption.js         # Create top/bottom text
│   ├── meme.js            # Combine image + caption
│   └── pipeline.js        # Full pipeline
├── utils/
│   └── runPython.js       # Python subprocess helper
└── python/                # Image + AI scripts
    ├── find_image.py
    ├── generate_caption.py
    ├── generate_image.py
    ├── generate_meme.py
    ├── security_check.py
    ├── memes/             # Final output (served at /memes)
```

---

## 🔄 Meme Generation Pipeline

**Endpoint:**
`POST /api/pipeline`

**Input:**

```json
{ "prompt": "T-Rex trying to use a laptop" }
```

**Steps:**

1. **Security Check** → Filters unsafe prompts (`security_check.py`)
2. **Caption Generation** → Creates top/bottom text (`generate_caption.py`)
3. **Image Selection/Creation** → Finds or generates a matching dinosaur image (`find_image.py` / `generate_image.py`)
4. **Meme Composition** → Adds captions to the image (`generate_meme.py`)
5. **Serve Meme** → Final meme saved to `/python/memes` and accessible via

    ```
    http://localhost:5000/memes/<filename>.jpg
    ```

**Example Response:**

```json
{
    "success": true,
    "top_text": "TECH REX",
    "bottom_text": "CAN’T TYPE WITH TINY ARMS",
    "imageUrl": "http://localhost:5000/memes/TRex_42_meme.jpg"
}
```

---

## 🧠 Other Endpoints

| Route           | Method | Description                   |
| --------------- | ------ | ----------------------------- |
| `/api/security` | POST   | Prompt safety filter          |
| `/api/image`    | POST   | Find/generate dinosaur image  |
| `/api/caption`  | POST   | Generate meme captions        |
| `/api/meme`     | POST   | Combine image + text          |
| `/api/pipeline` | POST   | Full meme-generation pipeline |
| `/memes/:file`  | GET    | Serve generated memes         |

---

## 🌐 Frontend Integration

Images are public at:

```
/memes/<filename>.jpg
```

Example in React:

```jsx
<img src={`${API_BASE}/memes/TRex_42_meme.jpg`} alt="meme" />
```

---

## 🧾 License

MIT License © 2025 Dinosaur Meme Team 🦕

---

Would you like me to add a short **“for teammates”** setup section (clone → run backend → connect frontend)? It can fit just below Setup.
