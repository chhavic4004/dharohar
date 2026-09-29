import { Send, Users } from "lucide-react";
import { CONTRIBUTORS, contributions, PERSONA_KEY, personaCounts, TEAM_STATUS_KEY, type RangeId, type Team } from "./data";
import { useAdminText } from "./useAdminText";

const PERSONA_COLOR = ["bg-terracotta", "bg-turmeric", "bg-heritage", "bg-maroon", "bg-parchment/70"];
const TEAM_STYLE = {
  available: "bg-heritage/20 text-[#8fc3a0] border-heritage/40",
  deployed: "bg-alert/15 text-[#e08a6f] border-alert/40",
  returning: "bg-turmeric/15 text-turmeric border-turmeric/30",
} as const;

export default function UsersTab({ range, teams, onDispatch }: { range: RangeId; teams: Team[]; onDispatch: (teamId: string) => void }) {
  const { t, num, pct, place } = useAdminText();
  const personas = personaCounts(range).sort((a, b) => b.count - a.count);
  const totalP = personas.reduce((s, p) => s + p.count, 0);
  const maxP = Math.max(...personas.map((p) => p.count));
  const top = CONTRIBUTORS.map((c) => ({ c, n: contributions(c, range) })).sort((a, b) => b.n - a.n);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <section className="lg:col-span-2 bg-[#241b1d] border border-parchment/10 rounded-xl p-5 sm:p-6" aria-labelledby="persona-h">
        <h2 id="persona-h" className="font-serif text-xl mb-1">{t("personaTitle")}</h2>
        <p className="text-parchment/55 text-sm mb-5">{t("personaDesc", { n: num(totalP) })}</p>
        <ul className="space-y-4">
          {personas.map((p, i) => (
            <li key={p.persona}>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-parchment/80">{t(PERSONA_KEY[p.persona])}</span>
                <span className="tabular-nums">
                  {num(p.count)} <span className="text-parchment/45 text-xs">({pct((p.count / totalP) * 100)})</span>
                </span>
              </div>
              <div className="h-2 bg-black/30 rounded-full overflow-hidden" aria-hidden="true">
                <div data-keep className={`h-full rounded-full ${PERSONA_COLOR[i % PERSONA_COLOR.length]}`} style={{ width: `${(p.count / maxP) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="lg:col-span-3 bg-[#241b1d] border border-parchment/10 rounded-xl p-5 sm:p-6" aria-labelledby="topc-h">
        <h2 id="topc-h" className="font-serif text-xl mb-4">{t("topContribTitle")}</h2>
        <div className="overflow-x-auto -mx-5 sm:mx-0">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="border-b border-parchment/10 text-parchment/60">
                <th scope="col" className="py-2 px-3 text-start font-medium">#</th>
                <th scope="col" className="py-2 px-3 text-start font-medium">{t("colName")}</th>
                <th scope="col" className="py-2 px-3 text-start font-medium">{t("colPersona")}</th>
                <th scope="col" className="py-2 px-3 text-start font-medium">{t("colState")}</th>
                <th scope="col" className="py-2 px-3 text-end font-medium">{t("colContribs")}</th>
                <th scope="col" className="py-2 px-3 text-end font-medium">{t("colVerifiedRate")}</th>
              </tr>
            </thead>
            <tbody>
              {top.map(({ c, n }, i) => (
                <tr key={c.id} className="border-b border-parchment/5">
                  <td className="py-2.5 px-3 tabular-nums text-parchment/50">{num(i + 1)}</td>
                  <th scope="row" className="py-2.5 px-3 text-start font-medium">{t(c.name)}</th>
                  <td className="py-2.5 px-3 text-parchment/75">{t(PERSONA_KEY[c.persona])}</td>
                  <td className="py-2.5 px-3 text-parchment/75">{place(c.state)}</td>
                  <td className="py-2.5 px-3 text-end tabular-nums">{num(n)}</td>
                  <td className="py-2.5 px-3 text-end tabular-nums">{pct(c.verifiedRate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="lg:col-span-5 bg-[#241b1d] border border-parchment/10 rounded-xl p-5 sm:p-6" aria-labelledby="teams-h">
        <h2 id="teams-h" className="font-serif text-xl mb-1">{t("teamsTitle")}</h2>
        <p className="text-parchment/55 text-sm mb-5">{t("teamsDesc")}</p>
        <ul className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {teams.map((tm) => (
            <li key={tm.id} className="bg-white/[0.03] border border-white/5 rounded-lg p-4 flex flex-col">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-medium">{t(tm.name)}</h3>
                <span className={`text-[11px] px-2 py-0.5 rounded-full border shrink-0 ${TEAM_STYLE[tm.status]}`}>{t(TEAM_STATUS_KEY[tm.status])}</span>
              </div>
              <dl className="text-xs text-parchment/60 space-y-1 mb-4 flex-1">
                <div className="flex gap-1">
                  <dt>{t("teamBase")}:</dt>
                  <dd className="text-parchment/85">{place(tm.base)}</dd>
                </div>
                <div className="flex items-center gap-1">
                  <dt className="flex items-center">
                    <Users className="w-3 h-3" aria-hidden="true" />
                    <span className="sr-only">{t("colMembers")}</span>
                  </dt>
                  <dd>{t("teamMembers", { n: num(tm.members) })}</dd>
                </div>
                {tm.deployedTo && tm.status === "deployed" && (
                  <div className="flex gap-1">
                    <dt className="sr-only">{t("colStatus")}</dt>
                    <dd className="text-parchment/80">{t("deployedTo", { state: place(tm.deployedTo) })}</dd>
                  </div>
                )}
              </dl>
              <button
                type="button"
                disabled={tm.status !== "available"}
                onClick={() => onDispatch(tm.id)}
                className="print:hidden inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded text-xs font-medium bg-turmeric text-ink hover:bg-parchment disabled:bg-white/5 disabled:text-parchment/40 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-turmeric"
              >
                <Send className="w-3.5 h-3.5" aria-hidden="true" /> {t("dispatch")}
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
