import React, { useState } from "react";

export default function MemeInput() {
  const [prompt, setPrompt] = useState(""); //prompt stores what user types in text box, setPrompt updates as user types
  const [resultUrl, setResultUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const API_URL = "http://localhost:8080/generate-dinosaur"; //TEMPORARY: react will wait for a response from backend server, currently set to the temporary server that runs in the TEST-combine-images.js
  //THIS WILL BE REPLACED WITH THE BACKEND SERVER 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }), //sends input prompt in json, will be received by security check
      });

      console.log(prompt)

      const data = await response.json(); //this comes from the image and text combiner (currently TEST-combine-images)
      setResultUrl(data.imageUrl); //display meme from backend
    } catch (err) {
      console.error("Error:", err);
      alert("Failed to generate meme. Check console.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)} //updated here
          placeholder="Enter meme caption"
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Generating..." : "Generate Meme"}
        </button>
      </form>

      {resultUrl && (
        <div>
          <h3>Generated Meme:</h3>
          <img
            src={resultUrl}
            alt="AI generated meme"
            style={{ maxWidth: "400px" }}
          />
        </div>
      )}
    </div>
  );
}
