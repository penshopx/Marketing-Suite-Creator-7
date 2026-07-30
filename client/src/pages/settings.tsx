import { useEffect } from "react";
import { useLocation } from "wouter";

/**
 * Settings previously contained a standalone business-profile form.
 * That feature now lives at /business-profile with multi-profile support.
 * Redirect there so any existing /settings links keep working.
 */
export default function Settings() {
  const [, navigate] = useLocation();

  useEffect(() => {
    navigate("/business-profile", { replace: true });
  }, [navigate]);

  return null;
}
