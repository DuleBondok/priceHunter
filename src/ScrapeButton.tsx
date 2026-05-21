import React from "react";

type ScrapeButtonProps = {
  label: string;
  endpoint: string;
  addLog: (message: string) => void;
};

function ScrapeButton({ label, endpoint, addLog }: ScrapeButtonProps) {
  const handleClick = async () => {
    addLog(`${label} started (calling http://localhost:5000/api/${endpoint})...`);

    try {
      const res = await fetch(`http://localhost:5000/api/${endpoint}`);
      const rawText = await res.text();
      let data: unknown = null;
      try {
        data = rawText ? JSON.parse(rawText) : null;
      } catch {
        addLog(
          `${label} failed (non-JSON response): ${rawText.slice(0, 200)}${rawText.length > 200 ? "…" : ""}`,
        );
        return;
      }

      if (res.ok) {
        if (Array.isArray(data)) {
          addLog(`${label} completed — ${data.length} proizvoda u odgovoru (sačuvano u bazu ako je backend povezan).`);
          return;
        }
        const obj = data as Record<string, unknown>;
        const cleared =
          typeof obj.priceCleared === "number" ? obj.priceCleared : null;
        addLog(
          cleared != null
            ? `${label} completed. Price cleared: ${cleared}`
            : `${label} completed successfully.`,
        );
      } else {
        const obj = data as Record<string, unknown>;
        addLog(
          `${label} failed (${res.status}): ${String(obj.message ?? obj.error ?? JSON.stringify(data))}`,
        );
      }
    } catch (err) {
      addLog(
        `${label} failed — mrežna greška (da li radi backend na portu 5000?).`,
      );
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