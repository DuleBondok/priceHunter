import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { apiFetch } from "./api";

const CF_VARIANTS = [
  "card",
  "cardMobile",
  "product",
  "productMobile",
  "og",
  "appCard",
  "appProduct",
] as const;

type SearchProduct = {
  id: number;
  name: string;
  brand: string | null;
  image: string | null;
  mainCategory: string | null;
};

type LogEntry = {
  productId: number;
  productName: string;
  brand: string | null;
  mainCategory: string | null;
  replacedAt: string;
  source: "manual" | "checked" | "brand";
};

type ReplacementLog = Record<string, LogEntry>;

type BrandStats = {
  total: number;
  logged: number;
  allBrandSource: boolean;
};

type CardState = {
  imageUrl: string | null;
  uploading: boolean;
  status: "idle" | "success" | "error";
  statusMessage: string;
  showVariants: boolean;
  cacheBust?: number;
};

function cfVariantUrl(baseUrl: string | null | undefined, variant: string): string {
  if (!baseUrl) return "";
  if (baseUrl.includes("/public")) {
    return baseUrl.replace("/public", `/${variant}`);
  }
  return baseUrl;
}

function cardPreviewUrl(image: string | null | undefined): string {
  if (!image) return "";
  return cfVariantUrl(image, "card") || image;
}

