# Meme Generator

## Backend Setup

```bash
cd backend
npm install
node server.js
```

Server runs on [http://localhost:8080](http://localhost:8080)

---

## Frontend Setup

```bash
cd frontend
npm install
node server.js
```

Server runs on [http://localhost:3000](http://localhost:3000)

---

## Tech Stack

-   **Backend:** Node.js + Express, Python scripts for AI captioning and image generation
-   **Frontend:** React.js
-   **AI Services:** OpenAI API for caption generation and image creation through OpenRouter API
-   **Hosting:** Localhost for development; can be deployed to cloud services for production using AWS EC2
-   **Version Control:** Git and GitHub
-   **Security:** Basic prompt filtering to avoid unsafe content
-   **APIs:** RESTful endpoints for meme generation pipeline [README.md](backend/README.md)
-   **Data Storage:** Local file system for storing generated memes, could be upgraded to AWS S3

---
