import React, { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  FiCheckSquare,
  FiClock,
  FiCopy,
  FiGrid,
  FiImage,
  FiLink,
  FiLogOut,
  FiMenu,
  FiPackage,
  FiPlayCircle,
  FiX,
} from "react-icons/fi";
import { clearAdminToken } from "./api";

const NAV_ITEMS: Array<{
  to: string;
  end?: boolean;
  label: string;
  hint: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  {
    to: "/admin",
    end: true,
    label: "Overview",
    hint: "Home",
    icon: FiGrid,
  },
  {
    to: "/admin/matches",
    label: "Similarity matches",
    hint: "Link products",
    icon: FiLink,
  },
  {
    to: "/admin/new-product-matches",
    label: "NewProducts matches",
    hint: "Promote new rows",
    icon: FiPackage,
  },
  {
    to: "/admin/receipt-verification",
    label: "Receipt verification",
    hint: "Confirm & reject",
    icon: FiCheckSquare,
  },
  {
    to: "/admin/scrape-stores",
    label: "Quick scrapes",
    hint: "Single store",
    icon: FiPlayCircle,
  },
  {
    to: "/admin/complete-scrape",
    label: "Complete scrapers",
    hint: "Schedule & logs",
    icon: FiClock,
  },
  {
    to: "/admin/image-manager",
    label: "Image Manager",
    hint: "Cloudflare images",
    icon: FiImage,
  },
  {
    to: "/admin/duplicate-store-links",
    label: "Duplicate store links",
    hint: "Unlink / delete",
    icon: FiCopy,
  },
];

function AdminLayout() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const logout = () => {
    clearAdminToken();
    navigate("/login", { replace: true });
  };

  const closeMobile = () => setMobileOpen(false);

  return (
    <div className="adminShell">
      <button
        type="button"
        className="adminMobileMenuBtn"
        aria-label={mobileOpen ? "Close menu" : "Open menu"}
        onClick={() => setMobileOpen((v) => !v)}
      >
        {mobileOpen ? <FiX size={22} /> : <FiMenu size={22} />}
      </button>

      {mobileOpen ? (
        <button
          type="button"
          className="adminSidebarBackdrop"
          aria-label="Close menu"
          onClick={closeMobile}
        />
      ) : null}

      <aside className={`adminSidebar${mobileOpen ? " is-open" : ""}`}>
        <div className="adminSidebarBrand">
          <span className="adminSidebarBrandMark">P</span>
          <div>
            <div className="adminSidebarBrandName">Pricely</div>
            <div className="adminSidebarBrandSub">Admin</div>
          </div>
        </div>

        <nav className="adminSidebarNav" aria-label="Admin sections">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `adminSidebarLink${isActive ? " is-active" : ""}`
                }
                onClick={closeMobile}
              >
                <Icon className="adminSidebarLinkIcon" />
                <span className="adminSidebarLinkText">
                  <span className="adminSidebarLinkLabel">{item.label}</span>
                  <span className="adminSidebarLinkHint">{item.hint}</span>
                </span>
              </NavLink>
            );
          })}
        </nav>

        <div className="adminSidebarFooter">
          <button type="button" className="adminSidebarLogout" onClick={logout}>
            <FiLogOut className="adminSidebarLinkIcon" />
            Logout
          </button>
        </div>
      </aside>

      <main className="adminMain">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
