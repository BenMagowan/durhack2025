import React, { useState } from "react";

export default function MemeInput() {
  const [prompt, setPrompt] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [resultUrl, setResultUrl] = useState(null);

  const API_URL = "http://localhost:5000/generate";

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("prompt", prompt);
    if (imageFile) formData.append("image", imageFile);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setResultUrl(data.imageUrl); //display meme from backend
    } catch (err) {
      console.error("Error:", err);
      alert("Failed to generate meme. Check console.");
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter meme caption"
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files[0])}
        />
        <button type="submit">Generate Meme</button>
      </form>

      {resultUrl && (
        <div>
          <h3>Generated Meme:</h3>
          <img src={resultUrl} alt="AI generated meme" style={{ maxWidth: "400px" }} />
        </div>
      )}
    </div>
  );
}