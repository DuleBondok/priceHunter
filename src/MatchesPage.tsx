import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Category.css";

const API_BASE = "http://localhost:5000";

function MatchesPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [standardizedMainCategories, setStandardizedMainCategories] = useState<
    string[]
  >([]);
  const [productCategories, setProductCategories] = useState<string[]>([]);
  /** Empty string = all categories */
  const [standardizedMainCategory, setStandardizedMainCategory] =
    useState("");
  const [productCategory, setProductCategory] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/matches/meta`);
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        setStandardizedMainCategories(
          Array.isArray(data.standardizedMainCategories)
            ? data.standardizedMainCategories
            : [],
        );
        setProductCategories(
          Array.isArray(data.productCategories) ? data.productCategories : [],
        );
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const addLog = (message: string) => {
    setLogs((prev) => [
      ...prev,
      `${new Date().toLocaleTimeString()} — ${message}`,
    ]);
  };

  const fetchMatches = async () => {
    const params = new URLSearchParams();
    if (standardizedMainCategory.trim()) {
      params.set("standardizedMainCategory", standardizedMainCategory.trim());
    }
    if (productCategory.trim()) {
      params.set("productCategory", productCategory.trim());
    }
    const qs = params.toString();
    const url = qs ? `${API_BASE}/matches?${qs}` : `${API_BASE}/matches`;

    const spLabel = standardizedMainCategory.trim() || "all";
    const prLabel = productCategory.trim() || "all";
    addLog(`Fetching matches (SP main: ${spLabel}, Product: ${prLabel})…`);

    try {
      const res = await fetch(url);
      const data = await res.json();
      setMatches(data);
      addLog(`Matches fetched (${Array.isArray(data) ? data.length : 0} rows).`);
    } catch (err) {
      addLog("Error fetching matches.");
      console.error(err);
    }
  };

  const confirmMatch = async (
    productId: number,
    standardizedProductId: number,
  ) => {
    addLog(`Confirming match for product ID ${productId}...`);
    try {
      const res = await fetch(`${API_BASE}/confirm-match`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, standardizedProductId }),
      });

      const data = await res.json();

      if (res.ok) {
        addLog(data.message);
        setMatches(matches.filter((m) => m.product.id !== productId));
      } else {
        addLog(`Error: ${data.message || data.error}`);
      }
    } catch (err) {
      addLog("Something went wrong while confirming match.");
      console.error(err);
    }
  };

  function getImageUrl(image: string | null | undefined) {
    if (!image) return "";
    if (image.startsWith("http")) return image;
    return `https://online.idea.rs/${image}`;
  }

  return (
    <div className="adminSubPage">
      <div className="adminSubPageBar">
        <Link to="/admin" className="adminBackLink">
          ← Admin
        </Link>
        <h1>Similarity matches</h1>
      </div>

      <div className="matchesFilters">
        <label className="matchesFilterField">
          <span className="matchesFilterLabel">
            StandardizedProduct mainCategory
          </span>
          <select
            className="matchesFilterSelect"
            value={standardizedMainCategory}
            onChange={(e) => setStandardizedMainCategory(e.target.value)}
          >
            <option value="">All main categories</option>
            {standardizedMainCategories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="matchesFilterField">
          <span className="matchesFilterLabel">Product category</span>
          <select
            className="matchesFilterSelect"
            value={productCategory}
            onChange={(e) => setProductCategory(e.target.value)}
          >
            <option value="">All store categories</option>
            {productCategories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="scrapingLogsDiv">
        {logs.map((log, index) => (
          <div key={index}>{log}</div>
        ))}
      </div>

      <button type="button" onClick={fetchMatches}>
        Fetch matches
      </button>

      <div className="matchResults">
        {matches.map((match, index) => (
          <div key={index} className="matchCard">
            <div className="standardizedProductDiv">
              <p className="standardizedProductParagraph">
                {match.standardizedProduct.brand}{" "}
                {match.standardizedProduct.name}
              </p>
              <img
                src={match.standardizedProduct.image}
                className="standardizedProductImage"
                alt=""
              />
              <p className="standardizedProductText">standardized</p>
            </div>
            <div className="scrapedProductDiv">
              <p className="scrapedProductParagraph">{match.product.name}</p>
              <img
                src={getImageUrl(match.product.image)}
                alt="Product"
                className="scrapedProductImage"
              />
              <p className="scrapedProductText">scraped</p>
            </div>
            <div className="similarityDiv">
              <p className="similarityValue">
                {(match.similarity * 100).toFixed(1)}%
              </p>
              <p>Similarity</p>
            </div>
            <button
              type="button"
              className="confirmSimilarityBtn"
              onClick={() =>
                confirmMatch(match.product.id, match.standardizedProduct.id)
              }
            >
              Confirm
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MatchesPage;
