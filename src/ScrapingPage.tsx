import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "./api";

type StepStatus = "success" | "failed";
type RunStatus = "running" | "success" | "partial" | "failed";

type ScrapeRunStep = {
  store: "Idea" | "Maxi" | "DIS";
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  status: StepStatus;
  exitCode: number;
  command: string;
  logs: string[];
  finalInfo?: {
    scraped?: number;
    created?: number;
    updated?: number;
    priceCleared?: number;
    totalInDb?: number;
  };
  errorMessage?: string;
};

type ScrapeRun = {
  id: string;
  trigger: "manual" | "scheduled";
  status: RunStatus;
  startedAt: string;
  finishedAt?: string;
  durationMs?: number;
  steps: ScrapeRunStep[];
  summary: {
    totalSteps: number;
    successfulSteps: number;
    failedSteps: number;
  };
};

type ActiveRun = {
  runId: string;
  trigger: "manual" | "scheduled";
  startedAt: string;
  currentStore?: "Idea" | "Maxi" | "DIS";
  currentCommand?: string;
  currentStepStartedAt?: string;
  currentStepLogs: string[];
  completedSteps: ScrapeRunStep[];
};

const formatTime = (date?: string) =>
  date ? new Date(date).toLocaleString("sr-RS") : "-";

async function readJsonSafely(res: Response): Promise<any> {
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(
      `Backend returned non-JSON response (status ${res.status}). Make sure backend is running and restarted after latest changes.`,
    );
  }
}

function deriveFinalInfoFromLogs(step: ScrapeRunStep): {
  scraped?: number;
  created?: number;
  updated?: number;
  priceCleared?: number;
  totalInDb?: number;
} {
  if (step.finalInfo) return step.finalInfo;

  const text = (step.logs || []).join("\n");
  const info: {
    scraped?: number;
    created?: number;
    updated?: number;
    priceCleared?: number;
    totalInDb?: number;
  } = {};

  const createdUpdatedClearedTotal = text.match(
    /Created:\s*(\d+),\s*Updated:\s*(\d+),\s*Price cleared:\s*(\d+),\s*Total:\s*(\d+)/i,
  );
  if (createdUpdatedClearedTotal) {
    info.created = Number(createdUpdatedClearedTotal[1]);
    info.updated = Number(createdUpdatedClearedTotal[2]);
    info.priceCleared = Number(createdUpdatedClearedTotal[3]);
    info.totalInDb = Number(createdUpdatedClearedTotal[4]);
  } else {
    const createdUpdatedTotal = text.match(
      /Created:\s*(\d+),\s*Updated:\s*(\d+),\s*Total:\s*(\d+)/i,
    );
    if (createdUpdatedTotal) {
      info.created = Number(createdUpdatedTotal[1]);
      info.updated = Number(createdUpdatedTotal[2]);
      info.totalInDb = Number(createdUpdatedTotal[3]);
    }
  }

  const ideaSummaryNew = text.match(
    /Scraped\s*(\d+)\s*rows\s*[^\d]*(\d+)\s*new,\s*(\d+)\s*price updates,\s*(\d+)\s*price cleared,\s*(\d+)\s*products in DB/i,
  );
  if (ideaSummaryNew) {
    info.scraped = Number(ideaSummaryNew[1]);
    info.created = Number(ideaSummaryNew[2]);
    info.updated = Number(ideaSummaryNew[3]);
    info.priceCleared = Number(ideaSummaryNew[4]);
    info.totalInDb = Number(ideaSummaryNew[5]);
  } else {
    const ideaSummary = text.match(
      /Scraped\s*(\d+)\s*rows\s*[^\d]*(\d+)\s*new,\s*(\d+)\s*price updates,\s*(\d+)\s*products in DB/i,
    );
    if (ideaSummary) {
      info.scraped = Number(ideaSummary[1]);
      info.created = Number(ideaSummary[2]);
      info.updated = Number(ideaSummary[3]);
      info.totalInDb = Number(ideaSummary[4]);
    }
  }

  if (info.scraped == null) {
    const disTotal = text.match(/\[DIS\]\s*Total collected:\s*(\d+)/i);
    if (disTotal) info.scraped = Number(disTotal[1]);
  }

  if (info.scraped == null) {
    const maxiTotal = text.match(/Total products collected:\s*(\d+)/i);
    if (maxiTotal) info.scraped = Number(maxiTotal[1]);
  }

  return info;
}

