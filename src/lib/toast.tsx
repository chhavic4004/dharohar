import { useEffect, useSyncExternalStore } from "react";

/** Tiny site-wide toast: showToast("Saved") from anywhere, render <ToastHost /> once. */
let message: string | null = null;
const listeners = new Set<() => void>();

export function showToast(msg: string) {
  message = msg;
  listeners.forEach((l) => l());
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function ToastHost() {
  const msg = useSyncExternalStore(subscribe, () => message, () => null);
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => showToast(null as unknown as string), 3500);
    return () => clearTimeout(t);
  }, [msg]);
  if (!msg) return null;
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[80] max-w-[90vw] rounded-full bg-ink text-parchment text-sm px-5 py-2.5 shadow-lg text-center" role="status">
      {msg}
    </div>
  );
}
