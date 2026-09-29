import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { useAuth } from "../AuthProvider";

/**
 * Every signed-in account must have a verified mobile number. Accounts that
 * do not (Google sign-ins, older accounts) are sent to add one first.
 * Rendered once in the site layout.
 */
export default function PhoneGate() {
  const { status, account } = useAuth();
  const { pathname, search } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (status !== "signedIn" || !account || account.phoneVerified || pathname.startsWith("/login")) return;
    navigate(`/login?step=phone&next=${encodeURIComponent(pathname + search)}`, { replace: true });
  }, [status, account, pathname, search, navigate]);

  return null;
}
