import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { Account, AuthResponse } from "@shared/auth-contract";
import { getAuthToken, onAuthTokenChange, resetGuestId, setAuthToken } from "../../lib/http";
import { setLang, useLang } from "../../lib/language";
import { authApi } from "./api";

type Status = "loading" | "guest" | "signedIn";

interface AuthCtx {
  status: Status;
  account: Account | null;
  /** Call with the response of register, login or Google sign-in. */
  completeSignIn: (res: AuthResponse) => void;
  signOut: () => void;
  setAccount: (a: Account) => void;
}

const Ctx = createContext<AuthCtx | null>(null);

/**
 * Login state for the whole site. Wrap the app once (done in Layout).
 * Any page can read it:  const { account, status } = useAuth();
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [account, setAccountState] = useState<Account | null>(null);
  const [status, setStatus] = useState<Status>(getAuthToken() ? "loading" : "guest");

  useEffect(() => {
    let live = true;
    if (getAuthToken()) {
      authApi
        .me()
        .then((a) => {
          if (!live) return;
          setAccountState(a);
          setStatus("signedIn");
        })
        .catch(() => {
          if (!live) return;
          // Network trouble keeps the token; an invalid token was already cleared by the client.
          setStatus(getAuthToken() ? "loading" : "guest");
        });
    }
    const off = onAuthTokenChange((token) => {
      if (!token) {
        setAccountState(null);
        setStatus("guest");
      }
    });
    return () => {
      live = false;
      off();
    };
  }, []);

  const completeSignIn = useCallback((res: AuthResponse) => {
    setAuthToken(res.token);
    setAccountState(res.account);
    setStatus("signedIn");
  }, []);

  const signOut = useCallback(() => {
    setAuthToken(null);
    // The next visitor on this browser starts as a brand new guest.
    resetGuestId();
  }, []);

  const setAccount = useCallback((a: Account) => setAccountState(a), []);

  // Language follows the person: their saved choice is applied when they sign
  // in (on any device), and changing the language while signed in saves it.
  const lang = useLang();
  const appliedFor = useRef<string | null>(null);
  useEffect(() => {
    if (status !== "signedIn" || !account) {
      appliedFor.current = null;
      return;
    }
    if (appliedFor.current !== account.id) {
      appliedFor.current = account.id;
      if (account.preferredLang && account.preferredLang !== lang) {
        setLang(account.preferredLang);
        return;
      }
    }
    if (account.preferredLang === lang) return;
    const id = setTimeout(() => {
      authApi
        .setPreferredLang(lang)
        .then((a) => setAccountState(a))
        .catch(() => undefined);
    }, 600);
    return () => clearTimeout(id);
  }, [status, account, lang]);

  const value = useMemo(() => ({ status, account, completeSignIn, signOut, setAccount }), [status, account, completeSignIn, signOut, setAccount]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
