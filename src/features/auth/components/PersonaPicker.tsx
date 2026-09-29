import { forwardRef } from "react";
import { useSiteT } from "../../../i18n/site";
import { PERSONA_META, PERSONAS, personaOf, type Persona } from "../personas";

/**
 * "I am a…" card grid. Native radio inputs, so Tab moves into the group,
 * arrow keys change the choice and Space selects, with screen reader support for free.
 */
export const PersonaPicker = forwardRef<HTMLFieldSetElement, {
  value: Persona | null;
  onChange: (p: Persona) => void;
  error?: string | null;
  name?: string;
  compact?: boolean;
}>(function PersonaPicker({ value, onChange, error, name = "persona", compact }, ref) {
  const t = useSiteT();
  const errId = `${name}-error`;
  return (
    <fieldset ref={ref} tabIndex={-1} aria-invalid={error ? true : undefined} aria-describedby={error ? errId : undefined} className="outline-none">
      <legend className="block text-xs font-semibold text-ink/70 mb-1">{t("personaTitle")}</legend>
      {!compact && <p className="text-[11px] text-ink/45 mb-2">{t("personaHint")}</p>}
      <div className={`grid gap-2 ${compact ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2"}`}>
        {PERSONAS.map((p) => {
          const { icon: Icon, label, desc } = PERSONA_META[p];
          const checked = value === p;
          return (
            <label
              key={p}
              className={`relative flex flex-col gap-1 rounded-xl border-2 p-3 cursor-pointer transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-maroon ${
                checked ? "border-maroon bg-maroon/5" : error ? "border-alert/40 bg-white hover:border-maroon/40" : "border-maroon/15 bg-white hover:border-maroon/40"
              }`}
            >
              <input type="radio" name={name} value={p} checked={checked} onChange={() => onChange(p)} className="sr-only" />
              <span className="flex items-center gap-2">
                <span className={`w-8 h-8 shrink-0 rounded-lg flex items-center justify-center ${checked ? "bg-maroon text-white" : "bg-maroon/10 text-maroon"}`}>
                  <Icon className="w-4 h-4" aria-hidden />
                </span>
                <span className="text-sm font-semibold text-ink leading-tight">{t(label)}</span>
              </span>
              <span className="text-[11px] text-ink/55 leading-snug">{t(desc)}</span>
            </label>
          );
        })}
      </div>
      {error && (
        <p id={errId} className="text-xs text-alert mt-1.5" role="alert">
          {error}
        </p>
      )}
    </fieldset>
  );
});

/** Small pill with the persona's icon and name. */
export function PersonaBadge({ persona, className = "" }: { persona: unknown; className?: string }) {
  const t = useSiteT();
  const { icon: Icon, label } = PERSONA_META[personaOf(persona)];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full bg-terracotta/10 text-terracotta px-2 py-0.5 text-[11px] font-semibold ${className}`}>
      <Icon className="w-3 h-3" aria-hidden /> {t(label)}
    </span>
  );
}