function withCacheBust(url: string, bust?: number): string {
  if (!url || !bust) return url;
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}t=${bust}`;
}

function ImageManagerPage() {
  const [categories, setCategories] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [products, setProducts] = useState<SearchProduct[]>([]);
  const [replacementLog, setReplacementLog] = useState<ReplacementLog>({});
  const [logReady, setLogReady] = useState(false);
  const [cardState, setCardState] = useState<Record<number, CardState>>({});
  const [brandStats, setBrandStats] = useState<Record<string, BrandStats>>({});
  const [brandMarking, setBrandMarking] = useState<string | null>(null);

  const loadLog = useCallback(async () => {
    const res = await apiFetch(`/api/admin/image-manager/log`);
    if (!res.ok) return;
    const data = await res.json();
    setReplacementLog(data.log ?? {});
  }, []);

  const loadCategories = useCallback(async () => {
    const res = await apiFetch(`/api/admin/image-manager/categories`);
    if (!res.ok) return;
    const data = await res.json();
    setCategories(Array.isArray(data.categories) ? data.categories : []);
  }, []);

  const loadBrands = useCallback(async (category: string) => {
    const res = await apiFetch(
      `/api/admin/image-manager/brands?category=${encodeURIComponent(category)}`,
    );
    if (!res.ok) {
      setBrands([]);
      return;
    }
    const data = await res.json();
    const list: string[] = Array.isArray(data.brands) ? data.brands : [];
    setBrands(list);
    setBrandStats(
      data.brandStats && typeof data.brandStats === "object"
        ? data.brandStats
        : {},
    );
  }, []);

  const runSearch = useCallback(async () => {
    const q = query.trim();
    if (!q && !selectedCategory && !selectedBrand) {
      setProducts([]);
      return;
    }

    setSearching(true);
    setSearchError(null);
    try {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (selectedCategory) params.set("category", selectedCategory);
      if (selectedBrand) params.set("brand", selectedBrand);

      const res = await apiFetch(
        `/api/admin/image-manager/search?${params.toString()}`,
      );
      if (!res.ok) throw new Error(`Search failed (${res.status})`);
      const data = await res.json();
      const rows: SearchProduct[] = Array.isArray(data.products)
        ? data.products
        : [];
      setProducts(rows);
      setCardState((prev) => {
        const next: Record<number, CardState> = { ...prev };
        for (const p of rows) {
          if (!next[p.id]) {
            next[p.id] = {
              imageUrl: p.image,
              uploading: false,
              status: "idle",
              statusMessage: "",
              showVariants: Boolean(replacementLog[String(p.id)]?.source === "manual"),
            };
          }
        }
        return next;
      });
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : "Search failed");
      setProducts([]);
    } finally {
      setSearching(false);
    }
  }, [query, selectedCategory, selectedBrand, replacementLog]);

  useEffect(() => {
    void (async () => {
      await loadLog();
      setLogReady(true);
      await loadCategories();
    })();
  }, [loadLog, loadCategories]);

  useEffect(() => {
    if (selectedCategory) {
      void loadBrands(selectedCategory);
    } else {
      setBrands([]);
      setBrandStats({});
    }
  }, [selectedCategory, loadBrands]);

  useEffect(() => {
    if (!logReady) return;
    void runSearch();
  }, [logReady, selectedCategory, selectedBrand, runSearch]);

  useEffect(() => {
    if (!logReady || products.length === 0) return;
    setCardState((prev) => {
      const next = { ...prev };
      for (const p of products) {
        const entry = replacementLog[String(p.id)];
        if (!entry) continue;
        const existing = next[p.id];
        next[p.id] = {
          imageUrl: p.image,
          uploading: existing?.uploading ?? false,
          status:
            entry.source === "manual"
              ? "success"
              : existing?.status ?? "idle",
          statusMessage:
            entry.source === "manual"
              ? "✓ Zamenjeno"
              : existing?.statusMessage ?? "",
          showVariants:
            entry.source === "manual" ? true : existing?.showVariants ?? false,
          cacheBust: existing?.cacheBust,
        };
      }
      return next;
    });
  }, [replacementLog, products, logReady]);

  const categoryLogCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const entry of Object.values(replacementLog)) {
      if (!entry.mainCategory) continue;
      counts[entry.mainCategory] = (counts[entry.mainCategory] ?? 0) + 1;
    }
    return counts;
  }, [replacementLog]);

  const isBrandFullyMarked = (brand: string): boolean => {
    const stats = brandStats[brand];
    return Boolean(stats && stats.total > 0 && stats.logged === stats.total);
  };

  const isBrandCheckboxChecked = (brand: string): boolean =>
    Boolean(brandStats[brand]?.allBrandSource);

  const getLogEntry = (productId: number): LogEntry | undefined =>
    replacementLog[String(productId)];

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setSelectedBrand(null);
    setQuery("");
  };

  const handleBrandSelect = (brand: string) => {
    setSelectedBrand(brand);
    setQuery("");
  };

  const handleBrandMark = async (brand: string, checked: boolean) => {
    if (!selectedCategory) return;
    setBrandMarking(brand);
    try {
      const res = await apiFetch(`/api/admin/image-manager/mark-brand`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand,
          category: selectedCategory,
          checked,
        }),
      });
      if (!res.ok) throw new Error("Mark brand failed");
      await loadLog();
      if (selectedCategory) await loadBrands(selectedCategory);
      await runSearch();
    } catch {
      /* ignore */
    } finally {
      setBrandMarking(null);
    }
  };

  const handleProductMark = async (productId: number, checked: boolean) => {
    try {
      const res = await apiFetch(
        `/api/admin/image-manager/mark/${productId}`,
        {
          method: "POST",
          body: JSON.stringify({ checked }),
        },
      );
      if (!res.ok) throw new Error("Mark failed");
      await loadLog();
      if (selectedCategory) await loadBrands(selectedCategory);
    } catch {
      /* ignore */
    }
  };

  const handleFileSelect = async (product: SearchProduct, file: File | undefined) => {
    if (!file) return;

    setCardState((prev) => ({
      ...prev,
      [product.id]: {
        ...(prev[product.id] ?? {
          imageUrl: product.image,
          showVariants: false,
        }),
        uploading: true,
        status: "idle",
        statusMessage: "",
        showVariants: false,
      },
    }));

    try {
      const form = new FormData();
      form.append("file", file);

      const res = await apiFetch(
        `/api/admin/image-manager/upload/${product.id}`,
        { method: "POST", body: form },
      );
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        throw new Error(data.message || `Upload failed (${res.status})`);
      }

      await loadLog();
      if (selectedCategory) await loadBrands(selectedCategory);

      const newImageUrl =
        typeof data.newImageUrl === "string" ? data.newImageUrl : null;
      if (!newImageUrl) {
        throw new Error("Upload succeeded but no image URL was returned");
      }

      const cacheBust = Date.now();

      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id ? { ...p, image: newImageUrl } : p,
        ),
      );

      setCardState((prev) => ({
        ...prev,
        [product.id]: {
          imageUrl: newImageUrl,
          uploading: false,
          status: "success",
          statusMessage: "✓ Zamenjeno",
          showVariants: true,
          cacheBust,
        },
      }));
    } catch (err) {
      const message =
        err instanceof Error && err.message ? err.message : "Upload failed";
      setCardState((prev) => ({
        ...prev,
        [product.id]: {
          ...(prev[product.id] ?? {
            imageUrl: product.image,
            showVariants: false,
          }),
          uploading: false,
          status: "error",
          statusMessage: `✗ ${message}`,
          showVariants: false,
        },
      }));
    }
  };

  const getCardState = (product: SearchProduct): CardState =>
    cardState[product.id] ?? {
      imageUrl: product.image,
      uploading: false,
      status: "idle",
      statusMessage: "",
      showVariants: false,
    };

  const activeFilters = useMemo(() => {
    const pills: { key: string; label: string; clear: () => void }[] = [];
    if (selectedCategory) {
      pills.push({
        key: "category",
        label: selectedCategory,
        clear: () => {
          setSelectedCategory(null);
          setSelectedBrand(null);
        },
      });
    }
    if (selectedBrand) {
      pills.push({
        key: "brand",
        label: selectedBrand,
        clear: () => setSelectedBrand(null),
      });
    }
    return pills;
  }, [selectedCategory, selectedBrand]);

  return (
    <div className="adminSubPage imageManager">
      <style>{`
        .imageManagerLayout {
          display: flex;
          gap: 1.25rem;
          max-width: 96vw;
          margin: 0 auto;
          align-items: flex-start;
        }
        .imageManagerSidebar {
          width: 250px;
          flex-shrink: 0;
          position: sticky;
          top: 1rem;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 0.85rem;
          background: #fff;
          max-height: calc(100vh - 2rem);
          overflow-y: auto;
        }
        .imageManagerSidebarTitle {
          font-weight: 700;
          font-size: 0.95rem;
          margin: 0 0 0.65rem;
          color: #334155;
        }
        .imageManagerCategoryBtn {
          display: block;
          width: 100%;
          text-align: left;
          border: none;
          background: transparent;
          padding: 0.45rem 0.5rem;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.88rem;
          color: #334155;
        }
        .imageManagerCategoryBtn:hover,
        .imageManagerCategoryBtnActive {
          background: #fff7ed;
          color: #c2410c;
          font-weight: 600;
        }
        .imageManagerCategoryBtnHasLog {
          font-weight: 600;
        }
        .imageManagerCategoryCount {
          margin-left: 0.35rem;
          font-size: 0.72rem;
          color: #16a34a;
          font-weight: 700;
        }
        .imageManagerBrandCount {
          font-size: 0.72rem;
          color: #64748b;
          font-weight: 500;
        }
        .imageManagerBrandCountDone {
          color: #16a34a;
          font-weight: 700;
        }
        .imageManagerCardSaved {
          font-size: 0.72rem;
          color: #64748b;
          margin: 0 0 0.45rem;
        }
        .imageManagerBrandsSection {
          margin-top: 1rem;
          padding-top: 0.75rem;
          border-top: 1px solid #e2e8f0;
        }
        .imageManagerBrandRow {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          padding: 0.45rem 0;
          border-bottom: 1px solid #f1f5f9;
        }
        .imageManagerBrandRowMarked {
          background: #f0fdf4;
          border-radius: 8px;
          padding: 0.45rem 0.35rem;
        }
        .imageManagerBrandNameBtn {
          border: none;
          background: transparent;
          text-align: left;
          cursor: pointer;
          font-size: 0.86rem;
          font-weight: 600;
          color: #334155;
          padding: 0;
        }
        .imageManagerBrandNameBtn:hover {
          color: #ea580c;
        }
        .imageManagerBrandCheck {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.78rem;
          color: #64748b;
        }
        .imageManagerMain {
          flex: 1;
          min-width: 0;
        }
        .imageManagerSearchForm {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
          margin-bottom: 0.75rem;
        }
        .imageManagerSearchInput {
          flex: 1;
          min-width: 220px;
          padding: 0.55rem 0.75rem;
          border-radius: 8px;
          border: 1px solid #cbd5e1;
          font-size: 0.95rem;
        }
        .imageManagerSearchBtn {
          padding: 0.55rem 1.1rem;
          border-radius: 8px;
          border: none;
          background: #ea580c;
          color: #fff;
          font-weight: 600;
          cursor: pointer;
        }
        .imageManagerSearchBtn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .imageManagerPills {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }
        .imageManagerPill {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.3rem 0.55rem;
          border-radius: 999px;
          background: #fff7ed;
          border: 1px solid #fdba74;
          color: #9a3412;
          font-size: 0.82rem;
        }
        .imageManagerPillClear {
          border: none;
          background: transparent;
          cursor: pointer;
          font-weight: 700;
          color: #c2410c;
          padding: 0;
          line-height: 1;
        }
        .imageManagerGrid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 1rem;
        }
        @media (max-width: 900px) {
          .imageManagerLayout {
            flex-direction: column;
          }
          .imageManagerSidebar {
            width: 100%;
            position: static;
            max-height: none;
          }
          .imageManagerGrid {
            grid-template-columns: 1fr;
          }
        }
        .imageManagerCard {
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 0.85rem;
          background: #fff;
          position: relative;
        }
        .imageManagerCardTitle {
          font-weight: 700;
          font-size: 0.92rem;
          margin: 0 0 0.2rem;
          padding-right: 1.75rem;
          line-height: 1.35;
        }
        .imageManagerCardMeta {
          font-size: 0.8rem;
          color: #64748b;
          margin: 0 0 0.6rem;
        }
        .imageManagerCardCheck {
          position: absolute;
          top: 0.65rem;
          right: 0.65rem;
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.72rem;
        }
        .imageManagerCardCheck input[type="checkbox"] {
          width: 1rem;
          height: 1rem;
          accent-color: #3b82f6;
        }
        .imageManagerCardCheckManual input[type="checkbox"],
        .imageManagerCardCheckBrand input[type="checkbox"] {
          accent-color: #16a34a;
        }
        .imageManagerPreview {
          width: 100%;
          aspect-ratio: 1;
          object-fit: contain;
          background: #f8fafc;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }
        .imageManagerReplaceBtn {
          margin-top: 0.65rem;
          width: 100%;
          padding: 0.5rem 0.75rem;
          border-radius: 8px;
          border: 1px solid #cbd5e1;
          background: #f8fafc;
          font-weight: 600;
          cursor: pointer;
          display: block;
          text-align: center;
        }
        .imageManagerReplaceBtn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .imageManagerStatus {
          margin-top: 0.45rem;
          font-size: 0.85rem;
          font-weight: 600;
        }
        .imageManagerStatusSuccess { color: #15803d; }
        .imageManagerStatusError { color: #b91c1c; }
        .imageManagerVariants {
          margin-top: 0.75rem;
          padding-top: 0.75rem;
          border-top: 1px solid #e2e8f0;
        }
        .imageManagerVariantsTitle {
          font-size: 0.78rem;
          font-weight: 700;
          margin: 0 0 0.45rem;
          color: #334155;
        }
        .imageManagerVariantGrid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.45rem;
        }
        .imageManagerVariantLabel {
          font-size: 0.68rem;
          color: #64748b;
          margin-bottom: 0.2rem;
        }
        .imageManagerVariantImg {
          width: 100%;
          height: 64px;
          object-fit: contain;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
        }
        .imageManagerError {
          color: #b91c1c;
          margin-bottom: 0.75rem;
        }
        .imageManagerEmpty {
          color: #64748b;
        }
      `}</style>

      <div className="adminSubPageBar">
        <Link to="/admin" className="adminBackLink">
          ← Admin
        </Link>
        <h1>Image Manager</h1>
      </div>

      <div className="imageManagerLayout">
        <aside className="imageManagerSidebar">
          <p className="imageManagerSidebarTitle">Kategorije</p>
          {categories.map((cat) => {
            const loggedCount = categoryLogCounts[cat] ?? 0;
            return (
              <button
                key={cat}
                type="button"
                className={`imageManagerCategoryBtn ${
                  selectedCategory === cat ? "imageManagerCategoryBtnActive" : ""
                } ${loggedCount > 0 ? "imageManagerCategoryBtnHasLog" : ""}`}
                onClick={() => handleCategorySelect(cat)}
              >
                {cat}
                {loggedCount > 0 && (
                  <span className="imageManagerCategoryCount">({loggedCount})</span>
                )}
              </button>
            );
          })}

          {selectedCategory && (
            <div className="imageManagerBrandsSection">
              <p className="imageManagerSidebarTitle">Brendovi</p>
              {brands.map((brand) => {
                const fullyMarked = isBrandFullyMarked(brand);
                const brandChecked = isBrandCheckboxChecked(brand);
                const stats = brandStats[brand];
                return (
                  <div
                    key={brand}
                    className={`imageManagerBrandRow ${
                      fullyMarked ? "imageManagerBrandRowMarked" : ""
                    }`}
                  >
                    <button
                      type="button"
                      className="imageManagerBrandNameBtn"
                      onClick={() => handleBrandSelect(brand)}
                    >
                      {brand}
                      {stats && (
                        <span
                          className={`imageManagerBrandCount ${
                            fullyMarked ? "imageManagerBrandCountDone" : ""
                          }`}
                        >
                          {" "}
                          ({stats.logged}/{stats.total})
                        </span>
                      )}
                    </button>
                    <label className="imageManagerBrandCheck">
                      <input
                        type="checkbox"
                        checked={brandChecked}
                        disabled={brandMarking === brand}
                        onChange={(e) =>
                          void handleBrandMark(brand, e.target.checked)
                        }
                      />
                      Stikliran
                    </label>
                  </div>
                );
              })}
            </div>
          )}
        </aside>

        <main className="imageManagerMain">
          <form
            className="imageManagerSearchForm"
            onSubmit={(e) => {
              e.preventDefault();
              void runSearch();
            }}
          >
            <input
              className="imageManagerSearchInput"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ID proizvoda, naziv ili brend"
            />
            <button
              className="imageManagerSearchBtn"
              type="submit"
              disabled={searching}
            >
              {searching ? "Pretraga…" : "Pretraži"}
            </button>
          </form>

          {activeFilters.length > 0 && (
            <div className="imageManagerPills">
              {activeFilters.map((pill) => (
                <span key={pill.key} className="imageManagerPill">
                  {pill.label}
                  <button
                    type="button"
                    className="imageManagerPillClear"
                    onClick={pill.clear}
                    aria-label={`Ukloni filter ${pill.label}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

          {searchError && <p className="imageManagerError">{searchError}</p>}

          {!searching && products.length === 0 && (
            <p className="imageManagerEmpty">Nema rezultata.</p>
          )}

          <div className="imageManagerGrid">
            {products.map((product) => {
              const state = getCardState(product);
              const logEntry = getLogEntry(product.id);
              const isChecked = Boolean(logEntry);
              const checkClass =
                logEntry?.source === "checked"
                  ? ""
                  : logEntry?.source === "manual" || logEntry?.source === "brand"
                    ? "imageManagerCardCheckManual"
                    : "";
              const imageUrl = product.image ?? state.imageUrl;
              const previewSrc = withCacheBust(
                cardPreviewUrl(imageUrl),
                state.cacheBust,
              );
              const publicUrl = imageUrl ?? "";

              return (
                <article key={product.id} className="imageManagerCard">
                  <label
                    className={`imageManagerCardCheck ${checkClass} ${
                      logEntry?.source === "brand"
                        ? "imageManagerCardCheckBrand"
                        : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) =>
                        void handleProductMark(product.id, e.target.checked)
                      }
                    />
                    Stiklirano
                  </label>

                  <p className="imageManagerCardTitle">{product.name}</p>
                  <p className="imageManagerCardMeta">
                    #{product.id}
                    {product.brand ? ` · ${product.brand}` : ""}
                  </p>
                  {logEntry && (
                    <p className="imageManagerCardSaved">
                      Sačuvano ·{" "}
                      {logEntry.source === "manual"
                        ? "zamenjeno"
                        : logEntry.source === "brand"
                          ? "brend stikliran"
                          : "stiklirano"}
                    </p>
                  )}

                  {previewSrc ? (
                    <img
                      className="imageManagerPreview"
                      src={previewSrc}
                      alt={product.name}
                    />
                  ) : (
                    <div className="imageManagerPreview" aria-hidden />
                  )}

                  <label className="imageManagerReplaceBtn">
                    {state.uploading ? "Upload…" : "Zameni sliku"}
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      disabled={state.uploading}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        void handleFileSelect(product, file);
                        e.target.value = "";
                      }}
                    />
                  </label>

                  {state.statusMessage && (
                    <p
                      className={`imageManagerStatus ${
                        state.status === "success"
                          ? "imageManagerStatusSuccess"
                          : state.status === "error"
                            ? "imageManagerStatusError"
                            : ""
                      }`}
                    >
                      {state.statusMessage}
                    </p>
                  )}

                  {state.showVariants && publicUrl && (
                    <div className="imageManagerVariants">
                      <p className="imageManagerVariantsTitle">Varijante</p>
                      <div className="imageManagerVariantGrid">
                        {CF_VARIANTS.map((variant) => (
                          <div key={variant}>
                            <div className="imageManagerVariantLabel">
                              {variant}
                            </div>
                            <img
                              className="imageManagerVariantImg"
                              src={withCacheBust(
                                cfVariantUrl(publicUrl, variant),
                                state.cacheBust,
                              )}
                              alt={`${product.name} ${variant}`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}

export default ImageManagerPage;
