import type { TranslationTable } from "../types";
import { HI_ARCHITECTURE } from "./architecture";
import { HI_CULINARY } from "./culinary";
import { HI_DAILY } from "./daily";
import { HI_RHYTHMS } from "./rhythms";
import { HI_RULERS } from "./rulers";
import { HI_TRADITIONS } from "./traditions";
import { HI_VISUAL } from "./visual";

/** Hindi translations, hand-written. Keyed by question id. */
export const HI: TranslationTable = {
  ...HI_RHYTHMS,
  ...HI_ARCHITECTURE,
  ...HI_CULINARY,
  ...HI_TRADITIONS,
  ...HI_RULERS,
  ...HI_VISUAL,
  ...HI_DAILY,
};
