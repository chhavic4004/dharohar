import type { HeritageLink } from "../../../../../shared/quiz-contract";
import { heritageById, toLink } from "./registry";

/**
 * Where the quiz gets live information about traditions (HVS, number of
 * archived stories, a recording to play).
 *
 * INTEGRATION: when the archive API exists, call setArchiveAdapter() at
 * startup with an adapter that fetches from it. The default adapter uses the
 * local registry with sample HVS values.
 */
export interface ArchiveAdapter {
  getLinks(ids: string[]): HeritageLink[];
}

const registryAdapter: ArchiveAdapter = {
  getLinks(ids) {
    return ids.map((id) => heritageById.get(id)).filter((e) => e !== undefined).map((e) => toLink(e!));
  },
};

let adapter: ArchiveAdapter = registryAdapter;

export function setArchiveAdapter(next: ArchiveAdapter | null) {
  adapter = next ?? registryAdapter;
}

export function heritageLinks(ids: string[] | undefined): HeritageLink[] {
  return ids?.length ? adapter.getLinks(ids) : [];
}