function ScrapingPage() {
  const [runs, setRuns] = useState<ScrapeRun[]>([]);
  const [selectedRunId, setSelectedRunId] = useState<string>("");
  const [isRunning, setIsRunning] = useState(false);
  const [scheduled, setScheduled] = useState("");
  const [activeRun, setActiveRun] = useState<ActiveRun | null>(null);
  const [error, setError] = useState("");
  const [isTriggering, setIsTriggering] = useState(false);

  const selectedRun = useMemo(
    () => runs.find((run) => run.id === selectedRunId) ?? runs[0],
    [runs, selectedRunId],
  );

  const runPriceClearedTotal = useMemo(() => {
    if (!selectedRun?.steps?.length) return null;
    let sum = 0;
    let any = false;
    for (const step of selectedRun.steps) {
      const p = deriveFinalInfoFromLogs(step).priceCleared;
      if (p != null && !Number.isNaN(p)) {
        sum += p;
        any = true;
      }
    }
    return any ? sum : null;
  }, [selectedRun]);

  const loadData = useCallback(async () => {
    try {
      setError("");
      const [statusRes, runsRes] = await Promise.all([
        apiFetch(`/api/scraping/status`),
        apiFetch(`/api/scraping/runs`),
      ]);

      if (!statusRes.ok) {
        throw new Error(
          `Failed to load scraping status (HTTP ${statusRes.status}).`,
        );
      }
      if (!runsRes.ok) {
        throw new Error(`Failed to load scraping runs (HTTP ${runsRes.status}).`);
      }

      const statusData = await readJsonSafely(statusRes);
      const runsData = await readJsonSafely(runsRes);

      setIsRunning(Boolean(statusData.isRunning));
      setScheduled(String(statusData.scheduled ?? ""));
      setActiveRun(statusData.activeRun ?? null);
      setRuns(Array.isArray(runsData.runs) ? runsData.runs : []);
      setSelectedRunId((prev) => prev || runsData.runs?.[0]?.id || "");
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unknown error";
      setError(message);
    }
  }, []);

  useEffect(() => {
    loadData();
    const timer = setInterval(loadData, 15000);
    return () => clearInterval(timer);
  }, [loadData]);

  const handleRunNow = async () => {
    try {
      setIsTriggering(true);
      setError("");
      const res = await apiFetch(`/api/scraping/run-now`, {
        method: "POST",
      });
      const data = await readJsonSafely(res);
      if (!res.ok) {
        throw new Error(data.message || "Run could not be started.");
      }
      // Give the server a moment before polling (scrape starts after HTTP response).
      await new Promise((r) => setTimeout(r, 800));
      try {
        await loadData();
      } catch {
        setError(
          "Run started, but status poll failed (server may be busy or restarting). Click Refresh in a minute.",
        );
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unknown error";
      const hint =
        message === "Failed to fetch"
          ? " Failed to fetch usually means the Render service crashed (often out of memory when Chrome starts). Check Render logs/metrics."
          : "";
      setError(message + hint);
    } finally {
      setIsTriggering(false);
    }
  };

  return (
    <div className="scrapingPage">
      <div className="adminSubPageBar">
        <Link to="/admin" className="adminBackLink">
          ← Admin
        </Link>
      </div>
      <div className="scrapingTopBar">
        <div>
          <h1>Complete scrapers</h1>
          <p className="scrapingSubInfo">Schedule: {scheduled || "Not configured"}</p>
          <p className={`scrapingStatus ${isRunning ? "running" : "idle"}`}>
            {isRunning ? "Run in progress" : "Idle"}
          </p>
        </div>
        <div className="scrapingActions">
          <button
            onClick={handleRunNow}
            disabled={isTriggering || isRunning}
            className="scrapingActionBtn"
          >
            {isTriggering ? "Starting..." : "Run now"}
          </button>
          <button onClick={loadData} className="scrapingRefreshBtn">
            Refresh
          </button>
        </div>
      </div>

      {error ? <div className="scrapingError">{error}</div> : null}

      <div className="scrapingContent">
        <div className="scrapingRunList">
          <h3>Recent runs</h3>
          {runs.length === 0 ? (
            <p>No runs yet.</p>
          ) : (
            runs.map((run) => (
              <button
                key={run.id}
                className={`scrapingRunRow ${selectedRun?.id === run.id ? "active" : ""}`}
                onClick={() => setSelectedRunId(run.id)}
              >
                <div>
                  <strong>{run.trigger === "manual" ? "Manual" : "Scheduled"}</strong>
                  <p>{formatTime(run.startedAt)}</p>
                </div>
                <span className={`runBadge ${run.status}`}>{run.status}</span>
              </button>
            ))
          )}
        </div>

        <div className="scrapingRunDetails">
          {isRunning && activeRun ? (
            <div className="stepCard" style={{ marginBottom: 12 }}>
              <div className="stepHeader">
                <h4>Live progress</h4>
                <span className="runBadge running">running</span>
              </div>
              <p>Run ID: {activeRun.runId}</p>
              <p>Store in progress: {activeRun.currentStore || "-"}</p>
              <p>Step started: {formatTime(activeRun.currentStepStartedAt)}</p>
              <p className="mono">{activeRun.currentCommand || ""}</p>
              <p>Completed steps: {activeRun.completedSteps.length}/3</p>
              <details open>
                <summary>Live logs ({activeRun.currentStepLogs.length})</summary>
                <pre className="stepLogs">{activeRun.currentStepLogs.join("\n")}</pre>
              </details>
            </div>
          ) : null}

          {!selectedRun ? (
            <p>Select a run to see details.</p>
          ) : (
            <>
              <div className="detailsMeta">
                <p>Started: {formatTime(selectedRun.startedAt)}</p>
                <p>Finished: {formatTime(selectedRun.finishedAt)}</p>
                <p>
                  Steps: {selectedRun.summary.successfulSteps}/{selectedRun.summary.totalSteps} successful
                </p>
                {runPriceClearedTotal != null ? (
                  <p>
                    <strong>Price cleared (run total):</strong>{" "}
                    {runPriceClearedTotal}
                  </p>
                ) : null}
              </div>

              {selectedRun.steps.map((step, idx) => (
                <div key={`${selectedRun.id}-${step.store}-${idx}`} className="stepCard">
                  {(() => {
                    const finalInfo = deriveFinalInfoFromLogs(step);
                    return (
                      <>
                  <div className="stepHeader">
                    <h4>{step.store}</h4>
                    <span className={`runBadge ${step.status}`}>{step.status}</span>
                  </div>
                  <div className="finalInfoRow">
                    <p><strong>Scraped:</strong> {finalInfo.scraped ?? "-"}</p>
                    <p><strong>Created:</strong> {finalInfo.created ?? "-"}</p>
                    <p><strong>Updated:</strong> {finalInfo.updated ?? "-"}</p>
                    <p><strong>Price cleared:</strong> {finalInfo.priceCleared ?? "-"}</p>
                    <p><strong>Total in DB:</strong> {finalInfo.totalInDb ?? "-"}</p>
                  </div>
                  <p>Duration: {(step.durationMs / 1000).toFixed(1)}s</p>
                  <p>Exit code: {step.exitCode}</p>
                  <p className="mono">{step.command}</p>
                  {step.errorMessage ? (
                    <p className="stepError">Error: {step.errorMessage}</p>
                  ) : null}
                  <details>
                    <summary>Logs ({step.logs.length})</summary>
                    <pre className="stepLogs">{step.logs.join("\n")}</pre>
                  </details>
                      </>
                    );
                  })()}
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ScrapingPage;
