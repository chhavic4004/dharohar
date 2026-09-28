// Central place to define story categories, their display order and pin colors.
// Add a new category here and it automatically shows up in filters + legend.
export const CATEGORIES = [
  { id: "All", label: "All", color: "#7a1f33" },
  { id: "Partition Migration", label: "Partition Migration", color: "#8c1f28" },
  { id: "Craft & Tradition", label: "Craft & Tradition", color: "#b5541b" },
  { id: "Folk Song", label: "Folk Song", color: "#1fa971" },
  { id: "Living Tradition", label: "Living Tradition", color: "#e0932b" },
];

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
