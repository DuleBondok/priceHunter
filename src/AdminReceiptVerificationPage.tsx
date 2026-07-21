import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { apiFetch } from "./api";

type ReceiptItem = {
  id: string;
  productId: string;
  name: string;
  expectedQuantity: number;
  confirmed: boolean;
};

type ReceiptScan = {
  id: number;
  scannedUrl: string;
  userEmail: string | null;
  status: "pending" | "confirmed" | string;
  cartItemsSnapshot: unknown;
  cartTotalSnapshot: number | null;
  itemConfirmations: ReceiptItem[] | null;
  confirmedBy: string | null;
  confirmedAt: string | null;
  createdAt: string;
  purchaseGroupId: string | null;
  checkoutStoreLabel: string | null;
};

type ListBlock =
  | { kind: "single"; receipt: ReceiptScan }
  | { kind: "group"; purchaseGroupId: string; receipts: ReceiptScan[] };

function toSnapshotItems(raw: unknown): ReceiptItem[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((entry) => typeof entry === "object" && entry !== null)
    .map((entry) => {
      const item = entry as Record<string, unknown>;
      return {
        id: String(item.id ?? ""),
        productId: String(item.productId ?? ""),
        name: String(item.name ?? ""),
        expectedQuantity: Math.max(1, Math.floor(Number(item.quantity ?? 1))),
        confirmed: false,
      };
    })
    .filter((item) => item.id && item.productId && item.name);
}

function buildListBlocks(receipts: ReceiptScan[]): ListBlock[] {
  const byGroup = new Map<string, ReceiptScan[]>();
  const withoutGroupId: ReceiptScan[] = [];
  for (const r of receipts) {
    const gid = typeof r.purchaseGroupId === "string" ? r.purchaseGroupId.trim() : "";
    if (gid) {
      const arr = byGroup.get(gid) ?? [];
      arr.push(r);
      byGroup.set(gid, arr);
    } else {
      withoutGroupId.push(r);
    }
  }
  const blocks: ListBlock[] = [];
  for (const r of withoutGroupId) blocks.push({ kind: "single", receipt: r });
  Array.from(byGroup.entries()).forEach(([purchaseGroupId, list]) => {
    const sorted = [...list].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    if (sorted.length <= 1) {
      const only = sorted[0];
      if (only) blocks.push({ kind: "single", receipt: only });
      return;
    }
    blocks.push({ kind: "group", purchaseGroupId, receipts: sorted });
  });
  blocks.sort((a, b) => {
    const ta =
      a.kind === "single"
        ? new Date(a.receipt.createdAt).getTime()
        : Math.max(...a.receipts.map((x) => new Date(x.createdAt).getTime()));
    const tb =
      b.kind === "single"
        ? new Date(b.receipt.createdAt).getTime()
        : Math.max(...b.receipts.map((x) => new Date(x.createdAt).getTime()));
    return tb - ta;
  });
  return blocks;
}

function firstReceiptIdInBlocks(blocks: ListBlock[]): number | null {
  const first = blocks[0];
  if (!first) return null;
  if (first.kind === "single") return first.receipt.id;
  return first.receipts[0]?.id ?? null;
}

function AdminReceiptVerificationPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receipts, setReceipts] = useState<ReceiptScan[]>([]);
  const [activeReceiptId, setActiveReceiptId] = useState<number | null>(null);
  const [itemConfirmations, setItemConfirmations] = useState<ReceiptItem[]>([]);

  const listBlocks = useMemo(() => buildListBlocks(receipts), [receipts]);

  const activeListBlock = useMemo((): ListBlock | null => {
    if (activeReceiptId == null) return null;
    for (const b of listBlocks) {
      if (b.kind === "single" && b.receipt.id === activeReceiptId) return b;
      if (b.kind === "group" && b.receipts.some((r) => r.id === activeReceiptId)) return b;
    }
    return null;
  }, [listBlocks, activeReceiptId]);

  const loadReceipts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch(`/api/admin/receipt-scans`);
      if (!res.ok) {
        throw new Error(`Failed to load receipt scans (${res.status})`);
      }
      const data = (await res.json()) as ReceiptScan[];
      const normalized = data.map((r) => ({
        ...r,
        purchaseGroupId:
          typeof r.purchaseGroupId === "string" && r.purchaseGroupId.trim()
            ? r.purchaseGroupId.trim()
            : null,
        checkoutStoreLabel:
          typeof r.checkoutStoreLabel === "string" && r.checkoutStoreLabel.trim()
            ? r.checkoutStoreLabel.trim()
            : null,
      }));
      setReceipts(normalized);
      const blocks = buildListBlocks(normalized);
      const defaultId = firstReceiptIdInBlocks(blocks);
      setActiveReceiptId((prev) => {
        if (prev && normalized.some((r) => r.id === prev)) return prev;
        return defaultId;
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadReceipts();
  }, []);

  const activeReceipt = useMemo(
    () => receipts.find((r) => r.id === activeReceiptId) ?? null,
    [receipts, activeReceiptId]
  );

  const groupPeers = useMemo(() => {
    if (!activeReceipt || !activeListBlock || activeListBlock.kind === "single") return [];
    return activeListBlock.receipts
      .filter((r) => r.id !== activeReceipt.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [activeReceipt, activeListBlock]);

  useEffect(() => {
    if (!activeReceipt) {
      setItemConfirmations([]);
      return;
    }
    if (
      Array.isArray(activeReceipt.itemConfirmations) &&
      activeReceipt.itemConfirmations.length > 0
    ) {
      setItemConfirmations(activeReceipt.itemConfirmations);
      return;
    }
    setItemConfirmations(toSnapshotItems(activeReceipt.cartItemsSnapshot));
  }, [activeReceipt]);

  const toggleItem = (id: string) => {
    setItemConfirmations((current) =>
      current.map((item) =>
        item.id === id ? { ...item, confirmed: !item.confirmed } : item
      )
    );
  };

  const onConfirmReceipt = async () => {
    if (!activeReceipt) return;
    if (
      itemConfirmations.length === 0 ||
      !itemConfirmations.some((i) => i.confirmed)
    ) {
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await apiFetch(
        `/api/admin/receipt-scans/${activeReceipt.id}/confirm`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            confirmedBy: "admin@pricehunter.local",
            itemConfirmations,
          }),
        }
      );
      if (!res.ok) {
        const payload = (await res.json().catch(() => ({}))) as { message?: string };
        throw new Error(payload.message ?? `Confirm failed (${res.status})`);
      }
      await loadReceipts();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setSaving(false);
    }
  };

  const confirmedCount = itemConfirmations.filter((i) => i.confirmed).length;
  const atLeastOneItemConfirmed = itemConfirmations.some((i) => i.confirmed);
  const canConfirmReceipt = atLeastOneItemConfirmed && !saving;

  const groupProgress = useMemo(() => {
    if (!activeListBlock || activeListBlock.kind === "single") return null;
    const entries = activeListBlock.receipts;
    if (entries.length < 2) return null;
    const confirmed = entries.filter((r) => r.status === "confirmed").length;
    return { confirmed, total: entries.length };
  }, [activeListBlock]);

  return (
    <div className="adminSubPage">
      <div className="adminSubPageBar">
        <Link to="/admin" className="adminBackLink">
          ← Admin
        </Link>
        <h1>Receipt verification</h1>
      </div>

      {loading ? (
        <p>Loading receipts…</p>
      ) : error ? (
        <p style={{ color: "#b91c1c" }}>{error}</p>
      ) : receipts.length === 0 ? (
        <p>No receipt scans yet.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 14 }}>
          <div style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: 10 }}>
            {listBlocks.map((block) => {
              if (block.kind === "single") {
                const receipt = block.receipt;
                return (
                  <button
                    key={`s-${receipt.id}`}
                    type="button"
                    onClick={() => setActiveReceiptId(receipt.id)}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      border: "1px solid #e5e7eb",
                      borderRadius: 10,
                      background: activeReceiptId === receipt.id ? "#f0fdf4" : "#fff",
                      marginBottom: 8,
                      padding: 10,
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ fontWeight: 700 }}>#{receipt.id}</div>
                    <div style={{ fontSize: 13 }}>{receipt.userEmail ?? "unknown user"}</div>
                    <div style={{ fontSize: 12, color: "#6b7280" }}>
                      {receipt.status.toUpperCase()} ·{" "}
                      {new Date(receipt.createdAt).toLocaleString()}
                    </div>
                  </button>
                );
              }

              const pending = block.receipts.filter((r) => r.status !== "confirmed").length;
              return (
                <div
                  key={`g-${block.purchaseGroupId}`}
                  style={{
                    marginBottom: 12,
                    border: "1px solid #93c5fd",
                    borderRadius: 10,
                    padding: 10,
                    background: "#eff6ff",
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      color: "#1e40af",
                      letterSpacing: 0.4,
                      marginBottom: 6,
                    }}
                  >
                    MULTI-STORE CHECKOUT
                  </div>
                  <div style={{ fontSize: 12, color: "#1f2937", marginBottom: 8, lineHeight: 1.45 }}>
                    {block.receipts[0]?.userEmail ?? "unknown user"} · {block.receipts.length}{" "}
                    fiscal receipt{block.receipts.length === 1 ? "" : "s"} — open each row and
                    confirm items separately.
                  </div>
                  <div style={{ fontSize: 11, color: "#b45309", marginBottom: 8 }}>
                    {pending === 0
                      ? "All scans in this group are confirmed."
                      : `${pending} receipt${pending === 1 ? "" : "s"} still pending.`}
                  </div>
                  {block.receipts.map((receipt) => (
                    <button
                      key={receipt.id}
                      type="button"
                      onClick={() => setActiveReceiptId(receipt.id)}
                      style={{
                        width: "100%",
                        textAlign: "left",
                        border: "1px solid #bfdbfe",
                        borderRadius: 8,
                        background: activeReceiptId === receipt.id ? "#f0fdf4" : "#ffffff",
                        marginBottom: 6,
                        padding: 8,
                        cursor: "pointer",
                      }}
                    >
                      <div style={{ fontWeight: 700 }}>
                        #{receipt.id}
                        {receipt.checkoutStoreLabel
                          ? ` · ${receipt.checkoutStoreLabel}`
                          : ""}
                      </div>
                      <div style={{ fontSize: 12, color: "#6b7280" }}>
                        {receipt.status.toUpperCase()} ·{" "}
                        {new Date(receipt.createdAt).toLocaleString()}
                      </div>
                    </button>
                  ))}
                </div>
              );
            })}
          </div>

          {activeReceipt ? (
            <div style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: 12 }}>
              {groupProgress && activeListBlock?.kind === "group" ? (
                <div
                  style={{
                    marginBottom: 14,
                    padding: 12,
                    borderRadius: 10,
                    border: "1px solid #93c5fd",
                    background: "#eff6ff",
                  }}
                >
                  <div style={{ fontWeight: 800, color: "#1e3a8a", marginBottom: 6 }}>
                    Multi-store purchase
                  </div>
                  <p style={{ margin: "0 0 8px", fontSize: 14, color: "#1f2937", lineHeight: 1.5 }}>
                    This receipt is one of <b>{groupProgress.total}</b> scans in the same checkout
                    session. Each physical receipt must be reviewed and confirmed on its own.
                  </p>
                  <p style={{ margin: "0 0 8px", fontSize: 13, color: "#374151" }}>
                    Progress in this group:{" "}
                    <b>
                      {groupProgress.confirmed}/{groupProgress.total}
                    </b>{" "}
                    confirmed.
                  </p>
                  {groupPeers.length > 0 ? (
                    <div style={{ fontSize: 13 }}>
                      <div style={{ fontWeight: 700, marginBottom: 6 }}>Other receipts in this checkout:</div>
                      <ul style={{ margin: 0, paddingLeft: 18 }}>
                        {groupPeers.map((r) => (
                          <li key={r.id} style={{ marginBottom: 4 }}>
                            <button
                              type="button"
                              onClick={() => setActiveReceiptId(r.id)}
                              style={{
                                background: "none",
                                border: "none",
                                padding: 0,
                                color: "#2563eb",
                                cursor: "pointer",
                                textDecoration: "underline",
                                fontSize: 13,
                              }}
                            >
                              #{r.id}
                              {r.checkoutStoreLabel ? ` · ${r.checkoutStoreLabel}` : ""} ·{" "}
                              {r.status.toUpperCase()}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              ) : null}

              <h3 style={{ marginTop: 0, marginBottom: 10 }}>Receipt #{activeReceipt.id}</h3>
              {activeReceipt.checkoutStoreLabel ? (
                <p style={{ margin: "0 0 6px" }}>
                  Store (from app): <b>{activeReceipt.checkoutStoreLabel}</b>
                </p>
              ) : null}
              <p style={{ margin: "0 0 6px" }}>
                User: <b>{activeReceipt.userEmail ?? "unknown"}</b>
              </p>
              <p style={{ margin: "0 0 6px" }}>
                Total snapshot:{" "}
                <b>{Math.round(Number(activeReceipt.cartTotalSnapshot ?? 0))} RSD</b>
              </p>
              <p style={{ margin: "0 0 10px" }}>
                URL:{" "}
                <a href={activeReceipt.scannedUrl} target="_blank" rel="noreferrer">
                  {activeReceipt.scannedUrl}
                </a>
              </p>

              <p style={{ marginTop: 0, marginBottom: 8, fontWeight: 700 }}>
                Confirm items ({confirmedCount}/{itemConfirmations.length})
              </p>
              <div style={{ maxHeight: 360, overflow: "auto", marginBottom: 12 }}>
                {itemConfirmations.map((item) => (
                  <label
                    key={item.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      border: "1px solid #e5e7eb",
                      borderRadius: 10,
                      padding: 10,
                      marginBottom: 8,
                      background: item.confirmed ? "#f0fdf4" : "#fff",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={item.confirmed}
                      onChange={() => toggleItem(item.id)}
                    />
                    <div>
                      <div style={{ fontWeight: 700 }}>{item.name}</div>
                      <div style={{ fontSize: 12, color: "#6b7280" }}>
                        Expected qty: {item.expectedQuantity}
                      </div>
                    </div>
                  </label>
                ))}
              </div>

              <button
                type="button"
                onClick={onConfirmReceipt}
                disabled={!canConfirmReceipt}
                title={
                  atLeastOneItemConfirmed
                    ? undefined
                    : "Confirm at least one item before confirming the receipt."
                }
              >
                {saving ? "Confirming…" : "Confirm receipt"}
              </button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

export default AdminReceiptVerificationPage;
