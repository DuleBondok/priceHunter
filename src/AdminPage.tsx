import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { clearAdminToken } from "./api";

function AdminPage() {
  const navigate = useNavigate();

  const logout = () => {
    clearAdminToken();
    navigate("/login", { replace: true });
  };

  return (
    <div className="adminHub">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          gap: "1rem",
        }}
      >
        <h1 className="adminHubTitle">Admin</h1>
        <button type="button" onClick={logout} className="adminBackLink">
          Logout
        </button>
      </div>
      <p className="adminHubSubtitle">Choose a tool</p>

      <nav className="adminHubGrid" aria-label="Admin sections">
        <Link to="/admin/matches" className="adminHubCard">
          <span className="adminHubCardTitle">Similarity matches</span>
          <span className="adminHubCardDesc">
            Fetch suggested product ↔ standardized pairs and confirm links.
          </span>
        </Link>

        <Link to="/admin/new-product-matches" className="adminHubCard">
          <span className="adminHubCardTitle">NewProducts matches</span>
          <span className="adminHubCardDesc">
            Match pending NewProducts rows, promote to Product, and link to
            StandardizedProduct.
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

        <Link to="/admin/image-manager" className="adminHubCard">
          <span className="adminHubCardTitle">Image Manager</span>
          <span className="adminHubCardDesc">
            Pretraži proizvode i zameni slike direktno na Cloudflare.
          </span>
        </Link>

        <Link to="/admin/duplicate-store-links" className="adminHubCard">
          <span className="adminHubCardTitle">Duplicate store links</span>
          <span className="adminHubCardDesc">
            Find StandardizedProducts linked to multiple Products from the same
            store, then unlink or delete the wrong ones.
          </span>
        </Link>
      </nav>
    </div>
  );
}

export default AdminPage;
