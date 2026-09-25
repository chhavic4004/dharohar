import { useState } from "react";
import { BookOpen, Check, Copy, Gift, Headphones, Home, Landmark, Lock, MapPin, Scissors, Ticket } from "lucide-react";
import type { Redemption, Reward, RewardKind } from "@shared/quiz-contract";
import { quizApi } from "../api/quizApi";
import { useApi } from "../hooks/useApi";
import { Button, Card, CoinBadge, ErrorState, Modal, Pill, Spinner, Toast, cx } from "../components/ui";

const KIND_ICON: Record<RewardKind, typeof Gift> = {
  museum: Landmark,
  crafts: Scissors,
  travel: MapPin,
  learning: BookOpen,
  digital: Headphones,
};

function rewardIcon(r: { rewardId?: string; id?: string; kind?: RewardKind }) {
  if ((r.rewardId ?? r.id) === "homestay") return Home;
  return r.kind ? KIND_ICON[r.kind] : Ticket;
}

export default function Rewards() {
  const profile = useApi(() => quizApi.profile());
  const rewards = useApi(() => quizApi.rewards());
  const wallet = useApi(() => quizApi.redemptions());
  const [tab, setTab] = useState<"store" | "wallet">("store");
  const [confirm, setConfirm] = useState<Reward | null>(null);
  const [redeemed, setRedeemed] = useState<Redemption | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  if (profile.loading || rewards.loading) return <Spinner label="Opening the rewards store" />;
  if (profile.error || rewards.error) return <ErrorState error={(profile.error ?? rewards.error)!} onRetry={() => { profile.reload(); rewards.reload(); }} />;

  const p = profile.data!;
  const list = rewards.data!;

  const redeem = async () => {
    if (!confirm) return;
    setBusy(true);
    setError(null);
    try {
      const res = await quizApi.redeem(confirm.id);
      setRedeemed(res.redemption);
      setConfirm(null);
      await Promise.all([profile.reload(), rewards.reload(), wallet.reload()]);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const copy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setToast("Code copied");
    } catch {
      setToast("Could not copy. Select the code and copy it manually.");
    }
  };

  return (
    <div className="bg-parchment pb-16">
      <div className="bg-gradient-to-br from-[#5c1728] to-maroon px-5 pt-10 pb-8 text-white">
        <div className="max-w-3xl mx-auto">
          <p className="text-turmeric text-xs tracking-[0.3em] uppercase mb-2">Heritage Rewards</p>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold">Turn what you learn into real experiences</h1>
          <p className="text-white/75 text-sm mt-2 max-w-xl">
            Coins you earn from quizzes and the Problem of the Day can be exchanged for discounts on museums, heritage walks, handloom
            and craft workshops.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <div className="rounded-xl bg-white/10 px-4 py-2.5">
              <p className="text-[11px] text-white/60">Your balance</p>
              <CoinBadge amount={p.coins} className="text-xl text-white" />
            </div>
            <div className="rounded-xl bg-white/10 px-4 py-2.5">
              <p className="text-[11px] text-white/60">Your level</p>
              <p className="font-serif text-lg font-semibold">
                {p.level.level}. {p.level.name}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 mt-5">
        <div className="rounded-xl border border-turmeric/40 bg-turmeric/10 px-4 py-3 text-xs text-[#6b4a0e] mb-5">
          <strong>Prototype.</strong> Partner names below are samples used to demonstrate how rewards will work. Codes are generated and
          stored, but they cannot yet be used at real outlets.
        </div>

        <div className="flex gap-2 mb-5" role="tablist">
          {(
            [
              ["store", "Rewards store"],
              ["wallet", `My rewards${wallet.data?.length ? ` (${wallet.data.length})` : ""}`],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              role="tab"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              className={cx(
                "px-4 py-2 rounded-full text-sm font-medium cursor-pointer",
                tab === id ? "bg-maroon text-white" : "bg-white/70 text-maroon hover:bg-white",
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "store" && (
          <div className="grid sm:grid-cols-2 gap-4">
            {list.map((r) => {
              const Icon = rewardIcon(r);
              const short = r.cost - p.coins;
              return (
                <Card key={r.id} className={cx("p-5 flex flex-col", !r.unlocked && "opacity-75")}>
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 w-11 h-11 rounded-xl bg-maroon/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-maroon" aria-hidden />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-serif font-semibold text-ink leading-tight">{r.title}</p>
                      <p className="text-xs text-ink/50 mt-0.5">{r.partner}</p>
                    </div>
                    <Pill className="bg-heritage/10 text-heritage shrink-0">{r.discountLabel}</Pill>
                  </div>
                  <p className="text-sm text-ink/70 mt-3 flex-1">{r.description}</p>
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-maroon/10">
                    <CoinBadge amount={r.cost} />
                    {!r.unlocked ? (
                      <span className="inline-flex items-center gap-1 text-xs text-ink/50">
                        <Lock className="w-3.5 h-3.5" aria-hidden /> Unlocks at level {r.minLevel}
                      </span>
                    ) : r.affordable ? (
                      <Button className="px-4 py-2" onClick={() => setConfirm(r)}>
                        Redeem
                      </Button>
                    ) : (
                      <span className="text-xs text-ink/50">{short} more coins needed</span>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {tab === "wallet" &&
          (wallet.loading ? (
            <Spinner />
          ) : !wallet.data?.length ? (
            <Card className="p-8 text-center">
              <Gift className="w-8 h-8 text-maroon/40 mx-auto mb-2" aria-hidden />
              <p className="text-sm text-ink/60">You have not redeemed any rewards yet.</p>
            </Card>
          ) : (
            <ul className="space-y-3">
              {wallet.data.map((w) => {
                const Icon = rewardIcon(w);
                return (
                  <Card key={w.id} className={cx("p-4 flex flex-wrap items-center gap-4", w.status === "expired" && "opacity-60")}>
                    <Icon className="w-6 h-6 text-maroon shrink-0" aria-hidden />
                    <div className="flex-1 min-w-[160px]">
                      <p className="font-semibold text-sm text-ink">
                        {w.title} <span className="text-heritage">· {w.discountLabel}</span>
                      </p>
                      <p className="text-xs text-ink/50">
                        {w.status === "expired" ? "Expired" : "Valid until"} {new Date(w.expiresAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                    <button
                      onClick={() => copy(w.code)}
                      className="inline-flex items-center gap-2 font-mono text-sm tracking-wider bg-parchment border border-dashed border-maroon/40 rounded-lg px-3 py-1.5 hover:bg-maroon/5 cursor-pointer"
                      aria-label={`Copy code ${w.code}`}
                    >
                      {w.code} <Copy className="w-3.5 h-3.5 text-maroon" aria-hidden />
                    </button>
                  </Card>
                );
              })}
            </ul>
          ))}
      </div>

      <Modal open={!!confirm} onClose={() => setConfirm(null)} title="Redeem this reward?">
        {confirm && (
          <div>
            <p className="font-serif font-semibold text-ink">{confirm.title}</p>
            <p className="text-sm text-ink/60 mb-3">
              {confirm.discountLabel} · {confirm.partner}
            </p>
            <ul className="text-xs text-ink/60 list-disc list-inside space-y-1 mb-4">
              <li>Valid for {confirm.validityDays} days after redeeming.</li>
              {confirm.terms.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
            <div className="flex items-center justify-between rounded-xl bg-white/70 p-3 text-sm mb-4">
              <span>Cost</span>
              <CoinBadge amount={confirm.cost} />
            </div>
            <div className="flex items-center justify-between rounded-xl bg-white/70 p-3 text-sm mb-4">
              <span>Balance after</span>
              <CoinBadge amount={p.coins - confirm.cost} />
            </div>
            {error && <p className="text-sm text-alert mb-3">{error}</p>}
            <div className="grid grid-cols-2 gap-3">
              <Button variant="secondary" onClick={() => setConfirm(null)}>
                Cancel
              </Button>
              <Button loading={busy} onClick={redeem}>
                Confirm
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={!!redeemed} onClose={() => setRedeemed(null)} title="Reward unlocked">
        {redeemed && (
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-heritage mx-auto flex items-center justify-center mb-3">
              <Check className="w-6 h-6 text-white" aria-hidden />
            </div>
            <p className="font-serif font-semibold text-ink">{redeemed.title}</p>
            <p className="text-sm text-heritage mb-4">{redeemed.discountLabel}</p>
            <button
              onClick={() => copy(redeemed.code)}
              className="w-full font-mono text-xl tracking-[0.2em] bg-white border-2 border-dashed border-maroon/40 rounded-xl py-4 hover:bg-maroon/5 cursor-pointer"
              aria-label={`Copy code ${redeemed.code}`}
            >
              {redeemed.code}
            </button>
            <p className="text-xs text-ink/50 mt-2">
              Tap to copy. Valid until {new Date(redeemed.expiresAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}. You
              can always find it under My rewards.
            </p>
            <Button className="w-full mt-5" onClick={() => { setRedeemed(null); setTab("wallet"); }}>
              View my rewards
            </Button>
          </div>
        )}
      </Modal>
      <Toast message={toast} onDone={() => setToast(null)} />
    </div>
  );
}
