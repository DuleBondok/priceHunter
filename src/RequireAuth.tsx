import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { isAdminAuthenticated } from "./api";

type Props = { children: React.ReactNode };

/** Redirects to /login when no admin token in sessionStorage. */
function RequireAuth({ children }: Props) {
  const location = useLocation();
  if (!isAdminAuthenticated()) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname + location.search }}
      />
    );
  }
  return <>{children}</>;
}

export default RequireAuth;
