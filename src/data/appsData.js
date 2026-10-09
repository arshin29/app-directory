export const CATEGORIES = [
  "All",
  "3D Printing",
  "Design",
  "Calculator",
  "Productivity",
  "Utilities",
  "Business",
  "Visualization",
  "Other"
];

export const SORT_OPTIONS = [
  { id: "name-asc", label: "Name (A–Z)" },
  { id: "name-desc", label: "Name (Z–A)" },
  { id: "newest", label: "Newest" },
  { id: "status", label: "Status (Ready first)" }
];

// Apps are managed through the DB. This file only exports category/sort constants.
// The appsData array is intentionally empty — all entries are added via the Admin UI.
export const appsData = [];
