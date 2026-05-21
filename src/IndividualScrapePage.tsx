import React, { useState } from "react";
import { Link } from "react-router-dom";
import ScrapeButton from "./ScrapeButton";

function IndividualScrapePage() {
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs((prev) => [
      ...prev,
      `${new Date().toLocaleTimeString()} — ${message}`,
    ]);
  };

  return (
    <div className="adminSubPage">
      <div className="adminSubPageBar">
        <Link to="/admin" className="adminBackLink">
          ← Admin
        </Link>
        <h1>Quick scrapes (Idea / Maxi / DIS)</h1>
      </div>

      <p className="adminSubPageHint">
        Runs the older single-store scrape endpoints. Full catalog runs live under
        Complete scrapers.
      </p>

      <div className="scrapingLogsDiv">
        {logs.map((log, index) => (
          <div key={index}>{log}</div>
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
    </div>
  );
}

export default IndividualScrapePage;
