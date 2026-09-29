import { useCallback } from "react";
import { usePageText } from "../../i18n/page";
import { passportDataText, passportText, type PassportDataKey } from "../../i18n/pages/passport";
import type { Actor, CraftCode } from "./registry";

/** UI strings + record strings + locale-aware formatting for the passport page. */
export function usePassportText() {
  const ui = usePageText(passportText);
  const data = usePageText(passportDataText);
  const { locale } = ui;
  const dt = data.t;

  const d = useCallback((code: CraftCode, field: string) => dt(`${code}_${field}` as PassportDataKey), [dt]);
  const uit = ui.t;
  const actor = useCallback((code: CraftCode, a: Actor) => (a === "issuer" ? uit("issuerName") : d(code, a)), [uit, d]);
  const fmtDate = useCallback(
    (iso: string) => new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(new Date(`${iso}T00:00:00`)),
    [locale],
  );
  const num = useCallback((n: number) => n.toLocaleString(locale), [locale]);

  return { ...ui, d, actor, fmtDate, num };
}
