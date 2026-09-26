import type { Lang } from "../../../../../shared/quiz-contract";

/**
 * Machine translation hook for languages without hand-made translations
 * (Punjabi, Urdu for now).
 *
 * INTEGRATION: set TRANSLATE_URL to the team's IndicTrans2 service. It must
 * accept POST { texts: string[], source: "en", target: "pa" | "ur" | "hi" }
 * and reply { translations: string[] }. Results are cached in memory.
 * With no TRANSLATE_URL, text stays in English and the UI says so.
 */
const cache = new Map<string, string>();
const url = process.env.TRANSLATE_URL?.trim();

export const machineTranslationEnabled = () => Boolean(url);

export async function translateTexts(texts: string[], target: Lang): Promise<string[] | null> {
  if (!url || target === "en") return null;
  const missing = [...new Set(texts.filter((t) => !cache.has(`${target}|${t}`)))];
  if (missing.length) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texts: missing, source: "en", target }),
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) return null;
      const data = (await res.json()) as { translations?: string[] };
      if (!Array.isArray(data.translations) || data.translations.length !== missing.length) return null;
      missing.forEach((t, i) => cache.set(`${target}|${t}`, data.translations![i]));
    } catch {
      return null;
    }
  }
  return texts.map((t) => cache.get(`${target}|${t}`) ?? t);
}
