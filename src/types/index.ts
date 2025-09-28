export interface TierItem {
  id: string;
  name: string;
  imageUrl: string;
  file: File;
}

export interface TierRow {
  id: string;
  label: string;
  color: string;
  items: TierItem[];
}

export interface TierList {
  id: string;
  title: string;
  rows: TierRow[];
  imagePool: TierItem[];
}

export const DEFAULT_TIER_ROWS: Omit<TierRow, "id" | "items">[] = [
  { label: "S", color: "#ff7f7f" },
  { label: "A", color: "#ffbf7f" },
  { label: "B", color: "#ffdf7f" },
  { label: "C", color: "#ffff7f" },
  { label: "D", color: "#bfff7f" },
];
