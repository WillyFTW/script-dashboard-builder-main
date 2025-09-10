import { Package, Shield, Settings, Terminal } from "lucide-react";

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
  Software: Package,
  Safety: Shield,
  Configuration: Settings,
  Command: Terminal,
} as const;

export const categoryLabels = {
  Software: "Software",
  Safety: "Safety",
  Configuration: "Configuration",
  Command: "Command",
} as const;
