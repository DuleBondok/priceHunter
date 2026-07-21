import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Category.css";

import { apiFetch } from "./api";

function NewProductsMatchesPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [standardizedMainCategories, setStandardizedMainCategories] = useState<
    string[]
  >([]);
  const [productCategories, setProductCategories] = useState<string[]>([]);
  const [stores, setStores] = useState<string[]>([]);
  const [standardizedMainCategory, setStandardizedMainCategory] = useState("");
  const [productCategory, setProductCategory] = useState("");
  const [store, setStore] = useState("");
  const [matchMeta, setMatchMeta] = useState<{
    eligible: number;
    withSuggestion: number;
    weakSuggestion: number;
    withoutSuggestion: number;
    total: number;
    limit: number;
    truncated: boolean;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiFetch(`/new-product-matches/meta`);
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
        setStores(Array.isArray(data.stores) ? data.stores : []);
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
    if (store.trim()) {
      params.set("store", store.trim());
    }
    const qs = params.toString();
    const url = qs
      ? `/new-product-matches?${qs}` : `/new-product-matches`;

    const spLabel = standardizedMainCategory.trim() || "all";
    const prLabel = productCategory.trim() || "all";
    const storeLabel = store.trim() || "all";
    addLog(
      `Fetching NewProducts matches (SP main: ${spLabel}, category: ${prLabel}, store: ${storeLabel})…`,
    );

    try {
      const res = await apiFetch(url);
      const data = await res.json();
      const rows = Array.isArray(data) ? data : (data.matches ?? []);
      setMatches(rows);
      if (Array.isArray(data)) {
        setMatchMeta(null);
        addLog(`Matches fetched (${rows.length} rows).`);
      } else {
        setMatchMeta({
          eligible: data.eligible ?? rows.length,
          withSuggestion: data.withSuggestion ?? rows.length,
          weakSuggestion: data.weakSuggestion ?? 0,
          withoutSuggestion: data.withoutSuggestion ?? 0,
          total: data.total ?? rows.length,
          limit: data.limit ?? rows.length,
          truncated: Boolean(data.truncated),
        });
        const extra =
          data.truncated && data.total > rows.length
            ? ` (showing ${rows.length} of ${data.total}; narrow filters for more)`
            : "";
        addLog(
          `Matches fetched: ${rows.length} rows — ${data.withSuggestion ?? "?"} confident, ${data.weakSuggestion ?? 0} weak, ${data.withoutSuggestion ?? 0} none${extra}.`,
        );
      }
    } catch (err) {
      addLog("Error fetching matches.");
      console.error(err);
    }
  };

  const confirmMatch = async (
    newProductId: number,
    standardizedProductId: number,
  ) => {
    addLog(`Confirming match for NewProducts ID ${newProductId}...`);
    try {
      const res = await apiFetch(`/confirm-new-product-match`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newProductId, standardizedProductId }),
      });

      const data = await res.json();

      if (res.ok) {
        addLog(data.message);
        setMatches(matches.filter((m) => m.product.id !== newProductId));
      } else {
        addLog(`Error: ${data.error || data.message}`);
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
        <h1>NewProducts similarity matches</h1>
      </div>

      <p className="matchesLimitNotice">
        Pending rows from <code>NewProducts</code> (unprocessed). Confirming a
        match promotes the row into <code>Product</code>, links it to the
        standardized product, and removes it from <code>NewProducts</code>.
      </p>

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
          <span className="matchesFilterLabel">NewProducts category</span>
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
        <label className="matchesFilterField">
          <span className="matchesFilterLabel">Store</span>
          <select
            className="matchesFilterSelect"
            value={store}
            onChange={(e) => setStore(e.target.value)}
          >
            <option value="">All stores</option>
            {stores.map((s) => (
              <option key={s} value={s}>
                {s}
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

      {matchMeta && (
        <p className="matchesLimitNotice" role="status">
          {matchMeta.eligible} pending NewProducts — {matchMeta.withSuggestion}{" "}
          confident, {matchMeta.weakSuggestion} weak,{" "}
          {matchMeta.withoutSuggestion} no suggestion.
          {matchMeta.truncated &&
            ` Showing ${matchMeta.limit} of ${matchMeta.total}; narrow filters.`}
        </p>
      )}

      <div className="matchResults">
        {matches.map((match) => (
          <div
            key={
              match.noSuggestion
                ? `none-${match.product.id}`
                : `${match.product.id}-${match.standardizedProduct!.id}`
            }
            className={`matchCard${match.noSuggestion ? " matchCardNoSuggestion" : ""}`}
          >
            <div className="standardizedProductDiv">
              {match.noSuggestion ? (
                <>
                  <p className="standardizedProductParagraph matchNoSuggestionText">
                    No suggestion found
                  </p>
                  <p className="matchScoreDetail">
                    No candidate met the similarity threshold
                  </p>
                </>
              ) : (
                <>
                  <p className="standardizedProductParagraph">
                    {match.standardizedProduct!.brand}{" "}
                    {match.standardizedProduct!.name}
                  </p>
                  <img
                    src={match.standardizedProduct!.image}
                    className="standardizedProductImage"
                    alt=""
                  />
                </>
              )}
              <p className="standardizedProductText">standardized</p>
            </div>
            <div className="scrapedProductDiv">
              <p className="scrapedProductParagraph">{match.product.name}</p>
              <p className="scrapedProductMeta">
                {match.product.store}
                {match.product.category ? ` · ${match.product.category}` : ""}
              </p>
              <img
                src={getImageUrl(match.product.image)}
                alt="Product"
                className="scrapedProductImage"
              />
              <p className="scrapedProductText">NewProducts</p>
            </div>
            <div className="similarityDiv">
              {!match.noSuggestion && (
                <>
                  <p className="similarityValue">
                    {(match.finalScore * 100).toFixed(1)}%
                  </p>
                  <p>Match score</p>
                  {match.weakSuggestion && (
                    <p className="matchLowConfidence">Weak suggestion</p>
                  )}
                  {match.lowConfidence && !match.weakSuggestion && (
                    <p className="matchLowConfidence">Low confidence</p>
                  )}
                  <p className="matchScoreDetail">
                    tokens {(match.similarity * 100).toFixed(0)}% · fuzzy{" "}
                    {(match.fuzzyScore * 100).toFixed(0)}%
                  </p>
                </>
              )}
            </div>
            {!match.noSuggestion && (
              <button
                type="button"
                className="confirmSimilarityBtn"
                onClick={() =>
                  confirmMatch(
                    match.product.id,
                    match.standardizedProduct!.id,
                  )
                }
              >
                Confirm
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default NewProductsMatchesPage;
