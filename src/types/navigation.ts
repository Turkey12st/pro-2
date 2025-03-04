
import { LucideIcon } from "lucide-react";

export interface MenuItem {
  title: string;
  icon: LucideIcon;
  href: string;
  children?: MenuItem[];
  new?: boolean;
  group?: string; // Group items for better organization
  badge?: string; // For showing badges like "Beta", "New", etc.
  disabled?: boolean; // For disabling menu items
}
