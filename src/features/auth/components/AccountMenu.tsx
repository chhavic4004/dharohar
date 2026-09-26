import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import { History, LogIn, LogOut, UserRound } from "lucide-react";
import { useSiteT } from "../../../i18n/site";
import { showToast } from "../../../lib/toast";
import { useAuth } from "../AuthProvider";

/** Header button: "Sign in" for guests, avatar with a small menu when signed in. */
export default function AccountMenu() {
  const t = useSiteT();
  const { status, account, signOut } = useAuth();
  const { pathname, search } = useLocation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const close = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  if (status !== "signedIn" || !account) {
    const next = pathname.startsWith("/login") ? "/account" : `${pathname}${search}`;
    return (
      <Link
        to={`/login?next=${encodeURIComponent(next)}`}
        className="flex items-center gap-1.5 text-xs font-semibold text-white bg-maroon hover:bg-terracotta rounded-full px-3 py-1.5 transition-colors"
      >
        <LogIn className="w-3.5 h-3.5 rtl:rotate-180" aria-hidden />
        <span className="hidden sm:inline">{t("signIn")}</span>
      </Link>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={t("accountMenu")}
        className="w-8 h-8 rounded-full overflow-hidden bg-maroon text-white font-serif font-bold text-sm flex items-center justify-center ring-2 ring-transparent hover:ring-terracotta/50 cursor-pointer"
      >
        {account.avatarUrl ? <img src={account.avatarUrl} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" /> : account.displayName.slice(0, 1).toUpperCase()}
      </button>
      {open && (
        <div className="absolute end-0 mt-2 w-56 bg-parchment border border-maroon/20 rounded-lg shadow-lg py-1 z-50">
          <div className="px-3.5 py-2 border-b border-maroon/10">
            <p className="text-sm font-semibold text-ink truncate">{account.displayName}</p>
            <p className="text-[11px] text-ink/50 truncate" dir="ltr">
              {account.email}
            </p>
          </div>
          <Link to="/account" className="flex items-center gap-2 px-3.5 py-2 text-sm text-ink/80 hover:bg-maroon/5 hover:text-maroon">
            <UserRound className="w-4 h-4" aria-hidden /> {t("myAccount")}
          </Link>
          <Link to="/account#history" className="flex items-center gap-2 px-3.5 py-2 text-sm text-ink/80 hover:bg-maroon/5 hover:text-maroon">
            <History className="w-4 h-4" aria-hidden /> {t("myHistory")}
          </Link>
          <button
            onClick={() => {
              signOut();
              setOpen(false);
              showToast(t("signedOutToast"));
            }}
            className="w-full flex items-center gap-2 px-3.5 py-2 text-sm text-ink/80 hover:bg-maroon/5 hover:text-maroon text-start cursor-pointer"
          >
            <LogOut className="w-4 h-4 rtl:rotate-180" aria-hidden /> {t("signOut")}
          </button>
        </div>
      )}
    </div>
  );
}
