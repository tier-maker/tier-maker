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
  theme: Theme;
  backgroundImage?: string;
}

export interface Theme {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
}

export const DEFAULT_THEMES: Theme[] = [
  {
    id: "light",
    name: "浅色主题",
    primary: "#1890ff",
    secondary: "#f0f0f0",
    background: "#f5f5f5",
    surface: "#ffffff",
    text: "#000000",
  },
  {
    id: "dark",
    name: "深色主题",
    primary: "#177ddc",
    secondary: "#434343",
    background: "#141414",
    surface: "#1f1f1f",
    text: "#ffffff",
  },
  {
    id: "colorful",
    name: "彩色主题",
    primary: "#722ed1",
    secondary: "#f6ffed",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    surface: "#ffffff",
    text: "#000000",
  },
];

export const DEFAULT_TIER_ROWS: Omit<TierRow, "id" | "items">[] = [
  { label: "S", color: "#ff7f7f" },
  { label: "A", color: "#ffbf7f" },
  { label: "B", color: "#ffdf7f" },
  { label: "C", color: "#ffff7f" },
  { label: "D", color: "#bfff7f" },
];
