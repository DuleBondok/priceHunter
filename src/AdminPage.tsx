import React from "react";
import { Link } from "react-router-dom";
import {
  FiCheckSquare,
  FiClock,
  FiCopy,
  FiImage,
  FiLink,
  FiPackage,
  FiPlayCircle,
} from "react-icons/fi";

const TOOLS: Array<{
  to: string;
  title: string;
  desc: string;
  tone: "coral" | "teal" | "amber" | "sky" | "rose" | "lime" | "slate";
  icon: React.ComponentType<{ size?: number }>;
}> = [
  {
    to: "/admin/matches",
    title: "Similarity matches",
    desc: "Fetch suggested product ↔ standardized pairs and confirm links.",
    tone: "coral",
    icon: FiLink,
  },
  {
    to: "/admin/new-product-matches",
    title: "NewProducts matches",
    desc: "Match pending NewProducts rows, promote to Product, and link.",
    tone: "teal",
    icon: FiPackage,
  },
  {
    to: "/admin/receipt-verification",
    title: "Receipt verification",
    desc: "Confirm purchased items, reject invalid scans, award points.",
    tone: "lime",
    icon: FiCheckSquare,
  },
  {
    to: "/admin/scrape-stores",
    title: "Quick scrapes",
    desc: "Run Idea, Maxi, or DIS scrape endpoints from the backend.",
    tone: "amber",
    icon: FiPlayCircle,
  },
  {
    to: "/admin/complete-scrape",
    title: "Complete scrapers",
    desc: "Full catalog runs, schedule, run history, and logs.",
    tone: "sky",
    icon: FiClock,
  },
  {
    to: "/admin/image-manager",
    title: "Image Manager",
    desc: "Search products and replace images on Cloudflare.",
    tone: "rose",
    icon: FiImage,
  },
  {
    to: "/admin/duplicate-store-links",
    title: "Duplicate store links",
    desc: "Find bad multi-links for the same store, then unlink or delete.",
    tone: "slate",
    icon: FiCopy,
  },
];

function AdminPage() {
  return (
    <div className="adminHub">
      <header className="adminHubHeader">
        <p className="adminHubEyebrow">Pricely ops</p>
        <h1 className="adminHubTitle">Overview</h1>
        <p className="adminHubSubtitle">
          Use the sidebar for every tool. Shortcuts below open the same pages.
        </p>
      </header>

      <nav className="adminHubGrid" aria-label="Admin shortcuts">
        {TOOLS.map((tool) => {
          const Icon = tool.icon;
          return (
            <Link
              key={tool.to}
              to={tool.to}
              className={`adminHubCard adminHubCard--${tool.tone}`}
            >
              <span className="adminHubCardIcon" aria-hidden>
                <Icon size={20} />
              </span>
              <span className="adminHubCardTitle">{tool.title}</span>
              <span className="adminHubCardDesc">{tool.desc}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export default AdminPage;
