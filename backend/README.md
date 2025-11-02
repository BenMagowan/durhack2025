# Meme Generator Backend

This backend powers the **Dinosaur Meme Generator**, an AI-assisted meme creator that turns user prompts into funny dinosaur memes.
Built with **Node.js + Express** and **Python scripts** for AI captioning and image generation.

---

## Setup

### Prerequisites

-   Node.js ≥ 18
-   Python ≥ 3.8
-   Python deps: `Pillow`, `requests`, `openai` (if using AI)

### Install & Run

```bash
npm install
node server.js
```

Server runs on [http://localhost:8080](http://localhost:8080)

---

## Meme Generation Pipeline

**Endpoint:**
`POST /legacy-meme`
`POST /nanobanana-meme`

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

## Endpoints

| Route                   | Method | Description                           |
| ----------------------- | ------ | ------------------------------------- |
| `/api/security-check`   | POST   | Prompt safety filter                  |
| `/api/find-image`       | POST   | Find most relevent image              |
| `/api/generate-caption` | POST   | Generate meme captions                |
| `/api/generate-meme`    | POST   | Combine image + text                  |
| `/legacy-meme`          | POST   | Full meme caption generation pipeline |
| `/nanobanana-meme`      | POST   | Caption and Image generation pipeline |
| `/memes/:file`          | GET    | Serve generated memes                 |
