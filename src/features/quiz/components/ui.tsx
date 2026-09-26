import { useEffect, type ButtonHTMLAttributes, type ReactNode } from "react";
import { AlertCircle, Coins, Loader2, X } from "lucide-react";
import { useI18n } from "../i18n";

export function cx(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

type Variant = "primary" | "secondary" | "ghost" | "gold";

export function Button({
  variant = "primary",
  className,
  loading,
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; loading?: boolean }) {
  const styles: Record<Variant, string> = {
    primary: "bg-maroon text-white hover:bg-terracotta shadow-md disabled:bg-ink/15 disabled:text-ink/40 disabled:shadow-none",
    secondary: "border-2 border-maroon text-maroon hover:bg-maroon/5 disabled:opacity-40",
    ghost: "text-maroon hover:bg-maroon/5 disabled:opacity-40",
    gold: "border-2 border-turmeric text-[#8a5f12] hover:bg-turmeric/10 disabled:opacity-40",
  };
  return (
    <button
      {...rest}
      disabled={rest.disabled || loading}
      className={cx(
        "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 font-semibold text-sm transition-all active:scale-[0.98] cursor-pointer disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-maroon",
        styles[variant],
        className,
      )}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cx("bg-white/80 rounded-2xl border border-maroon/10 shadow-sm", className)}>{children}</div>;
}

export function SectionTitle({ children, id }: { children: ReactNode; id?: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="h-px flex-1 bg-maroon/20" />
      <h2 id={id} className="font-serif text-lg font-semibold text-ink text-center">
        {children}
      </h2>
      <div className="h-px flex-1 bg-maroon/20" />
    </div>
  );
}

export function Spinner({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-maroon" role="status">
      <Loader2 className="w-7 h-7 animate-spin" aria-hidden />
      <span className="text-sm text-ink/60">{label}</span>
    </div>
  );
}

export function ErrorState({ error, onRetry }: { error: Error; onRetry?: () => void }) {
  const { t } = useI18n();
  return (
    <Card className="p-6 text-center max-w-md mx-auto my-10">
      <AlertCircle className="w-8 h-8 text-alert mx-auto mb-3" aria-hidden />
      <p className="font-serif font-semibold text-ink mb-1">{t("somethingWrong")}</p>
      <p className="text-sm text-ink/60 mb-4">{error.message}</p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          {t("tryAgain")}
        </Button>
      )}
    </Card>
  );
}

export function ProgressBar({ value, color = "#7A1F35", className, label }: { value: number; color?: string; className?: string; label?: string }) {
  const pct = Math.max(0, Math.min(100, value * 100));
  return (
    <div
      className={cx("h-2 rounded-full bg-maroon/10 overflow-hidden", className)}
      role="progressbar"
      aria-label={label}
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }} />
    </div>
  );
}

export function CoinBadge({ amount, className }: { amount: number; className?: string }) {
  return (
    <span className={cx("inline-flex items-center gap-1.5 font-semibold text-[#8a5f12]", className)}>
      <Coins className="w-4 h-4 text-turmeric" aria-hidden />
      {amount.toLocaleString("en-IN")}
      <span className="sr-only">coins</span>
    </span>
  );
}

export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-ink/60 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="w-full max-w-md rounded-2xl bg-parchment shadow-2xl border border-maroon/20 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 pt-5">
          <h3 className="font-serif text-lg font-semibold text-ink">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-maroon/10 text-ink/60 cursor-pointer" aria-label="Close">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export function Toast({ message, onDone }: { message: string | null; onDone: () => void }) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onDone, 2500);
    return () => clearTimeout(t);
  }, [message, onDone]);
  if (!message) return null;
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[70] rounded-full bg-ink text-parchment text-sm px-5 py-2.5 shadow-lg" role="status">
      {message}
    </div>
  );
}

export function Pill({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cx("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium", className)}>{children}</span>;
}
