import type { TranslationTable } from "../types";
import { UR_ARCHITECTURE } from "./architecture";
import { UR_CULINARY } from "./culinary";
import { UR_DAILY } from "./daily";
import { UR_RHYTHMS } from "./rhythms";
import { UR_RULERS } from "./rulers";
import { UR_TRADITIONS } from "./traditions";
import { UR_VISUAL } from "./visual";

/** Urdu translations, hand-written. Keyed by question id. */
export const UR: TranslationTable = {
  ...UR_RHYTHMS,
  ...UR_ARCHITECTURE,
  ...UR_CULINARY,
  ...UR_TRADITIONS,
  ...UR_RULERS,
  ...UR_VISUAL,
  ...UR_DAILY,
};
