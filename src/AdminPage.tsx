import React, { useState } from "react";
import ScrapeButton from "./ScrapeButton";
import "./Category.css";

function AdminPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [matches, setMatches] = useState<any[]>([]);

  const addLog = (message: string) => {
    setLogs((prev) => [
      ...prev,
      `${new Date().toLocaleTimeString()} — ${message}`,
    ]);
  };

  const fetchMatches = async () => {
    addLog("Fetching matches...");
    try {
      const res = await fetch("http://localhost:5000/matches");
      const data = await res.json();
      setMatches(data);
      addLog("Matches fetched.");
    } catch (err) {
      addLog("Error fetching matches.");
      console.error(err);
    }
  };

  const confirmMatch = async (
    productId: number,
    standardizedProductId: number
  ) => {
    addLog(`Confirming match for product ID ${productId}...`);
    try {
      const res = await fetch("http://localhost:5000/confirm-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, standardizedProductId }),
      });

      const data = await res.json();

      if (res.ok) {
        addLog(data.message);
        setMatches(matches.filter((m) => m.product.id !== productId)); // remove from list
      } else {
        addLog(`Error: ${data.message || data.error}`);
      }
    } catch (err) {
      addLog("Something went wrong while confirming match.");
      console.error(err);
    }
  };
function getImageUrl(image: string | null | undefined) {
  if (!image) return ""; // or a placeholder image URL
  if (image.startsWith("http")) return image;
  return `https://online.idea.rs/${image}`;
}

  return (
    <>
      <div className="scrapingLogsDiv">
        {logs.map((log, index) => (
          <div key={index}>{log}</div>
        ))}
      </div>

      <button onClick={fetchMatches}>Fetch Matches</button>

      <div className="matchResults">
        {matches.map((match, index) => (
          <div key={index} className="matchCard">
            <div className="standardizedProductDiv">
              <p className="standardizedProductParagraph">
                {match.standardizedProduct.brand}{" "}
                {match.standardizedProduct.name}
              </p>
              <img src={match.standardizedProduct.image} className="standardizedProductImage"></img>
              <p className="standardizedProductText">standardized</p>
            </div>
            <div className="scrapedProductDiv">
              <p className="scrapedProductParagraph">
            {match.product.name}
              </p>
              <img
  src={getImageUrl(match.product.image)}
  alt="Product"
  className="scrapedProductImage"
/>
              <p className="scrapedProductText">scraped</p>
            </div>
            <div className="similarityDiv">
              <p className="similarityValue">{(match.similarity * 100).toFixed(1)}%</p>
              <p>Similarity</p>
            </div>
            <button className="confirmSimilarityBtn"
              onClick={() =>
                confirmMatch(match.product.id, match.standardizedProduct.id)
              }
            >
              Confirm
            </button>
          </div>
        ))}
      </div>

      <div className="scrapingButtonsDiv">
        <ScrapeButton
          label="Scrape Idea"
          endpoint="scrape-idea"
          addLog={addLog}
        />
        <ScrapeButton
          label="Scrape Maxi"
          endpoint="scrape-maxi"
          addLog={addLog}
        />
        <ScrapeButton
          label="Scrape DIS"
          endpoint="scrape-dis"
          addLog={addLog}
        />
      </div>
    </>
  );
}

export default AdminPage;
