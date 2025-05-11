import React from "react";

type ScrapeButtonProps = {
  label: string;
  endpoint: string;
  addLog: (message: string) => void;
};

function ScrapeButton({ label, endpoint, addLog }: ScrapeButtonProps) {
  const handleClick = async () => {
    addLog(`${label} started...`);

    try {
      const res = await fetch(`http://localhost:5000/api/${endpoint}`);
      const data = await res.json();

      if (res.ok) {
        addLog(`${label} completed successfully.`);
      } else {
        addLog(`${label} failed: ${data.message || data.error}`);
      }
    } catch (err) {
      addLog(`${label} failed due to a network error.`);
      console.error(err);
    }
  };

  return (
    <button className="scrapingButton" onClick={handleClick}>
      {label}
    </button>
  );
}

export default ScrapeButton;