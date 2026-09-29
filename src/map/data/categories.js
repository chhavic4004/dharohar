// Central place to define story categories, their display order and pin colors.
// Add a new category here and it automatically shows up in filters + legend.
// `id` is the value stored on stories and sent to the API: never translate it.
// `labelKey` points at the display label in src/i18n/pages/storyMap.ts.
export const CATEGORIES = [
  { id: "All", label: "All", labelKey: "catAll", color: "#7a1f33" },
  { id: "Partition Migration", label: "Partition Migration", labelKey: "catPartition", color: "#8c1f28" },
  { id: "Craft & Tradition", label: "Craft & Tradition", labelKey: "catCraft", color: "#b5541b" },
  { id: "Folk Song", label: "Folk Song", labelKey: "catFolk", color: "#1fa971" },
  { id: "Living Tradition", label: "Living Tradition", labelKey: "catLiving", color: "#e0932b" },
];

/** Display label for a category id in the current language (t from usePageText(storyMapText)). */
export function getCategoryLabel(categoryId, t) {
  const found = CATEGORIES.find((c) => c.id === categoryId);
  return found ? t(found.labelKey) : categoryId;
}

export function getCategoryColor(categoryId) {
  const found = CATEGORIES.find((c) => c.id === categoryId);
  return found ? found.color : "#7a1f33";
}

// Journey-stage colors, used for migration route markers (origin / waypoint / present).
export const STAGE_COLORS = {
  origin: "#6b5f56",
  waypoint: "#c99a3d",
  present: "#8c1f28",
};

export function getStageColor(stage) {
  return STAGE_COLORS[stage] || STAGE_COLORS.waypoint;
}
