import { useEffect, useRef, useState } from "react";
import { useLang } from "../../../lib/language";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (opts: { client_id: string; callback: (r: { credential: string }) => void; ux_mode?: "popup" }) => void;
          renderButton: (el: HTMLElement, opts: Record<string, unknown>) => void;
        };
      };
    };
  }
}

const SRC = "https://accounts.google.com/gsi/client";
let loader: Promise<void> | null = null;

function loadGoogle(): Promise<void> {
  if (window.google?.accounts) return Promise.resolve();
  loader ??= new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = SRC;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => {
      loader = null;
      reject(new Error("Could not load Google sign-in"));
    };
    document.head.appendChild(s);
  });
  return loader;
}

/** Official "Sign in with Google" button (Google Identity Services). */
export default function GoogleButton({ clientId, onCredential }: { clientId: string; onCredential: (credential: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const lang = useLang();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let live = true;
    loadGoogle()
      .then(() => {
        if (!live || !ref.current || !window.google) return;
        window.google.accounts.id.initialize({ client_id: clientId, callback: (r) => onCredential(r.credential), ux_mode: "popup" });
        ref.current.innerHTML = "";
        window.google.accounts.id.renderButton(ref.current, {
          theme: "outline",
          size: "large",
          shape: "pill",
          text: "continue_with",
          width: Math.min(360, ref.current.offsetWidth || 320),
          locale: lang,
        });
      })
      .catch(() => live && setFailed(true));
    return () => {
      live = false;
    };
  }, [clientId, onCredential, lang]);

  if (failed) return null;
  return <div ref={ref} className="flex justify-center min-h-[44px]" />;
}
