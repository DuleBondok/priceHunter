import React, { useState } from "react";
import ScrapeButton from "./ScrapeButton";

function AdminPage() {
  const [logs, setLogs] = useState(() => [] as string[]);

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, `${new Date().toLocaleTimeString()} — ${message}`]);
  };

  return (
    <>
      <div className="scrapingLogsDiv">
        {logs.map((log, index) => (
          <div key={index}>{log}</div>
        ))}
      </div>
      <div className="scrapingButtonsDiv">
        <ScrapeButton label="Scrape Idea" endpoint="scrape-idea" addLog={addLog} />
        <ScrapeButton label="Scrape Maxi" endpoint="scrape-maxi" addLog={addLog} />
        <ScrapeButton label="Scrape DIS" endpoint="scrape-dis" addLog={addLog} />
      </div>
      <button
        className="clearDataBaseBtn"
        onClick={async () => {
          addLog("Clearing database...");
          try {
            const res = await fetch("http://localhost:5000/api/clear-db", {
              method: "DELETE",
            });

            const data = await res.json();

            if (res.ok) {
              addLog(data.message);
              alert(data.message);
            } else {
              addLog(`Error: ${data.message || data.error}`);
              alert(`Error: ${data.message || data.error}`);
            }
          } catch (err) {
            addLog("Something went wrong clearing DB.");
            console.error(err);
          }
        }}
      >
        Clear DB
      </button>
    </>
  );
}

export default AdminPage;
