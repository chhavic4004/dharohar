import type { TranslationTable } from "../types";
import { PA_ARCHITECTURE } from "./architecture";
import { PA_CULINARY } from "./culinary";
import { PA_DAILY } from "./daily";
import { PA_RHYTHMS } from "./rhythms";
import { PA_RULERS } from "./rulers";
import { PA_TRADITIONS } from "./traditions";
import { PA_VISUAL } from "./visual";

/** Punjabi translations, hand-written. Keyed by question id. */
export const PA: TranslationTable = {
  ...PA_RHYTHMS,
  ...PA_ARCHITECTURE,
  ...PA_CULINARY,
  ...PA_TRADITIONS,
  ...PA_RULERS,
  ...PA_VISUAL,
  ...PA_DAILY,
};
