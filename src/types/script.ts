export interface Script {
  name: string;
  code: string;
  description: string;
  category: "software" | "safety" | "configuration" | "command";
  statuses: string[];
  customers: string[];
}

export interface Customer {
  name: string;
}

export const categoryIcons = {
  software: "Package",
  safety: "Shield",
  configuration: "Settings",
  command: "Terminal",
} as const;

export const categoryLabels = {
  software: "Software",
  safety: "Safety",
  configuration: "Configuration",
  command: "Command",
} as const;
