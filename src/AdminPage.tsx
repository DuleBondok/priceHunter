import React from "react";
import { Link } from "react-router-dom";

function AdminPage() {
  return (
    <div className="adminHub">
      <h1 className="adminHubTitle">Admin</h1>
      <p className="adminHubSubtitle">Choose a tool</p>

      <nav className="adminHubGrid" aria-label="Admin sections">
        <Link to="/admin/matches" className="adminHubCard">
          <span className="adminHubCardTitle">Similarity matches</span>
          <span className="adminHubCardDesc">
            Fetch suggested product ↔ standardized pairs and confirm links.
          </span>
        </Link>

        <Link to="/admin/receipt-verification" className="adminHubCard">
          <span className="adminHubCardTitle">Receipt verification</span>
          <span className="adminHubCardDesc">
            Review scanned receipts, confirm each item, and finalize receipt validation.
          </span>
        </Link>

        <Link to="/admin/scrape-stores" className="adminHubCard">
          <span className="adminHubCardTitle">Quick scrapes</span>
          <span className="adminHubCardDesc">
            Run Idea, Maxi, or DIS scrape endpoints from the backend.
          </span>
        </Link>

        <Link to="/admin/complete-scrape" className="adminHubCard">
          <span className="adminHubCardTitle">Complete scrapers</span>
          <span className="adminHubCardDesc">
            Full catalog runs, schedule, run history, and logs.
          </span>
        </Link>
      </nav>
    </div>
  );
}

export default AdminPage;
