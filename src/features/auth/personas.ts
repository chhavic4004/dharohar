import { Backpack, Compass, GraduationCap, Palette, Presentation, ScrollText, type LucideIcon } from "lucide-react";
import { DEFAULT_PERSONA, PERSONAS, isPersona, type Persona } from "@shared/auth-contract";
import type { SiteKey } from "../../i18n/site";

/** Icon and text keys for each persona ("I am a…"). Order matches PERSONAS. */
export const PERSONA_META: Record<Persona, { icon: LucideIcon; label: SiteKey; desc: SiteKey }> = {
  student: { icon: GraduationCap, label: "personaStudent", desc: "personaStudentDesc" },
  historian: { icon: ScrollText, label: "personaHistorian", desc: "personaHistorianDesc" },
  seeker: { icon: Compass, label: "personaSeeker", desc: "personaSeekerDesc" },
  educator: { icon: Presentation, label: "personaEducator", desc: "personaEducatorDesc" },
  artisan: { icon: Palette, label: "personaArtisan", desc: "personaArtisanDesc" },
  traveller: { icon: Backpack, label: "personaTraveller", desc: "personaTravellerDesc" },
};

export { PERSONAS, DEFAULT_PERSONA, type Persona };

/** Safe read for accounts cached before personas existed. */
export const personaOf = (p: unknown): Persona => (isPersona(p) ? p : DEFAULT_PERSONA);

/** Quiz level to suggest first: historians get the timed Historian level, everyone else starts as a Seeker. */
export const suggestedDifficulty = (p: unknown): "seeker" | "historian" => (personaOf(p) === "historian" ? "historian" : "seeker");
