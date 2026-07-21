import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "./api";
import "./Category.css";

type LinkedProduct = {
  id: number;
  name: string;
  store: string;
  category: string;
  price: string | null;
  priceBeforeDiscount: string | null;
  image: string;
  isAvailable: boolean;
  lastSeenAt: string;
  consecutiveMissingDays: number;
  flaggedForReview: boolean;
};

type ConflictGroup = {
  standardizedProduct: {
    id: number;
    name: string;
    brand: string | null;
    volume: string | null;
    image: string | null;
    mainCategory: string | null;
    midCategory: string | null;
    subCategory: string | null;
  };
  store: string;
  products: LinkedProduct[];
};

function getImageUrl(image: string | null | undefined) {
  if (!image) return "";
  if (image.startsWith("http")) return image;
  return `https://online.idea.rs/${image}`;
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString("sr-RS");
  } catch {
    return iso;
  }
}

function DuplicateStoreLinksPage() {
  const [groups, setGroups] = useState<ConflictGroup[]>([]);
  const [storeFilter, setStoreFilter] = useState("");
  const [stores, setStores] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [busyProductId, setBusyProductId] = useState<number | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [meta, setMeta] = useState<{
    totalGroups: number;
    totalDuplicateProducts: number;
  } | null>(null);

  const addLog = (message: string) => {
    setLogs((prev) => [
      ...prev,
      `${new Date().toLocaleTimeString()} — ${message}`,
    ]);
  };

  const fetchConflicts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (storeFilter.trim()) params.set("store", storeFilter.trim());
    const qs = params.toString();
    const url = qs
      ? `/api/admin/duplicate-store-links?${qs}` : `/api/admin/duplicate-store-links`;

    addLog(
      `Loading conflicts${storeFilter.trim() ? ` (store: ${storeFilter.trim()})` : ""}…`,
    );

    try {
      const res = await apiFetch(url);
      const data = await res.json();
      if (!res.ok) {
        addLog(`Error: ${data.error || res.statusText}`);
        setGroups([]);
        setMeta(null);
        return;
      }

      const nextGroups: ConflictGroup[] = Array.isArray(data.groups)
        ? data.groups
        : [];
      setGroups(nextGroups);
      setMeta({
        totalGroups: data.totalGroups ?? nextGroups.length,
        totalDuplicateProducts:
          data.totalDuplicateProducts ??
          nextGroups.reduce((sum, g) => sum + g.products.length, 0),
      });

      const storeSet = new Set<string>();
      for (const g of nextGroups) storeSet.add(g.store);
      if (!storeFilter.trim()) {
        setStores(Array.from(storeSet).sort((a, b) => a.localeCompare(b)));
      }

      addLog(
        `Found ${data.totalGroups ?? nextGroups.length} conflict groups (${data.totalDuplicateProducts ?? 0} linked products).`,
      );
    } catch (err) {
      console.error(err);
      addLog("Failed to load conflicts.");
    } finally {
      setLoading(false);
    }
  }, [storeFilter]);

  useEffect(() => {
    fetchConflicts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const removeProductFromUi = (productId: number) => {
    setGroups((prev) =>
      prev
        .map((g) => ({
          ...g,
          products: g.products.filter((p) => p.id !== productId),
        }))
        .filter((g) => g.products.length >= 2),
    );
  };

  const unlinkProduct = async (productId: number) => {
    setBusyProductId(productId);
    addLog(`Unlinking Product #${productId}…`);
    try {
      const res = await apiFetch("/api/admin/duplicate-store-links/unlink", {
        method: "POST",
        body: JSON.stringify({ productId }),
      });
      const data = await res.json();
      if (!res.ok) {
        addLog(`Error: ${data.error || res.statusText}`);
        return;
      }
      addLog(data.message || "Unlinked.");
      removeProductFromUi(productId);
    } catch (err) {
      console.error(err);
      addLog("Unlink failed.");
    } finally {
      setBusyProductId(null);
    }
  };

  const deleteProduct = async (product: LinkedProduct) => {
    const ok = window.confirm(
      `Delete Product #${product.id} permanently?\n\n${product.name}\n${product.store} · ${product.price ?? "no price"}`,
    );
    if (!ok) return;

    setBusyProductId(product.id);
    addLog(`Deleting Product #${product.id}…`);
    try {
      const res = await apiFetch(
        `/api/admin/duplicate-store-links/product/${product.id}`,
        { method: "DELETE" },
      );
      const data = await res.json();
      if (!res.ok) {
        addLog(`Error: ${data.error || res.statusText}`);
        return;
      }
      addLog(data.message || "Deleted.");
      removeProductFromUi(product.id);
    } catch (err) {
      console.error(err);
      addLog("Delete failed.");
    } finally {
      setBusyProductId(null);
    }
  };

  return (
    <div className="adminSubPage">
      <div className="adminSubPageBar">
        <Link to="/admin" className="adminBackLink">
          ← Admin
        </Link>
        <h1>Duplicate store links</h1>
      </div>

      <p className="adminSubPageHint">
        Each StandardizedProduct should link to at most one Product per store.
        Groups below have 2+ Products from the same store. Unlink the wrong
        match, or delete an obsolete Product row.
      </p>

      <div className="matchesFilters">
        <label className="matchesFilterField">
          <span className="matchesFilterLabel">Store</span>
          <select
            className="matchesFilterSelect"
            value={storeFilter}
            onChange={(e) => setStoreFilter(e.target.value)}
          >
            <option value="">All stores</option>
            {stores.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
            {!stores.includes("Maxi") && <option value="Maxi">Maxi</option>}
            {!stores.includes("Idea") && <option value="Idea">Idea</option>}
            {!stores.includes("DIS") && <option value="DIS">DIS</option>}
            {!stores.includes("Univerexport") && (
              <option value="Univerexport">Univerexport</option>
            )}
          </select>
        </label>
        <button type="button" onClick={fetchConflicts} disabled={loading}>
          {loading ? "Loading…" : "Refresh"}
        </button>
      </div>

      <div className="scrapingLogsDiv">
        {logs.map((log, index) => (
          <div key={index}>{log}</div>
        ))}
      </div>

      {meta && (
        <p className="matchesLimitNotice" role="status">
          {meta.totalGroups} conflict groups · {meta.totalDuplicateProducts}{" "}
          linked Product rows
          {groups.length !== meta.totalGroups
            ? ` · ${groups.length} remaining after fixes`
            : ""}
        </p>
      )}

      <div className="dupLinkList">
        {groups.map((group) => {
          const sp = group.standardizedProduct;
          return (
            <section
              key={`${sp.id}-${group.store}`}
              className="dupLinkGroup"
            >
              <div className="dupLinkSp">
                {sp.image ? (
                  <img
                    src={getImageUrl(sp.image)}
                    alt=""
                    className="dupLinkSpImage"
                  />
                ) : (
                  <div className="dupLinkSpImage dupLinkSpImageEmpty" />
                )}
                <div className="dupLinkSpBody">
                  <p className="dupLinkSpTitle">
                    {sp.brand ? `${sp.brand} ` : ""}
                    {sp.name}
                    {sp.volume ? ` · ${sp.volume}` : ""}
                  </p>
                  <p className="dupLinkSpMeta">
                    SP #{sp.id}
                    {sp.mainCategory ? ` · ${sp.mainCategory}` : ""}
                    {sp.midCategory ? ` / ${sp.midCategory}` : ""}
                    {sp.subCategory ? ` / ${sp.subCategory}` : ""}
                  </p>
                  <p className="dupLinkStoreBadge">
                    Conflict store: <strong>{group.store}</strong> (
                    {group.products.length} products)
                  </p>
                </div>
              </div>

              <div className="dupLinkProducts">
                {group.products.map((p) => (
                  <article key={p.id} className="dupLinkProductCard">
                    {p.image ? (
                      <img
                        src={getImageUrl(p.image)}
                        alt=""
                        className="dupLinkProductImage"
                      />
                    ) : (
                      <div className="dupLinkProductImage dupLinkSpImageEmpty" />
                    )}
                    <div className="dupLinkProductBody">
                      <p className="dupLinkProductName">{p.name}</p>
                      <p className="dupLinkProductMeta">
                        Product #{p.id} · {p.store}
                        {p.category ? ` · ${p.category}` : ""}
                      </p>
                      <p className="dupLinkProductPrice">
                        {p.price ?? "—"}
                        {p.priceBeforeDiscount
                          ? ` (was ${p.priceBeforeDiscount})`
                          : ""}
                      </p>
                      <p className="dupLinkProductMeta">
                        {p.isAvailable ? "available" : "unavailable"}
                        {p.flaggedForReview ? " · flagged" : ""}
                        {p.consecutiveMissingDays > 0
                          ? ` · missing ${p.consecutiveMissingDays}d`
                          : ""}
                        {" · last seen "}
                        {formatDate(p.lastSeenAt)}
                      </p>
                      <div className="dupLinkActions">
                        <button
                          type="button"
                          className="dupLinkBtn dupLinkBtnUnlink"
                          disabled={busyProductId === p.id}
                          onClick={() => unlinkProduct(p.id)}
                        >
                          Unlink
                        </button>
                        <button
                          type="button"
                          className="dupLinkBtn dupLinkBtnDelete"
                          disabled={busyProductId === p.id}
                          onClick={() => deleteProduct(p)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {!loading && groups.length === 0 && (
        <p className="matchesLimitNotice">No duplicate store links found.</p>
      )}
    </div>
  );
}

export default DuplicateStoreLinksPage;
