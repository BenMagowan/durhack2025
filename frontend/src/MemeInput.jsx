import React, { useState } from "react";
import "./index.css";

export default function MemeInput() {
  // Workflow 1: Prompt → Caption + Template
  const [legacyPrompt, setLegacyPrompt] = useState("");
  const [legacyResult, setLegacyResult] = useState(null);
  const [legacyLoading, setLegacyLoading] = useState(false);


  // Workflow 2: Prompt → Caption + Nano banana
  const [nanoPrompt, setNanoPrompt] = useState("");
  const [nanoResult, setNanoResult] = useState(null);
  const [nanoLoading, setNanoLoading] = useState(false);

  // Workflow 1: Generate caption and match with template
  const handleLegacySubmit = async (e) => {
  e.preventDefault();
  if (!legacyPrompt.trim()) return;
  setLegacyLoading(true);
  setLegacyResult(null);
  try {
      const response = await fetch("http://localhost:8080/legacy-meme", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: legacyPrompt }),
      });
      const data = await response.json();
      setLegacyResult(`${data.imageUrl}?t=${Date.now()}`); // cache-busting
  } catch (err) {
      console.error("Error generating legacy meme:", err);
      alert("Failed to generate legacy meme. Check console.");
  } finally {
      setLegacyLoading(false);
  }
  };

  // Workflow 2: Generate meme from caption
  const handleNanoSubmit = async (e) => {
  e.preventDefault();
  if (!nanoPrompt.trim()) return;
  setNanoLoading(true);
  setNanoResult(null);

  try {
    const response = await fetch("http://localhost:8080/nanobanana-meme", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: nanoPrompt }),
    });

    const data = await response.json();
    setNanoResult(`${data.imageUrl}?t=${Date.now()}`); // cache-busting
  } catch (err) {
    console.error("Error generating Nano Banana meme:", err);
    alert("Failed to generate Nano Banana meme. Check console.");
  } finally {
    setNanoLoading(false);
  }
};


  return (
    <div className="meme-generator">
  
    {/* Workflow 1: Legacy Meme */}
    <div className="workflow-card">
      <h2>Legacy Meme Generator</h2>
      <form onSubmit={handleLegacySubmit} className="meme-form">
        <input
          type="text"
          value={legacyPrompt}
          onChange={(e) => setLegacyPrompt(e.target.value)}
          placeholder="Enter a prompt"
          required
        />
        <button type="submit" disabled={legacyLoading}>
          {legacyLoading ? "Generating..." : "Generate Meme"}
        </button>
      </form>
      {legacyResult && (
        <div className="meme-result">
          <h3>Generated Legacy Meme:</h3>
          <img src={legacyResult} alt="Legacy Meme" />
        </div>
      )}
    </div>
  
    {/* Workflow 2: Nano Banana Meme */}
    <div className="workflow-card">
      <h2>Nano Banana Meme Generator</h2>
      <form onSubmit={handleNanoSubmit} className="meme-form">
        <input
          type="text"
          value={nanoPrompt}
          onChange={(e) => setNanoPrompt(e.target.value)}
          placeholder="Enter a prompt"
          required
        />
        <button type="submit" disabled={nanoLoading}>
          {nanoLoading ? "Generating..." : "Generate Meme"}
        </button>
      </form>
      {nanoResult && (
        <div className="meme-result">
          <h3>Generated Nano Banana Meme:</h3>
          <img src={nanoResult} alt="Nano Banana Meme" />
        </div>
      )}
    </div>
  
  </div>
  );
}
